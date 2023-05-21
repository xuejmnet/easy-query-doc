---
title: 连表统计
order: 90
---

# 连表统计
`easy-query`可以实现连表统计,方便用户针对连表统计时进行操作而不需要手写sql,并且支持分片

实现sql
```sql
select a,b,c,(select count(t1.id) from a t1) as xx from b
```

## count连表统计

```java

@Data
public class TopicSubQueryBlog {
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
    private Long blogCount;
}

```

```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class,"x");
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(t->{
            return queryable.where(x -> x.eq(t, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnCount(BlogEntity::getId));
        }, TopicSubQueryBlog::getBlogCount))select.toList();
```

```sql

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT COUNT(x.`id`) AS `id` FROM `t_blog` x WHERE x.`deleted` = ? AND x.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 4(ms)
<== Total: 99
```

需要注意的是子查询匿名表需要自定义请不要和默认主表一致以免条件出现相同的情况`easyQuery.queryable(BlogEntity.class,"x");`指定为x


## sum连表统计
```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class,"x");
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(t->{
            return queryable.where(x -> x.eq(t, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnSum(BlogEntity::getStar));
        }, TopicSubQueryBlog::getBlogCount)).toList();
```
```sql
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT SUM(x.`star`) AS `star` FROM `t_blog` x WHERE x.`deleted` = ? AND x.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 14(ms)
<== Total: 99

```

`max`、`min` 同理