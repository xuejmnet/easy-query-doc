---
title: Related Terminology
order: 5
---

# Related Terminology

::: warning Key Points!!!
> `Implicit Expression` and `DTO Query` are the key points in `eq`. If you master these two points, you'll understand 80% of `eq`.
:::

## Implicit Expression

`Implicit Query` is a way to filter, assemble, and sort database data by writing expressions through object relationship descriptions. This is called implicit expression in eq.

Also known as `auto join` or `auto subquery`.

::: tip Note!!!
> `Implicit Expression` is the top priority in `eq`. If you use eq without mastering implicit expression, then using `eq` is not much different from using other ORMs. 70% of `eq`'s power comes from implicit expressions.
:::

### Implicit Join

The following is an `implicit join` operation setting `user` and `company` as many-to-one relationship. The join operation is not reflected in the expression, but expression writing is achieved through the object relationship tree.

```java
eq.queryable(User.class)
    .where(u->{
        u.company().name().eq("XX Company")
    })
    .toList();
```

### Implicit Subquery

The following is an `implicit subquery` operation setting `user` and `bankCard` as one-to-many relationship. The `exists` statement is not reflected in the expression, but the expression still queries users who have at least one savings card when the condition is met in a `stream`-like way.

```java
eq.queryable(User.class)
    .where(u->{
        u.bankCards().any(card->{
            card.type().eq("Savings Card")
        })
    })
    .toList();
```

## Explicit Expression

`Explicit Query` manually joins two or more objects or generates subquery expressions.

Also known as `manual join` or `manual subquery`.

### Explicit Join

The following is an `explicit join` operation setting `SysUser` and `SysBankCard` manually joined together and querying all user fields and bankCard's type field.

```java
eq.queryable(SysUser.class)
    .leftJoin(SysBankCard.class, (user, bank_card) -> user.id().eq(bank_card.uid()))
    .where((user, bank_card) -> {
        user.username().contains("XiaoMing");
    })
    .select((user, bank_card) -> Select.PART.of(
            user,
            bank_card.type()
    )).toList();
```

### Explicit Subquery

The following is an `explicit subquery` operation setting `user` and `bankCard` for subquery filtering, querying users who must have a savings card.

```java
eq.queryable(SysUser.class)
    .where(user -> {
        user.id().in(
                eq.queryable(SysBankCard.class)
                        .where(bank_card -> {
                            bank_card.uid().eq(user.id());
                            bank_card.type().eq("Savings Card");
                        }).select(bank_card -> bank_card.uid())
        );
    }).toList();
```

## Include Query

::: tip Note!!!
> This operation will NOT have N+1 problem
> Use `include` for `OneToOne` or `ManyToOne`, use `includes` for `OneToMany` or `ManyToMany`
:::

`include` query is a secondary query after object relationship modeling, supports unlimited nested levels "pulling out radish brings out mud".
```java

        List<SysUser> list = eq.queryable(SysUser.class)
                .toList();
        List<SysUser> list1 = eq.queryable(SysUser.class)
                .includes(user -> user.bankCards())//If returned object has no BankCards, collection is empty collection, object is null
                .toList();
```

The second operation will generate a second query. Through the first query of `SysUser`'s id, perform a second query of `SysBankCard` records. The return structure is as follows:

```json
{
  "id": "1",
  "username": "1",
  "age": 12,
  "bankCards": [{ "id": "1", "uid": "1" }]
}
```

## Implicit Group, GroupJoin
`eq` extends almost all subquery functions, allowing subqueries to cooperate with user business systems, not just simple fetch queries. Supports `where subquery`, `order subquery`, `select subquery`. However, too many subqueries will slow down SQL performance. So `eq` completed the last piece of the subquery puzzle in 3.x version - performance improvement by automatically converting subqueries to `Group Join`. We call this function `Implicit Group` or `GroupJoin`. In actual business, complex SQL query nesting multiple subqueries can greatly improve SQL performance.

## DTO Query🔥
`DTO Query` is the collective name for `selectAutoInclude`, `whereObject`, `orderByObject`. These functions together build `DTO Query`. In our actual business, it can greatly improve user development efficiency. Can be viewed as strongly-typed version of `GraphQL`.

```java
//Assume this is our requested JSON data
QueryRequest request=new QueryRequest();
eq.queryable(SysUser.class)
    .whereObject(request)//Auto query by configured conditions
    .orderByObject(request)//Auto sort by configuration
    .selectAutoInclude(QueryResponse.class)//Auto return any structured object downward from SysUser as object tree root
    .toList()
```

## Data Tracking
Data tracking is commonly used for object update and object save operations. After enabling tracking for object update, eq can identify whether the tracked object's value has changed, thus generating differential update set columns. For object save, save allows objects to be saved in aggregate root form, with maximum range being the queried tracked object path and non-value type position data range boundary as save boundary, automatically sensing insert, update, delete, or set to null.

## Computed Property
`eq` extends common data objects, divided into two types of computed properties:
- In-memory computed property: such as enum, JSON map or JSON array
- Database computed property: such as age, status, etc.

In-memory computed property is only the type after computed property at business code level. Actual mapping to database is still basic type.

Database computed property differs from in-memory computed property. Database computed property supports participating in any expression operations, equivalent to actual table properties except cannot be modified or inserted. Even object associations can use this property.

## Auto Save
`eq` provides an ORM object relationship save function that can automatically sense whether object is deleted, inserted, or modified, initiated from aggregate root as save root, implementing automatic sensing save of complex structured object trees.

## Aggregate Root, Value Object
A save root under eq save function. Any saved object is viewed as aggregate root, extending downward until encountering query tracking boundary or non-value object.

## Dissociate
A relationship separation that occurs under save function. That is, we manually separate a and b two related objects so they no longer have relationship. We call this dissociate. There are three common types of dissociation:
- No processing
- Set null by setting relationship key to null
- Delete by deleting target object value object
Framework default is set to auto processing. When encountering many-to-many, need to set dissociation cascade for intermediate table.

## Ownership
In object relationships, a and b two object relationships may swap with each other.
Now there are a1, a2 objects and b1, b2 objects corresponding to a1 with b1, a2 with b2. If we save by swapping a1 with b2, a2 with b1, or only swapping one side, ownership change problem will occur. This behavior is prohibited by eq by default. But if this situation really exists, users can choose to enable ownership change configuration to allow this operation.

## CteViewer
A way to let users customize CTE view. Can define complex SQL to be viewed as a "table" in eq. This table just cannot be deleted, inserted, or modified, but has strong typing and no difference from actual business tables. Suitable for users to encapsulate some corresponding logic.

## code-first
`code-first` or `auto-ddl` is a code-first technology that generates databases and tables directly by writing business logic first and then running, rather than db-first technology selection. Suitable for code distribution under multi-database adaptation for small and medium-sized application projects, no need to maintain multiple database scripts, only need to configure strong database constraints on current entity objects.

