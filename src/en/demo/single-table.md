---
title: Single Table
order: 1
category:
  - Guide
tag:
  - single-table
---


## Complete Single Table Case
First, let's look at a complete version of single table query, involving filtering, aggregation, aggregation filtering, mapping query, and sorting
```java

List<Draft3<String, Integer, LocalDateTime>> myBlog = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        .groupBy(b -> GroupKeys.of(b.title()))
        .having(group -> {
            group.groupTable().star().sum().lt(10);
        })
        //If select is used, the select and previous expressions will be wrapped as an inner view (t1 table). If there are no subsequent chain configurations, it will be expanded, otherwise it will be represented as an inner view (t1 table)
        .select(group -> Select.DRAFT.of(
                group.key1(),//value1
                group.groupTable().star().sum().asAnyType(Integer.class),//value2
                group.groupTable().createTime().max()//value3
        ))
        //If orderBy is not added, the inner view (t1 table) SQL will not be generated
        //Because orderBy is applied to the result of the previous select
        .orderBy(group -> group.value3().desc())
        .limit(2,2)//Limit the returned results
        .toList();



-- 1st SQL data
SELECT
    t1.`value1` AS `value1`,
    t1.`value2` AS `value2`,
    t1.`value3` AS `value3` 
FROM
    (SELECT
        t.`title` AS `value1`,
        SUM(t.`star`) AS `value2`,
        MAX(t.`create_time`) AS `value3` 
    FROM
        `t_blog` t 
    WHERE
        t.`deleted` = false 
        AND t.`content` LIKE '%my blog%' 
    GROUP BY
        t.`title` 
    HAVING
        SUM(t.`star`) < 10) t1 
ORDER BY
    t1.`value3` DESC LIMIT 2,2
```

## Single Table All Columns Return
```java

List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Don't limit the result with select, directly return all columns from the from table
        .toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)



List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //After select on the expression, an inner view will be generated. The difference is that this query will carry an alias
        .select(b -> b)
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Directly return the current table's proxy object (if no operations are performed, it means query all)
        .select(b -> new BlogEntityProxy())
        //.select(b -> new BlogEntityProxy().selectAll(b))
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)
```

::: tip Why do some queries from the main table carry aliases while others don't?
> Because of eq framework's feature: `toList` will execute a `select(class)` on the current expression. If the `toList` parameter is empty, `class` is the current expression's main table type. When eq encounters a situation where the current table is an inner view `select t1.* from (select t.* from xxx t) t1`, it will determine whether there are other operations on the expression. If not, it will expand the current inner view expression to `select t.* from xxx t`. Since the entire expression has only one table (2 tables in total) for the outermost layer, the alias is not displayed. So the final SQL presented is `select * from xxx`

> Based on the above rules, let's look at `select(b -> b)`. Because `select` was executed once, and then `toList` method defaults to executing `select(class)` again, the entire expression becomes a 2-layer inner view `select t2.* from (select t1.* from (select t.* from xx t) t1 )t2`. For the whole, there are 3 tables `t,t1,t2`. For the expanded outermost layer, there are only 2 tables, but because 2 tables need aliases, even if the entire expression is expanded, because there are 2 tables, the entire context will not ignore the alias, so it will eventually become `select t.* from xx t`
:::

## Single Table Partial Columns Return

```java
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        .select(b -> b.FETCHER.id().star().status())
        .toList();

==> Preparing: SELECT t.`id`,t.`star`,t.`status` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Query all fields excluding title and star fields
        .select(b -> b.FETCHER.allFieldsExclude(b.title(),b.star()))
        .toList();


==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`content`,t.`url`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        //The first parameter of select indicates the return type
        //The second parameter indicates the columns to be mapped and their corresponding aliases
        .select(BlogEntity.class,b -> Select.of(
                //lombok uses @FieldsNameConstant
                //You can use BlogEntity.Fields.id to achieve the same effect
                b.id().as(BlogEntityProxy.Fields.id),
                b.title().as(BlogEntityProxy.Fields.title),
                b.star().as(BlogEntityProxy.Fields.star)
        ))
        .toList();

==> Preparing: SELECT t.`id` AS `id`,t.`title` AS `title`,t.`star` AS `star` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: false(Boolean),%my blog%(String),123(String)
```

## Single Table Single Column Return

```java

List<String> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        .select(b -> b.id())
        .toList();


==> Preparing: SELECT t.`id` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: false(Boolean),%my blog%(String),123(String)



List<String> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        .selectColumn(b -> b.id())
        .toList();


==> Preparing: SELECT t.`id` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: false(Boolean),%my blog%(String),123(String)


```

## Return Single Column + Function
```java

List<String> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        .selectColumn(b -> b.id().nullOrDefault("123"))
        .toList();
        
==> Preparing: SELECT IFNULL(t.`id`,?) FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: 123(String),false(Boolean),%my blog%(String),123(String)



List<String> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        //If using fx(column), you need to specify the specific type
        //If using selectColumn, you don't need to specify the type
        .select(b -> new StringProxy(b.id().nullOrDefault("123")))
        .toList();
        
==> Preparing: SELECT IFNULL(t.`id`,?) FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: 123(String),false(Boolean),%my blog%(String),123(String)
```

