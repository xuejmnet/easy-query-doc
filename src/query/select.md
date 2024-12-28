---
title: 查询
order: 40
---




## 简单的看下select的使用

### 查询当前对象
::: tabs

@tab entity

```java
//查询当前对象id=2的博客
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2")).singleOrNull();


//查询当前对象id=2的博客只查询id，name，title三个字段 
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        //2.0.66以前版本需要额外添加fetchProxy
        .select(s->s.FETCHER.id().name().title()).singleOrNull();

```

@tab lambda
编写中...
@tab client
编写中...

:::

### 查询基本类型
更多使用请查看 [基本类型查询](/easy-query-doc/query/basic-type)

::: tabs

@tab entity

```java

//查询当前对象id=2的博客只查询id
String id = easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(s->s.id()).singleOrNull();

//查询当前对象id=2的博客只查询id
String id = easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .selectColumn(s->s.id()).singleOrNull();
```

@tab lambda
编写中...
@tab client
编写中...

:::

### 按需返回VO对象
::: tabs

@tab entity

```java
//直接映射到BlogEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class).singleOrNull();


//只查询id和name和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.id().name().title()).singleOrNull();

//查询所有字段到BlogEntityVO1.class等同于select(BlogEntityVO1.class),会自动select vo有的字段
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.allFields()).singleOrNull();


//查询id和name但是映射的时候是映射到DTO的name和status,
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->Select.of(
                //s.id().as("name"),为什么使用BlogEntityVO1.Fields.name是因为lombok注解@FieldNameConstants
                //强类型有助于我们程序的健壮性,后续字段如果不需要或者改名后有助于ide的寻找和编译提醒
                s.id().as(BlogEntityVO1.Fields.name),
                s.name().as(BlogEntityVO1.Fields.status)
        )).singleOrNull();

//查询所有字段除了id和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.allFieldsExclude(s.id(),s.title())).singleOrNull();

//也可以对BlogEntityVO1添加@EntityProxy生成代理对象来处理

easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(s->{
             BlogEntityVO1Proxy result =new BlogEntityVO1Proxy();
             result.selectAll(s);
             result.selectIgnores(s.id());
             reuslt.abc().set(s.title());//title as status(因为abc的属性映射为status别名)
             return result;
        }).singleOrNull();

```

@tab lambda
```java

//直接映射到BlogEntityVO1.class
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class).firstOrNull();

//只查询id和name和title映射到logEntityVO1.class
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.column(BlogEntity::getId).column(BlogEntity::getName).column(BlogEntity::getTitle)).firstOrNull();

//查询所有字段到logEntityVO1.class等同于select(BlogEntityVO1.class),会自动select vo有的字段
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnAll()).firstOrNull();


//查询所有字段除了id和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.columnAll().columnIgnore(BlogEntity::getId).columnIgnore(BlogEntity::getTitle)).firstOrNull();
```
@tab client
编写中...

:::


::: warning 注意点及说明!!!
> `EasyEntityQuery`的直接`select(vo.class)`和直接返回`select(new voProxy)`的区别在于您是否要对后续操作进行处理,简单理解为就是是否需要操作`内嵌视图`,如果不需要只需要返回结果那么可以直接使用`VO.class`不需要生成`proxy`,但是如果您需要在后续继续操作比如`join`其他表那么select需要返回对应的`Proxy`在DTO上添加`@EntityProxy`
:::



如果出现多表属性映射,可以将相识度高的先进行全列查询,然后将不需要的进行忽略




## 单表查询

::: code-tabs
@tab 对象模式
```java
//根据条件查询表中的第一条记录
List<Topic> topics = easyEntityQuery
                .queryable(Topic.class)
                .limit(1)
                .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1

//根据条件查询表中的第一条记录
Topic topic = easyEntityQuery
                .queryable(Topic.class)
                .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LIMIT 1
<== Total: 1 

//根据条件查询id为3的记录
Topic topic = easyEntityQuery
        .queryable(Topic.class)
        .where(o->o.id().eq("3"))
        .firstOrNull();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1


Topic topic = easyEntityQuery
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

### 按需快速join返回列



::: tabs

@tab entity
```java


//select t.*,t2.id as t2Id from t leftJoin t2 on ...
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                b1.FETCHER.allFields(),
                //表2获取id
                s2.FETCHER.id().as("t2Id")
        )).toList();

