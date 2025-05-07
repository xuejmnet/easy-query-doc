---
title: 快速查询(必看) 🔥🔥🔥
order: 3
category:
  - Startup
---

# 快速连表
`eq`与常规orm不同，连表支持`显式join`和`隐式join`对于常规的业务操作我们认为各个表之间的数据不是孤单数据,所以在90%的场景下任意两张表之间进行join那么使用on条件应该是相同的，我们把这种相同的条件通过面向对象的形式将其配置到对象属性上面，这种行为我们称其为导航属性，导航属性又是我们常说的对象关系,常见的对象关系拥有`一对一`、`一对多`、`多对一`、`多对多`,各个属性分别在数据库实体对象上以单个对象属性亦或者是集合属性展示

`eq`支持将这种对象关系转换成数据库sql语法表达式来进行数据的查询,通过面向对象的方式编写`dsl`屏蔽复杂的数据库语句转而以开发者方便阅读的形式来进行业务代码的编写。

## 建立对象关系
首先我们建立一个相对简单的用户模型来描述目前的对象关系
- 用户 `SysUser`
- 银行卡 `SysBankCard`
- 银行 `SysBank`
我们目前有这三张表分别是每个银行有对应的银行卡，并且每个用户有对应的银行卡,用户和银行卡一对多,银行和银行卡也是一对多,用户和银行通过银行卡可以实现多对多关系




