---
title: PARTITION BY
order: 100
---

`PARTITION BY` is a database window function. Some databases may not support it or low-version databases may not support it. Please use it based on the specific database.

## Provided APIs

Method  
--- 
rowNumberOver
rankOver
denseRankOver
countOver
sumOver
avgOver
maxOver
minOver

## Initialize Data Table Structure

```java

@Getter
@Setter
@Table("t_blog")
@EntityProxy
@ToString
public class DocBlog implements ProxyEntityAvailable<DocBlog , DocBlogProxy> {
    @Column(primaryKey = true)
    private String id;

    /**
     * Title
     */
    private String title;
    /**
     * Topic
     */
    private String topic;
    /**
     * Blog link
     */
    private String url;
    /**
     * Likes count
     */
    private Integer star;
    /**
     * Publish time
     */
    private LocalDateTime publishTime;
    /**
     * Score
     */
    private BigDecimal score;
    /**
     * Status
     */
    private Integer status;
}
```

## Case 1
Query 2024 blogs and calculate score ranking of each blog under each topic:
```java
//By default only Partition1-2, if you need more you can submit an issue
List<Partition1<DocBlog, Long>> list = easyEntityQuery.queryable(DocBlog.class)
        .where(d -> {
            d.publishTime().gt(LocalDateTime.of(2024, 1, 1, 0, 0));
        }).select(d -> Select.PARTITION.of(
                d,
                d.expression().rowNumberOver().partitionBy(d.topic()).orderByDescending(d.score())
        )).toList();
        //Partition1 structure is {entity:{},partitionColumn1:object}

-- 1st SQL data
SELECT
    t.`id`,
    t.`title`,
    t.`topic`,
    t.`url`,
    t.`star`,
    t.`publish_time`,
    t.`score`,
    t.`status`,
    (ROW_NUMBER() OVER (PARTITION BY t.`topic` ORDER BY t.`score` DESC)) AS `__partition__column1` 
FROM
    `t_blog` t 
WHERE
    t.`publish_time` > '2024-01-01 00:00'
```

## Case 2
Query 2024 blogs, calculate each blog's score and likes count under each topic, return top 3 by score and last 5 by likes count:
```java
//Don't return ranking, directly return object
  List<DocBlog> list = easyEntityQuery.queryable(DocBlog.class)
                .where(d -> {
                    d.publishTime().gt(LocalDateTime.of(2024, 1, 1, 0, 0));
                }).select(d -> Select.PARTITION.of(
                        d,
                        d.expression().rowNumberOver().partitionBy(d.topic()).orderByDescending(d.score().nullOrDefault(BigDecimal.ZERO)),
                        d.expression().rowNumberOver().partitionBy(d.topic()).orderBy(d.star().nullOrDefault(0))
                ))
                .where(p2 -> {
                    p2.partitionColumn1().le(3L);
                    p2.partitionColumn2().le(5L);
                }).select(p2 -> p2.entityTable()).toList();


-- 1st SQL data
SELECT
    t1.`id`,
    t1.`title`,
    t1.`topic`,
    t1.`url`,
    t1.`star`,
    t1.`publish_time`,
    t1.`score`,
    t1.`status` 
FROM
    (SELECT
        t.`id`,
        t.`title`,
        t.`topic`,
        t.`url`,
        t.`star`,
        t.`publish_time`,
        t.`score`,
        t.`status`,
        (ROW_NUMBER() OVER (PARTITION BY t.`topic` ORDER BY IFNULL(t.`score`, '0') DESC)) AS `__partition__column1`,
        (ROW_NUMBER() OVER (PARTITION BY t.`topic` ORDER BY IFNULL(t.`star`, 0) ASC)) AS `__partition__column2` 
    FROM
        `t_blog` t 
    WHERE
        t.`publish_time` > '2024-01-01 00:00') t1 
WHERE
    t1.`__partition__column1` <= 3 
    AND t1.`__partition__column2` <= 5
```

```java

        List<Partition2<DocBlog, Long, Long>> list = easyEntityQuery.queryable(DocBlog.class)
                .where(d -> {
                    d.publishTime().gt(LocalDateTime.of(2024, 1, 1, 0, 0));
                }).select(d -> Select.PARTITION.of(
                        d,
                        d.expression().rowNumberOver().partitionBy(d.topic()).orderByDescending(d.score().nullOrDefault(BigDecimal.ZERO)),
                        d.expression().rowNumberOver().partitionBy(d.topic()).orderBy(d.star().nullOrDefault(0))
                ))
                .where(p2 -> {
                    p2.partitionColumn1().le(3L);
                    p2.partitionColumn2().le(5L);
                }).toList();



-- 1st SQL data
SELECT
    t1.`id`,
    t1.`title`,
    t1.`topic`,
    t1.`url`,
    t1.`star`,
    t1.`publish_time`,
    t1.`score`,
    t1.`status`,
    t1.`__partition__column1` AS `__partition__column1`,
    t1.`__partition__column2` AS `__partition__column2` 
FROM
    (SELECT
        t.`id`,
        t.`title`,
        t.`topic`,
        t.`url`,
        t.`star`,
        t.`publish_time`,
        t.`score`,
        t.`status`,
        (ROW_NUMBER() OVER (PARTITION BY t.`topic` ORDER BY IFNULL(t.`score`, '0') DESC)) AS `__partition__column1`,
        (ROW_NUMBER() OVER (PARTITION BY t.`topic` ORDER BY IFNULL(t.`star`, 0) ASC)) AS `__partition__column2` 
    FROM
        `t_blog` t 
    WHERE
        t.`publish_time` > '2024-01-01 00:00') t1 
WHERE
    t1.`__partition__column1` <= 3 
    AND t1.`__partition__column2` <= 5
```

