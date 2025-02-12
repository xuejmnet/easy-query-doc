---
title: 常用api介绍
---



::: tip 推荐!!!
> 在业务中如果开发者能够确定按当前条件查询可以返回单条记录的那么eq更加推荐您使用`single`方法而不是`first`，因为`single`表示单条也就是至多一条如果出现两条即以上则框架会抛出错误,
当您的业务对于查询出来的结果无关哪一条都行的情况下那么才是使用`first`相关查询结果
:::

## 终结方法

终结方法我们指的链式表达式不再继续编写表达式而是将表达式对应的sql发送到数据库执行后，将结果集转成具体java对象的方法我们称之为终结方法,常见的终结方法如下

`singleOrNull`、`singleNotNull`、`firstOrNull`、`firstNotNull`分别是对查询结果进行第一条数据的返回
方法  | 默认值 | 描述  
--- | --- | --- 
singleOrNull |  null | 查询返回第一条数据,如果没有结果返回null,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`single不会`添加`limit 1`或者`top 1`
singleNotNull| - | 查询返回第一条数据,如果没有结果将会抛错`EasyQuerySingleOrNotNullException`,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`single不会`添加`limit 1`或者`top 1`
firstOrNull | null  | 查询返回第一条数据,如果没有结果返回null,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响
firstNotNull | - | 查询返回第一条数据,如果没有结果将会抛错`EasyQueryFirstOrNotNullException`,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响


::: warning 全局异常替换!!!
> `firstNotNull、singleNotNull、singleOrNull`的默认报错信息可以通过替换eq的`AssertExceptionFactory`来达到自定义异常抛出
:::


`toList`对查询结果进行多条数据返回
方法  | 默认值 | 描述  
--- | --- | --- 
toList |  `new ArrayList`  | 查询返回符合条件的所有数据,并且以`ArrayList`集合进行返回,如果没有符合条件的结果将返回空的`ArrayList`而不是`null`



`toTreeList`对查询结果进行多条数据返回(`toList`)然后在内存中按一对多的关系(自己关联自己一对多)进行返回树形结果
方法  | 默认值 | 描述  
--- | --- | --- 
toTreeList |  `new ArrayList`或抛错  | 查询返回符合条件的所有数据,并且以`ArrayList`集合进行返回,然后在内存中按一对多的关系(自己关联自己一对多)进行返回树形结果,如果没有符合条件的结果将返回空的`ArrayList`而不是`null`



`toPageResult`对查询结果进行分页查询
方法  | 默认值 | 描述  
--- | --- | --- 
toPageResult |  `new DefaultPageResult`  | 查询返回符合条件的分页结果,如果没有符合条件的结果将返回默认分页对象而不是`null`



`toPageSelectResult`和`toPageResult`的差别就是支持将select的结果延迟到`toList`阶段执行保证count的条件变得非常干净
方法  | 默认值 | 描述  
--- | --- | --- 
toPageSelectResult |  `new DefaultPageResult`  | 查询返回符合条件的分页结果,如果没有符合条件的结果将返回默认分页对象而不是`null`


`toStreamResult`对查询结果进行迭代器模式返回,符合超大数量级的数据获取
方法  | 默认值 | 描述  
--- | --- | --- 
toStreamResult |  `new DefaultJdbcStreamResultSet`  | 查询返回符合条件的可迭代结果集,支持获取`Iterable`接口也支持`foreach`,使用时需要配合`try finally`来关闭资源

`streamBy`将数据库结果用最小迭代次数转成java的`stream-api`

### 测试数据
```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy>{

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

}
```


### 查询第一条数据


查询第一条数据且仅存在至多一条数据,没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab 属性模式

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 

查询第一条数据没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab 属性模式

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

::: 


### 查询至多一条数据且不为null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab 属性模式
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 

### 查询第一条数据且不为null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

@tab 属性模式
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
::: 

默认异常替换成业务异常
::: warning notnull异常!!!
> 框架默认针对NotNull返回的错误类型可能并不是你所希望得我们可以通过重写接口实现自己的自定义异常，接口`AssertExceptionFactory.class`默认实现类`DefaultAssertExceptionFactory.class`  [查看替换框架行为](/easy-query-doc/config/replace-configure)
:::


### 查询多条数据
查询第一条数据没有的情况下返回`new ArrayList<>(0)`实例的接口`List<T>`

