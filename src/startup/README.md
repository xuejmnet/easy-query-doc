---
title: easy-query简介目录
---

如果您是`c#`转过来的开发，如果您不想使用复杂恶心的xml来编写sql,如果您是一个有追求的喜欢强类型的技术开发,如果您是一个刚入行java的新人，那么easy-query将是非常适合您的一个框架，没有`mybatis`的繁琐,可以快速的编写crud代码和复杂代码。

## 目录指引
- 无实体查询,无实体更新,无实体新增,无实体删除等操作
- 动态条件,form表单查询,有值就添加到条件,没值就忽略 [DynamicWhere](/easy-query-doc/guide/query/dynamic-where)
- 动态排序,form表单排序,前端指定排序 [DynamicOrderBy](/easy-query-doc/guide/query/dynamic-sort)
- 对象关系结构化VO自动组装返回,支持一对多一对一结果筛选,排序,limit
- 多数据源,动态多数据源，支持`SpringEL`，使用场景多租户(一个租户一个库) [DynamicDataSource](/easy-query-doc/guide/config/muti-datasource) 
- 软删除，软删除部分禁用启用非常方便，软删除记录删除时间,删除人  [LogicDelete](/easy-query-doc/guide/adv/logic-delete)
- 自定义错误异常快速针对`firstNotNull`、`singleNotNull`、`required`  [Exception](/easy-query-doc/practice/configuration/exception)
- 枚举和数据库映射,数据脱敏,数据编码存储解码获取,枚举属性,json或者数组,计算属性等 [ValueConverter,ColumnValueSQLConverter](/easy-query-doc/guide/prop/)
- 数据填充,自动赋值创建人创建时间,修改人修改时间 [拦截器](/easy-query-doc/guide/adv/interceptor)、 [对象实战](/easy-query-doc/practice/entity/)
- 慢sql监听拦截,自动上报预警 [jdbc执行监听器](/easy-query-doc/guide/adv/jdbc-listener)
- 数据库列的加密和加密后的模糊查询企业级解决方案 [数据库列加密](/easy-query-doc/guide/adv/column-encryption)
- 分库分表，读写分离 [分库分表，读写分离](/easy-query-doc/guide/super/) (敬请期待已经完成功能文档还在完善中)
- VO对象直接返回 [自定义vo列返回](/easy-query-doc/guide/query/select)
- 数据库对象模型关联查询：一对多、一对一、多对多、多对一 [对象关系查询](/easy-query-doc/startup/nodsl)
- 对象关系关联查询`nosql`不仅仅是`sql`联级筛选,支持额外条件过滤比如公用中间表,多对多关联+type区分 [联级筛选Include Filter](/easy-query-doc/guide/query/relation-filter)
- [对象关系查询](/easy-query-doc/startup/nodsl)、[SQL查询](/easy-query-doc/startup/sql)强类型语法的sql查询语法
- 智能的差异识别更新、并发更新 [更新、追踪](/easy-query-doc/guide/basic/update)
- 自带分页方法和无依赖分页链式返回 [分页](/easy-query-doc/guide/query/paging)
- Embeddable、ValueObject对象 [值对象](/easy-query-doc/guide/adv/value-object)
- 数据权限,业务权限拦截器,我能查看我下面的所有组,组长可以查询所有组员的数据,组员查看自己的数据
- 原生sql片段使用,方便开发人员使用数据库特有的函数或者方言
- java函数数据库封装支持各个数据库
- group感知,在众多orm中极少数orm才会支持的group感知
- 无任何依赖的框架,不会有任何冲突
- sql多表查询支持join、in、exists等子查询
- idea插件提供更加高效快速的开发效率和开发体验
- sql上下文泛型限制
- 大数据流式查询防止oom
- 自带便捷的`batch`批处理
- 动态报名支持对查询的表名进行动态设置可以再非分库分表模式下直接操作对应表
- 配合`easy-cache`实现缓存的便捷使用并且是一个企业级别的延迟双删
- insert or update语法方言 [InsertOrUpdate](/easy-query-doc/guide/basic/insertOrUpdate)
- 计算属性,额外计算列比如年龄是动态的而不是固定的,所以年龄应该是`(当前时间-出生日期)`,复杂计算属性比如班级表存在学生数量这个属性这个属性应该是`select count(*) from student where class_id=?`
- 自定义主键,支持雪花id,uuid等其他一系列id的自定义生成,支持多主键模式[PrimaryKeyGenerator](/easy-query-doc/guide/adv/auto-key)