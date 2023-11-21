---
title: OR条件
---

# OR条件查询
`where`默认提供了`and`和`or`关键字并且提供了泛型版本所以用户可以通过`and`和`or`来进行组合对应的条件,默认条件和条件之间用and进行链接

- `and(()->{条件})`表示`and`内部的条件是以括号包裹,并且和前一个条件之间是`AND`关系
- `or(()->{条件})`表示`or`内部的条件是以括号包裹,并且和前一个条件之间是`OR`关系

## 案例
`and`内部使用`or`链接那么可以将`and`视为括号`(....or....or....)`
```java
Topic topic = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "1").and(
                        () -> o.like(Topic::getTitle, "你好")
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
                        () -> o.like(BlogEntity::getTitle, "你好")
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
                        () -> o.like(Topic::getTitle, "你好")
                                .eq(Topic::getTitle, "我是title")
                                .le(Topic::getCreateTime, LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR (`title` LIKE ? AND `title` = ? AND `create_time` <= ?)) LIMIT 1
==> Parameters: 1(String),%你好%(String),我是title(String),2023-07-05T06:35:32.079(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

多列`or`条件模糊搜索,传入`List<String>`的name集合,需要查询主题id和标题包含的结果

```java

List<String> searchValues = Arrays.asList("1", "小明", "小红");
List<Topic> list = easyQuery
        .queryable(Topic.class)
        .where(o -> o.isBank(Topic::getId))
        .where(o -> {
                for (String searchValue : searchValues) {
                o.and(() -> { //每次and就是代表一个括号,括号里面用or来链接
                        o.like(Topic::getId, searchValue)
                                .or().like(Topic::getTitle, searchValue);
                });
                }
        })
        .toList();


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = ? AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?)
==> Parameters: (String),(String),%1%(String),%1%(String),%小明%(String),%小明%(String),%小红%(String),%小红%(String)
<== Time Elapsed: 53(ms)
<== Total: 0
```