::: tabs
@tab 关系图
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
     * 用户拥有的银行卡数
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
     * 银行卡号
     */
    private String code;
    /**
     * 银行卡类型借记卡 储蓄卡
     */
    private String type;
    /**
     * 所属银行
     */
    private String bankId;
    /**
     * 用户开户时间
     */
    private LocalDateTime openTime;

    /**
     * 所属银行
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
    @ForeignKey//可以不加
    private SysBank bank;

    /**
     * 所属用户
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
     * 银行名称
     */
    private String name;
    /**
     * 成立时间
     */
    private LocalDateTime createTime;

    /**
     * 拥有的银行卡
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {"id"},
            targetProperty = {"bankId"})
    private List<SysBankCard> bankCards;
}

```

:::

## 隐式join
查询银行卡 条件银行卡的所属用户姓名叫小明
```java

List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.user().name().eq("小明");
        }).toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t LEFT JOIN `t_sys_user` t1 ON t1.`id` = t.`uid` WHERE t1.`name` = ?
==> Parameters: 小明(String)
```

查询银行卡 条件银行卡的所属用户手机号包含`1234`并且银行卡是工商银行的
```java

List<SysBankCard> list1 = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.user().phone().like("1234");
            bank_card.bank().name().eq("工商银行");
        }).toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t LEFT JOIN `t_sys_user` t1 ON t1.`id` = t.`uid` INNER JOIN `t_bank` t2 ON t2.`id` = t.`bank_id` WHERE t1.`phone` LIKE ? AND t2.`name` = ?
==> Parameters: %1234%(String),工商银行(String)
```
查询小明在工商银行的银行卡信息返回`[姓名|所属银行|卡号]` 按卡号正序排列

```java
List<Draft3<String, String, String>> list2 = easyEntityQuery.queryable(SysBankCard.class)
                .where(bank_card -> {
                    bank_card.user().name().eq("小明");
                    bank_card.bank().name().eq("工商银行");
                })
                .orderBy(bank_card -> bank_card.code().asc())
                .select(bank_card -> Select.DRAFT.of(
                        bank_card.user().name(),
                        bank_card.bank().name(),
                        bank_card.code()
                )).toList();


==> Preparing: SELECT t1.`name` AS `value1`,t2.`name` AS `value2`,t.`code` AS `value3` FROM `t_bank_card` t LEFT JOIN `t_sys_user` t1 ON t1.`id` = t.`uid` INNER JOIN `t_bank` t2 ON t2.`id` = t.`bank_id` WHERE t1.`name` = ? AND t2.`name` = ? ORDER BY t.`code` ASC
==> Parameters: 小明(String),工商银行(String)
```

## 动态join
查询银行卡条件可以传入持卡人姓名或者不传入来筛选结果

以下查询支持动态join,有查询条件那么会自动join用户表否则不会进行join真正做到了`智能orm`
```java

String queryName=null;
List<SysBankCard> xmCards = easyEntityQuery.queryable(SysBankCard.class)
        //如果查询条件不符合那么将不会加入到条件中
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .where(bank_card -> {
            bank_card.user().name().eq(queryName);
        })
        .toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t
```

## 混合join
`eq`不单单支持`显式join`,还支持`隐式join`并且最最最重要的是支持`显式+隐式混合使用`这是其他orm做不到的
```java


List<Draft3<String, String, String>> result = easyEntityQuery.queryable(SysBankCard.class)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .leftJoin(SysBank.class,(bank_card, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, bank) -> {
            bank_card.user().name().eq("小明");
        })
        .select((bank_card, bank) -> Select.DRAFT.of(
                bank_card.code(),
                bank_card.user().name(),
                bank.name()
        )).toList();


==> Preparing: SELECT t.`code` AS `value1`,t2.`name` AS `value2`,t1.`name` AS `value3` FROM `t_bank_card` t LEFT JOIN `t_bank` t1 ON t.`bank_id` = t1.`id` LEFT JOIN `t_sys_user` t2 ON t2.`id` = t.`uid` WHERE t2.`name` = ?
==> Parameters: 小明(String)
```


## 超强筛选🔥🔥🔥
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

很多小伙伴认为就是因为orm生成的sql不行导致性能不行那么我们看`eq`最最最最最牛逼的子查询合并`隐式group又称subQueryToGroupJoin`

还是上述条件

筛选出用户拥有至少2张工商银行卡且还未在建设银行开户的用户

- 配置子查询转`group join`框架`2.8.16^`支持在`@Navigate(subQueryToGroupJoin = true)`设置
- 表达式配置` .subQueryToGroupJoin(u->u.bankCards())//启用隐式group`
- 表达式配置全部都是用`.configure(o->{o.getBehavior().addBehavior(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);})`


超级的orm写法如下
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

## partation by

筛选用户条件为喜欢工商银行的(第一张开户的银行卡是工商银行的)
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //用户的银行卡中第一个开户银行卡是工商银行的
            user.bankCards().orderBy(x->x.openTime().asc()).firstElement().bank().name().eq("工商银行");
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
            t2.`id` AS `id`,
            t2.`uid` AS `uid`,
            t2.`code` AS `code`,
            t2.`type` AS `type`,
            t2.`bank_id` AS `bank_id`,
            t2.`open_time` AS `open_time` 
        FROM
            (SELECT
                t1.`id`,
                t1.`uid`,
                t1.`code`,
                t1.`type`,
                t1.`bank_id`,
                t1.`open_time`,
                (ROW_NUMBER() OVER (PARTITION BY t1.`uid` ORDER BY t1.`open_time` ASC)) AS `__row__` 
            FROM
                `t_bank_card` t1) t2 
        WHERE
            t2.`__row__` = 1
        ) t4 
            ON t4.`uid` = t.`id` 
    INNER JOIN
        `t_bank` t5 
            ON t5.`id` = t4.`bank_id` 
    WHERE
        t5.`name` = '工商银行'
```

## select子查询
```java
 List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
                .where(user -> {
                    user.name().like("小明");

                }).select(user -> Select.DRAFT.of(
                        user.name(),
                        //用户的银行卡中前两个开户银行卡类型
                        user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).joining(x -> x.type(),",")
                )).toList();

-- 第1条sql数据
SELECT
    t.`name` AS `value1`,
    (SELECT
        GROUP_CONCAT(t1.`type` SEPARATOR ',') 
    FROM
        `t_bank_card` t1 
    WHERE
        t1.`uid` = t.`id` 
    ORDER BY
        t1.`open_time` ASC LIMIT 2) AS `value2` 
FROM
    `t_sys_user` t 
WHERE
    t.`name` LIKE '%小明%'
```

## 快速任意子查询
筛选用户姓名包含小明的并且开户的前两张没有杭州银行卡的,返回用户姓名和用户的前两张银行卡的类型
```java

List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.name().like("小明");
            user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).none(x->x.bank().name().eq("杭州银行"));
        }).select(user -> Select.DRAFT.of(
                user.name(),
                //用户的银行卡中前两个开户银行卡类型
                user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).joining(x -> x.type(),",")
        )).toList();


-- 第1条sql数据
SELECT
    t.`name` AS `value1`,
    (SELECT
        GROUP_CONCAT(t4.`type` SEPARATOR ',') 
    FROM
        `t_bank_card` t4 
    WHERE
        t4.`uid` = t.`id` 
    ORDER BY
        t4.`open_time` ASC LIMIT 2) AS `value2` 
FROM
    `t_sys_user` t 
WHERE
    t.`name` LIKE '%小明%' 
    AND NOT ( EXISTS (SELECT
        1 
    FROM
        (SELECT
            t1.`id`,
            t1.`uid`,
            t1.`code`,
            t1.`type`,
            t1.`bank_id`,
            t1.`open_time` 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = t.`id` 
        ORDER BY
            t1.`open_time` ASC LIMIT 2) t2 
    INNER JOIN
        `t_bank` t3 
            ON t3.`id` = t2.`bank_id` 
    WHERE
        t3.`name` = '杭州银行' LIMIT 1))
```

## 超级无敌究极子查询转group🔥🔥🔥
筛选用户条件为姓名包含小明,并且用户的所有储蓄卡中前三张银行卡都不是在2000年前的银行中开户的,并且返回用户姓名和储蓄卡的所属银行名称逗号分割
```java


List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(x -> x.bankCards())
        .where(user -> {
            user.name().like("小明");

            user.bankCards()
                .where(x -> x.type().eq("储蓄卡"))
                .orderBy(x -> x.openTime().asc()).elements(0, 2)
                .none(x -> x.bank().createTime().ge(LocalDateTime.of(2000,1,1,0,0)));

        }).select(user -> Select.DRAFT.of(
                user.name(),
                user.bankCards()
                    .where(x -> x.type().eq("储蓄卡"))
                    .orderBy(x -> x.openTime().asc())
                    .elements(0, 2).joining(x -> x.bank().name(),",")
        )).toList();



-- 第1条sql数据
SELECT
    t.`name` AS `value1`,
    t3.`__joining3__` AS `value2` 
FROM
    `t_sys_user` t 
LEFT JOIN
    (
        SELECT
            t2.`uid` AS `uid`,
            (CASE 
                WHEN COUNT((CASE WHEN t4.`create_time` >= '2000-01-01 00:00' THEN 1 ELSE NULL END)) > 0 THEN false ELSE true 
            END) AS `__none2__`,
            GROUP_CONCAT(t4.`name` SEPARATOR ',') AS `__joining3__` 
        FROM
            (SELECT
                t1.`id`,
                t1.`uid`,
                t1.`code`,
                t1.`type`,
                t1.`bank_id`,
                t1.`open_time` 
            FROM
                `t_bank_card` t1 
            WHERE
                t1.`type` = '储蓄卡' 
            ORDER BY
                t1.`open_time` ASC LIMIT 3) t2 
        INNER JOIN
            `t_bank` t4 
                ON t4.`id` = t2.`bank_id` 
        GROUP BY
            t2.`uid`) t3 
                ON t3.`uid` = t.`id` 
        WHERE
            t.`name` LIKE '%小明%' 
            AND IFNULL(t3.`__none2__`,true) = true
```

