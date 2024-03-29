---
title: 子查询 In/Exists
---
# 子查询
`easy-qeury`提供支持子查询包括`exists`、`not exists`、`in`、`not in`

## EXISTS

::: code-tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
        .where(o -> o.id().eq("1" ));

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.expression().exists(() -> {
                return subQueryable.where(q -> q.id().eq(o.id()));
        })).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 1
```

@tab lambda模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
 Queryable<BlogEntity> subQueryable = easyQuery.queryable(BlogEntity.class)
                .where(o -> o.eq(BlogEntity::getId, "1"));


List<Topic> x = easyQuery
        .queryable(Topic.class).where(o -> o.expression().exists(subQueryable.where(q -> q.eq(o, BlogEntity::getId, Topic::getId)))).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 1
```

::: 


## NOT EXISTS

::: code-tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("1" ));

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.notExists(() -> {
                    return subQueryable.where(q -> q.id().eq(o.id()));
                })).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE NOT EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 100
```

@tab lambda模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
Queryable<BlogEntity> subQueryable = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "1"));

List<Topic> x = easyQuery
        .queryable(Topic.class).where(o -> o.notExists(subQueryable.where(q -> q.eq(o, BlogEntity::getId, Topic::getId)))).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE NOT EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 100
```


::: 


## IN

::: code-tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .select(o -> new StringProxy(o.id()));//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().in(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),123(String)
<== Time Elapsed: 4(ms)
<== Total: 0
```

@tab lambda模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
Queryable<String> idQueryable = easyQuery.queryable(BlogEntity.class)
            .where(o -> o.eq(BlogEntity::getId, "123"))
            .select(String.class, o -> o.column(BlogEntity::getId));//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致
List<Topic> list = easyQuery
        .queryable(Topic.class).where(o -> o.in(Topic::getId, idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```


::: 

## NOT IN

::: code-tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .select(o -> new StringProxy(o.id()));//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().notIn(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```

@tab lambda模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
Queryable<String> idQueryable = easyQuery.queryable(BlogEntity.class)
            .where(o -> o.eq(BlogEntity::getId, "1"))
            .select(String.class, o -> o.column(BlogEntity::getId));

List<Topic> list = easyQuery
        .queryable(Topic.class).where(o -> o.notIn(Topic::getId, idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```
::: 