//select t.*,t.createTime as createMyTime,t2.id from t leftJoin t2 on ...
//但是会对t.*里面进行id的排除
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                //查询表1全部列忽略id将createTime别名改成createMyTime
                b1.FETCHER.allFieldsExclude(s.id()).createTime().as(BlogEntityVO2.Fields.createMyTime),
                //表2获取id
                s2.FETCHER.id()
        )).toList();
//自定义部分列
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                b1.FETCHER.id().content().createTime().as(BlogEntityVO2.Fields.createMyTime),
                s2.FETCHER.address().idCard()
        )).toList();

//全手动拉取映射生成内嵌视图支持后续筛选聚合等操作
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select((b1, s2) -> {
                BlogEntityVO2Proxy result=new BlogEntityVO2Proxy();
                result.selectAll(b1);
                result.selectIgnores(s.id());
                result.createMyTime().set(b1.createTime());
                return result;
        })
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                //查询表1全部列忽略id将createTime别名改成createMyTime
                b1.FETCHER.allFieldsExclude(s.id()).createTime().as("createMyTime"),
                //表2获取id
                s2.FETCHER.id()
        )).toList();
```

@tab lambda
```java

BlogEntityVO2 blogEntityVO1 = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        //直接先对第二张表进行全字段获取然后忽略掉id在对第二张表进行id获取
        .select(BlogEntityVO2.class,(t,t1)->t1.columnAll().columnIgnore(BlogEntity::getId).then(t).column(Topic::getId)
                //.columnAs(Topic::getId,BlogEntityVO2::getId)//如果属性对应的columnName不一致需要as处理
        ).firstOrNull();
```
@tab client
编写中...

:::


### 内嵌视图
表达式每次`select`将会生成一个内嵌视图如果需要后续操作那么可以对其进行再次操作

生成的sql语句为
```sql

SELECT
    t2.`id`,
    t2.`stars`,
    t2.`title`,
    t2.`create_time` 
FROM
    (SELECT
        t.`id` AS `blogId`,
        COUNT(*) AS `blogCount` 
    FROM
        `t_blog` t 
    WHERE
        t.`deleted` = false 
        AND t.`star` > 1 
    GROUP BY
        t.`id`) t1 
LEFT JOIN
    `t_topic` t2 
        ON t1.`blogId` = t2.`id` 
WHERE
    t1.`blogCount` <= 123
```
具体表达式代码为如下

::: tabs

@tab entity
```java
//首先我们定义两个key用来后续操作
MapKey<String> blogId = MapKeys.stringKey("blogId");
MapKey<Integer> blogCount = MapKeys.integerKey("blogCount");

 List<Topic> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> {
                    b.star().gt(1);
                })
                //对其group by
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(b -> GroupKeys.of(b.id()))
                //生成中间对象并且变成匿名表(每次select都是生成匿名表,后续如果没有别的操作那么匿名表会被展开)
                // select * from (select blogId,blogCount from xxx group by id) t
                //如果select后续没有非终结操作那么会被展开为 select blogId,blogCount from xxx group by id
                .select(group -> new MapTypeProxy().put(blogId, group.key1()).put(blogCount, group.intCount()))
                //对匿名表进行join
                .leftJoin(Topic.class, (g, topic) -> {
                    g.get(blogId).eq(topic.id());
                })
                .where((g, topic) -> {
                    g.get(blogCount).le(123);
                })
                //再次生成匿名表
                .select((g, topic) -> topic)
                //后续无操作了所以会被展开
                .toList();

定义MapKey是为了后续可以继续操作如果不需要可以不定义key

//展开后代码为


MapKey<String> blogId = MapKeys.stringKey("blogId");
        MapKey<Integer> blogCount = MapKeys.integerKey("blogCount");
//匿名表
// SELECT * FROM (SELECT
//         t.`id` AS `blogId`,
//         COUNT(*) AS `blogCount` 
//     FROM
//         `t_blog` t 
//     WHERE
//         t.`deleted` = false 
//         AND t.`star` > 1 
//     GROUP BY
//         t.`id`) t1

        EntityQueryable<MapTypeProxy, Map<String, Object>> groupAndCount = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> {
                    b.star().gt(1);
                })
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(b -> GroupKeys.of(b.id()))
                .select(group -> new MapTypeProxy().put(blogId, group.key1()).put(blogCount, group.intCount()));

