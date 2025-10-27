---
title: Object Sorting
order: 12
---

# Sorting
`easy-query` provides convenient sorting query functionality, supporting function sorting and column sorting, etc.

## Single Field Sorting
::: code-tabs

@tab Object Mode
```java
 List<Topic> list = easyEntityQuery.queryable(Topic.class)
                    .orderBy(t -> t.id().asc())
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY `id` ASC
<== Time Elapsed: 2(ms)
<== Total: 101
```

:::

## Two Field Sorting
::: code-tabs

@tab Object Mode
```java

//Two field sorting

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> t.id().asc())
        .orderBy(t -> t.createTime().desc())
        .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY `id` ASC,`create_time` DESC
<== Time Elapsed: 3(ms)
<== Total: 101



List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.id().asc();
            t.createTime().desc();
        })
        .toList();


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY `id` ASC,`create_time` DESC
<== Time Elapsed: 3(ms)
<== Total: 101
```

:::

## Dynamic Sorting
::: code-tabs

@tab Object Mode
```java

//Dynamic sorting

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.id().asc(false);//false means not effective
            t.createTime().desc();
        })
        .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY `create_time` DESC
<== Time Elapsed: 3(ms)
<== Total: 101
```

:::

If you want to implement frontend sorting, you can refer to this link [DynamicSort](/en/easy-query-doc/query/dynamic-sort)

## Function Sorting
::: code-tabs

@tab Object Mode
```java

//Function sorting

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.createTime().format("yyyy-MM-dd").desc();
        })
        .toList();


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY DATE_FORMAT(`create_time`,'%Y-%m-%d') DESC
<== Time Elapsed: 11(ms)
<== Total: 101
```

:::

## Null First/Last

Supports all databases, Oracle generates `id asc nulls first`
```java

//nulls last/first
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.id().asc(OrderByModeEnum.NULLS_LAST);
            t.createTime().desc(OrderByModeEnum.NULLS_FIRST);
        })
        .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` ORDER BY CASE WHEN `id` IS NULL THEN 1 ELSE 0 END ASC,`id` ASC,CASE WHEN `create_time` IS NULL THEN 0 ELSE 1 END ASC,`create_time` DESC
<== Time Elapsed: 5(ms)
<== Total: 101
```

## Custom Ascending/Descending

```java

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.id().asc(false);//false means not effective
            t.createTime().orderBy(true/false);//true/false indicates ascending/descending, not whether it's effective
        })
        .toList();

boolean asc=false;
OrderByModeEnum nullMode=OrderByModeEnum.NULLS_LAST;
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .orderBy(t -> {
            t.createTime().orderBy(asc,nullMode);//true/false indicates ascending/descending, not whether it's effective
        })
        .toList();

```

