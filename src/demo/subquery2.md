---
title: 显式子查询
order: 5
category:
  - Guide
tag:
  - subquery
---
# 连表查询
`eq`对于子查询也有多种模式并且也可以混合使用
- `隐式join`面向对象的方式进行数据的筛选拥有非常完美的阅读体验和书写体验
- `显式子查询`拥有和sql一样的常规编写体验，用户可以把控全局

## 隐式子查询
隐式子查询分为多个子查询主要是按出现的地方和功能来进行区分比如在where里面或者select中亦或者是orderBy....也可以按功能来分独立子查询或者是合并子查询

## where子查询

`easy-qeury`提供支持子查询包括`exists`、`not exists`、`in`、`not in`,并且有手动和自动两种方式



::: danger 说明!!!
> 尽可能在表达式使用子查询`subQueryable`而不是使用eq实例构建独立子查询
> 区别在于`eq`实例构建的是独立子查询无法感知表达式上下文在where order 等条件中，会有必须子查询表在左侧的限制
> 而表达式构建的`subQueryable`子查询可以感知表达式上下文自由构建条件
:::

## EXISTS

::: tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?



        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    Expression expression = o.expression();
                    
                    expression.exists(
                        expression.subQueryable(BlogEntity.class).where(q -> {
                            q.id().eq("1" );
                            q.id().eq(o.id());
                        })
                    );
                }).toList();


//上下两种都可以但是建议使用上面那种,区别在于下面这种subQueryable是独立子查询无法感知表达式上下文在where order 等条件中，会有必须子查询表在左侧的限制
// EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
//         .where(o -> o.id().eq("1" ));

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.expression().exists(
//              subQueryable.where(q -> q.id().eq(o.id()))
//         )).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 1
```


::: 


## NOT EXISTS

::: tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?


List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            Expression expression = o.expression();
            expression.notExists(
                expression.subQueryable(BlogEntity.class).where(q -> {
                    q.id().eq("1");
                    q.id().eq(o.id());
                })
            );
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
@tab 对象模式

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
//         .selectColumn(o -> o.id());//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

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
@tab 对象模式

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
//         .selectColumn(o -> o.id());//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

// List<Topic> list = easyEntityQuery.queryable(Topic.class)
//         .where(o -> o.id().notIn(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```
::: 
