---
title: Why Not Use Entity with selectAutoInclude
order: 60
---

If EQ's include / selectAutoInclude implementation uses secondary queries + IN (instead of JOIN), the documentation explanation needs to be adjusted, otherwise it will mislead users. The core issue is no longer JOIN explosion, but rather the uncontrollable number of additional SQL queries and query scope.

Here is a more accurate version suitable for documentation.



## Why Not Use Entity as Parameter for selectAutoInclude

In the Easy Query (EQ) framework, the design goal of selectAutoInclude is:

Automatically derive the navigation properties that need to be loaded based on the structure of the returned object.

Therefore, this capability is more suitable for DTO projections, and it is not recommended to directly use entity classes as parameters.

The reason is: entity structure evolves dynamically, while DTO is a stable query contract.



### 1. Entity Structure Evolves with Business Development

Entity classes belong to the domain model and usually continuously add new navigation properties during business evolution.

For example, the initial User entity:

```java
class User {
    private String id;
    @Navigate
    private School school;
}
```

An interface uses:

```java
query.selectAutoInclude(User.class)
```

The framework will only automatically load:

```text
User -> School
```

But as the business develops, the entity adds new navigation properties:

```java
class User {
    private String id;
    @Navigate
    private School school;
    @Navigate
    private ClassRoom classRoom;
    @Navigate
    private List<Paper> papers;
}
```

At this point, the original code is completely unchanged, but the query behavior will automatically become:

```text
User
 ├─ School
 ├─ ClassRoom
 └─ Papers
```



### 2. Auto Include Generates Additional SQL Queries

EQ's include / selectAutoInclude is not implemented through JOIN, but through secondary queries + IN conditions to load navigation properties.

For example, querying users:
```sql
SELECT * FROM user
```

Loading School:
```sql
SELECT * FROM school WHERE id IN (...)
```

Loading Papers (one-to-many):
```sql
SELECT * FROM paper WHERE user_id IN (...)
```

If the entity adds new navigation properties:

```text
User
 ├─ School
 ├─ ClassRoom
 ├─ Papers
 └─ Roles
```

The SQL may become:

```sql
SELECT * FROM user;
SELECT * FROM school WHERE id IN (...);
SELECT * FROM class_room WHERE id IN (...);
SELECT * FROM paper WHERE user_id IN (...);
SELECT * FROM role_user WHERE user_id IN (...);
```

The result is:
- SQL count increases
- Query scope expands
- Data loading amount increases

And the calling code itself has no changes at all.



### 3. Depth and Breadth of Auto Include Are Uncontrollable

If selectAutoInclude(Entity.class), the framework will:
1. Scan @Navigate on the entity
2. Automatically generate includes
3. Recursively parse navigation relationships

This leads to two problems:

1) Breadth is uncontrollable

```text
User
 ├─ School
 ├─ ClassRoom
 ├─ Papers
 ├─ Roles
 └─ Permissions
```

After adding new navigation properties:
- Auto include count increases
- SQL count increases



2) Depth is uncontrollable

For example:

```text
User
 └─ School
      └─ Address
           └─ City
```

The framework may continue to automatically include:

```text
User
 └─ School
      └─ Address
           └─ City
```

The query depth will continue to expand.



### 4. API Behavior Becomes Unstable

If the interface returns an entity object:

```java
public User getUser(...)
```

And uses:

```java
selectAutoInclude(User.class)
```

Then when new navigation properties are added to the entity:

May occur:
- SQL query count increases
- More data loaded
- Interface response time slows down
- Returned JSON structure becomes complex

This means:

Interface behavior will change as the entity structure changes.

Even if the calling code is completely unchanged.



### 5. DTO is a Stable Query Contract

DTO is usually part of the interface definition and is stable.

For example:

```java
class UserDTO {
    private String id;
    private String schoolName;
}
```

Query:

```java
query.selectAutoInclude(UserDTO.class)
```

The framework will only load the navigation data needed by the DTO:

```text
User
 └─ School
      └─ schoolName
```

Even if the entity adds:

```text
User
 ├─ Papers
 ├─ Roles
 └─ Address
```

It will not affect the query behavior.



### 6. Recommend Using Explicit Include When Returning Entities

If the interface needs to return an entity object, it is recommended to explicitly specify include:

```java
query
    .include(user -> user.school())
    .include(user -> user.classRoom())
    .toList();
```

This way you can:
- Explicitly specify which navigation properties to load
- Avoid implicit expansion
- Keep query behavior stable



## Best Practices

| Scenario | Recommended Approach |
|----------|---------------------|
| Return DTO | selectAutoInclude |
| Return Entity | include |
| Return Entity + selectAutoInclude | ❌ Not Recommended |



## Summary

The core capability of selectAutoInclude is:

Automatically derive the navigation properties that need to be loaded based on the returned object.

