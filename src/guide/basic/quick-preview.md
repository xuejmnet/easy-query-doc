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
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```

### 查询第一条数据
查询第一条数据没有的情况下返回null
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```

查询第一条数据且仅存在至多一条数据,没有的情况下返回null
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```

### 查询第一条数据且不为null

```java

Topic topic = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```

查询第一条数据且仅存在至多一条数据,没有的情况下返回null
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```

### 查询多条数据
查询第一条数据没有的情况下返回`new ArrayList<>(0)`实例的接口`List<T>`
```java
List<Topic> topics = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 2(ms)
<== Total: 0
```
::: tip 说明!!!
> `single`和`first`获取单条数据 `toList`获取多条数据,大部分情况下终结方法就是这两个
:::
### 自定义列
返回当前对象自定义列
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "1"))
                    .select(o->o.column(Topic::getId).column(Topic::getTitle))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```

### 创建匿名表
通过`select(class,expression)`表达式可以创建对应的匿名表,如果使用`select(expression)`那么不会创建匿名表
```java
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