---
title: 快速预览🔥
---

# 快速预览
本章节是为了方便没有经验的用户进行快速预览使用和场景说明

## 查询对象

`firstOrNull`、`firstNotNull`、`singleOrNull`、`singleNotNull`分别是对查询结果进行第一条数据的返回
方法  | 默认值 | 描述  
--- | --- | --- 
firstOrNull | null  | 查询返回第一条数据,如果没有结果返回null,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响
firstNotNull | - | 查询返回第一条数据,如果没有结果将会抛错`EasyQueryFirstOrNotNullException`,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响
singleOrNull |  null | 查询返回第一条数据,如果没有结果返回null,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`不会`添加`limit 1`或者`top 1`
singleNotNull| - | 查询返回第一条数据,如果没有结果将会抛错`EasyQuerySingleOrNotNullException`,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`不会`添加`limit 1`或者`top 1`



`toList`对查询结果进行多条数据返回
方法  | 默认值 | 描述  
--- | --- | --- 
toList |  `new ArrayList`  | 查询返回符合条件的所有数据,并且以`ArrayList`集合进行返回,如果没有符合条件的结果将返回空的`ArrayList`而不是`null`



`toPageResult`对查询结果进行分页查询
方法  | 默认值 | 描述  
--- | --- | --- 
toPageResult |  `new DefaultPageResult`  | 查询返回符合条件的分页结果,如果没有符合条件的结果将返回默认分页对象而不是`null`



`toStreamResult`对查询结果进行迭代器模式返回,符合超大数量级的数据获取
方法  | 默认值 | 描述  
--- | --- | --- 
toStreamResult |  `new DefaultJdbcStreamResultSet`  | 查询返回符合条件的可迭代结果集,支持获取`Iterable`接口也支持`foreach`,使用时需要配合`try finally`来关闭资源

### 测试数据
```java
@Data
@Table("t_topic")
@EntityFileProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy>{

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

    @Override
    public Class<TopicProxy> proxyTableClass() {
        return TopicProxy.class;
    }
}
```

### 查询第一条数据
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

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable()
Topic topic = easyProxyQuery.queryable(topic)
                    .where(o -> o.eq(topic.id(),"123"))
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

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable()
Topic topic = easyProxyQuery.queryable(topic)
                    .where(o -> o.eq(topic.id(),"123"))
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

@tab lambda模式
```java

Topic topic = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable();
Topic topic = easyProxyQuery.queryable(Topic.class)
        .where(o -> o.eq(topic.id(),"123"))
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

查询第一条数据且仅存在至多一条数据,没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab lambda模式
```java

Topic topic = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable();
Topic topic = easyProxyQuery.queryable(Topic.class)
        .where(o -> o.eq(topic.id(),"123"))
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
默认异常替换成业务异常
::: warning notnull异常!!!
> 框架默认针对NotNull返回的错误类型可能并不是你所希望得我们可以通过重写接口实现自己的自定义异常，接口`AssertExceptionFactory.class`默认实现类`DefaultAssertExceptionFactory.class`  [查看替换框架行为](/easy-query-doc/guide/config/replace-configure)
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

@tab lambda模式
```java
List<Topic> topics = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable();
List<Topic> topics = easyProxyQuery.queryable(Topic.class)
                    .where(o -> o.eq(topic.id(), "123"))
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
                    .select(o->new TopicProxy().adapter(r->{
                        r.id().set(o.id());
                        r.title().set(o.title());
                    }))
                    .firstOrNull();

==> Preparing: SELECT `id` AS `id`,`title` AS `title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)

如果返回的是当前类型可以直接使用fetcher函数，缺点仅支持主表切仅支持当前类型

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->o.FETCHER.id().title().name().content()........fetchProxy())
                    .firstOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)

也可以采用表达式非强类型

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->new TopicProxy().adapter(r->{
                        r.selectExpression(o.id(),o.title());
                        //如果列很多可以用fetcher
                        //r.selectExpression(o.FETCHER.id().title().name().content().......);
                    }))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "1"))
                    .select(o->o.column(Topic::getId).column(Topic::getTitle))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```
@tab proxy模式
```java
TopicProxy topic=TopicProxy.createTable();
Topic topic = easyProxyQuery.queryable(Topic.class)
                    .where(o -> o.eq(topic.id(), "1"))
                    .select(o->o.column(topic.id()).column(topic.title()))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```
@tab 属性模式
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(o->o.column("id").column("title"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```
::: 

### 创建匿名表

::: code-tabs
@tab 对象模式
```java
//  SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? 

EntityQueryable<TopicProxy, Topic> query = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("1"))
        .select(o -> new TopicProxy().adapter(r->{
            r.selectExpression(o.id(), o.title());
        }));

List<Topic> list = query.leftJoin(Topic.class, (t, t1) -> t.id().eq(t1.id()))
        .where((t, t1) -> {
            t1.id().eq("123");
            t.id().eq( "456");
        }).toList();

SELECT t1.`id`,t1.`title` 
FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 
LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` 

==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
```

@tab lambda模式
```java
通过`select(class,expression)`表达式可以创建对应的匿名表,如果使用`select(expression)`那么不会创建匿名表
//  SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? 
Queryable<Topic> query = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "1"))
                    .select(Topic.class, o -> o.column(Topic::getId).column(Topic::getTitle));

List<Topic> list = query.leftJoin(Topic.class, (t, t1) -> t.eq(t1, Topic::getId, Topic::getId))
                    .where((t, t1) -> {
                        t1.eq(Topic::getId, "123");
                        t.eq(Topic::getId, "456");
                    }).toList();

SELECT t1.`id`,t1.`title` 
FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 
LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` 

==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
<== Time Elapsed: 5(ms)
<== Total: 0
```

::: 