---
title: CaseWhen
order: 130
---


# CaseWhen
`easy-query`可以自定义实现`case when`,其中框架默认提供多种实现

方法  | 描述 | 用法  
--- | --- | --- 
SQLClientFunc | 支持`EasyQueryClient`表达式api  | `SQLClientFunc.caseWhenBuilder(t).caseWhen(f -> f.eq("title", "123"), "111").caseWhen(f -> f.eq("title", "456"), "222").elseEnd("2223")`
Expression | 支持`EasyEntityQuery`表达式api   | `o.expression().caseWhen(() -> o.title().eq("123")).then("1").elseEnd("2")`
隐式`CaseWhen` | 对属性使用聚合函数+filter筛选  | `o.age().sum().filter(()->o.name().like("小明"))`



## 简单查询


::: tabs

@tab entity
```java

        easyEntityQuery.queryable(Topic.class)
                .where(t_topic -> {
                    t_topic.title().eq("someTitle");
                })
                .select(t_topic -> new TopicProxy()
                        .title().set(
                                t_topic.expression().caseWhen(() -> t_topic.title().eq("123")).then("1").elseEnd("2").asAnyType(String.class)
                        )
                        .id().set(t_topic.id())
                ).toList();

==> Preparing: SELECT (CASE WHEN t.`title` = ? THEN ? ELSE ? END) AS `title`,t.`id` AS `id` FROM `t_topic` t WHERE t.`title` = ?
==> Parameters: 123(String),1(String),2(String),someTitle(String)
```

@tab client
```java

List<Topic> list = easyQueryClient.queryable(Topic.class)
                .where(t -> t.like("title", "someTitle"))
                .select(Topic.class, t -> t
                        .sqlSegmentAs(
                                SQLClientFunc.caseWhenBuilder(t)
                                        .caseWhen(f -> f.eq("title", "123"), "111")
                                        .caseWhen(f -> f.eq("title", "456"), "222")
                                        .elseEnd("222")
                                , "title")
                        .column("id")
                ).toList();

==> Preparing: SELECT CASE WHEN t.`title` = ? THEN ? WHEN t.`title` = ? THEN ? ELSE ? END AS `title`,t.`id` FROM `t_topic` t WHERE t.`title` LIKE ?
==> Parameters: 123(String),111(String),456(String),222(String),222(String),%someTitle%(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```

:::

## 多条件CaseWhen
有时候我们的case when需要实现多个条件而不是单一条件
```java
List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(t_topic -> {
                    t_topic.expression().caseWhen(() -> t_topic.title().eq("123"))
                            .then(1)
                            .caseWhen(() -> {
                                t_topic.title().eq("456");
                                t_topic.stars().eq(1);
                            }).then(t_topic.stars())
                            .elseEnd(3).eq(4);
                    t_topic.title().eq("someTitle");
                })
                .select(t_topic -> new TopicProxy()
                        .title().set(
                                t_topic.expression().caseWhen(() -> t_topic.title().eq("123")).then("1").elseEnd("2").asAnyType(String.class)
                        )
                        .id().set(t_topic.id())
                ).toList();

==> Preparing: SELECT (CASE WHEN t.`title` = ? THEN ? ELSE ? END) AS `title`,t.`id` AS `id` FROM `t_topic` t WHERE (CASE WHEN t.`title` = ? THEN ? WHEN t.`title` = ? AND t.`stars` = ? THEN t.`stars` ELSE ? END) = ? AND t.`title` = ?
==> Parameters: 123(String),1(String),2(String),123(String),1(Integer),456(String),1(Integer),3(Integer),4(Integer),someTitle(String)
<== Time Elapsed: 2(ms)
<== Total: 0

```

## 属性聚合函数筛选
`eq`对大部分函数实现了属性聚合函数筛选来实现隐式`CaseWhen`
```java

easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {
                t_blog.title().like("123");

        }).groupBy(t_blog -> GroupKeys.of(t_blog.title()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.groupTable().id().count().filter(() -> {
                        group.groupTable().star().ge(123);
                })
        )).toList();



-- 第1条sql数据
SELECT
    t.`title` AS `value1`,
    COUNT((CASE WHEN t.`star` >= 123 THEN t.`id` ELSE NULL END)) AS `value2` 
FROM
    `t_blog` t 
WHERE
    t.`deleted` = false 
    AND t.`title` LIKE '%123%' 
GROUP BY
    t.`title`
```

## group+where
```java

easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {
                t_blog.title().like("123");

        }).groupBy(t_blog -> GroupKeys.of(t_blog.title()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.where(t -> t.star().ge(123)).count()
        )).toList();



-- 第1条sql数据
SELECT
    t.`title` AS `value1`,
    COUNT((CASE WHEN t.`star` >= 123 THEN 1 ELSE NULL END)) AS `value2` 
FROM
    `t_blog` t 
WHERE
    t.`deleted` = false 
    AND t.`title` LIKE '%123%' 
GROUP BY
    t.`title`
```