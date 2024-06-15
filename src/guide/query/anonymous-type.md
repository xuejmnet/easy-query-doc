---
title: 匿名类型查询
---

## 背景
如果一个orm没有匿名对象那么在返回自定义列的时候就需要新建一个VO来接受,不然返回整个对象会导致下层方法无法得知哪个属性没有被查询,所以匿名对象的存在非常有意义

## 场景
需要统计返回id+count+sum之类的结果用于中间业务处理
```java
//查询基础表信息

//查询聚合id group获取count+sum

//返回结果
```
在如上的业务代码中因为需要有id+group+count+sum所以我们不得不去定义一个中间对象来处理,再比如多级查询需要对结果进行匿名处理后在筛选,比如我要对topic进行查询聚合然后结果再去join基本配置表获取信息

## draft
匿名对象需要返回`select`+`Select.DRAFT.of(...)`你可以简单理解为一种草稿类型,也可以理解为`tuple`类型

### 案例一
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.title().like("123");
                    o.createTime().ge(LocalDateTime.of(2022, 2, 1, 3, 4));
                })
                .groupBy(o -> GroupKeys.TABLE1.of(o.id()))
                .select(o -> Select.DRAFT.of(
                        o.key1(),
                        o.count()
                ))
                .toList();
```
```sql

-- 第1条sql数据
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

### 案例二
多层嵌套匿名表sql
```java
 List<Draft2<String, String>> list = easyEntityQuery.queryable(Topic.class).limit(100)
                    .select(o -> Select.DRAFT.of(o.id(), o.stars()))
                    .leftJoin(BlogEntity.class, (t, t1) -> t.value1().eq(t1.id()))
                    .select((a, b) -> Select.DRAFT.of(a.value1(), b.url()))
                    .innerJoin(BlogEntity.class, (t, t1) -> t.value2().eq(t1.id()))
                    .select((a, b) -> Select.DRAFT.of(a.value1(), b.url())).toList();


```
```sql

-- 第1条sql数据
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

## 注意
draft草稿类型需要提供具体类型不然则已`jdbc.resultSet.getObject`来处理获取列可以通过`setPropertyType`来确定
```java
          List<Draft3<String, LocalDateTime, String>> list = easyEntityQuery
                    .queryable(BlogEntity.class)
                    .select(t -> Select.DRAFT.of(t.id(),
                            t.createTime(),
                            t.sql("1").setPropertyType(String.class)//因为t.sql返回的是自定义sql片段无法知晓具体类型所以通过setPropertyType(String.class)来确定
                    ))
                    .toList();
```
修正类型,此处count默认返回long类型但是`star`可接受类型为`integer`所以可以通过`setPropertyType(Integer.class)`来修正当然也可以用`o.intCount()`函数
```java
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
                    .where(o -> o.id().eq("123" ))
                    .groupBy(o -> GroupKeys.TABLE1.of(o.id()))
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