But if used for entities:
- Entity structure will continuously expand
- Auto include count will increase
- Additional SQL queries will increase
- Query scope becomes uncontrollable

Therefore:

selectAutoInclude is only recommended for DTO projections, not for entity queries.



## Why ORM Uses Secondary Query IN Instead of JOIN

Developers default to thinking that ORM's association loading must be JOIN, but in fact many mature ORMs (such as Hibernate, EF Core, JPA, etc.) choose secondary queries + IN in certain scenarios.
EQ uses this approach for clear design reasons, which can be explained from three perspectives: result set stability, performance, and ORM mapping complexity.



## Why ORM Does Not Use JOIN but Uses Secondary Query + IN

In the Easy Query (EQ) framework, when loading navigation properties with include / selectAutoInclude, the default approach is secondary query + IN conditions, rather than directly querying through SQL JOIN in a single query.

For example:

```sql
SELECT * FROM user
```

Then load navigation properties based on the user primary key collection:

```sql
SELECT * FROM school WHERE id IN (...);
SELECT * FROM paper WHERE user_id IN (...);
```

This design is not accidental, but to avoid multiple problems caused by JOIN.



### 1. Avoid Result Set Expansion Caused by One-to-Many JOIN

In one-to-many relationships, if JOIN is used:

```sql
SELECT *
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
```

If the data is:

```text
User: 1, 2

Paper:
- user1 -> 3 items
- user2 -> 2 items

JOIN result:
- user1 paper1
- user1 paper2
- user1 paper3
- user2 paper1
- user2 paper2

Result set grows from 2 rows to 5 rows
```

If you continue to JOIN multiple one-to-many relationships, for example:

```text
User
 ├─ Papers
 └─ Roles
```

The result may become: `user × papers × roles`, which causes **Cartesian product growth**.

Using secondary queries + IN:

```sql
SELECT * FROM user;
SELECT * FROM paper WHERE user_id IN (...);
SELECT * FROM role WHERE user_id IN (...);
```

The result set scale remains stable:

```text
user  -> 2 rows
paper -> 5 rows
role  -> n rows
```

Result set expansion will not occur.



### 2. Keep Main Query Results Stable

When using JOIN, main table records are repeated.

For example:

```sql
SELECT u.*, p.*
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
```

ORM must when mapping objects:
- Deduplicate User
- Aggregate Paper

This brings additional complexity:
- Object deduplication
- HashMap merging
- Memory overhead

Using secondary queries:

```sql
SELECT * FROM user
```

The main query is always: `User count = SQL row count`

ORM mapping process is simpler and more stable.



### 3. Better Pagination Semantics

If using JOIN:

```sql
SELECT *
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
LIMIT 10
```

The actual meaning becomes:

Limit the result after JOIN

Instead of:

Limit the User count

For example:

```text
user1 has 10 papers

LIMIT 10 may only return: user1
```

This causes **pagination result errors**.

Using secondary queries:

```sql
SELECT * FROM user LIMIT 10;
SELECT * FROM paper WHERE user_id IN (...);
```

Pagination semantics are completely correct.



### 4. Lower SQL Complexity

When navigation relationships become more complex:

```text
User
 ├─ School
 ├─ Papers
 ├─ Roles
 └─ Permissions
```

If using JOIN:

```sql
SELECT ...
FROM user
LEFT JOIN school ...
LEFT JOIN paper ...
LEFT JOIN role ...
LEFT JOIN permission ...
```

SQL will quickly become:
- Difficult to optimize
- Complex execution plans
- Severe data duplication

Using secondary queries:

```sql
-- 1. SELECT user
SELECT * FROM user;

-- 2. SELECT school WHERE id IN (...)
SELECT * FROM school WHERE id IN (...);

-- 3. SELECT paper WHERE user_id IN (...)
SELECT * FROM paper WHERE user_id IN (...);

-- 4. SELECT role WHERE user_id IN (...)
SELECT * FROM role WHERE user_id IN (...);
```

Each SQL is:
- Simple
- Predictable
- Easy to optimize



### 5. More Consistent with ORM Object Loading Model

The goal of ORM is to build an object graph:

```text
User
 ├─ School
 └─ Papers
```

Instead of a flat result set:

```text
user + school + paper
```

Secondary query approach is closer to the object model:

```text
Step1: load users
Step2: load schools
Step3: load papers
Step4: assemble object graph
```

The logic is clearer.



## Design Summary

Compared to JOIN, secondary queries + IN have the following advantages:

| Comparison Item | JOIN | Secondary Query IN |
|-----------------|------|-------------------|
| One-to-Many Result Set | Expansion | Stable |
| Pagination Semantics | Easily Wrong | Correct |
| SQL Complexity | High | Low |
| ORM Mapping | Complex | Simple |
| Maintainability | Poor | Better |

Therefore, in the EQ framework:

include / selectAutoInclude adopts the secondary query + IN strategy by default to load navigation properties.
