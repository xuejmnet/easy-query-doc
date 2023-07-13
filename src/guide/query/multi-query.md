---
title: 多表查询
order: 20
---

# 多表查询
`easy-query`提供了丰富的多表链接查询,并且支持匿名表链接查询

## api变化
当使用join操作后
- `where`存在两种重载,第一种就是单个参数,第二种是两个参数,单个参数为主表操作,两个参数为表顺序,可以通过链式调用`then()`来进行切换,`select`、`groupBy`.....同理

## leftJoin
```java
Topic topic = easyQuery
                .queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where(o -> o.eq(Topic::getId, "3"))
                .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),3(String)
<== Total: 1
```

## innerJoin
```java
 List<BlogEntity> blogEntities = easyQuery
                .queryable(Topic.class)
                .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle).then(t).eq(Topic::getId, "3"))
                .select(BlogEntity.class, (t, t1) -> t1.columnAll())
                .toList();

==> Preparing: SELECT t1.`id`,t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: false(Boolean),3(String)
<== Total: 1
```

## 嵌套Join
```java
//创建一个匿名表的表达式
 Queryable<Topic> sql = easyQuery
                .queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"));
                
        List<BlogEntity> topics = easyQuery
                .queryable(BlogEntity.class)
                .leftJoin(sql,(a,b)->a.eq(b,BlogEntity::getId,Topic::getId))//join匿名表
                .where(o -> o.isNotNull(BlogEntity::getId).eq(BlogEntity::getId,"3"))
                .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t LEFT JOIN (SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?) t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`id` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String),false(Boolean),3(String)
<== Total: 1
```

## group join

```java
 Queryable<TopicGroupTestDTO> sql = easyQuery
                .queryable(Topic.class)
                .where(o -> o.eq(Topic::getId, "3"))
                .groupBy(o->o.column(Topic::getId))
                .select(TopicGroupTestDTO.class, o->o.columnAs(Topic::getId,TopicGroupTestDTO::getId).columnCount(Topic::getId,TopicGroupTestDTO::getIdCount));
        List<BlogEntity> topics = easyQuery
                .queryable(BlogEntity.class)
                .leftJoin(sql,(a,b)->a.eq(b,BlogEntity::getId,TopicGroupTestDTO::getId))
                .where(o -> o.isNotNull(BlogEntity::getId).eq(BlogEntity::getId,"3"))
                .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t LEFT JOIN (SELECT t.`id` AS `id`,COUNT(t.`id`) AS `idCount` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`) t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`id` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String),false(Boolean),3(String)
<== Total: 1
```