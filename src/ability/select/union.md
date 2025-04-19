---
title: 联合查询 UNION (ALL)
order: 110
---

# 联合查询
`easy-query`支持union，union all，并且支持对应的union下的分片查询

实现sql
```sql
select * from (
select a,b from t
union
select c,d from t1
) t where t.id='1'
```

::: danger
！！！union或者union all需要表达式Queryable\<T\>都是相同的，您也可以自定义对象来返回对应的结果集
:::

数据库建表脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50)  null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
java实体对象
```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```
## 单表union
```java

Queryable<Topic> q1 = easyQuery
                .queryable(Topic.class);
Queryable<Topic> q2 = easyQuery
        .queryable(Topic.class);
Queryable<Topic> q3 = easyQuery
        .queryable(Topic.class);
List<Topic> list = q1.union(q2, q3).where(o -> o.eq(Topic::getId, "123321")).toList();

```
```sql

==> Preparing: SELECT t1.`id`,t1.`stars`,t1.`title`,t1.`create_time`
 FROM (
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t
    ) t1 WHERE t1.`id` = ?
==> Parameters: 123321(String)
<== Time Elapsed: 19(ms)
<== Total: 0
```

## 复杂union
```java
//where id
Queryable<Topic> q1 = easyQuery
        .queryable(Topic.class).where(o->o.eq(Topic::getId,"123"));
//where create time
Queryable<Topic> q2 = easyQuery
        .queryable(Topic.class).where(o->o.ge(Topic::getCreateTime,LocalDateTime.of(2020,1,1,1,1)));
//join
Queryable<Topic> q3 = easyQuery
        .queryable(Topic.class).leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where((t,t1)->t1.isNotNull(BlogEntity::getContent).then(t).isNotNull(Topic::getStars));
List<Topic> list = q1.union(q2, q3).where(o -> o.eq(Topic::getId, "123321")).toList();


```
```sql
==> Preparing: SELECT t1.`id`,t1.`stars`,t1.`title`,t1.`create_time` FROM (
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` = ? 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`create_time` >= ? 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`content` IS NOT NULL AND t.`stars` IS NOT NULL
    ) t1 WHERE t1.`id` = ?
==> Parameters: 123(String),2020-01-01T01:01(LocalDateTime),false(Boolean),123321(String)
<== Time Elapsed: 10(ms)
<== Total: 0
```

## 自定义结果集
```java

@Data
public class TopicUnion {
    private String id;
    private Integer stars;
    @Column("title")//列名需要对应
    private String abc;
}
```

```java

Queryable<TopicUnion> q1 = easyQuery
        .queryable(Topic.class).where(o->o.eq(Topic::getId,"123")).select(TopicUnion.class);
Queryable<TopicUnion> q2 = easyQuery
        .queryable(Topic.class)
        .where(o->o.ge(Topic::getCreateTime,LocalDateTime.of(2020,1,1,1,1)))
        .select(TopicUnion.class);
Queryable<TopicUnion> q3 = easyQuery
        .queryable(Topic.class).leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where((t,t1)->t1.isNotNull(BlogEntity::getContent).then(t).isNotNull(Topic::getStars))
        .select(TopicUnion.class);
List<TopicUnion> list = q1.union(q2, q3).where(o -> o.eq(TopicUnion::getId, "123321")).toList();
```

```sql
==> Preparing: SELECT t2.`id`,t2.`stars`,t2.`title` FROM (
    SELECT t.`id`,t.`stars`,t.`title` FROM `t_topic` t WHERE t.`id` = ? 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title` FROM `t_topic` t WHERE t.`create_time` >= ? 
    UNION 
    SELECT t.`id`,t.`stars`,t.`title` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t1.`content` IS NOT NULL AND t.`stars` IS NOT NULL
    ) t2 WHERE t2.`id` = ?
==> Parameters: 123(String),2020-01-01T01:01(LocalDateTime),false(Boolean),123321(String)
<== Time Elapsed: 6(ms)
<== Total: 0

```

## 不同表union

```java
Queryable<TopicUnion> q1 = easyQuery
            .queryable(Topic.class).where(o->o.eq(Topic::getId,"123")).select(TopicUnion.class);
Queryable<TopicUnion> q2 = easyQuery
        .queryable(BlogEntity.class)
        .where(o->o.ge(BlogEntity::getCreateTime,LocalDateTime.of(2020,1,1,1,1)))
        .select(TopicUnion.class,o->o.columnAs(BlogEntity::getId,TopicUnion::getId)
                .columnAs(BlogEntity::getStar,TopicUnion::getStars)
                .columnAs(BlogEntity::getContent,TopicUnion::getAbc)
        );
List<TopicUnion> list = q1.unionAll(q2).where(o -> o.eq(TopicUnion::getId, "123321")).toList();
```
```sql
==> Preparing: SELECT t2.`id`,t2.`stars`,t2.`title` FROM (
    
    SELECT t.`id`,t.`stars`,t.`title` FROM `t_topic` t WHERE t.`id` = ? 
    UNION ALL 
    SELECT t.`id` AS `id`,t.`star` AS `stars`,t.`content` AS `title` FROM `t_blog` t WHERE t.`deleted` = ? AND t.`create_time` >= ?
    ) t2 WHERE t2.`id` = ?
==> Parameters: 123(String),false(Boolean),2020-01-01T01:01(LocalDateTime),123321(String)
<== Time Elapsed: 5(ms)
<== Total: 0

```