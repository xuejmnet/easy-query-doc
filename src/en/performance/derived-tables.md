---
title: Derived Table Condition Penetration
order: 90
---

# Derived Table Condition Penetration
Sometimes we often perform `from subquery` operations on data, especially when exposing our designed objects to downstream or frontend, allowing them to filter or sort. However, this operation, because it involves external operations on derived tables, will cause the derived table to be unable to use indexes during use, leading to poor performance. The actual code is as follows:
```java
 EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // Score
                        .status().set(t_blog.status()) // Status
                        .order().set(t_blog.order()) // Order
                        .isTop().set(t_blog.isTop()) // Is top
                        .top().set(t_blog.top()) // Is top
                );
        //Downstream operations or frontend user passing json to operate query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().gt(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
Through the above expression we will generate the following SQL
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

We can see that both status1 and order are filtered outside the derived table. Even `status` becomes the corresponding alias `status1` after generating the vo. This causes the `t_blog` table to be unable to reasonably use the corresponding index, leading to poor performance. So how should we handle this?
```java

        EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .configure(s->s.getBehavior().addBehavior(EasyBehaviorEnum.SMART_PREDICATE))//This configuration
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // Score
                        .status().set(t_blog.status()) // Status
                        .order().set(t_blog.order()) // Order
                        .isTop().set(t_blog.isTop()) // Is top
                        .top().set(t_blog.top()) // Is top
                );
        //Downstream operations or frontend user passing json to operate query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().gt(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
After adding this `EasyBehaviorEnum.SMART_PREDICATE` configuration, the generated SQL is as follows:
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
We see that the framework penetrated the order condition into the derived table. This way, if we encounter packaged key data, we can create condition indexes on that table.

But careful partners must have noticed why `status1` did not penetrate. Because by default, our framework only supports the `eq` and `in` operators for penetration. If needed, we will continue to add more in the future. So let's change the comparison of `status1` to `eq`:
```java
EntityQueryable<BlogEntityVO1Proxy, BlogEntityVO1> query = easyEntityQuery.queryable(BlogEntity.class)
                .configure(s->s.getBehavior().addBehavior(EasyBehaviorEnum.SMART_PREDICATE))
                .select(t_blog -> new BlogEntityVO1Proxy()
                        .score().set(t_blog.score()) // Score
                        .status().set(t_blog.status()) // Status
                        .order().set(t_blog.order()) // Order
                        .isTop().set(t_blog.isTop()) // Is top
                        .top().set(t_blog.top()) // Is top
                );


        //Downstream operations or frontend user passing json to operate query
        List<BlogEntityVO1> list = query.where(o -> {
            o.status().eq(0);
            o.order().eq(BigDecimal.ONE);
        }).toList();
```
Generated SQL
```sql

-- SQL Statement 1

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

