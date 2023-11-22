---
title: map结果返回
order: 70
---


# map结果返回
`easy-query`针对查询结果支持将结果动态返回以`Map<String,Object>`格式返回,默认Key忽略大小写(`Locale.ENGLISH`)


## 查询sqlQuery
强类型结果返回
### 无参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t", BlogEntity.class);

==> Preparing: SELECT * FROM t_blog t
<== Total: 100

```
### 有参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t where t.id=?", BlogEntity.class, Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## 查询sqlQueryMap
`Map`返回默认`key`忽略大小写
### 无参数Map返回
```java
 List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t");
 
 ==> Preparing: SELECT * FROM t_blog t
<== Total: 100
```

### 有参数Map返回
```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t  where t.id=?", Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t  where t.id=?
==> Parameters: 1(String)
<== Total: 1
```


## Map
返回结果为`Map<String,Object>` ,默认Key忽略大小写(`Locale.ENGLISH`)


::: code-tabs
@tab 代理属性
```java
TopicProxy table = TopicProxy.createTable();
Class<Map<String,Object>> mapClass= EasyObjectUtil.typeCastNullable(Map.class);
List<Map<String,Object>> list2 = easyProxyQuery.queryable(table)
                    .where((f, t) -> f.eq(t.id(), "1"))
                    .select(MapProxy.createTable(), (s, t) -> s.columnAll(t))
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
:::