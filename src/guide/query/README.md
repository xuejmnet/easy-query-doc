---
title: 查询
order: 20
---

# 查询

`easy-query`在java的静态语言特性下，参考众多C# ORM(efcore,freesql,sqlsugar...),和java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的sql表达式，并且拥有强类型语法提示，可以帮助不想写sql的用户，有洁癖的用户多一个选择.

## 单表查询

::: code-tabs
@tab 对象模式
```java
//根据条件查询表中的第一条记录
List<Topic> topics = easyEntityProxy
                .queryable(Topic.class)
                .limit(1)
                .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1

//根据条件查询表中的第一条记录
Topic topic = easyEntityProxy
                .queryable(Topic.class)
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1 

//根据条件查询id为3的记录
Topic topic = easyEntityProxy
        .queryable(Topic.class)
        .where(o->o.id().eq("3"))
        .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1


Topic topic = easyEntityProxy
        .queryable(Topic.class)
        .where(o->{
                o.id().eq("3");
                o.title().like("3");
        })
        .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? AND t.`title` like ? LIMIT 1
==> Parameters: 3(String),%3%(String)
<== Total: 1

```

@tab 代理属性
```java
//根据条件查询表中的第一条记录
List<Topic> topics = easyProxyQuery
                .queryable(TopicProxy.createTable())
                .limit(1)
                .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1

//根据条件查询表中的第一条记录
Topic topic = easyProxyProxy
                .queryable(TopicProxy.createTable())
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1 

//根据条件查询id为3的记录
TopicProxy table = TopicProxy.createTable();
Topic topic = easyProxyQuery
        .queryable(table)
        .where(o->o.eq(table.id(),"3"))
        .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

//根据条件查询id为3的集合
List<Topic> topics = easyProxyQuery
                .queryable(TopicProxy.createTable())
                .where(o->o.eq(o.t().id(),"3"))
                .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```
@tab lambda属性

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
@tab 字符串属性

```java
//根据条件查询表中的第一条记录
List<Topic> topics = easyQueryClient
                .queryable(Topic.class)
                .limit(1)
                .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1

//根据条件查询表中的第一条记录
Topic topic = easyQueryClient
                .queryable(Topic.class)
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1 

//根据条件查询id为3的记录
Topic topic = easyQueryClient
                .queryable(Topic.class)
                .where(o->o.eq("id","3"))
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

//根据条件查询id为3的集合
List<Topic> topics = easyQueryClient
                .queryable(Topic.class)
                .where(o->o.eq("id","3"))
                .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```
:::

## 多表

::: code-tabs
@tab 对象模式
```java

Topic topic = easyEntityQuery
        .queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t,b) -> t.id().eq(b.id()))
        .where((t,b) -> t.id().eq("3"))
        .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

List<BlogEntity> blogEntities = easyEntityQuery
        .queryable(Topic.class)
        //join 后面是多参数委托,第一个主表,第二个参数为join表
        .innerJoin(BlogEntity.class, (t,b) -> t.id().eq(b.id()))
        .where((t,b) -> {
                t.title().isNotNull();
                b.id().eq("3");
        })
        //select 参数个数和join表个数一样,group后参数为一个,返回一个对象代理
        //可以对其进行自定义赋值比如id().set(t.title())将title赋值给id属性
        .select((t,b)->new BlogEntityProxy().selectAll(t))
        .toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```
@tab 代理属性
```java

        TopicProxy topicTable = TopicProxy.createTable();
        BlogEntityProxy blogTable = BlogEntityProxy.createTable();
        Topic topic = easyProxyQuery
                .queryable(topicTable)
                .leftJoin(blogTable, o -> o.eq(topicTable.id(), blogTable.id()))
                .where(o -> o.eq(topicTable.id(), "3"))
                .firstOrNull();
//下面这种写法也是可以的
//Topic topic = easyProxyQuery
//      .queryable(TopicProxy.createTable())
//      .leftJoin(BlogEntityProxy.createTable(), o -> o.eq(o.t().id(), o.t1().id()))
//      .where(o -> o.eq(o.t().id(), "3"))
//      .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

TopicProxy topicTable = TopicProxy.createTable();
BlogEntityProxy blogTable = BlogEntityProxy.createTable();
BlogEntityProxy blogResult = BlogEntityProxy.createTable();

List<BlogEntity> blogEntities = easyProxyQuery
        .queryable(topicTable)
        //join 后面是多参数委托,第一个为filter固定,后面两个分别数join的表，参数顺序表示join表顺序
        .innerJoin(blogTable, o -> o.eq(topicTable.id(), blogTable.id()))
        .where(o -> o.isNotNull(topicTable.title()).eq(blogTable.id(), "3"))
        //join查询select必须要带对应的返回结果,可以是自定义dto也可以是实体对象,如果不带对象则返回t表主表数据
        //参数依然是第一个是selector固定后面两个是join对象的表顺序
        .select(blogResult, s -> s.columnAll(topicTable))
        .toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```
@tab lambda属性

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
@tab 字符串属性

```java
 Topic topic = easyQueryClient
                .queryable(Topic.class)
                //join 后面是双参数委托，参数顺序表示join表顺序，可以通过then函数切换
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where(o -> o.eq(Topic::getId, "3"))
                .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1

List<BlogEntity> blogEntities = easyQueryClient
                .queryable(Topic.class)
                //join 后面是双参数委托，参数顺序表示join表顺序，可以通过then函数切换
                .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, "id", "id"))
                .where((t, t1) -> t1.isNotNull("title").then(t).eq("id", "3"))
                //join查询select必须要带对应的返回结果,可以是自定义dto也可以是实体对象,如果不带对象则返回t表主表数据
                .select(BlogEntity.class, (t, t1) -> t1.columnAll())
                .toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String)
<== Total: 1
```
:::