::: code-tabs
@tab 对象模式
```java
List<Topic> topics = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab 属性模式
```java
List<Topic> topics = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```


::: 

::: tip 说明!!!
> `single`和`first`获取单条数据 `toList`获取多条数据,大部分情况下终结方法就是这两个
:::
### 自定义列
返回当前对象自定义列

::: code-tabs
@tab 对象模式
```java

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->o.FETCHER.id().title().name().content())
                    .singleOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)

//显式赋值
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->{
                        TopicProxy r = new TopicProxy();
                        r.id().set(o.id());
                        r.title().set(o.title());
                        return r;
                    })
                    .singleOrNull();

==> Preparing: SELECT `id` AS `id`,`title` AS `title` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)

如果返回的是当前类型可以直接使用fetcher函数，缺点仅支持主表切仅支持当前类型


也可以采用表达式非强类型
//隐式赋值
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    //如果列很多可以用fetcher
                    //r.selectExpression(o.FETCHER.id().title().name().content().......);
                    .select(o->new TopicProxy().selectExpression(o.id(),o.title()))
                    .singleOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
```

@tab 属性模式
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(o->o.column("id").column("title"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
```
::: 

### 内嵌视图

内嵌视图我们也称之为`from subQuery`或者`subQuery join`将子查询作为临时表对其进行查询或者join操作来达到类视图的功能所以我们称之为内嵌视图

::: code-tabs
@tab 对象模式
```java
//  SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? 

EntityQueryable<TopicProxy, Topic> query = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("1"))
        .select(o -> new TopicProxy()
                .selectExpression(o.id(), o.title())
        );

List<Topic> list = query.leftJoin(Topic.class, (t, t1) -> t.id().eq(t1.id()))
        .where((t, t1) -> {
            t1.id().eq("123");
            t.id().eq( "456");
        }).toList();


==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
```


::: 

### 公用表达式

`WITH CTE AS()`使用这个api来实现将临时表在当前表达式复用的实现
```java
EntityQueryable<TopicProxy, Topic> cteAs = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.id().eq("456");
        }).toCteAs();//支持传入表名来实现自定义表名

List<Topic> list1 = easyEntityQuery.queryable(Topic.class)
        .leftJoin(cteAs, (t_topic, t2) -> t_topic.id().eq(t2.id()))
        .leftJoin(cteAs, (t_topic, t_topic2, t3) -> t_topic.id().eq(t3.id()))
        .where((t_topic, t_topic2, t_topic3) -> {
            t_topic.id().eq("123");
            t_topic3.id().eq("t2123");
        }).toList();



-- 第1条sql数据
WITH `with_Topic` AS (SELECT
    t1.`id`,
    t1.`stars`,
    t1.`title`,
    t1.`create_time` 
FROM
    `t_topic` t1 
WHERE
    t1.`id` = '456')  

SELECT
    t.`id`,
    t.`stars`,
    t.`title`,
    t.`create_time` 
FROM
    `t_topic` t 
LEFT JOIN
    `with_Topic` t2 
        ON t.`id` = t2.`id` 
LEFT JOIN
    `with_Topic` t3 
        ON t.`id` = t3.`id` 
WHERE
    t.`id` = '123' 
    AND t3.`id` = 't2123'
```



## 单表api使用

::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq( "123xxx"))
        .toList();



//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers =entityQuery.queryable(SysUser.class)
        .where(o ->{
                o.id().eq("123xxx");
                o.idCard().like("123")
        }).toList();//toList表示查询结果集


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like( "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq"123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc()).firstOrNull();

//仅查询id和createTime两列
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc())
        .select(o->new SysUserProxy()
                .id().set(o.id())
                .createTime().set(o.createTime())
        )
        .firstOrNull();
        
```
:::

## 多表查询api


::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);


List<Topic> list = entityQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //toList默认只查询主表数据
        .toList();


List<Draft3<String,String,LocalDateTime>> list = entityQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //select返回强类型匿名元组对象无需定义dto/vo类型来接受用于方法中间的结果存储
        .select((t, t1, t2) -> Select.DRAFT.of(
            t.id(),
            t1.title(),
            t2.createTime()
        ))
        .toList();
        
```
:::


::: tip 链式说明!!!
> leftJoin第二个lambda入参参数个数和join使用的表个数一样,入参参数顺序就是from和join的表

> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::