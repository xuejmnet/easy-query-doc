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
@tab 对象查询
```java
List<Map<String, Object>> list = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t_topic, t_blog) -> {
                t_topic.id().eq(t_blog.id());
        })
        .where((t_topic, t_blog) -> {
                t_topic.title().like("123");
        }).select((t_topic, t_blog) -> new MapProxy()
                .put("v1", t_topic.id())
                .put("v2", t_blog.star().add(1))
                .put("v3", t_topic.createTime().nullOrDefault(LocalDateTime.now()))
        ).toList();



==> Preparing: SELECT t.`id` AS `v1`,(t1.`star` + ?) AS `v2`,IFNULL(t.`create_time`,?) AS `v3` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`title` LIKE ?
==> Parameters: 1(Integer),2025-02-10T21:01:03.097(LocalDateTime),false(Boolean),%123%(String)


//自定义key返回
MapKey<String> str = MapKeys.stringKey("str");
MapKey<Integer> integer = MapKeys.integerKey("integer");
MapKey<LocalDateTime> time = MapKeys.localDateTimeKey("time");

List<Map<String, Object>> list = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t_topic, t_blog) -> {
                t_topic.id().eq(t_blog.id());
        })
        .where((t_topic, t_blog) -> {
                t_topic.title().like("123");
        }).select((t_topic, t_blog) -> new MapTypeProxy()
                .put(str, t_topic.id())
                .put(integer, t_blog.star().add(1))
                .put(time, t_topic.createTime().nullOrDefault(LocalDateTime.now()))
        ).toList();


for (Map<String, Object> map : list) {
        String value1OrNull = str.getValueOrNull(map);
        Integer value2OrNull = integer.getValueOrNull(map);
        LocalDateTime value3OrNull = time.getValueOrNull(map);
}

==> Preparing: SELECT t.`id` AS `str`,(t1.`star` + ?) AS `integer`,IFNULL(t.`create_time`,?) AS `time` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`title` LIKE ?
==> Parameters: 1(Integer),2025-02-10T21:10:47.308(LocalDateTime),false(Boolean),%123%(String)
```
:::