//        easyEntityQuery.getRuntimeContext().getEntityMetadataManager().getEntityMetadata()
        List<Topic> list = groupAndCount
                .leftJoin(Topic.class, (g, topic) -> {
                    g.get(blogId).eq(topic.id());
                })
                .where((g, topic) -> {
                    g.get(blogCount).le(123);
                }).select((g, topic) -> topic).toList();


```


如果您不想定义Key可以使用`DRAFT`匿名对象来实现上述写法

更多用法请参考[匿名类型查询](/easy-query-doc/query/anonymous-type)
```java


 List<Topic> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> {
                    b.star().gt(1);
                })
                //对其group by
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(b -> GroupKeys.of(b.id()))
                //生成中间对象并且变成匿名表(每次select都是生成匿名表,后续如果没有别的操作那么匿名表会被展开)
                // select * from (select id as value1,count(*) as value2 from xxx group by id) t
                //如果select后续没有非终结操作那么会被展开为 select value1,value2 from xxx group by id
                .select(group -> Select.DRAFT.of(
                        group.key1(),
                        group.intCount()
                ))
                //对匿名表进行join
                .leftJoin(Topic.class, (g, topic) -> {
                    g.value1().eq(topic.id());
                })
                .where((g, topic) -> {
                    g.value2().le(123);
                })
                //再次生成匿名表
                .select((g, topic) -> topic)
                //后续无操作了所以会被展开
                .toList();
```


@tab lambda
编写中...
@tab client
编写中...

:::

### 内嵌视图案例2
对一张表进行开窗函数处理并且进行筛选

实际我们会让用户直接使用[开窗函数](/easy-query-doc/query/partition) 这边只是给视图一个demo演示
```sql
SELECT
    t1.`id`,
    t1.`create_time`,
    t1.`update_time`,
    t1.`create_by`,
    t1.`update_by`,
    t1.`deleted`,
    t1.`title`,
    t1.`content`,
    t1.`url`,
    t1.`star`,
    t1.`publish_time`,
    t1.`score`,
    t1.`status`,
    t1.`order`,
    t1.`is_top`,
    t1.`top`,
    t1.`num` AS `num` 
FROM
    (SELECT
        t.`id`,
        t.`create_time`,
        t.`update_time`,
        t.`create_by`,
        t.`update_by`,
        t.`deleted`,
        t.`title`,
        t.`content`,
        t.`url`,
        t.`star`,
        t.`publish_time`,
        t.`score`,
        t.`status`,
        t.`order`,
        t.`is_top`,
        t.`top`,
        ROW_NUMBER() OVER(PARTITION  BY t.`title` ORDER BY t.`score` DESC) AS `num` 
    FROM
        `t_blog` t 
    WHERE
        t.`deleted` = false 
        AND t.`star` < 12) t1 --生成匿名表
WHERE
    t1.`num` < 1
```
```java
//创建dto额外多一个num字段
@Data
@EntityProxy
public class BlogPartitionEntityVO extends BlogEntity{
    private Integer num;
}

List<BlogPartitionEntityVO> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> b.star().lt(12))
                .select(b -> {
                    Expression expression = b.expression();
                    BlogPartitionEntityVOProxy r = new BlogPartitionEntityVOProxy();
                    r.selectAll(b);
                    r.num().set(
                            expression.sqlSegment("ROW_NUMBER() OVER(PARTITION BY {0} ORDER BY {1} DESC)", c -> c.expression(b.title()).expression(b.score()))
                                    .setPropertyType(Integer.class)
                    );
                    return r;
                })
                .where(b -> b.num().lt(1))
                .toList();

```

### toMap
```java
//查询所有并且将其他表字段查询出来
List<Map<String, Object>> list = easyEntityQuery.queryable(SysUser.class)
                .leftJoin(Topic.class, (s, t2) -> s.id().eq(t2.id()))
                .where((s1, t2) -> s1.id().eq("1"))
                .select((s1, t2) -> new MapTypeProxy().selectAll(s1).selectExpression(t2.title().as("abc")))
                .toList();

Map<String, Object> map = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        .select(BlogEntityVO2.class, (t, t1) -> t1.columnAll().then(t).column(Topic::getId)//如果不进行忽略两个id都查询,但是默认会把后面的覆盖掉前面的
        ).toMap();

//相同的代码如果使用toMap将会抛出 IllegalStateException 异常:Duplicate key found: id
```