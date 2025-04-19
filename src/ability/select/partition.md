---
title: PARTITION BY
order: 100
---

`PARTITION BY`是数据库的一个`窗口函数`,部分数据库可能不支持或者低版本数据库不支持，请结合具体数据库使用

## 提供api

方法  
--- 
rowNumberOver
rankOver
denseRankOver
countOver
sumOver
avgOver
maxOver
minOver

## 初始化数据表结构

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
     * 标题
     */
    private String title;
    /**
     * 主题
     */
    private String topic;
    /**
     * 博客链接
     */
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
}
```

## 案例1
查询2024年博客,并且求出每个主题下的各个博客分数,排名
```java
//默认只有Partition1-2如果有更多需要的可以提交issue
List<Partition1<DocBlog, Long>> list = easyEntityQuery.queryable(DocBlog.class)
        .where(d -> {
            d.publishTime().gt(LocalDateTime.of(2024, 1, 1, 0, 0));
        }).select(d -> Select.PARTITION.of(
                d,
                d.expression().rowNumberOver().partitionBy(d.topic()).orderByDescending(d.score())
        )).toList();
        //Partition1结构式{entity:{},partitionColumn1:object}

-- 第1条sql数据
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

## 案例2
求出查询2024年博客,并且求出每个主题下的各个博客分数和点赞数,返回得分前3位并且点赞数最后5位的博客
```java
//不返回排名直接返回对象
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


-- 第1条sql数据
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



-- 第1条sql数据
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