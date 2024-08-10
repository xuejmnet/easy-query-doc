---
title: 基本类型查询
---

# 基本类型查询
`easy-query`提供了针对基本类型的查询功能,如果您只需要返回基本类型那么不需要额外定义复杂的对象,并且支持map等数据结构



## String


::: code-tabs
@tab 对象模式
```java
List<String> list2 = easyEntityQuery.queryable(Topic.class)
                .where(f -> f.id().eq("1"))
                .select(s -> new StringProxy(s.id()))
                .toList();

List<String> list2 = easyEntityQuery.queryable(Topic.class)
                .where(f -> f.id().eq("1"))
                .select(s -> s.id())//eq 2.x.x^
                //.selectColumn(s -> s.id())
                .toList();

==> Preparing: SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab 代理属性
```java
TopicProxy table = TopicProxy.createTable();
List<String> list2 = easyProxyQuery.queryable(table)
                .where(f -> f.eq(table.id(), "1"))
                .select(StringProxy.createTable(), s -> s.column(table.id()))
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

@tab lambda表达式树模式
```java
List<String> list = elq.queryable(Topic.class)
                .where(f -> f.getId() == "1")
                .select(s -> s.getId())
                .toList();

==> Preparing: SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
:::

## Integer


::: code-tabs
@tab 对象模式
```java
List<Integer> list2 = easyEntityQuery.queryable(Topic.class)
                .where(f -> f.id().eq( "1"))
                .select(s -> new IntegerProxy(s.stars()))
                .toList();

List<Integer> list2 = easyEntityQuery.queryable(Topic.class)
                .where(f -> f.id().eq( "1"))
                .select(s -> s.stars())//eq 2.x.x^
                //.selectColumn(s -> s.stars())
                .toList();

==> Preparing: SELECT t.`stars` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab 代理属性
```java
TopicProxy table = TopicProxy.createTable();
List<Integer> list2 = easyProxyQuery.queryable(table)
                .where(f -> f.eq(table.id(), "1"))
                .select(IntegerProxy.createTable(), s -> s.column(table.stars()))
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
@tab lambda表达式树模式
```java
List<Integer> list2 = elq.queryable(Topic.class)
        .where(f -> f.getId() == "1")
        .select(s -> s.getStars())
        .toList();

==> Preparing: SELECT t.`stars` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
:::

## Map
返回结果为`Map<String,Object>` ,默认Key忽略大小写(`Locale.ENGLISH`)


::: code-tabs
@tab 对象模式
```java
List<Map<String,Object>> list2 = easyEntityQuery.queryable(Topic.class)
                    .where(f -> f.id().eq( "1"))
                    .select(s -> new MapProxy().adapter(r->{
                        r.put("id",s.id());
                        r.put("name",s.stars());
                    }))
                    .toList();

==> Preparing: SELECT t.`id` AS `id`,t.`stars` AS `name` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

List<Map<String,Object>> list2 = easyEntityQuery.queryable(Topic.class)
                    .where(f -> f.id().eq( "1"))
                    .select(s -> new MapProxy().selectAll(s))
                    .toList();
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1


List<Map<String,Object>> list2 = easyEntityQuery.queryable(table)
                    .where(f -> f.id().eq( "1"))
                    .select(s -> new MapProxy())
                    .toList();


==> Preparing: SELECT * FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 9(ms)
<== Total: 1
```
@tab 代理属性
```java
TopicProxy table = TopicProxy.createTable();
Class<Map<String,Object>> mapClass= EasyObjectUtil.typeCastNullable(Map.class);
List<Map<String,Object>> list2 = easyProxyQuery.queryable(table)
                    .where(f -> f.eq(table.id(), "1"))
                    .select(MapProxy.createTable(), s -> s.columnAll(table))
                    .toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1


List<Map<String,Object>> list2 = easyProxyQuery.queryable(table)
                    .where(f -> f.eq(table.id(), "1"))
                    .select(MapProxy.createTable())
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
@tab lambda表达式树模式

```java
List<Map<String,Object>> list3 = elq.queryable(Topic.class)
                .where(f -> f.getId() == "1")
                // 暂时不支持对返回弱类型Map的字段选择
                .toMaps();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
:::


## 支持的类型

类型  | 是否支持
--- | --- 
String | ✅
BigDecimal | ✅
Boolean | ✅
Byte[] | ✅
Byte | ✅
Double | ✅
Float | ✅
Integer | ✅
LocalDate | ✅
LocalDateTime | ✅
LocalTime | ✅
Long | ✅
Map | ✅
Short | ✅
java.sql.Date | ✅
Time | ✅
Timestamp | ✅
java.util.Date | ✅