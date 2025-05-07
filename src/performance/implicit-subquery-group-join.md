---
title: 隐式子查询优化🔥
order: 20
---

::: tip 说明!!!
> 市面上没有orm实现了该功能`2025/04/22`
> 市面上没有orm实现了该功能`2025/04/22`
> 市面上没有orm实现了该功能`2025/04/22`
:::
`eq`默认隐式子查询也就是`一对多`或`多对多`对子表进行筛选或者排序或者拉取数据的时候我们采用子查询转`group join`可以让程序在不进行过多配置的情况下瞬间提升程序的整个性能,尤其是`where子查询`或者`select子查询`在整个sql中占比过多的时候比如存在2个及以上

隐式子查询利用`join`让子查询性能飙升尤其是在深度结构筛选的时候并且如果启用`subQueryToGroupJoin`后`flatElement`将会支持多条件合并



::: warning 说明!!!
> 虽然子查询转groupJoin可以让性能大大提升但是生成的sql会相对难以阅读,如果你的目标表子查询数据量很大的情况下建议一定要开启
> 虽然groupJoin代替了`select子查询`、`where子查询`、`order子查询`但是性能可以大大的提升并且永远保证程序的结果一致
:::


## 导航属性配置

`@@Navigate(subQueryToGroupJoin = true)`表示为当前子查询的查询将使用`groupJoin`来代替当目标表大于`10-20w`后非常建议开启该功能

使用方式和普通子查询一样，并且会自动合并多个子查询

## 表达式设置指定子查询
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(u->u.bankCards())//启用隐式group
        .where(user -> {
            //至少2张工商银行
            user.bankCards().where(card -> {
                card.bank().name().eq("工商银行");
            }).count().ge(2L);

            //没有建行卡
            user.bankCards().none(card -> {
                card.bank().name().eq("建设银行");
            });
        }).toList();
```


## 表达式设置全部子查询
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .configure(o->{//当我们的子查询数量很多时升级到后2.8.14后可以配置行为全部子查询转group join
            o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
        })
        .where(user -> {
            //至少2张工商银行
            user.bankCards().where(card -> {
                card.bank().name().eq("工商银行");
            }).count().ge(2L);

            //没有建行卡
            user.bankCards().none(card -> {
                card.bank().name().eq("建设银行");
            });
        }).toList();
```


## 未开启子查询转GroupJoin

筛选出用户拥有至少2张工商银行卡且还未在建设银行开户的用户

高级一点的orm写法如下
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.bankCards().where(card -> {
                card.bank().name().eq("工商银行");
            }).count().ge(2L);

            user.bankCards().none(card -> {
                card.bank().name().eq("建设银行");
            });
        }).toList();


-- 第1条sql数据
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
            AND t2.`name` = '工商银行'
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
        AND t4.`name` = '建设银行' LIMIT 1))
```

开启子查询转groupJoin后
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(u->u.bankCards())//启用隐式group
        // .configure(o->{//当我们的子查询数量很多时升级到后2.8.14后可以配置行为全部子查询转group join
        //     o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
        // })
        .where(user -> {
            //至少2张工商银行
            user.bankCards().where(card -> {
                card.bank().name().eq("工商银行");
            }).count().ge(2L);

            //没有建行卡
            user.bankCards().none(card -> {
                card.bank().name().eq("建设银行");
            });
        }).toList();


-- 第1条sql数据
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
            COUNT((CASE WHEN t3.`name` = '工商银行' THEN 1 ELSE NULL END)) AS `__count2__`,
            (CASE WHEN COUNT((CASE WHEN t3.`name` = '建设银行' THEN 1 ELSE NULL END)) > 0 THEN false ELSE true END) AS `__none3__` 
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

使用数据库分析可以让原本10秒的双子查询迅速优化到只需要100ms,并且最重要的一点是比原生sql的可读性强百倍