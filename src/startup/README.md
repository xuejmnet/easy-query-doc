---
title: 简介
---

## 简介

Easy Query是一款轻量级的ORM框架，它完全独立，无需任何第三方依赖。
我们只需要建好表，就可以使用Easy Query的Idea插件生成对应的实体类和查询类，直接可以进行单表进行增删改查操作，包括批量操作。
Easy Query提供了许多有泛型约束的方法，结合IDEA插件的支持，可以为表别名、列名和列类型提供友好的代码提示，使得编写查询逻辑如同在SQL客户端编写SQL语句一样直观简便。
Easy Query简化了多表关联操作，只要声明好了实体类之间的关联关系，也就是表之间的关联关系，它就可以自动查询关联表的数据。

## 开源框架
[kyou-solon](https://github.com/link2fun/kyou-solon)

### 特性

- 无实体查询,无实体更新,无实体新增,无实体删除等操作
- 使用Easy Query的[动态条件](/easy-query-doc/query/dynamic-where)可以自动将有值的条件拼接到SQL中，省掉重复的判空和拼接SQL操作，
- 动态排序,form表单排序,前端指定排序 [DynamicOrderBy](/easy-query-doc/query/dynamic-sort)
- 对象关系结构化VO自动组装返回,支持一对多一对一结果筛选,排序,limit
- 多数据源,动态多数据源，支持`SpringEL`，使用场景多租户(一个租户一个库) [DynamicDataSource](/easy-query-doc/config/muti-datasource)
- 软删除，软删除部分禁用启用非常方便，软删除记录删除时间,删除人 [LogicDelete](/easy-query-doc/adv/logic-delete)
- 自定义错误异常快速针对`firstNotNull`、`singleNotNull`、`required` [Exception](/easy-query-doc/practice/configuration/exception)
- 枚举和数据库映射,数据脱敏,数据编码存储解码获取,枚举属性,json或者数组,计算属性等 [ValueConverter,ColumnValueSQLConverter](/easy-query-doc/prop/)
- 数据填充,自动赋值创建人创建时间,修改人修改时间 [拦截器](/easy-query-doc/adv/interceptor)、 [对象实战](/easy-query-doc/practice/configuration/entity)
- 慢sql监听拦截,自动上报预警 [jdbc执行监听器](/easy-query-doc/adv/jdbc-listener)
- 数据库列的加密和加密后的模糊查询企业级解决方案 [数据库列加密](/easy-query-doc/adv/column-encryption)
- 分库分表，读写分离 [分库分表，读写分离](/easy-query-doc/super/) (敬请期待已经完成功能文档还在完善中)
- VO对象直接返回 [自定义vo列返回](/easy-query-doc/query/select)
- 数据库对象模型关联查询：一对多、一对一、多对多、多对一 [对象关系查询](/easy-query-doc/startup/nodsl)
- 对象关系关联查询`nosql`不仅仅是`sql`联级筛选,支持额外条件过滤比如公用中间表,多对多关联+type区分 [联级筛选Include Filter](/easy-query-doc/query/relation-filter)
- [对象关系查询](/easy-query-doc/startup/nodsl)、[SQL查询](/easy-query-doc/startup/sql)强类型语法的sql查询语法
- 智能的差异识别更新、并发更新 [更新、追踪](/easy-query-doc/basic/update)
- 自带分页方法和无依赖分页链式返回 [分页](/easy-query-doc/query/paging)
- Embeddable、ValueObject对象 [值对象](/easy-query-doc/adv/value-object)
- 数据权限,业务权限拦截器,我能查看我下面的所有组,组长可以查询所有组员的数据,组员查看自己的数据
- 原生sql片段使用,方便开发人员使用数据库特有的函数或者方言
- java函数数据库封装支持各个数据库
- group感知,在众多orm中极少数orm才会支持的group感知
- 无任何依赖的框架,不会有任何冲突
- sql多表查询支持join、in、exists等子查询
- idea插件提供更加高效快速的开发效率和开发体验
- 大数据流式查询防止oom
- 自带便捷的`batch`批处理
- 动态报名支持对查询的表名进行动态设置可以再非分库分表模式下直接操作对应表
- 配合`easy-cache`实现缓存的便捷使用并且是一个企业级别的延迟双删
- insert or update语法方言 [InsertOrUpdate](/easy-query-doc/basic/insertOrUpdate)
- 计算属性,额外计算列比如年龄是动态的而不是固定的,所以年龄应该是`(当前时间-出生日期)`,复杂计算属性比如班级表存在学生数量这个属性这个属性应该是`select count(*) from student where class_id=?`

## 数据库支持

| 数据库名称          | 包名            | springboot配置   | solon配置        |
| ------------------- | --------------- | ---------------- | ---------------- |
| MySQL               | sql-mysql       | mysql            | mysql            |
| Oracle              | sql-oracle      | oracle           | oracle           |
| PostgresSQL         | sql-pgsql       | pgsql            | pgsql            |
| SqlServer           | sql-mssql       | mssql            | mssql            |
| SqlServer RowNumber | sql-mssql       | mssql_row_number | mssql_row_number |
| H2                  | sql-h2          | h2               | h2               |
| SQLite              | sql-sqlite      | sqlite           | sqlite           |
| ClickHouse          | sql-clickhouse  | clickhouse       | clickhouse       |
| 达梦dameng          | sql-dameng      | dameng           | dameng           |
| 人大金仓KingbaseES  | sql-kingbase-es | kingbase_es      | kingbase_es      |

Easy Query目前已经抽象了表达式,所以原则上支持所有数据库,只需要自定义实现对应数据库的增删改查接口即可,也就是[`sql-db-support`open in new window](https://github.com/xuejmnet/easy-query/tree/main/sql-db-support) 。所以如果不支持对应的sql那么你可以自行扩展或者提交相应的issue


## 🔔QQ交流群

如果有什么功能建议或者开发中遇到什么问题，欢迎加入QQ交流群。
::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery官方QQ群: 170029046
:::