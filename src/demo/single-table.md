---
title: 单表
order: 1
category:
  - Guide
tag:
  - single-table
---


## 单表完整案例
首先我们来看一下完整版本的单表查询,涉及到筛选、聚合、聚合筛选、映射查询、排序
```java

List<Draft3<String, Integer, LocalDateTime>> myBlog = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        .groupBy(b -> GroupKeys.of(b.title()))
        .having(group -> {
            group.groupTable().star().sum().lt(10);
        })
        //select那么会将select和之前的表达式作为一个内嵌视图(t1表)进行包裹如果后续没有链式配置则会展开否则以内嵌视图(t1表)表示
        .select(group -> Select.DRAFT.of(
                group.key1(),//value1
                group.groupTable().star().sum().asAnyType(Integer.class),//value2
                group.groupTable().createTime().max()//value3
        ))
        //如果不添加orderBy则不会生成内嵌视图(t1表)sql
        //因为orderBy是对前面的select结果进行orderBy
        .orderBy(group -> group.value3().desc())
        .limit(2,2)//对结果进行限制返回
        .toList();



-- 第1条sql数据
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

## 单表全部列返回
```java

List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //不对结果进行select限制直接返回from表的全部列
        .toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)



List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //对表达式进行select后会生成内嵌视图区别是本次查询会携带别名
        .select(b -> b)
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
        })
        //直接返回当前表的代理对象(不进行任何操作则表示查询全部)
        .select(b -> new BlogEntityProxy())
        //.select(b -> new BlogEntityProxy().selectAll(b))
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)
```

::: tip 都是查询from主表为什么会出现一个携带别名一个携带别名?
> 因为eq框架的特性:`toList`会对当前表达式执行一次`select(class)`如果`toList`入参为空则`class`为当前表达式主表类型,并且eq在遇到当前表为内嵌视图的情况下`select t1.* from (select t.* from xxx t) t1`会对表达式进行判断是否存在其余操作如果不存在则会对当前内嵌视图表达式进行展开,展开后为`select t.* from xxx t`,因为整个表达式对于最外层而言只有一张表(整体2张表)所以所以当表达式只存在一张表时则不显示别名。所以最终呈现的sql为`select * from xxx`

> 基于上述规则我们看`select(b -> b)`因为执行了一次`select`然后`toList`方法默认又会执行一次`select(class)`那么整个表达式会变成2层内嵌视图`select t2.* from (select t1.* from (select t.* from xx t) t1 )t2`对于整体而言是3张表`t,t1,t2`对于展开的最外层而言只有2张表,但是因为2张表需要别名,所以哪怕把整个表达式都展开但是因为是2张表所以整个上下文不会忽略别名那么最终会变成`select t.* from xx t`
:::

## 单表部分列返回

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
        //查询所有字段排除titile和star字段
        .select(b -> b.FETCHER.allFieldsExclude(b.title(),b.star()))
        .toList();


==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`content`,t.`url`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ?
==> Parameters: false(Boolean),%my blog%(String)


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(b -> {
            b.content().like("my blog");
            b.title().eq("123");
        })
        //select第一个参数表示返回类型
        //第二个参数表示要映射的列和对应的别名
        .select(BlogEntity.class,b -> Select.of(
                //lombok 使用@FieldsNameConstant
                //可以使用BlogEntity.Fields.id达到一样的下过
                b.id().as(BlogEntityProxy.Fields.id),
                b.title().as(BlogEntityProxy.Fields.title),
                b.star().as(BlogEntityProxy.Fields.star)
        ))
        .toList();

==> Preparing: SELECT t.`id` AS `id`,t.`title` AS `title`,t.`star` AS `star` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: false(Boolean),%my blog%(String),123(String)
```

## 单表单列返回

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

## 返回单列+函数
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
        //如果使用fx(column)则需要返回指定具体类型
        //如果使用selectColumn则不需要指定类型
        .select(b -> new StringProxy(b.id().nullOrDefault("123")))
        .toList();
        
==> Preparing: SELECT IFNULL(t.`id`,?) FROM `t_blog` t WHERE t.`deleted` = ? AND t.`content` LIKE ? AND t.`title` = ?
==> Parameters: 123(String),false(Boolean),%my blog%(String),123(String)
```