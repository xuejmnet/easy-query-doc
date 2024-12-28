---
title: 分组
order: 30
---

# 分组
`easy-query`提供了方便的分组查询功能的支持


::: code-tabs
@tab 对象模式
```java
List<TopicGroupTestDTO> topicGroupTestDTOS = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().eq("3"))
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(o -> GroupKeys.of(o.id()))
                .select(g->{
                    TopicGroupTestDTOProxy result = new TopicGroupTestDTOProxy();
                    result.id().set(g.key1());
                    result.idCount().set(g.intCount());
                    result.idMin().set(g.groupTable().id().min());
                    return result;
                })
                //.select(TopicGroupTestDTO.class,g -> Select.of(
                       //group.key1().as(TopicGroupTestDTO::getId),
                       //group.groupTable().id().intCount().as(TopicGroupTestDTO::getIdCount),
                       //group.groupTable().id().min().as(TopicGroupTestDTO::getIdMin)
                //))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `id_count`,MIN(t.`id`) AS `id_min` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1

```

@tab lambda模式
```java
List<TopicGroupTestDTO> topicGroupTestDTOS = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                .select(TopicGroupTestDTO.class, o->o.columnAs(Topic::getId,TopicGroupTestDTO::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `id_count` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1


List<TopicGroupTestDTO> topicGroupTestDTOS = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                .select(TopicGroupTestDTO.class, o->o.groupKeysAs(0, TopicGroupTestDTO::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `id_count` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1


List<TopicGroupTestDTO> topicGroupTestDTOS = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                //将上述查询的columnAs替换为column
                .select(TopicGroupTestDTO.class, o->o.column(Topic::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount))
                .toList();


==> Preparing: SELECT t.`id`,COUNT(t.`id`) AS `idCount` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1


`select`将表示需要讲表达式进行对应结果映射到`TopicGroupTestDTO`对象上,`TopicGroupTestDTO`是一个数据接受对象不具有具体表名,
`select`第二个参数表示需要映射的关系,`columnAs`方法和`column`如果两者对象在数据库列上映射是一样的那么可以用`column`也是一样的,`columnCount`表示需要对id列进行`count`聚合并且映射到`TopicGroupTestDTO::getIdCount`
```

::: 


EntityQuery `group` 多表2张表及以上,`group.groupTable()`无法表示为对应的表,需要通过`group.groupTable().t1......t10`来表示

```java
List<BlogGroupIdAndName> list = easyEntityQuery.queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, b2) -> t.id().eq(b2.id()))
                .where((t, b2) -> {
                    t.title().isNotNull();
                    t.createTime().le(LocalDateTime.of(2021, 3, 4, 5, 6));
                })
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy((t1, b2) -> GroupKeys.of(t1.id(), b2.star()))
                .select(group -> new BlogGroupIdAndNameProxy()
                    .id().set(group.key1())
                    .idCount().set(group.groupTable().t2.id().count())
                ).toList();

==> Preparing: SELECT t.`id` AS `id`,COUNT(t1.`id`) AS `id_count` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`title` IS NOT NULL AND t.`create_time` <= ? GROUP BY t.`id`,t1.`star`
==> Parameters: false(Boolean),2021-03-04T05:06(LocalDateTime)
<== Time Elapsed: 7(ms)
<== Total: 0
```