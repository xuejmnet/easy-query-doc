---
title: 查询
order: 20
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

## API


方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
toSql |   | string | 返回当前表达式即将执行的sql语句
any |   | boolean | 返回当前表达式是在数据库中是否存在匹配项,存在至少一条返回true,无法匹配任意一条在返回false
all | lambda  | boolean | 返回当前表达式是在数据库中是否所有的都匹配,参数为符合条件的表达式
count | | long | 返回当前表达式在数据库中命中的条数有多少,没有匹配数返回0
firstOrNull |  | TEntity | 返回当前表达式在数据库中命中的第一条,如果没命中就返回null
toList | | List\<TEntity\> | 返回当前表达式在数据库中命中的所有结果,如果没有结果则返回空集合
where | lambda | this | 对当前表达式进行条件追加
limit | 1.offset,2.rows | this | 对当前表达式进行查询结果返回和偏移进行限制，offset表示跳过多少条，limit表示获取多少条
orderBy | lambda | this | 对当前表达式进行查询结果进行排序
sumBigDecimalOrDefault | lambda,默认值 | BigDecimal |  用于对lambda列进行求和,返回结果BigDecimal防止结果溢出
sumOrDefault | lambda,默认值 | 列类型 |   用于对lambda列进行求和
maxOrDefault | lambda,默认值  | 列类型 |  用于对lambda列进行最大值查询
minOrDefault | lambda,默认值  | 列类型 |  用于对lambda列进行最小值查询
avgOrDefault | lambda,默认值 | 列类型 |  用于对lambda列进行平均值值查询
lenOrDefault | lambda,默认值 | 列类型 |  用于对lambda列进行长度查询
whereById | object 主键 | this |  添加单主键条件
whereObject | object 查询对象 | this |  添加对象查询条件
groupBy | lambda | this |  查询分组
having | lambda | this |  查询对分组结果进行筛选
orderByDynamic | `EasyDynamicOrderByConfiguration` | this | 添加查询动态排序
distinct |  | this |  对查询结果进行去重
toPageResult | long,long | `PageResult` | 对结果进行先count，然后limit+toList查询结果并且封装成`PageResult`返回
leftJoin | lambda | this |  左链接
rightJoin | lambda | this |  右链接
innerJoin | lambda | this |  内链接
disableLogicDelete |  | this |  本次查询不启用逻辑删除
enableLogicDelete |  | this |  本次查询启用逻辑删除
noInterceptor |  | this |   本次查询不使用拦截器
noInterceptor | name | this |   不使用指定name的拦截器
useInterceptor |  | this |  本次查询使用拦截器
useInterceptor | name | this |  使用指定name的拦截器
asTracking |  | this |   本次查询使用追踪，需要开启追踪后才有效
asNoTracking |  | this |   本次查询不使用追踪,默认就是不使用追踪
asTable | tableName | this |  指定本次查询最近的表的表名,如果最近的表是匿名表则设置表别名alias
asTable | lambda | this |    指定本次查询最近的表的表名,如果最近的表是匿名表则设置表别名alias,表达式入参为现有表名返回设置的表名