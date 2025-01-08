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
                .leftJoin(BlogEntity.class, (t, t1) -> tid().eq(t1.id()))
                .where(o -> o.id().eq("3"))
                .firstOrNull();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t LEFT JOIN t_blog t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`id` = ? LIMIT 1
==> Parameters: false(Boolean),3(String)
<== Total: 1
```

## innerJoin
```java
 List<BlogEntity> blogEntities = easyQuery
                .queryable(Topic.class)
                .innerJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
                .where((t, t1) ->{
                        t1.title().isNotNull();
                        t.id().eq("3");
                })
                .select(BlogEntity.class, (t, t1) -> t1.FETCHER.allFields())
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
                .where(o -> o.id().eq("3"));
                
        List<BlogEntity> topics = easyQuery
                .queryable(BlogEntity.class)
                .leftJoin(sql,(a,b)->a.id().eq(b.id()))//join匿名表
                .where(o -> {
                        o.id().isNotNull();
                        o.id().eq("3");
                })
                .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t LEFT JOIN (SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` = ?) t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`id` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String),false(Boolean),3(String)
<== Total: 1
```

## group join

```java
 Queryable<TopicGroupTestDTO> sql = easyQuery
                .queryable(Topic.class)
                .where(o -> o.id().eq("3"))
                .groupBy(o->GroupKeys.of(o.id()))
                .select(TopicGroupTestDTO.class, group->Select.of(
                        group.key1().as(TopicGroupTestDTO.Fields.id),
                        group.id().count().as(TopicGroupTestDTO.Fields.idCount)
                ));
        List<BlogEntity> topics = easyQuery
                .queryable(BlogEntity.class)
                .leftJoin(sql,(a,b)->a.id().eq(b.id()))
                .where(o -> {
                        o.id().isNotNull();
                        o.id().eq("3");
                })
                .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top` FROM t_blog t LEFT JOIN (SELECT t.`id` AS `id`,COUNT(t.`id`) AS `idCount` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`) t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ? AND t.`id` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String),false(Boolean),3(String)
<== Total: 1
```

## join2表以上


```java
//返回Queryable3那么可以对这个查询表达式进行后续操作,操作都是可以操作三张表的
Queryable3<Topic, BlogEntity, SysUser> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity,对应关系就是参数顺序
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))//t表示Topic表,t1表示BlogEntity表,对应关系就是参数顺序
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser,对应关系就是参数顺序
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        });



//也支持单表的Queryable返回,但是这样后续操作只可以操作单表没办法操作其他join表了
Queryable<Topic> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        //如果where参数过多不想写可以用whereMerge,selectMerge,orderByMerge同理
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        });
```

## 查询某一张表的所有字段
```java

List<Map<String, Object>> list1 = easyEntityQuery.queryable(BlogEntity.class)
        .leftJoin(Topic.class, (b, t2) -> b.id().eq(t2.id()))
        .select((b1, t2) -> {
                MapProxy result = new MapProxy();
                result.selectAll(b1);
                result.put("xx",t2.createTime());
                return result;
        })
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t1.`create_time` AS `xx` FROM `t_blog` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Time Elapsed: 6(ms)
<== Total: 100
```

## 查询所有字段忽略其中一个
```java

List<Map<String, Object>> list1 = easyEntityQuery.queryable(BlogEntity.class)
        .leftJoin(Topic.class, (b, t2) -> b.id().eq(t2.id()))
        .select((b1, t2) -> {
                MapProxy result = new MapProxy();
                result.selectAll(b1);
                result.put("xx",t2.createTime());
                return result;
        })
        .toList();

==> Preparing: SELECT t.`id`,t.`create_time`,t.`update_time`,t.`create_by`,t.`update_by`,t.`deleted`,t.`title`,t.`content`,t.`url`,t.`star`,t.`publish_time`,t.`score`,t.`status`,t.`order`,t.`is_top`,t.`top`,t1.`create_time` AS `xx` FROM `t_blog` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`deleted` = ?
==> Parameters: false(Boolean)
<== Time Elapsed: 6(ms)
<== Total: 100
```


## 一个相对比较全的查询
```java
easyQuery.queryable(Topic.class)
                .leftJoin(Topic.class, (t, t1) -> t.eq(t1, Topic::getId, Topic::getId))
                .leftJoinMerge(Topic.class, o -> o.t().eq(o.t2(), Topic::getId, Topic::getId))
                .leftJoinMerge(Topic.class, o -> o.t().eq(o.t3(), Topic::getId, Topic::getId))
                .leftJoinMerge(Topic.class, o -> o.t().eq(o.t4(), Topic::getId, Topic::getId))
                .leftJoinMerge(Topic.class, o -> o.t().eq(o.t5(), Topic::getId, Topic::getId))
                .leftJoinMerge(Topic.class, o -> o.t().eq(o.t6(), Topic::getId, Topic::getId))
                .where(o -> o.eq(Topic::getId, 1))
                .where(false, o -> o.eq(Topic::getId, 1))
                .whereById("1")
                .whereById(false, "1")
                .whereById(Collections.singletonList("1"))
                .whereById(false, Collections.singletonList("1"))
                .whereObject(topicRequest)
                .whereObject(false, topicRequest)
                .whereMerge(o -> {
                    o.t().eq(Topic::getId, "1");
                    o.t().eq(false, Topic::getId, "1");
                    o.t().ne(Topic::getId, "1");
                    o.t().ne(false, Topic::getId, "1");
                    o.t().ge(Topic::getId, "1");
                    o.t().ge(false, Topic::getId, "1");
                    o.t().gt(Topic::getId, "1");
                    o.t().gt(false, Topic::getId, "1");
                    o.t().le(Topic::getId, "1");
                    o.t().le(false, Topic::getId, "1");
                    o.t().lt(Topic::getId, "1");
                    o.t().lt(false, Topic::getId, "1");
                    o.t().like(Topic::getId, "1");
                    o.t().like(false, Topic::getId, "1");
                    o.t().notLike(Topic::getId, "1");
                    o.t().notLike(false, Topic::getId, "1");
                    o.t().likeMatchLeft(Topic::getId, "1");
                    o.t().likeMatchLeft(false, Topic::getId, "1");
                    o.t().likeMatchRight(Topic::getId, "1");
                    o.t().likeMatchRight(false, Topic::getId, "1");
                    o.t().notLikeMatchLeft(Topic::getId, "1");
                    o.t().notLikeMatchLeft(false, Topic::getId, "1");
                    o.t().notLikeMatchRight(Topic::getId, "1");
                    o.t().notLikeMatchRight(false, Topic::getId, "1");
                })
                .limit(1, 2)
                .orderByAsc(o -> o.column(Topic::getCreateTime))
                .orderByDesc(o -> o.column(Topic::getCreateTime))
                .orderByAsc(false, o -> o.column(Topic::getCreateTime))
                .orderByDesc(false, o -> o.column(Topic::getCreateTime))
                .orderByAscMerge(o -> o.t().column(Topic::getCreateTime))
                .orderByDescMerge(o -> o.t().column(Topic::getCreateTime))
                .orderByAscMerge(false, o -> o.t().column(Topic::getCreateTime))
                .orderByDescMerge(false, o -> o.t().column(Topic::getCreateTime))
                .groupByMerge(o -> o.t().column(Topic::getId))
                .groupByMerge(false, o -> o.t().column(Topic::getId))
                .havingMerge(o -> o.t().count(Topic::getId, AggregatePredicateCompare.GE, 1))
                .havingMerge(false, o -> o.t().count(Topic::getId, AggregatePredicateCompare.GE, 1));
```