---
title: 分组
order: 30
---

# 分组
`easy-query`提供了方便的分组查询功能的支持,并且支持链式支持group感知类型变化

# 链式api
在`entity`模式下`groupBy`后会将多个结果集进行合并到`group.groupTable()`里面如果需要操作group前的表需要从`group.groupTable()`里面获取,当表达式是单表那么`group.groupTable()`本身就是当前表,当表达式是多表join的那么表达式的表访问存在于`group.groupTable().t1....tn`



| 方法            | 后续                                                              |
| --------------- | ----------------------------------------------------------------- |
| `groupBy(o->GroupKeys.of(o.column()))` | `group.groupTable()`本身就是`groupBy的入参o` |
| `groupBy((o1,o2)->GroupKeys.of(o1.column()))`   | `group.groupTable().t1`就是`groupBy的入参o1`  `group.groupTable().t2`就是`groupBy的入参o2`                                                       |
| `groupBy((o1,o2,o3)->GroupKeys.of(o1.column()，o2.column()))`      | `group.groupTable().t1`就是`groupBy的入参o1`  `group.groupTable().t2`就是`groupBy的入参o2`     `group.groupTable().t3`就是`groupBy的入参o3`                                              |



参数前后变化
我们用一个简单的案例来描述一下java下面的stream api是如何变化的
```java

public class Person {
        private String name;
        private String city;

        // 构造函数、getters & setters 省略
    }
List<Person> people = Arrays.asList(
                new Person("a", "e"),
                new Person("b", "f"),
                new Person("c", "g"),
                new Person("d", "h")
        );

        // 使用Stream API进行分组
        Map<String, List<Person>> groupedPeople = people.stream()
                                                      .collect(Collectors.groupingBy(Person::getCity));

        // 输出分组结果
        for (Map.Entry<String, List<Person>> entry : groupedPeople.entrySet()) {
            System.out.println("City: " + entry.getKey() + ", People: " + entry.getValue());
        }
```


::: warning 说明!!!
> `groupBy`后原先的`List<Person>` 变成了 `Map<String, List<Person>>`这个我们在表达式中称之为`group感知`在java层面基本上没有orm实现了这种效果(或者说极少一部分orm才有这个特性),
`group感知`有什么用,最重要的一点就是帮助用户了解数据结构的变化从而实现一个`简易的防呆设计(除了group by的字段其余字段应该以聚合函数的形式出现在select里面)`
:::





::: code-tabs
@tab 对象模式
```java
List<TopicGroupTestDTO> topicGroupTestDTOS = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().eq("3"))
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(o -> GroupKeys.of(o.id()))
                .select(g->{
                    TopicGroupTestDTOProxy result = new TopicGroupTestDTOProxy();
                    result.id().set(g.key1());
                    result.idCount().set(g.intCount());
                    result.idMin().set(g.groupTable().id().min());
                    return result;
                })
                //.select(TopicGroupTestDTO.class,g -> Select.of(
                       //group.key1().as(TopicGroupTestDTO::getId),
                       //group.groupTable().id().intCount().as(TopicGroupTestDTO::getIdCount),
                       //group.groupTable().id().min().as(TopicGroupTestDTO::getIdMin)
                //))
                .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `id_count`,MIN(t.`id`) AS `id_min` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1

```

@tab client模式
```java

List<TopicGroupTestDTO> list = easyQueryClient.queryable(Topic.class)
        .where(t_topic -> t_topic.eq(TopicProxy.Fields.id, "3"))
        .groupBy(t_topic -> t_topic.column(TopicProxy.Fields.id))
        .select(TopicGroupTestDTO.class, t_topic -> t_topic.columnAs("id", "id").columnCountAs("id", "idCount"))
        .toList();


==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `id_count` FROM t_topic t WHERE t.`id` = ? GROUP BY t.`id`
==> Parameters: 3(String)
<== Total: 1

```

::: 


EntityQuery `group` 多表2张表及以上,`group.groupTable()`无法表示为对应的表,需要通过`group.groupTable().t1......t10`来表示

```java
List<BlogGroupIdAndName> list = easyEntityQuery.queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, b2) -> t.id().eq(b2.id()))
                .where((t, b2) -> {
                    t.title().isNotNull();
                    t.createTime().le(LocalDateTime.of(2021, 3, 4, 5, 6));
                })
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy((t1, b2) -> GroupKeys.of(t1.id(), b2.star()))
                .select(group -> new BlogGroupIdAndNameProxy()
                    .id().set(group.key1())
                    .idCount().set(group.groupTable().t2.id().count())
                ).toList();

==> Preparing: SELECT t.`id` AS `id`,COUNT(t1.`id`) AS `id_count` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` WHERE t.`title` IS NOT NULL AND t.`create_time` <= ? GROUP BY t.`id`,t1.`star`
==> Parameters: false(Boolean),2021-03-04T05:06(LocalDateTime)
<== Time Elapsed: 7(ms)
<== Total: 0
```