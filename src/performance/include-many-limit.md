---
title: 目标集合返回limit项
order: 30
---
`eq`默认提供了对多子项返回`limit`限制条数比如主评论和子评论的前3条,默认可以通过`selectAutoInclude`或`includes`来进行设置，譬如

```java
@Data
@EntityProxy
@Table("comment")
public class M8Comment implements ProxyEntityAvailable<M8Comment, M8CommentProxy> {
    @Column(primaryKey = true)
    private String id;
    private String parentId;
    private String content;
    private String username;
    private LocalDateTime time;
    
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {M8CommentProxy.Fields.id}, targetProperty = {M8CommentProxy.Fields.parentId})
    private List<M8Comment> subComments;
}
```

## UNION_ALL
```java

List<M8Comment> list = easyEntityQuery.queryable(M8Comment.class)
        .includes(m -> m.subComments(), s -> s.limit(3))
        .toList();
```

默认eq会使用`UNION_ALL+LIMIT`来进行限制查询限制返回
```sql


-- 第1条sql数据

    SELECT
        `id`,
        `parent_id`,
        `content`,
        `username`,
        `time` 
    FROM
        `comment`
-- 第2条sql数据


    SELECT
        t1.`id`,
        t1.`parent_id`,
        t1.`content`,
        t1.`username`,
        t1.`time` 
    FROM ( 
    (SELECT
        t.`id`,
        t.`parent_id`,
        t.`content`,
        t.`username`,
        t.`time` 
    FROM
        `comment` t 
    WHERE
        t.`parent_id` = '1' 
    LIMIT 3)  
    UNION
    ALL  (SELECT
        t.`id`, t.`parent_id`, t.`content`, t.`username`, t.`time` FROM `comment` t 
    WHERE
        t.`parent_id` = '2' 
    LIMIT 3)  
    UNION
    ALL  (SELECT
        t.`id`, t.`parent_id`, t.`content`, t.`username`, t.`time` FROM `comment` t 
    WHERE
        t.`parent_id` = '3' 
    LIMIT 3)  
    UNION
    ALL  (SELECT
        t.`id`, t.`parent_id`, t.`content`, t.`username`, t.`time` FROM `comment` t 
    WHERE
        t.`parent_id` = '4' 
    LIMIT 3)  
    UNION
    ALL  (SELECT
        t.`id`, t.`parent_id`, t.`content`, t.`username`, t.`time` FROM `comment` t 
    WHERE
        t.`parent_id` = '5' 
    LIMIT 3) 
) t1
```

但是虽然这个方案适用于大部分数据库但是整体相对而言的性能方面是不如其他解决方案的

## PARTITION BY

可以通过配置`include-mode: partition`将子项的limit返回使用分区sql来实现,但是需要注意部分数据库可能不一定支持

```java

List<M8Comment> list = easyEntityQuery.queryable(M8Comment.class)
        .includes(m -> m.subComments(), s -> s.limit(3))
        .toList();
```
还是一样的表达式将生成如下sql
```sql

-- 第1条sql数据

    SELECT
        `id`,
        `parent_id`,
        `content`,
        `username`,
        `time` 
    FROM
        `comment`
-- 第2条sql数据


    SELECT
        t2.`id` AS `id`,
        t2.`parent_id` AS `parent_id`,
        t2.`content` AS `content`,
        t2.`username` AS `username`,
        t2.`time` AS `time` 
    FROM
        (SELECT
            t1.`id` AS `id`,
            t1.`parent_id` AS `parent_id`,
            t1.`content` AS `content`,
            t1.`username` AS `username`,
            t1.`time` AS `time` 
        FROM
            (SELECT
                t.`id`,
                t.`parent_id`,
                t.`content`,
                t.`username`,
                t.`time`,
                (ROW_NUMBER() OVER (PARTITION 
            BY
                t.`parent_id`)) AS `__row__` 
            FROM
                `comment` t 
            LIMIT
                3) t1 
        WHERE
            t1.`__row__` >= 1 
            AND t1.`__row__` <= 3) t2

```