## 嵌套多表

::: code-tabs
@tab 对象模式
```java
 EntityQueryable<TopicProxy, Topic> sql = easyEntityQuery
                .queryable(Topic.class)
                .where(o -> o.id().eq("3" ));
//SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?

List<BlogEntity> topics = easyEntityQuery
        .queryable(BlogEntity.class)
        .leftJoin(sql,(a,b)->a.id().eq(b.id()))
        .where((a,b) -> {
                a.id().isNotNull();
                b.id().isNotNull();
        })
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t LEFT JOIN (SELECT t1.`id`,t1.`stars`,t1.`title`,t1.`create_time` FROM `t_topic` t1 WHERE t1.`id` = ?) t2 ON t.`id` = t2.`id` WHERE t.`deleted` = ? AND t.`id` IS NOT NULL AND t2.`id` IS NOT NULL
==> Parameters: 3(String),false(Boolean)
<== Total: 1
```

@tab lambda模式
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


::: 

## 自定义VO返回结果
```java


@Data
public class BlogEntityTest2 {

    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    private String content;
    /**
     * 博客链接
     */
    @Column("my_url")
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}
``

::: code-tabs
@tab 对象模式
```java
//以下三种都是一样的结果,但是`toList(BlogEntityTest.class)`这种方式是不需要对返回结果进行后续处理或者自定义的情况下使用的
//映射规则为BlogEntity的属性字段对应的column_name和VO对象BlogEntityTest的属性字段对应的column_name一样即可直接映射
List<BlogEntityTest> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(o->new BlogEntityTestProxy()).toList();

List<BlogEntityTest> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(o->new BlogEntityTestProxy().selectAll(o)).toList();

//下面的写法和上面的都是等价的区别就是上面写法支持后续继续查询,而下面的写法仅支持结果返回

        //如果你只查询一张表并且是全属性映射那么可以直接使用class查询
List<BlogEntityTest> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(BlogEntityTest.class).toList();
        
List<BlogEntityTest> list = easyEntityQuery.queryable(BlogEntity.class)
        .toList(BlogEntityTest.class);

List<BlogEntityTest> list = easyEntityQuery.queryable(BlogEntity.class).toList(BlogEntityTest.class);

==> Preparing: SELECT t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Time Elapsed: 3(ms)
<== Total: 100
//如果遇到无法对应的可以通过手动set来实现映射
String sql = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq( "2"))
                .select(o->new BlogEntityVO1Proxy().adapter(r->{
                        r.score().set(o.order());//将查询的order映射到vo对象的score上
                }))
                .limit(1).toSQL();
Assert.assertEquals("SELECT t.`order` AS `score` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1", sql);


EntityQueryable<BlogEntityTest2Proxy, BlogEntityTest2> queryable = easyEntityQuery.queryable(BlogEntity.class)
                .select(o -> new BlogEntityTest2Proxy().adapter(r->{
                    r.selectAll(o);//等于*但是不会用*这种暴力的语法会将字段列出
                    r.selectIgnores(o.title());//忽略前面的selectAll里面的title列
                    r.url().set(o.url());//并且将url映射到my_url上
                }));
            String sql = queryable.toSQL();
            Assert.assertEquals("SELECT t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t.`url` AS `my_url` FROM `t_blog` t WHERE t.`deleted` = ?", sql);
           
```

@tab lambda模式
```java
//映射规则为BlogEntity的属性字段对应的column_name和VO对象BlogEntityTest的属性字段对应的column_name一样即可直接映射
List<BlogEntityTest> list = easyQuery.queryable(BlogEntity.class)
        .select(BlogEntityTest.class).toList();

==> Preparing: SELECT t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM `t_blog` t WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Time Elapsed: 3(ms)
<== Total: 100
//如果遇到无法对应的可以通过手动as来实现映射
String sql = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class, o -> o.columnIgnore(BlogEntity::getId)
                .columnAs(BlogEntity::getOrder, BlogEntityVO1::getScore))//将查询的order映射到vo对象的score上
                .limit(1).toSQL();
Assert.assertEquals("SELECT t.`order` AS `score` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ? LIMIT 1", sql);

Queryable<BlogEntityTest2> queryable = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest2.class, o -> {
                        o.columnAll()//等于*但是不会用*这种暴力的语法会将字段列出
                        .columnIgnore(BlogEntity::getTitle)//忽略前面的columnAll里面的title列
                        .columnAs(BlogEntity::getUrl, BlogEntityTest2::getMyUrl);//并且将url映射到my_url上
                    });
            String sql = queryable.toSQL();
            Assert.assertEquals("SELECT t.`content`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t.`url` AS `my_url` FROM `t_blog` t WHERE t.`deleted` = ?", sql);
           
```


::: 

## API


方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
fetchBy | `Function<Stream<T>,TR> fetcher`  | 任意stream的终结方法 | 使用java方式只需要迭代一次返回符合stream的结果
toSql |   | string | 返回当前表达式即将执行的sql语句
any |   | boolean | 返回当前表达式是在数据库中是否存在匹配项,存在至少一条返回true,无法匹配任意一条在返回false
required |   | void | 返回当前表达式是在数据库中是否存在匹配项,存在至少一条,无法匹配任意一条抛错
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
toShardingPageResult | long,long,sequenceCountLine | `PageResult` | 支持高性能分片下的分页查询,如果第三个参数为null那么和toPageResult行为一致
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
union | queryable | this |    union 查询
unionAll | queryable | this |    union all查询