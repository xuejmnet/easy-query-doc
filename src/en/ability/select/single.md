---
title: Single Table Query
order: 40
---

## Single Table Complete Example
First, let's look at a complete version of single table query, involving filtering, aggregation, aggregate filtering, mapping query, and sorting:
```java

List<Draft3<String, Integer, LocalDateTime>> myBlog = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        .groupBy(b -> GroupKeys.of(b.title()))
        .having(group -> {
            group.groupTable().star().sum().lt(10);
        })
        //select will wrap select and previous expression as an embedded view (t1 table). If no subsequent chain configuration, will expand; otherwise represented as embedded view (t1 table)
        .select(group -> Select.DRAFT.of(
                group.key1(),//value1
                group.groupTable().star().sum().asAnyType(Integer.class),//value2
                group.groupTable().createTime().max()//value3
        ))
        //If orderBy is not added, embedded view (t1 table) SQL will not be generated
        //Because orderBy is for ordering the previous select result
        .orderBy(group -> group.value3().desc())
        .limit(2,2)//Limit the returned result
        .toList();



-- SQL 1
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

## Single Table Return All Columns
```java

List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Don't limit result with select, directly return all columns from from table
        .toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)



List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Using select on expression generates embedded view. Difference is this query carries alias
        .select(b -> b)
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //Directly return current table's proxy object (not performing any operations means query all)
        .select(b -> new BlogEntityProxy())
        //.select(b -> new BlogEntityProxy().selectAll(b))
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)
```

::: tip Why do all query from main table, but one carries alias and one doesn't?
> Because of eq framework's characteristic: `toList` executes a `select(class)` on current expression. If `toList` input parameter is empty, `class` is current expression's main table type. And eq, when encountering current table as embedded view like `select t1.* from (select t.* from xxx t) t1`, will judge if there are other operations. If not, will expand current embedded view expression, expanding to `select t.* from xxx t`. Because the entire expression has only one table for the outermost layer (2 tables overall), when expression has only one table, alias is not displayed. So the final SQL is `select * from xxx`

> Based on the above rules, we see `select(b -> b)` executes a `select` once, then `toList` method defaults to execute `select(class)` again. So the entire expression becomes 2-layer embedded view `select t2.* from (select t1.* from (select t.* from xx t) t1 )t2`. Overall 3 tables `t,t1,t2`. For the expanded outermost layer, only 2 tables. But because 2 tables need alias, even if the entire expression is expanded, because it's 2 tables, the entire context won't ignore aliases. So it finally becomes `select t.* from xx t`
:::

## Single Table Return Partial Columns

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
        //First parameter of select represents return type
        //Second parameter represents columns to map and corresponding aliases
        .select(BlogEntity.class,b -> Select.of(
                //lombok uses @FieldsNameConstant
                //Can use BlogEntity.Fields.id to achieve same effect
                b.id().as(BlogEntityProxy.Fields.id),
                b.title().as(BlogEntityProxy.Fields.title),
                b.star().as(BlogEntityProxy.Fields.star)
        ))
        .toList();

==> Preparing: SELECT t.`id` AS `id`,t.`title` AS `title`,t.`star` AS `star` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: false(Boolean),%my blog%(String),123(String)
```

## Single Table Return Single Column

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
        //If using fx(column), need to return specific type
        //If using selectColumn, no need to specify type
        .select(b -> new StringProxy(b.id().nullOrDefault("123")))
        .toList();
        
==> Preparing: SELECT IFNULL(t.`id`,?) FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: 123(String),false(Boolean),%my blog%(String),123(String)
```

