---
title: Group Query
order: 17
---

# Group Query

# Explicit Group

# Chain API
In `entity` mode, after `groupBy`, multiple result sets are merged into `group.groupTable()`. If you need to operate on tables before group, you need to get them from `group.groupTable()`. When the expression is a single table, `group.groupTable()` itself is the current table. When the expression is multi-table join, the expression table access exists in `group.groupTable().t1....tn`.

| Method            | Subsequent                                                              |
| --------------- | ----------------------------------------------------------------- |
| `groupBy(o->GroupKeys.of(o.column()))` | `group.groupTable()` itself is the `groupBy input parameter o` |
| `groupBy((o1,o2)->GroupKeys.of(o1.column()))`   | `group.groupTable().t1` is `groupBy input parameter o1`, `group.groupTable().t2` is `groupBy input parameter o2`                                                       |
| `groupBy((o1,o2,o3)->GroupKeys.of(o1.column(), o2.column()))`      | `group.groupTable().t1` is `groupBy input parameter o1`, `group.groupTable().t2` is `groupBy input parameter o2`, `group.groupTable().t3` is `groupBy input parameter o3`                                              |

## Parameter Changes Before and After
We use a simple case to describe how Java's stream API changes:
```java

public class Person {
        private String name;
        private String city;

        // Constructor, getters & setters omitted
    }
List<Person> people = Arrays.asList(
                new Person("a", "e"),
                new Person("b", "f"),
                new Person("c", "g"),
                new Person("d", "h")
        );

        // Use Stream API for grouping
        Map<String, List<Person>> groupedPeople = people.stream()
                                                      .collect(Collectors.groupingBy(Person::getCity));

        // Output grouped result
        for (Map.Entry<String, List<Person>> entry : groupedPeople.entrySet()) {
            System.out.println("City: " + entry.getKey() + ", People: " + entry.getValue());
        }
```

::: warning Explanation!!!
> After `groupBy`, the original `List<Person>` becomes `Map<String, List<Person>>`. We call this `group awareness` in expressions. At the Java level, basically no ORM implements this effect (or very few ORMs have this feature). What is `group awareness` useful for? The most important point is to help users understand data structure changes, thereby implementing a `simple fool-proof design (except for group by fields, other fields should appear in select in the form of aggregate functions)`.
:::

::: code-tabs
@tab Object Mode
```java
List<TopicGroupTestDTO> topicGroupTestDTOS = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().eq("3"))
                //Create group by, before version 2.3.4 use GroupKeys.TABLE1_10.of
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

@tab Client Mode
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

EntityQuery `group` for multi-table (2+ tables), `group.groupTable()` cannot represent the corresponding table, need to use `group.groupTable().t1......t10`:

```java


@Data
@EntityFileProxy
public class BlogGroupIdAndName {
    private String id;
    private Long idCount;
}

List<BlogGroupIdAndName> list = easyEntityQuery.queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, b2) -> t.id().eq(b2.id()))
                .where((t, b2) -> {
                    t.title().isNotNull();
                    t.createTime().le(LocalDateTime.of(2021, 3, 4, 5, 6));
                })
                //Create group by, before version 2.3.4 use GroupKeys.TABLE1_10.of
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

# Implicit Group

`Implicit Group` uses the API `subQueryToGroupJoin` to handle the last shortcoming of ORM in the OLAP domain. This functionality is currently non-existent in existing ORMs.

- Experience is the same as implicit subquery
- Multiple conditions automatically merge into implicit group
- Intelligently handles join relationships between multiple tables

::: tip Experience!!!
> Experience of implicit subquery with high-performance SQL generation. Who says you can't have your cake and eat it too!!!!
:::

## API
`subQueryToGroupJoin` converts object relationship `XToMany` to `join` to achieve efficient queries.

`subQueryToGroupJoin(true,o->o.many())` supports multiple subqueries

Parameter  | Type | Description  
--- | --- | --- 
condition | boolean  | Controls whether to convert subquery to `implicit Group`
manyPropColumn | expression  | Returns which subquery to convert to `implicit Group`
adapter | expression  | Enhances subquery, equivalent to adding extra conditions to subquery

::: tabs
@tab Relationship Diagram
<img :src="$withBase('/images/bank_card_user.svg')">

@tab SysUser
```java

@Table("t_sys_user")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String phone;
    private Integer age;
    private LocalDateTime createTime;

    /**
     * Number of bank cards owned by user
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"})
    private List<SysBankCard> bankCards;
}

```

@tab SysBankCard
```java

@Table("t_bank_card")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("bank_card")
public class SysBankCard implements ProxyEntityAvailable<SysBankCard , SysBankCardProxy> {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    /**
     * Bank card number
     */
    private String code;
    /**
     * Bank card type: debit card, savings card
     */
    private String type;
    /**
     * Belongs to bank
     */
    private String bankId;
    /**
     * User's account opening time
     */
    private LocalDateTime openTime;

    /**
     * Belongs to bank
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
    @ForeignKey//Can omit
    private SysBank bank;

    /**
     * Belongs to user
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}


```

