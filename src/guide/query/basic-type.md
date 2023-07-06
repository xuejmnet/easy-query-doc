---
title: 基本类型查询
---

# 基本类型查询
`easy-query`提供了针对基本类型的查询功能,如果您只需要返回基本类型那么不需要额外定义复杂的对象,并且支持map等数据结构


## String


::: code-tabs
@tab 代理属性
```java
List<String> list2 = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                .where((f, t) -> f.eq(t.id(), "1"))
                .select(StringProxy.DEFAULT, (s, t) -> s.column(t.id()))
                .toList();

==> Preparing: SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab lambda属性

```java
List<String> list = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "1"))
                .select(String.class, o -> o.column(Topic::getId))
                .toList();

==> Preparing: SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab 字符串属性

```java

List<String> list1 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1"))
                .select(String.class, o -> o.column("id"))
                .toList();


==> Preparing: SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 1(ms)
<== Total: 1
```
:::

## Integer


::: code-tabs
@tab 代理属性
```java
List<Integer> list2 = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                .where((f, t) -> f.eq(t.id(), "1"))
                .select(IntegerProxy.DEFAULT, (s, t) -> s.column(t.stars()))
                .toList();

==> Preparing: SELECT t.`stars` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab lambda属性

```java

List<Integer> list = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "1"))
        .select(Integer.class, o -> o.column(Topic::getStars))
        .toList();

==> Preparing: SELECT t.`stars` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab 字符串属性

```java

List<Integer> list1 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1"))
                .select(Integer.class, o -> o.column("stars"))
                .toList();


==> Preparing: SELECT t.`stars` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 1(ms)
<== Total: 1
```
:::

## Map
返回结果为`Map<String,Object>` ,默认Key忽略大小写(`Locale.ENGLISH`)


::: code-tabs
@tab 代理属性
```java
Class<Map<String,Object>> mapClass= EasyObjectUtil.typeCastNullable(Map.class);
List<Map<String,Object>> list2 = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                    .where((f, t) -> f.eq(t.id(), "1"))
                    .select(MapProxy.DEFAULT, (s, t) -> s.columnAll(t))
                    .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1


List<Map<String,Object>> list2 = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                    .where((f, t) -> f.eq(t.id(), "1"))
                    .select(MapProxy.DEFAULT)
                    .toList();


==> Preparing: SELECT * FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 9(ms)
<== Total: 1
```
@tab lambda属性

```java

Class<Map<String,Object>> mapClass= EasyObjectUtil.typeCastNullable(Map.class);
List<Map<String,Object>> list = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "1"))
        .select(mapClass, o -> o.columnAll())
        .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 9(ms)
<== Total: 1


List<Map<String,Object>> list = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "1"))
                .select(mapClass)
                .toList();


==> Preparing: SELECT * FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 9(ms)
<== Total: 1
```
@tab 字符串属性

```java
Class<Map<String,Object>> mapClass= EasyObjectUtil.typeCastNullable(Map.class);
List<Map<String,Object>> list1 = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(mapClass, o -> o.columnAll())
                    .toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1


List<Map<String,Object>> list1 = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(mapClass)
                    .toList();


==> Preparing: SELECT * FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
:::