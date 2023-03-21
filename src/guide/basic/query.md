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