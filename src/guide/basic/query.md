---
title: 查询
order: 40
---

# 查询

`EasyQuery`在java的静态语言特性下，参考众多C# ORM(efcore,freesql,sqlsugar...),和java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的sql表达式，并且拥有强类型语法提示，可以帮助不想写sql的用户，有洁癖的用户多一个选择.

## 单表查询
```java
//根据条件查询表中的第一条记录
List<Topic> topics = easyQuery
                .queryable(Topic.class)
                .limit(1)
                .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1

//根据条件查询表中的第一条记录
Topic topic = easyQuery
                .queryable(Topic.class)
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1 

//根据条件查询id为3的记录
Topic topic = easyQuery
                .queryable(Topic.class)
                .where(o->o.eq(Topic::getId,"3"))
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

//根据条件查询id为3的集合
List<Topic> topics = easyQuery
                .queryable(Topic.class)
                .where(o->o.eq(Topic::getId,"3"))
                .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```

## 多表
```java
 Topic topic = easyQuery
                .queryable(Topic.class)
                //join 后面是双参数委托，参数顺序表示join表顺序，可以通过then函数切换
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where(o -> o.eq(Topic::getId, "3"))
                .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

List<BlogEntity> blogEntities = easyQuery
                .queryable(Topic.class)
                //join 后面是双参数委托，参数顺序表示join表顺序，可以通过then函数切换
                .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle).then(t).eq(Topic::getId, "3"))
                //join查询select必须要带对应的返回结果,可以是自定义dto也可以是实体对象,如果不带对象则返回t表主表数据
                .select(BlogEntity.class, (t, t1) -> t1.columnAll())
                .toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```


## 嵌套多表
```java
Queryable<Topic> sql = easyQuery
        .queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "3"));
//SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?
List<BlogEntity> topics = easyQuery
        .queryable(BlogEntity.class)
        .leftJoin(sql,(a,b)->a.eq(b,BlogEntity::getId,Topic::getId))
        .where(o -> o.isNotNull(BlogEntity::getId).eq(BlogEntity::getId,"3"))
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t LEFT JOIN (SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?) t1 ON t.`id` = t1.`id` WHERE t.`id` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String),3(String)
<== Total: 1
```