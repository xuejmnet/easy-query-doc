---
title: Related Terminology
order: 5
---

# Related Terminology



::: warning Key of the Keys!!!
> `Implicit Expressions` and `DTO Queries` are the key of the keys in `eq`. You can say that if you master these two points, you've learned 80% of `eq`
:::


## Implicit Expressions

`Implicit queries` refer to the way of writing expressions through object relationship descriptions to filter, assemble, and sort database data. In eq, this is called implicit expressions

There's also a term called `automatic join` or `automatic subquery`

::: tip Note!!!
> `Implicit expressions` are the most important in `eq`. If you use eq without mastering implicit expressions, then using `eq` is not much different from using other ORMs. 70% of `eq`'s power comes from implicit expressions
:::

### Implicit JOIN

The following is an `implicit join` operation, setting `user` and `company` as a many-to-one relationship. The join operation is not reflected in the expression but is implemented through the object relationship tree

```java
eq.queryable(User.class)
    .where(u->{
        u.company().name().eq("xx公司")
    })
    .toList();
```

### Implicit Subquery

The following is an `implicit subquery` operation, setting `user` and `bankCard` as a one-to-many relationship. The `exists` statement is not reflected in the expression, but the expression still queries users who have at least one savings card when the condition is met through a `stream`-like approach

```java
eq.queryable(User.class)
    .where(u->{
        u.bankCards().any(card->{
            card.type().eq("储蓄卡")
        })
    })
    .toList();
```

## Explicit Expressions

`Explicit queries` manually join two or more objects or generate subquery expressions

There's also a term called `manual join` or `manual subquery`

### Explicit JOIN

The following is an `explicit join` operation, setting `SysUser` and `SysBankCard` to be associated through manual join, and querying all of user and the type field of bankCard

```java
eq.queryable(SysUser.class)
    .leftJoin(SysBankCard.class, (user, bank_card) -> user.id().eq(bank_card.uid()))
    .where((user, bank_card) -> {
        user.username().contains("小明");
    })
    .select((user, bank_card) -> Select.PART.of(
            user,
            bank_card.type()
    )).toList();
```

### Explicit Subquery

The following is an `explicit subquery` operation, setting `user` and `bankCard` to perform subquery filtering, querying users who must have a savings card

```java
eq.queryable(SysUser.class)
    .where(user -> {
        user.id().in(
                eq.queryable(SysBankCard.class)
                        .where(bank_card -> {
                            bank_card.uid().eq(user.id());
                            bank_card.type().eq("储蓄卡");
                        }).select(bank_card -> bank_card.uid())
        );
    }).toList();
```

## Include Queries

::: tip Note!!!
> This operation will not have N+1 problems
> Use `include` for `OneToOne` or `ManyToOne`, use `includes` for `OneToMany` or `ManyToMany`
> After 3.1.49+ Use `include` for `OneToOne` or `ManyToOne` or `OneToMany` or `ManyToMany`
:::

`include` queries are secondary queries after object relationship modeling, supporting unlimited nested levels "pull out a carrot and bring out the mud"
```java

        List<SysUser> list = eq.queryable(SysUser.class)
                .toList();
        List<SysUser> list1 = eq.queryable(SysUser.class)
                .include(user -> user.bankCards())//If the returned object doesn't have BankCards, the collection will be an empty collection, and the object will be null
                .toList();
```

The second operation above will produce a second query. Through the first query of `SysUser` IDs, a second query of `SysBankCard` records is performed. The following is the return structure

```json
{
  "id": "1",
  "username": "1",
  "age": 12,
  "bankCards": [{ "id": "1", "uid": "1" }]
}
```

## Implicit GROUP, GroupJoin
`eq` extends almost all subquery functions, allowing subqueries to be used with user business systems, not just simple pull queries. It supports `WHERE subqueries`, `ORDER subqueries`, `SELECT subqueries`. However, too many subqueries will make SQL performance very slow. So `eq` completed the last piece of the subquery puzzle in version 3.x - performance improvement by automatically converting subqueries into `Group Join`. This function is called `Implicit Group` or `GroupJoin`. In actual business, complex SQL queries with nested subqueries can greatly improve SQL performance

## DTO Queries🔥
`DTO queries` is a collective term for `selectAutoInclude`, `whereObject`, and `orderByObject`. Together these functions build `DTO queries`, which can greatly improve user development efficiency in our actual business. It can be viewed as a strongly-typed version of `GraphQL`

```java
//Suppose this is our requested JSON data
QueryRequest request=new QueryRequest();
eq.queryable(SysUser.class)
    .whereObject(request)//Automatically query according to configured conditions
    .orderByObject(request)//Automatically sort according to configuration
    .selectAutoInclude(QueryResponse.class)//Automatically return any structured object with SysUser as the object tree root downward
    .toList()
```

## Data Tracking
Data tracking is commonly used for object update and save operations. After enabling tracking for object updates, eq can identify whether the value set of the tracked object has changed, thus generating differential update set columns. For object save, save can save objects in the form of aggregate roots, with the maximum range being the object path tracked at query time and the data range boundary at non-value type positions as the save boundary, automatically sensing insertion, addition, deletion, or setting to null

## Computed Properties
`eq` extends common data objects, divided into two types of computed properties:
- In-memory computed properties: such as enums, JSON maps or JSON arrays
- Database computed properties: such as age, status, etc.

In-memory computed properties are just the type after the computed property at the business code level, and are still basic types when mapped to the database

Database computed properties differ from in-memory computed properties. Database computed properties support participating in any operation of expressions, equivalent to actual table properties except that they cannot be modified or inserted. Even object associations can use this property

## Auto Save
`eq` provides an ORM object relationship save function that can automatically sense whether an object is deleted, inserted, or modified, initiated with the aggregate root as the save root, implementing automatic sensing and saving of complex structured object trees

## Aggregate Root, Value Object
A save root under eq save function. Any saved object is considered an aggregate root, extending downward until it encounters a query tracking boundary or a non-value object

## Dissociation
A kind of relationship disengagement that occurs under the save function, meaning we artificially make two related objects a and b no longer related. This operation is called dissociation. There are three common types of dissociation:
- No processing
- Set null: Set the relationship key to null
- Delete: Delete the target object value object
The framework default setting is auto automatic processing. When encountering many-to-many, the intermediate table needs dissociation cascade settings

## Ownership
In object relationships, the relationship between two objects a and b may swap with each other
Now there are a1, a2 objects and b1, b2 objects, respectively a1 corresponds to b1, a2 corresponds to b2. If we swap a1 with b2, a2 with b1 during save, or only swap one side, ownership change problems will occur. This behavior is prohibited by default in eq, but if this situation really occurs, users can choose to enable ownership change configuration to allow this operation

## CteViewer
A way for users to customize CTE views, can define complex SQL to be viewed as a "table" in eq. However, this table cannot be deleted, added to, or modified, but has strong typing and no difference from actual business tables, suitable for users to encapsulate some corresponding logic

## code-first
`code-first` or `auto-ddl` is a code-first technology that directly generates databases and tables by writing business logic first and then running it. It is a non-db-first technology choice, suitable for multi-database adaptation code distribution for small and medium-sized application projects, without the need to maintain multiple database scripts, only requiring strong database constraint configuration for current entity objects
