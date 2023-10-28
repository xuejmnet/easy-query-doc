---
title: 分组
order: 30
---

# 分组
`easy-query`提供了方便的分组查询功能的支持

```java
List<TopicGroupTestDTO> topicGroupTestDTOS = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                .select(TopicGroupTestDTO.class, o->o.columnAs(Topic::getId,TopicGroupTestDTO::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `idCount` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1


List<TopicGroupTestDTO> topicGroupTestDTOS = easyQuery.queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                .select(TopicGroupTestDTO.class, o->o.groupKeysAs(0, TopicGroupTestDTO::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `idCount` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
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
```
`select`将表示需要讲表达式进行对应结果映射到`TopicGroupTestDTO`对象上,`TopicGroupTestDTO`是一个数据接受对象不具有具体表名,
`select`第二个参数表示需要映射的关系,`columnAs`方法和`column`如果两者对象在数据库列上映射是一样的那么可以用`column`也是一样的,`columnCount`表示需要对id列进行`count`聚合并且映射到`TopicGroupTestDTO::getIdCount`