@tab SysBank
```java

@Table("t_bank")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("bank")
public class SysBank implements ProxyEntityAvailable<SysBank, SysBankProxy> {
    @Column(primaryKey = true)
    private String id;
    /**
     * Bank name
     */
    private String name;
    /**
     * Establishment time
     */
    private LocalDateTime createTime;

    /**
     * Owned bank cards
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {"id"},
            targetProperty = {"bankId"})
    private List<SysBankCard> bankCards;
}

```

:::

## Normal Implicit Subquery
Each condition's judgment causes subqueries to be independent, so performance-wise it leads to very low performance. Often one subquery cannot solve multiple condition combinations, so multiple subqueries need to cooperate:
```java

easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(123);
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(456);
            user.bankCards().where(x -> x.type().eq("456")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(789);
        })
        .toList();



-- SQL 1
SELECT
    t.`id`,
    t.`name`,
    t.`phone`,
    t.`age` 
FROM
    `doc_user` t 
WHERE
    IFNULL((SELECT
        SUM(CAST(t1.`code` AS SIGNED)) 
    FROM
        `doc_bank_card` t1 
    WHERE
        t1.`uid` = t.`id` 
        AND t1.`type` = '123'),0) = 123 
    AND IFNULL((SELECT
        SUM(CAST(t3.`code` AS SIGNED)) 
    FROM
        `doc_bank_card` t3 
    WHERE
        t3.`uid` = t.`id` 
        AND t3.`type` = '123'),0) = 456 
    AND IFNULL((SELECT
        SUM(CAST(t5.`code` AS SIGNED)) 
    FROM
        `doc_bank_card` t5 
    WHERE
        t5.`uid` = t.`id` 
        AND t5.`type` = '456'),0) = 789
```

