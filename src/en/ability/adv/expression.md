---
title: Expression Writing
order: 10
---

# Query Description

Under Java's static language characteristics, `easy-query` references many C# ORMs (efcore, freesql, sqlsugar...) and Java ORMs (mybatis-plus, beetlsql...) to implement support for single-table, multi-table, complex, and nested SQL expressions with strong-type syntax hints, providing another choice for users who don't want to write SQL or are particular about code style.


## select

The `select` in `eq` is used to terminate the current expression and generate a new expression. Simply put, it tells the framework that the result the current expression needs to return is the result of `select`. If you understand `stream api`, you can simply understand it as its `map` operation.

::: tip Concept Supplement!!!

> This ORM `eq` is different from other Java ORMs you're familiar with. This ORM implements nearly 95% of SQL functionality, one of which is subquery nesting. So-called subquery nesting means treating the previous query result as a `derived table` or `inline view`. We will uniformly call it `inline view` hereafter. For example, in `select .... from (select id,name from table where name like ?) t where t.id = ?`, the part inside the parentheses (`select id,name from table where name like ?`) is what we call an `inline view`.
:::

So we can easily implement what other ORMs cannot:

```sql
select ... from
    (
        select
            key1,
            key2,
            count() as c,
            avg() as a,
            sum() as s
        from
            table
        where
            name like ?
        group by
            key1,
            key2
    ) t1
    left join table2 t2 on t1.key1 = t2.key1
where.....
```

## select Post-positioned Style

Unlike native SQL, in the DSL provided by `eq`, a post-positioned `select` style is used. This style is more common in C# language ORMs and has similarities with `stream api`. So why does `eq` choose post-positioned `select`?

- For strongly-typed Java language, post-positioned `select` helps deduce the classes that can be operated on subsequently in the expression, like `stream api`
- Post-positioned `select` is essentially the same as writing SQL. Although you write select first when writing SQL, you cannot write the content of select without writing `from group by` and other operations; you can only use `*` instead. So the essence of SQL writing is also post-positioned `select`

<img :src="$withBase('/images/sql-executor.png')" width="500">

::: tip Note!!!

> This diagram fully illustrates the SQL execution and parsing process, which is also the writing process of eq. The only thing that can be switched in this execution process is the order of `select` and `order by`

> Each select will summarize the previous expression to generate an `inline view`. If you continue to operate on the subsequent select, you will operate on the `inline view`

> Among them, 6 and 7 can be interchanged. If `select` comes before `order`, the `inline view` will be sorted. If `order` comes before `select`, it will be sorted first and then generate the `inline view`, but because the `inline view` has no subsequent operations, it will be expanded, i.e., no `inline view` will be generated
:::

The `select` statement appears after `where`, `orderBy`, `groupBy`, `having`, etc. If the expression calls `select`, then this SQL is determined. If `where` is called again, the previous expression will be treated as a `derived table` or `inline view`, such as `select .... from (select id,name from table ) t where t.id = ?`. Each `select` will wrap the current expression's result set once (`derived table` or `inline view`)



<img :src="$withBase('/images/simple-query.jpg')">

Taking this simple example, we can see that the order we should write is select at the end
```java
easyEntityQuery.queryable(HelpProvince.class)
        .where(o -> o.id().eq("1"))
        .orderBy(o -> o.id().asc())
        .select(o -> new HelpProvinceProxy()
                .id().set(o.id())
                .name().set(o.name())
        )
        //Essentially the following syntax
        // .select(o->{
        //        HelpProvinceProxy province= new HelpProvinceProxy();
        //         province.id().set(o.id());
        //         province.name().set(o.name());
        //         return province;
        // })
        //.select(o->o.FETCHER.id().name().fetchProxy())//If the return result is the same, you can use fetcher
        // .select(o->new HelpProvinceProxy(){{//Double brace initialization return
        //         id().set(o.id());
        //         name().set(o.name());
        // }})
        .toList();
```

Complex query order
<img :src="$withBase('/images/simple-nest-query.jpg')">

```java
easyEntityQuery.queryable(HelpProvince.class) //1
        .where(o->o.id().eq("1")) //2
        .orderBy(o->o.id().asc()) //3
        .select(o->new HelpProvinceProxy()//4 
                .id().set(o.id())
                .name().set(o.name())
        )
        //.select(o->o.FETCHER.id().name().fetchProxy())//If the return result is the same, you can use fetcher
        .where(o->o.id().eq("1")) // 5
        .select(o->new HelpProvinceProxy()
                .id().set(o.id())//6
        )
        .toList();
```

::: warning Note and Explanation!!!
> Select is generally written last. When you haven't written the table, you can only use * instead. After writing the table and confirming, then writing conditions, sorting, grouping, etc., and then writing the select columns. If you don't write, it's the main table's *. If you write where again, it will wrap the previous table in parentheses for anonymous table processing, and so on
:::

## Decompose Expression

### 1
```java
Expression: easyEntityQuery.queryable(HelpProvince.class)

sql: select * from help_province
```
### 2
```java
Expression: easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")) 

sql: select * from help_province where id='1'
```

### 3
```java
Expression: easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")).orderBy(o->o.id().asc())

sql: select * from help_province where id='1' order by id asc
```
### 4
```java
Expression:          easyEntityQuery.queryable(HelpProvince.class)
                        .where(o -> o.id().eq("1"))
                        .orderBy(o -> o.id().asc())
                        .select(o -> new HelpProvinceProxy()
                                .id().set(o.id())
                                .name().set(o.name())
                        )

sql: select id,name from help_province where id='1' order by id asc
```
Using the `select` method as a termination method to end this `sql` chain, subsequent operations will convert `select` and the previous expression into `anonymous sql` similar to `select * from (select * from help_province) t`. The simplified operation of `select` `o->o.FETCHER.id().name()` does not support returning VO and subsequent chaining. It is only used for quickly selecting columns when and only when the return result is itself. If you need to support subsequent chaining, please add `.fetchProxy()`

### 5
```java
Expression: easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//Convert to anonymous table sql
                .where(o->o.id().eq("1")) 

sql: select * from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

### 6
```java
Expression: easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//Convert to anonymous table sql
                .where(o->o.id().eq("1"))
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                ) 

sql: select id from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

::: tip Chain Explanation!!!
> All operations before select, such as multiple wheres and multiple orderBys, are appended to the previous ones. Limit replaces the previous operation. Multiple limits get the last one
> Under entityQuery, groupBy does not support consecutive calls of two. There must be a select between groupBys to specify the query result. Under other APIs, multiple calls also append
:::

