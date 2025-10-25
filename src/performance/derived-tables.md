---
title: 派生表条件穿透
order: 90
---

# 派生表条件穿透
有时候我们常常会对数据进行`from子查询`的操作，尤其是将我们设计好的对象暴露给下游或者暴露给前端，让其可以进行筛选或者排序，但是这种操作因为涉及到了派生表的外部操作，所以会导致派生表在使用时无法使用索引导致性能变得低下，实际代码如下
```java
 EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // 评分
                        .status().set(t_blog.status()) // 状态
                        .order().set(t_blog.order()) // 排序
                        .isTop().set(t_blog.isTop()) // 是否置顶
                        .top().set(t_blog.top()) // 是否置顶
                );
        //下游操作或者前端用户传递json操作query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().gt(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
通过上述表达式我们将生成如下sql
```sql

    SELECT
        t1.`score` AS `score`,
        t1.`status1` AS `status1`,
        t1.`order` AS `order`,
        t1.`is_top` AS `is_top`,
        t1.`top` AS `top` 
    FROM
        (SELECT
            t.`score` AS `score`,
            t.`status` AS `status1`,
            t.`order` AS `order`,
            t.`is_top` AS `is_top`,
            t.`top` AS `top` 
        FROM
            `t_blog` t 
        WHERE
            t.`deleted` = false) t1 
    WHERE
        t1.`status1` > 0 
        AND t1.`order` = 1
```

我们可以看到status1和order都是在派生表外部进行筛选，甚至`status`再生成vo后变成了对应的别名`status1`，这就导致了`t_blog`这张表无法合理的使用对应的索引导致性能的低下，那么我们应该如何处理呢
```java

        EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .configure(s->s.getBehavior().addBehavior(EasyBehaviorEnum.SMART_PREDICATE))//这个配置
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // 评分
                        .status().set(t_blog.status()) // 状态
                        .order().set(t_blog.order()) // 排序
                        .isTop().set(t_blog.isTop()) // 是否置顶
                        .top().set(t_blog.top()) // 是否置顶
                );
        //下游操作或者前端用户传递json操作query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().gt(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
添加这个`EasyBehaviorEnum.SMART_PREDICATE`配置后,生成sql如下
```sql

    SELECT
        t1.`score` AS `score`,
        t1.`status1` AS `status1`,
        t1.`order` AS `order`,
        t1.`is_top` AS `is_top`,
        t1.`top` AS `top` 
    FROM
        (SELECT
            t.`score` AS `score`,
            t.`status` AS `status1`,
            t.`order` AS `order`,
            t.`is_top` AS `is_top`,
            t.`top` AS `top` 
        FROM
            `t_blog` t 
        WHERE
            t.`deleted` = false 
            AND t.`order` = 1) t1 
    WHERE
        t1.`status1` > 0 
        AND t1.`order` = 1
```
我们看到框架将order结果穿透到了派生表内部,这样如果我们遇到封装关键数据时就能对该表进行条件索引了

但是细心的小伙伴肯定发现了为什么`status1`没有穿透呢，因为默认穿透我们框架只支持了`eq`和`in`两个操作符如果需要我们后续会继续增加,那么我们将`status1`的比较改成`eq`
```java
EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .configure(s->s.getBehavior().addBehavior(EasyBehaviorEnum.SMART_PREDICATE))
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // 评分
                        .status().set(t_blog.status()) // 状态
                        .order().set(t_blog.order()) // 排序
                        .isTop().set(t_blog.isTop()) // 是否置顶
                        .top().set(t_blog.top()) // 是否置顶
                );


        //下游操作或者前端用户传递json操作query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().eq(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
生成sql
```sql

-- 第1条sql数据

    SELECT
        t1.`score` AS `score`,
        t1.`status1` AS `status1`,
        t1.`order` AS `order`,
        t1.`is_top` AS `is_top`,
        t1.`top` AS `top` 
    FROM
        (SELECT
            t.`score` AS `score`,
            t.`status` AS `status1`,
            t.`order` AS `order`,
            t.`is_top` AS `is_top`,
            t.`top` AS `top` 
        FROM
            `t_blog` t 
        WHERE
            t.`deleted` = false 
            AND t.`status` = 0 
            AND t.`order` = 1) t1 
    WHERE
        t1.`status1` = 0 
        AND t1.`order` = 1
```