## subQueryToGroupJoin Implicit Group
After using `subQueryToGroupJoin`, the framework recognizes each subquery and merges them together. `eq` is intelligent enough to merge multiple subqueries, making writing complex SQL extremely easy:
```java
easyEntityQuery.queryable(DocUser.class)
        .subQueryToGroupJoin(o -> o.bankCards())
        .where(user -> {
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(123);
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(456);
            user.bankCards().where(x -> x.type().eq("456")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(789);
        })
        .toList();



-- SQL 1
SELECT
    t.`id`,
    t.`name`,
    t.`phone`,
    t.`age` 
FROM
    `doc_user` t 
LEFT JOIN
    (
        SELECT
            t1.`uid`,
            SUM((CASE 
                WHEN t1.`type` = '123' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum2__`,
            SUM((CASE 
                WHEN t1.`type` = '456' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum3__` 
        FROM
            `doc_bank_card` t1 
        GROUP BY
            t1.`uid`
    ) t2 
        ON t2.`uid` = t.`id` 
WHERE
    t2.`__sum2__` = 123 
    AND t2.`__sum2__` = 456 
    AND t2.`__sum3__` = 789
```

## subQueryToGroupJoin With Conditions
```java


easyEntityQuery.queryable(DocUser.class)
        .subQueryToGroupJoin(o -> o.bankCards())
        //Can also be used for non-subQueryToGroupJoin normal subqueries
        .subQueryConfigure(o -> o.bankCards(), bcq -> bcq.where(x -> {
            //Supports implicit join and normal property filtering
            x.bank().name().eq("Bank");
            x.type().like("45678");
        }))
        .where(user -> {
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(123);
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(456);
            user.bankCards().where(x -> x.type().eq("456")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(789);
        })
        .toList();



-- SQL 1
SELECT
    t.`id`,
    t.`name`,
    t.`phone`,
    t.`age` 
FROM
    `doc_user` t 
LEFT JOIN
    (
        SELECT
            t1.`uid`,
            SUM((CASE 
                WHEN t1.`type` = '123' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum2__`,
            SUM((CASE 
                WHEN t1.`type` = '456' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum3__` 
        FROM
            `doc_bank_card` t1 
        LEFT JOIN
            `doc_bank` t2 
                ON t2.`id` = t1.`bank_id` 
        WHERE
            t2.`name` = 'Bank' 
            AND t1.`type` LIKE '%45678%' 
        GROUP BY
            t1.`uid`
    ) t3 
        ON t3.`uid` = t.`id` 
WHERE
    t3.`__sum2__` = 123 
    AND t3.`__sum2__` = 456 
    AND t3.`__sum3__` = 789
```

## subQueryToGroupJoin Sort Query
```java

List<Draft3<String, Integer, String>> bank = easyEntityQuery.queryable(DocUser.class)
        .subQueryToGroupJoin(o -> o.bankCards(), bcq -> bcq.where(x -> {
            //Supports implicit join and normal property filtering
            x.bank().name().eq("Bank");
            x.type().like("45678");
        }))
        .where(user -> {
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(123);
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(456);
            user.bankCards().where(x -> x.type().eq("456")).
                    sum(o -> o.code().toNumber(Integer.class))
                    .eq(789);
        })
        .orderBy(user -> {
            user.bankCards().where(x -> x.type().eq("123")).
                    sum(o -> o.code().toNumber(Integer.class)).asc();
            user.bankCards().where(x -> x.type().eq("123")).
                    max(o -> o.code()).desc();
        })
        .select(user -> Select.DRAFT.of(
                user.id(),
                user.bankCards().where(x -> x.type().eq("123")).
                        sum(o -> o.code().toNumber(Integer.class)),
                user.bankCards().where(x -> x.type().eq("123")).
                        min(o -> o.code())
        ))
        .toList();


-- SQL 1
SELECT
    t.`id` AS `value1`,
    t3.`__sum2__` AS `value2`,
    t3.`__min5__` AS `value3` 
FROM
    `doc_user` t 
LEFT JOIN
    (
        SELECT
            t1.`uid`,
            SUM((CASE 
                WHEN t1.`type` = '123' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum2__`,
            SUM((CASE 
                WHEN t1.`type` = '456' THEN CAST(t1.`code` AS SIGNED) 
                ELSE 0 
            END)) AS `__sum3__`,
            MAX((CASE 
                WHEN t1.`type` = '123' THEN t1.`code` 
                ELSE NULL 
            END)) AS `__max4__`,
            MIN((CASE 
                WHEN t1.`type` = '123' THEN t1.`code` 
                ELSE NULL 
            END)) AS `__min5__` 
        FROM
            `doc_bank_card` t1 
        LEFT JOIN
            `doc_bank` t2 
                ON t2.`id` = t1.`bank_id` 
        WHERE
            t2.`name` = 'Bank' 
            AND t1.`type` LIKE '%45678%' 
        GROUP BY
            t1.`uid`
    ) t3 
        ON t3.`uid` = t.`id` 
WHERE
    t3.`__sum2__` = 123 
    AND t3.`__sum2__` = 456 
    AND t3.`__sum3__` = 789 
ORDER BY
    t3.`__sum2__` ASC,
    t3.`__max4__` DESC
```

## Case 3
```java

easyEntityQuery.queryable(DocUser.class)
        .subQueryToGroupJoin(o -> o.bankCards())
        .where(user -> {
            user.bankCards().where(x -> x.code().likeMatchLeft("400")).any();
        })
        .select(user -> Select.DRAFT.of(
                user.id(),
                user.bankCards().where(x->x.type().eq("ICBC")).count(),
                user.bankCards().where(x->x.type().eq("CCB")).count(),
                user.bankCards().where(x->x.type().eq("ABC")).count()
        ))
        .toList();

==> Preparing: SELECT t.`id` AS `value1`,t2.`__count3__` AS `value2`,t2.`__count4__` AS `value3`,t2.`__count5__` AS `value4` FROM `doc_user` t LEFT JOIN (SELECT t1.`uid`,(CASE WHEN COUNT((CASE WHEN t1.`code` LIKE ? THEN ? ELSE ? END)) > 0 THEN TRUE ELSE FALSE END) AS `__any2__`,COUNT((CASE WHEN t1.`type` = ? THEN ? ELSE ? END)) AS `__count3__`,COUNT((CASE WHEN t1.`type` = ? THEN ? ELSE ? END)) AS `__count4__`,COUNT((CASE WHEN t1.`type` = ? THEN ? ELSE ? END)) AS `__count5__` FROM `doc_bank_card` t1 GROUP BY t1.`uid`) t2 ON t2.`uid` = t.`id` WHERE t2.`__any2__` = ?
==> Parameters: 400%(String),1(Integer),null(null),ICBC(String),1(Integer),null(null),CCB(String),1(Integer),null(null),ABC(String),1(Integer),null(null),true(Boolean)
<== Time Elapsed: 6(ms)
```

## One-to-Many to Many Set subQueryToGroupJoin
M8User and M8Role many-to-many, then M8Role and M8Menu many-to-many:
```java
        List<M8User> admin = easyEntityQuery.queryable(M8User.class)
                .subQueryToGroupJoin(s->s.roles())
                //Set menu under role to also use implicit group
                .subQueryConfigure(s->s.roles(),s->s.subQueryToGroupJoin(r->r.menus()))
                .where(m -> {
                    m.roles().any(r -> {
                        r.menus().any(menu -> menu.name().eq("admin"));
                    });
                }).toList();
```

## Configure Entire Expression to Use subQueryToGroupJoin
The above configuration is sometimes too cumbersome for very deep levels. Is there a one-click enable for `subQueryToGroupJoin`? See below:
```java

    List<M8User> admin = easyEntityQuery.queryable(M8User.class)
            .configure(o->{
                o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
            })
            .where(m -> {
                m.roles().flatElement().menus().flatElement().name().eq("admin");
            }).toList();
//Same as above, the above is expanded and rewritten. If there are multiple conditions, menu can be a separate any

        List<M8User> admin = easyEntityQuery.queryable(M8User.class)
                .configure(o->{
                    o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
                })
                .where(m -> {

                    m.roles().any(r -> {
                        r.menus().any(menu -> menu.name().eq("admin"));
                    });
                }).toList();


```

