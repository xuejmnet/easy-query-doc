---
title: OR条件
---

# OR条件查询
where默认提供了`and`和`or`关键字并且提供了泛型版本所以用户可以通过`and`和`or`来进行组合对应的条件,默认条件和条件之间用and进行链接

## 案例
`and`内部使用`or`链接那么可以将`and`视为括号`(....or....or....)`
```java
Topic topic = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "1").and(
                        x -> x.like(Topic::getTitle, "你好")
                                .or()
                                .eq(Topic::getTitle, "我是title")
                                .or()
                                .le(Topic::getCreateTime, LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: 1(String),%你好%(String),我是title(String),2023-07-05T06:25:17.356(LocalDateTime)
<== Time Elapsed: 4(ms)
<== Total: 1
```

没有`and`全部都是`or`以where为单位之间会以and进行组合
```java
List<Topic> topic2 = easyQuery.queryable(Topic.class)
                .where(o -> o.like(Topic::getTitle, "你好")
                        .or()
                        .eq(Topic::getTitle, "我是title")
                        .or()
                        .le(Topic::getCreateTime, LocalDateTime.now())).toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`title` LIKE ? OR `title` = ? OR `create_time` <= ?)
==> Parameters: %你好%(String),我是title(String),2023-07-05T06:30:24.572(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 43
```
和逻辑删除等组合
```java
BlogEntity blog = easyQuery.queryable(BlogEntity.class)
                .where(o -> o.eq(BlogEntity::getId, "1").and(
                        x -> x.like(BlogEntity::getTitle, "你好")
                                .or()
                                .eq(BlogEntity::getTitle, "我是title")
                                .or()
                                .le(BlogEntity::getCreateTime, LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),1(String),%你好%(String),我是title(String),2023-07-05T06:33:07.090(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1


BlogEntity blog1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.like(BlogEntity::getTitle, "你好")
                .or()
                .eq(BlogEntity::getTitle, "我是title")
                .or()
                .le(BlogEntity::getCreateTime, LocalDateTime.now())).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),%你好%(String),我是title(String),2023-07-05T06:34:07.310(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

多个`and`用`or`链接
```java
Topic topic3 = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "1").or(
                        x -> x.like(Topic::getTitle, "你好")
                                .eq(Topic::getTitle, "我是title")
                                .le(Topic::getCreateTime, LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR (`title` LIKE ? AND `title` = ? AND `create_time` <= ?)) LIMIT 1
==> Parameters: 1(String),%你好%(String),我是title(String),2023-07-05T06:35:32.079(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```