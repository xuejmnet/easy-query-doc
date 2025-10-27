---
title: Expression Reuse
---

# Expression Reuse
For complex expressions, we often need to reuse expressions instead of redefining them. We can use the `cloneQueryable` method provided by `easy-query` to clone an identical one,
because `where`, `order`, `select`, etc. will append to the current expression's content rather than generating a new one.

```java
//First we define an expression
Queryable<BlogEntity> sql = easyQuery
        .queryable(Topic.class)
        .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle))
        .groupBy((t, t1) -> t1.column(BlogEntity::getId))
        .select(BlogEntity.class, (t, t1) -> t1.column(BlogEntity::getId).columnSum(BlogEntity::getScore));

//Clone a new one
Queryable<BlogEntity> blogEntityQueryable = sql.cloneQueryable();
//Add a select constant to it
String countSql = sql.cloneQueryable().select("COUNT(1)").toSQL();
Assert.assertEquals("SELECT COUNT(1) FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2", countSql);
//Add limit to it
String limitSql = sql.limit(2, 2).toSQL();
Assert.assertEquals("SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 2 OFFSET 2", limitSql);
//When operating on the original one, we find that select and limit are not assigned, so cloneQueryable works
String sql1 = blogEntityQueryable.select(Long.class, o -> o.columnCount(BlogEntity::getId)).toSQL();
Assert.assertEquals("SELECT COUNT(t2.`id`) AS `id` FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2", sql1);
```

