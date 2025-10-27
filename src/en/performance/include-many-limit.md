---
title: Target Collection Return Limit Items
order: 30
---
`eq` provides limit restriction on the number of returned items for multiple child items by default, such as the top 3 of main comments and sub-comments. By default, it can be set through `selectAutoInclude` or `includes`, for example

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

By default, eq will use `UNION_ALL+LIMIT` to restrict query and limit return
```sql


-- SQL Statement 1

    SELECT
        `id`,
        `parent_id`,
        `content`,
        `username`,
        `time` 
    FROM
        `comment`
-- SQL Statement 2


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

But although this solution is suitable for most databases, the overall performance is not as good as other solutions.

## PARTITION BY

You can configure `include-mode: partition` to use partition SQL to implement limit return for child items, but note that some databases may not support it.

```java

List<M8Comment> list = easyEntityQuery.queryable(M8Comment.class)
        .includes(m -> m.subComments(), s -> s.limit(3))
        .toList();
```
The same expression will generate the following SQL
```sql

-- SQL Statement 1

    SELECT
        `id`,
        `parent_id`,
        `content`,
        `username`,
        `time` 
    FROM
        `comment`
-- SQL Statement 2


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

