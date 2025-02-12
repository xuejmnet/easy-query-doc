---
title: 表达式复用
---

# 表达式复用
针对复杂表达式很多时候我们需要复用表达式,而不是重复定义,我们可以使用`easy-query`提供的`cloneQueryable`方法来克隆一个一模一样的,
因为`where`、`order`、`select`等会让当前表达式的内容是追加上去的而不是重新生成一个新的

```java
//首先我们定义一个表达式
Queryable<BlogEntity> sql = easyQuery
        .queryable(Topic.class)
        .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle))
        .groupBy((t, t1) -> t1.column(BlogEntity::getId))
        .select(BlogEntity.class, (t, t1) -> t1.column(BlogEntity::getId).columnSum(BlogEntity::getScore));

//克隆一个新的
Queryable<BlogEntity> blogEntityQueryable = sql.cloneQueryable();
//对其添加select常量
String countSql = sql.cloneQueryable().select("COUNT(1)").toSQL();
Assert.assertEquals("SELECT COUNT(1) FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2", countSql);
//对其limit
String limitSql = sql.limit(2, 2).toSQL();
Assert.assertEquals("SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 2 OFFSET 2", limitSql);
//在对原先的进行操作发现select和limit并没有赋值上去,所以cloneQueryable生效
String sql1 = blogEntityQueryable.select(Long.class, o -> o.columnCount(BlogEntity::getId)).toSQL();
Assert.assertEquals("SELECT COUNT(t2.`id`) AS `id` FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM `t_topic` t INNER JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2", sql1);
```