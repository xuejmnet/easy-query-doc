---
title: Map Result Return
order: 150
---

# Map Result Return
`easy-query` supports returning query results dynamically in `Map<String,Object>` format. By default, keys ignore case (`Locale.ENGLISH`).

## Query sqlQuery
Strongly-typed result return
### No Parameter Strongly-Typed Return
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t", BlogEntity.class);

==> Preparing: SELECT * FROM t_blog t
<== Total: 100

```
### With Parameter Strongly-Typed Return
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t where t.id=?", BlogEntity.class, Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## Query sqlQueryMap
`Map` return defaults to case-insensitive `key`
### No Parameter Map Return
```java
 List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t");
 
 ==> Preparing: SELECT * FROM t_blog t
<== Total: 100
```

### With Parameter Map Return
```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t  where t.id=?", Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t  where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## Map
Return result is `Map<String,Object>`, default key ignores case (`Locale.ENGLISH`)

::: code-tabs
@tab Object Query
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


//Custom key return
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

