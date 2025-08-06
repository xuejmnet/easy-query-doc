---
title: 什么是eq
order: 1
category:
  - Startup
---

# easy-qeury 简介


# QQ群
EasyQuery官方QQ群: 170029046

::: tip easy-query特性!!!
> 一款java下最强的、最懂查询的`orm`，完美实现自动处理和手动处理复杂对象关系
> 隐式join、隐式子查询、隐式分组、隐式分区分组、隐式case when、分库分表、字段加密检索、手动join多表子查询分组、code-first自动创建表结构、自动组装结构化对象数据......
:::

## easy-qeury 的发展
`easy-query`是一款始于2023年2月份的一款国产orm,初衷是让java也可以拥有和.net一样的操作数据库,该框架同时支持`java`和`kotlin`,🚀 java下唯一一款同时支持强类型对象关系查询和强类型SQL语法查询的ORM,拥有对象模型筛选、隐式子查询、隐式join、显式子查询、显式join,后续我们对该框架简称`eq`

## 特性

- 1.支持任意对象关系查询(标准单列 多列甚至左匹配)
- 2.支持隐式子查询转groupJoin的无敌优化性能
- 3.支持隐式partation by 筛选子查询第一个或第n个
- 4.支持任意对象关系的结构直接查询返回到前端selectAutoInclude
- 5.当以上都不满足还支持显式sql,只要能写sql就能用eq写表达式

## 使用人群
- 有`sql`基础，会`java stream`或者属性`java lambda`
- `JPA`或者`Hibernate`用户
- .net程序员转java的`墙裂`推荐你会拥有和`.net` orm不一样的体验++
- 喜欢强类型dsl，厌倦了xml手写字符串sql

## 使用场景
`eq`适用于任意支持jdbc的关系型数据库,并且用户可以自定义方言,支持数据模型建模筛选拉取,可以很高效的实现单表多表的crud

支持`dsl`模式编写数据库表达式查询数据也可以用`relation model`来实现数据模型关系筛选

## 为什么选择eq
- 提供了强大的面向对象查询功能，将表关系以对象数据结构的关系进行映射提供简洁api给用户查询
- 强类型 可以将大部分错误在编译时处理掉
- 弱类型 允许用户可以在动态场景下使用字符串属性来配合强类型dsl达到组合使用效果
- 高覆盖率单元测试 拥有2000+个单元测试
- 群主自己也在生产中使用，并且已经投入使用5个以上项目且稳定运行1-2年之久
- 出色的性能 哪怕是在其他orm的测试中也拥有非常出色的性能表现
- 轻量级 拥有零依赖项 框架整体从0到1全部自行实现可控
- `OLTP`+`OLAP`全方位掌控,`SQL`优化性能怪兽
- 所有sql尽可能不使用`select *`对于数据库原本5个列后面变成4个列后程序能马上反应出错误,如果是`*`那么只会让那一列变成null从而导致数据混乱

如果还有人问为什么选择`eq`,那么我可以很负责任的告诉你该框架拥有非常强的强类型和非常强度动态类型,你一定很神奇,`eq`是如何做到的

`eq`为了抽象在强类型api的下层使用了client模式,而client模式则可以支持任意弱类型,已有人通过client的api实现了一整套低代码框架,

除了实现低代码框架外还兼容所有已经适配的数据库,对用户而言无需考虑方言带来的差异

## 数据库支持


| 数据库名称          | 包名            | springboot配置   | solon配置        |
| ------------------- | --------------- | ---------------- | ---------------- |
| MySQL               | sql-mysql       | mysql            | mysql            |
| Oracle              | sql-oracle      | oracle           | oracle           |
| PostgreSQL         | sql-pgsql       | pgsql            | pgsql            |
| SqlServer           | sql-mssql       | mssql            | mssql            |
| SqlServer RowNumber | sql-mssql       | mssql_row_number | mssql_row_number |
| H2                  | sql-h2          | h2               | h2               |
| SQLite              | sql-sqlite      | sqlite           | sqlite           |
| ClickHouse          | sql-clickhouse  | clickhouse       | clickhouse       |
| 达梦dameng          | sql-dameng      | dameng           | dameng           |
| 人大金仓KingbaseES  | sql-kingbase-es | kingbase_es      | kingbase_es      |
| 高斯  | sql-gauss-db | gauss-db      | gauss-db      |
| DB2  | sql-db2 | db2     | db2     |

`eq`目前已经抽象了表达式,所以原则上支持所有数据库,只需要自定义实现对应数据库的增删改查接口即可,也就是[`sql-db-support`open in new window](https://github.com/xuejmnet/easy-query/tree/main/sql-db-support) 。所以如果不支持对应的sql那么你可以自行扩展或者提交相应的issue
