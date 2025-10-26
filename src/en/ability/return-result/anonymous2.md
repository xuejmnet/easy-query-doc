---
title: Anonymous Type 2
order: 20
---

## Background
If an ORM doesn't have anonymous objects, when returning custom columns, you need to create a VO to receive them. Otherwise, returning the entire object will make it impossible for lower-level methods to know which properties weren't queried, so anonymous objects are very meaningful.

## Scenario
Need to return statistics like id+count+sum for intermediate business processing:
```java
//Define object to receive results

@Data
@EntityProxy
public class GroupVO {
    private String key;
    private Long idCount;
    private LocalDateTime createTimeMax;
    private BigDecimal scoreSum;
}


easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {
            t_blog.title().like("123");
        }).groupBy(t_blog -> GroupKeys.of(t_blog.title()))
        .select(group -> new GroupVOProxy()
                .key().set(group.key1())
                .idCount().set(group.count())
                .createTimeMax().set(group.groupTable().createTime().max())
                .scoreSum().set(group.groupTable().score().sum().asAnyType(BigDecimal.class))
        ).toList();
```
In the above business code, because we need id+group+count+sum, we have to define an intermediate object to handle it. For example, multi-level queries need anonymous processing of results before filtering. For example, if I want to query and aggregate topics and then join the basic configuration table to get information.

If we have anonymous types, we can directly get them without defining:

```java

List<Draft4<String, Long, LocalDateTime, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {
            t_blog.title().like("123");
        }).groupBy(t_blog -> GroupKeys.of(t_blog.title()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                group.count(),
                group.groupTable().createTime().max(),
                group.groupTable().score().sum().asAnyType(BigDecimal.class)
        )).toList();
```

## Draft
Anonymous objects need to return `select`+`Select.DRAFT.of(...)`. You can simply understand it as a draft type, or as a `tuple` type.

### Case 1
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.title().like("123");
                    o.createTime().ge(LocalDateTime.of(2022, 2, 1, 3, 4));
                })
                //Create group by, use GroupKeys.TABLE1_10.of before 2.3.4
                .groupBy(o -> GroupKeys.of(o.id()))
                .select(o -> Select.DRAFT.of(
                        o.key1(),
                        o.count()
                ))
                .toList();
```
```sql

-- 1st SQL data
SELECT
    t.`id` AS `value1`,
    COUNT(*) AS `value2` 
FROM
    `t_topic` t 
WHERE
    t.`title` LIKE '%123%' 
    AND t.`create_time` >= '2022-02-01 03:04' 
GROUP BY
    t.`id`
```

### Case 2
Multi-level nested anonymous table SQL:
```java
 List<Draft2<String, String>> list = easyEntityQuery.queryable(Topic.class).limit(100)
                    .select(o -> Select.DRAFT.of(o.id(), o.stars()))
                    .leftJoin(BlogEntity.class, (t, t1) -> t.value1().eq(t1.id()))
                    .select((a, b) -> Select.DRAFT.of(a.value1(), b.url()))
                    .innerJoin(BlogEntity.class, (t, t1) -> t.value2().eq(t1.id()))
                    .select((a, b) -> Select.DRAFT.of(a.value1(), b.url())).toList();


```
```sql

-- 1st SQL data
SELECT
    t3.`value1` AS `value1`,
    t4.`url` AS `value2` 
FROM
    (SELECT
        t1.`value1` AS `value1`,
        t2.`url` AS `value2` 
    FROM
        (SELECT
            t.`id` AS `value1`,
            t.`stars` AS `value2` 
        FROM
            `t_topic` t LIMIT 100) t1  -- select(o -> Select.DRAFT.of(o.id(), o.stars()))
    LEFT JOIN
        `t_blog` t2 
            ON t2.`deleted` = false 
            AND t1.`value1` = t2.`id`
        ) t3 -- select((a, b) -> Select.DRAFT.of(a.value1(), b.url()))
INNER JOIN
    `t_blog` t4 
        ON t4.`deleted` = false 
        AND t3.`value2` = t4.`id` -- select((a, b) -> Select.DRAFT.of(a.value1(), b.url()))
```

## Note
Draft type needs to provide specific type, otherwise it will use `jdbc.resultSet.getObject` to handle column retrieval. Can be determined through `setPropertyType`:
```java
          List<Draft3<String, LocalDateTime, String>> list = easyEntityQuery
                    .queryable(BlogEntity.class)
                    .select(t -> Select.DRAFT.of(t.id(),
                            t.createTime(),
                            t.sql("1").setPropertyType(String.class)//Because t.sql returns custom SQL fragment, cannot know specific type, so determined by setPropertyType(String.class)
                    ))
                    .toList();
```
Correct type. Here count returns long type by default, but `star` acceptable type is `integer`, so can correct through `setPropertyType(Integer.class)`. Of course can also use `o.intCount()` function:
```java
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
                    .where(o -> o.id().eq("123" ))
                    //Create group by, use GroupKeys.TABLE1_10.of before 2.3.4
                    .groupBy(o -> GroupKeys.of(o.id()))
                    .having(o -> {
                        o.count().ne(1);
                        o.sum(o.group().star()).ge(10);
                    })
                    .select(o -> new BlogEntityProxy().adapter(r->{
                        r.id().set(o.key1());
                        r.star().set(o.count(o.group().id()).setPropertyType(Integer.class));
                        r.title().set(o.max(o.group().id()));
                    })).toList();
```

