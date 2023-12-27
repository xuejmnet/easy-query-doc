---
title: 连表统计 Select (Count...)
order: 90
---

# 连表统计
`easy-query`可以实现连表统计,方便用户针对连表统计时进行操作而不需要手写sql,并且支持分片

实现sql
```sql
select a,b,c,(select count(t1.id) from a t1) as xx from b
```

## count连表统计

::: code-tabs
@tab 对象模式
```java
@Data
@EntityFileProxy
public class TopicSubQueryBlog implements ProxyEntityAvailable<TopicSubQueryBlog , TopicSubQueryBlogProxy> {
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
    private Long blogCount;

    @Override
    public Class<TopicSubQueryBlogProxy> proxyTableClass() {
        return TopicSubQueryBlogProxy.class;
    }
}

@tab lambda模式

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

:::


::: code-tabs
@tab 对象模式
```java
 List<TopicSubQueryBlog> list = entityQuery.queryable(Topic.class)
                    .where(o -> o.title().isNotNull())
                    .select(TopicSubQueryBlog.class, (o, tr) -> {
                        return Select.of(
                                o.allFields(),
                                Select.subQueryAs(() -> {
                                    //.select(LongProxy.createTable(),x->x.id().count())这个是COUNT(id)和selectCount是COUNT(*)两者是一致的
                                    return entityQuery.queryable(BlogEntity.class).where(x -> x.id().eq(o.id())).selectCount();//count(*)
                                }, tr.blogCount())
                        );
                    }).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT COUNT(*) FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 5(ms)
<== Total: 99
        
```
@tab lambda模式

```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class);
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(()->{
            return queryable.where(x -> x.eq(o, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnCount(BlogEntity::getId));
        }, TopicSubQueryBlog::getBlogCount)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT COUNT(t1.`id`) AS `id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 4(ms)
<== Total: 99
```
:::


## sum连表统计

::: code-tabs
@tab 对象模式
```java

List<TopicSubQueryBlog> list = entityQuery.queryable(Topic.class)
        .where(o -> o.title().isNotNull())
        .select(TopicSubQueryBlog.class, (o, tr) -> {
            return Select.of(
                    o.allFields(),
                    Select.subQueryAs(() -> {
                        return entityQuery.queryable(BlogEntity.class)
                                .where(x -> x.id().eq(o.id())).
                                select(LongProxy.createTable(),x->x.star().sum());
                    }, tr.blogCount())
            );
        }).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT SUM(t1.`star`) FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 4(ms)
<== Total: 99
        
```
@tab lambda模式

```java

Queryable<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class);
List<TopicSubQueryBlog> list = easyQuery
        .queryable(Topic.class)
        .where(t -> t.isNotNull(Topic::getTitle))
        .select(TopicSubQueryBlog.class, o -> o.columnAll().columnSubQueryAs(()->{
            return queryable.where(x -> x.eq(o, BlogEntity::getId, Topic::getId)).select(Long.class, x->x.columnSum(BlogEntity::getStar));
        }, TopicSubQueryBlog::getBlogCount)).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time`,(SELECT SUM(t1.`star`) AS `star` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = t.`id`) AS `blog_count` FROM `t_topic` t WHERE t.`title` IS NOT NULL
==> Parameters: false(Boolean)
<== Time Elapsed: 14(ms)
<== Total: 99

```
:::

`max`、`min` 同理