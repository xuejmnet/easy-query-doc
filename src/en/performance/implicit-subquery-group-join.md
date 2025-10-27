---
title: Implicit Subquery Optimization🔥
order: 20
---

::: tip Notice!!!
> No ORM on the market has implemented this feature `2025/04/22`
> No ORM on the market has implemented this feature `2025/04/22`
> No ORM on the market has implemented this feature `2025/04/22`
:::
`eq` defaults implicit subqueries, that is, when filtering, sorting or fetching data from child tables in `one-to-many` or `many-to-many`, we use subquery to `group join` conversion, which can instantly improve the overall performance of the program without excessive configuration, especially when `where subquery` or `select subquery` accounts for too much in the entire SQL, such as when there are 2 or more.

Implicit subquery uses `join` to make subquery performance soar, especially during deep structure filtering. And if `subQueryToGroupJoin` is enabled, `flatElement` will support multi-condition merging.



::: warning Notice!!!
> Although converting subquery to groupJoin can greatly improve performance, the generated SQL will be relatively difficult to read. If your target table has a large amount of subquery data, it is strongly recommended to enable it
> Although groupJoin replaces `select subquery`, `where subquery`, `order subquery`, performance can be greatly improved and always guarantees program results consistency
:::


## Navigation Property Configuration

`@@Navigate(subQueryToGroupJoin = true)` indicates that the query for this subquery will use `groupJoin` instead. It is highly recommended to enable this feature when the target table exceeds `100,000-200,000`.



::: tip Notice!!!
> Truly smart ORM supports merging same subquery properties
:::

Used in the same way as normal subqueries, and will automatically merge multiple subqueries

## Expression Setting Specify Subquery
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(u->u.bankCards())//Enable implicit group
        .where(user -> {
            //At least 2 ICBC cards
            user.bankCards().where(card -> {
                card.bank().name().eq("ICBC");
            }).count().ge(2L);

            //No CCB cards
            user.bankCards().none(card -> {
                card.bank().name().eq("CCB");
            });
        }).toList();
```


## Expression Setting All Subqueries
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .configure(o->{//When we have many subqueries, after upgrading to 2.8.14, we can configure behavior to convert all subqueries to group join
            o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
        })
        .where(user -> {
            //At least 2 ICBC cards
            user.bankCards().where(card -> {
                card.bank().name().eq("ICBC");
            }).count().ge(2L);

            //No CCB cards
            user.bankCards().none(card -> {
                card.bank().name().eq("CCB");
            });
        }).toList();
```


## Without Subquery to GroupJoin Enabled

Filter users who have at least 2 ICBC bank cards and have not yet opened an account with CCB

Advanced ORM writing is as follows
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.bankCards().where(card -> {
                card.bank().name().eq("ICBC");
            }).count().ge(2L);

            user.bankCards().none(card -> {
                card.bank().name().eq("CCB");
            });
        }).toList();


-- SQL Statement 1
SELECT
    t.`id`,
    t.`name`,
    t.`phone`,
    t.`age`,
    t.`create_time` 
FROM
    `t_sys_user` t 
WHERE
    (
        SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t1 
        INNER JOIN
            `t_bank` t2 
                ON t2.`id` = t1.`bank_id` 
        WHERE
            t1.`uid` = t.`id` 
            AND t2.`name` = 'ICBC'
    ) >= 2 
    AND NOT ( EXISTS (SELECT
        1 
    FROM
        `t_bank_card` t3 
    INNER JOIN
        `t_bank` t4 
            ON t4.`id` = t3.`bank_id` 
    WHERE
        t3.`uid` = t.`id` 
        AND t4.`name` = 'CCB' LIMIT 1))
```

After enabling subquery to groupJoin
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(u->u.bankCards())//Enable implicit group
        // .configure(o->{//When we have many subqueries, after upgrading to 2.8.14, we can configure behavior to convert all subqueries to group join
        //     o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
        // })
        .where(user -> {
            //At least 2 ICBC cards
            user.bankCards().where(card -> {
                card.bank().name().eq("ICBC");
            }).count().ge(2L);

            //No CCB cards
            user.bankCards().none(card -> {
                card.bank().name().eq("CCB");
            });
        }).toList();


-- SQL Statement 1
SELECT
    t.`id`,
    t.`name`,
    t.`phone`,
    t.`age`,
    t.`create_time`  
FROM
    `t_sys_user` t 
LEFT JOIN
    (
        SELECT
            t1.`uid` AS `uid`,
            COUNT((CASE WHEN t3.`name` = 'ICBC' THEN 1 ELSE NULL END)) AS `__count2__`,
            (CASE WHEN COUNT((CASE WHEN t3.`name` = 'CCB' THEN 1 ELSE NULL END)) > 0 THEN false ELSE true END) AS `__none3__` 
        FROM
            `t_bank_card` t1 
        INNER JOIN
            `t_bank` t3 
                ON t3.`id` = t1.`bank_id` 
        GROUP BY
            t1.`uid`
    ) t2 
        ON t2.`uid` = t.`id` 
WHERE
    IFNULL(t2.`__count2__`,0) >= 2 
    AND IFNULL(t2.`__none3__`,true) = true        
```

Using database analysis can quickly optimize the original 10-second double subquery to only 100ms, and most importantly, the readability is 100 times stronger than native SQL (DSL reading)

