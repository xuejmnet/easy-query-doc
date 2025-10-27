---
title: General Functions
order: 10
---

`General functions` refer to functions that all types have and are not related to specific types

## nullOrDefault
A function used to describe using a default value when the value is null

Database  | Dialect  
---  | --- 
MySQL  | IFNULL
MSSQL  | ISNULL
PGSQL  | COALESCE
ORACLE  | NVL


Usage


```java
List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
                    .where(bank_card -> {
                        bank_card.code().nullOrDefault("noCode").eq("123");
                    }).toList();
```

## count | intCount
Used to get how many quantities of the current column exist. There is an overload `distinct:true/false`. For example, `o.id().count()` and `o.id().count(true)`

Database  | Dialect  
---  | --- 
MySQL  | COUNT
MSSQL  | COUNT
PGSQL  | COUNT
ORACLE  | COUNT


Aggregate function `filter` supports additional operations with implicit case when

Usage


```java

List<Draft3<Long, Long, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {
            t_blog.content().like("abc");
        }).select(t_blog -> Select.DRAFT.of(
                t_blog.id().count(),//count(id)
                t_blog.title().count(true),//count(distinct title)
                t_blog.title().count().filter(() -> {//count titles that are not "scary"
                    t_blog.title().ne("恐怖");
                })
        )).toList();
```


## max | min
Used to return the maximum and minimum values of the current property

Database  | Dialect  | Dialect  
---  | ---  | --- 
MySQL  | MAX | MIN
MSSQL  | MAX | MIN
PGSQL  | MAX | MIN
ORACLE  | MAX | MIN


Aggregate function `filter` supports additional operations with implicit case when

```java

    easyEntityQuery.queryable(BlogEntity.class)
            .where(t_blog -> {
                t_blog.content().like("abc");
            }).select(t_blog -> Select.DRAFT.of(
                    t_blog.score().max(),//max(id)
                    t_blog.score().max().filter(() -> {//get max score for titles that are not "scary"
                        t_blog.title().ne("恐怖");
                    })
            )).toList();
```

## maxColumns | minColumns
For databases that support `GREATEST` and `LEAST` and support ignoring nulls, use this function. If not supported or if ignoring nulls is not supported, it will be supported through `case when` or other methods
```java
        List<DamengMyTopic> list = entityQuery.queryable(DamengMyTopic.class)
                .where(d -> {
                    d.expression().maxColumns(d.id(), d.title(), d.title().nullOrDefault(d.id())).eq("123");
                }).toList();
```
This function can find out whether the maximum value of `id`, `title`, and `ifnull(title)` equals `'123'`



## equalsWith
Used to compare whether two values are the same and return a true/false expression



```java
List<Draft1<Boolean>> list = easyEntityQuery.queryable(DocBankCard.class)
                    .where(bank_card -> {
                        bank_card.code().equalsWith("myCode").eq(false);
                    })
                    .select(bank_card -> Select.DRAFT.of(
                            bank_card.id().equalsWith("123")
                    )).toList();

```





## Database Function Related Search
IFNULL ISNULL COALESCE NVL COUNT MAX MIN

