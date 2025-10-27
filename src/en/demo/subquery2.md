---
title: Explicit Subquery
order: 5
category:
  - Guide
tag:
  - subquery
---
# Multi-Table Query
For subqueries, `eq` also has multiple modes that can be mixed together
- `Implicit join` provides object-oriented data filtering with perfect reading and writing experience
- `Explicit subquery` has the same conventional writing experience as SQL, and users can control the whole situation

## Implicit Subquery
Implicit subqueries are divided into multiple subqueries mainly based on where they appear and their functions, such as in where or select or orderBy.... They can also be divided by function into independent subqueries or merged subqueries

## WHERE Subquery

`easy-query` provides support for subqueries including `exists`, `not exists`, `in`, `not in`, with both manual and automatic methods



::: danger Note!!!
> Use `subQueryable` in expressions as much as possible instead of using eq instance to build independent subqueries
> The difference is that independent subqueries built with `eq` instances cannot sense the expression context in where, order, and other conditions, and will have a limitation that the subquery table must be on the left side
> While `subQueryable` subqueries built in expressions can sense the expression context and freely build conditions
:::

## EXISTS

::: tabs
@tab Object Mode
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?



        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    Expression expression = o.expression();
                    
                    expression.exists(() -> {
                        return expression.subQueryable(BlogEntity.class).where(q -> {
                            q.id().eq("1" );
                            q.id().eq(o.id());
                        });
                    });
                }).toList();


//Both methods work, but the above method is recommended. The difference is that the subQueryable below is an independent subquery that cannot sense the expression context in where, order, and other conditions, and will have a limitation that the subquery table must be on the left side
// EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
//         .where(o -> o.id().eq("1" ));

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.expression().exists(() -> {
//                 return subQueryable.where(q -> q.id().eq(o.id()));
//         })).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 1
```


::: 


## NOT EXISTS

::: tabs
@tab Object Mode
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?


List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            Expression expression = o.expression();
            expression.notExists(() -> {
                return expression.subQueryable(BlogEntity.class).where(q -> {
                    q.id().eq("1");
                    q.id().eq(o.id());
                });
            });
        }).toList();

// EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
//         .where(o -> o.id().eq("1" ));

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.notExists(() -> {
//             return subQueryable.where(q -> q.id().eq(o.id()));
//         })).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE NOT EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 100
```


::: 


## IN

::: tabs
@tab Object Mode

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            Query<String> stringQuery = o.expression().subQueryable(BlogEntity.class)
                    .where(x -> o.id().eq("123"))
                    .selectColumn(x -> x.id());

            o.id().in(
                    stringQuery 
            );
        }).toList();

// EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
//         .where(o -> o.id().eq("123" ))
//         .selectColumn(o -> o.id());//If the subquery in is for string, then select should be string. If integer, then select should be integer. Both sides need to be consistent

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.id().in(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),123(String)
<== Time Elapsed: 4(ms)
<== Total: 0
```


::: 

## NOT IN

::: tabs
@tab Object Mode

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?


List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            Query<String> stringQuery = o.expression().subQueryable(BlogEntity.class)
                    .where(x -> o.id().eq("123"))
                    .selectColumn(x -> x.id());

            o.id().notIn(
                    stringQuery 
            );
        }).toList();
// EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
//         .where(o -> o.id().eq("123" ))
//         .selectColumn(o -> o.id());//If the subquery in is for string, then select should be string. If integer, then select should be integer. Both sides need to be consistent

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.id().notIn(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```
::: 

