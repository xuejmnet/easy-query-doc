---
title: 这个sql怎么写
---

本章节主要是将一些复杂sql的编写方式用表达式展现出来

## 案例一
查询对应的时间函数年份月份进行分组并且取3个月内的
```sql
 SELECT
        YEAR(日期) AS 年份，
        MONTH(日期) AS 月份
        SUM(收入) AS 月收入
        FROM
                your_table
        WHERE
        日期 >= CURDATE()- INTERVAL 3 MONTH
        GROUP BY
        年份，月份
        ORDER BY
        年份，月份;
```
```java
List<Draft3<Integer, Integer, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
          .where(o -> o.createTime().gt(o._now().plusMonths(-3))) //WHERE 日期 >= CURDATE()- INTERVAL 3 MONTH
          .groupBy(o -> GroupKeys.TABLE1.of(o.createTime().year(), o.createTime().month()))//GROUP BY 年份，月份
          .orderBy(o -> {
              o.key1().asc();  // ORDER BY 年份，月份;
              o.key2().asc();
          }).select(o -> Select.DRAFT.of( //采用草稿类型
                  o.key1(), //YEAR(日期) AS 年份，
                  o.key2(), //MONTH(日期) AS 月份
                  o.sum(o.group().star())  //SUM(收入) AS 月收入
          )).toList();


==> Preparing: SELECT YEAR(t.`create_time`) AS `value1`,MONTH(t.`create_time`) AS `value2`,SUM(t.`star`) AS `value3` FROM `t_blog` t WHERE t.`deleted` = ? AND  t.`create_time` > date_add(NOW(), interval (?) month) GROUP BY YEAR(t.`create_time`),MONTH(t.`create_time`) ORDER BY YEAR(t.`create_time`) ASC,MONTH(t.`create_time`) ASC
==> Parameters: false(Boolean),-3(Integer)
<== Time Elapsed: 4(ms)
<== Total: 0
```

## 案例二
```sql
select a.id,a.name
from table a
where (select count(*) as num from table b where b.box_id=a.id ) = 0
```
```java
List<Draft2<String, String>> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> {

                    Query<Long> longQuery = easyEntityQuery.queryable(Topic.class)
                            .where(x -> x.id().eq(o.id())).selectCount();//创建子查询的count然后和0常量进行比较

                    o.SQLParameter().valueOf(0L)
                            .eq(longQuery);
                }).select(o -> Select.DRAFT.of(
                        o.id(),
                        o.url()
                )).toList();

==> Preparing: SELECT t.`id` AS `value1`,t.`url` AS `value2` FROM `t_blog` t WHERE t.`deleted` = ? AND ? = (SELECT COUNT(*) FROM `t_topic` t1 WHERE t1.`id` = t.`id`)
==> Parameters: false(Boolean),0(Long)
```

## 案例三
```sql
select a,b,c,(select count(*) from a t1 where t.id=b.id) as xx from b
```
```java
List<Draft3<String, String, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> {
                    o.id().eq("123");
                }).select(o -> Select.DRAFT.of(
                        o.id(),
                        o.url(),
                        o.subQuery(() -> easyEntityQuery.queryable(Topic.class).where(x -> x.id().eq(o.id())).selectCount())
                )).toList();

==> Preparing: SELECT t.`id` AS `value1`,t.`url` AS `value2`,(SELECT COUNT(*) FROM `t_topic` t1 WHERE t1.`id` = t.`id`) AS `value3` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`id` = ?
==> Parameters: false(Boolean),123(String)
```