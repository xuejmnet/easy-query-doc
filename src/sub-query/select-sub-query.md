---
title: select子查询1
order: 1
---

`select子查询`常用于select的时候返回子表的数量或者相关的聚合信息

接下来我们将以银行 银行卡 用户来进行描述如何编写相关子查询

::: warning 说明!!!
> 其中将隐式子查询转成隐式group的方式如果用户出现两个及以上的子查询在无法合并的情况下建议用户使用隐式group不然多个子查询的性能将是很低下的
:::



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
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"})
    @ForeignKey//可以不加 加了就是InnerJoin处理更多细节查看注解篇章
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


## 案例1
查询银行信息并且额外返回银行发布的银行卡数量 条件是银行名称带银行两个字的


::: tabs

@tab 隐式子查询
```java
List<Part1<SysBank, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.bankCards().count()
        )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        (SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id`) AS `__part__column1` 
    FROM
        `t_bank` t 
    WHERE
        t.`name` LIKE '%银行%'
```
@tab 手动子查询
```java

List<Part1<SysBank, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.expression().subQuery(()->{
                    return bank.expression().subQueryable(SysBankCard.class)
                            .where(bank_card -> {
                                bank_card.bankId().eq(bank.id());
                            })
                            .selectColumn(bank_card -> bank_card.id().count());
                                //.selectCount()
                })
        )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        (SELECT
            COUNT(t1.`id`) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id`) AS `__part__column1` 
    FROM
        `t_bank` t 
    WHERE
        t.`name` LIKE '%银行%'
```
@tab 子查询转隐式group
```java

List<Part1<SysBank, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
        .subQueryToGroupJoin(bank -> bank.bankCards())
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.bankCards().count()
        )).toList();




    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        IFNULL(t2.`__count2__`, 0) AS `__part__column1` 
    FROM
        `t_bank` t 
    LEFT JOIN
        (SELECT
            t1.`bank_id` AS `bankId`, COUNT(*) AS `__count2__` FROM `t_bank_card` t1 
        GROUP BY
            t1.`bank_id`) t2 
            ON t2.`bankId` = t.`id` 
    WHERE
        t.`name` LIKE '%银行%'
```

:::





## 案例2
查询银行信息并且额外返回银行发布的储蓄卡卡数量和信用卡数量 条件是银行名称带银行两个字的



::: tabs

@tab 隐式子查询
```java


List<Part2<SysBank, Long, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.bankCards().where(card->card.type().eq("储蓄卡")).count(),
                bank.bankCards().where(card->card.type().eq("信用卡")).count()
        )).toList();



    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        (SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id` 
            AND t1.`type` = '储蓄卡') AS `__part__column1`,
        (SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t2 
        WHERE
            t2.`bank_id` = t.`id` 
            AND t2.`type` = '信用卡') AS `__part__column2` 
    FROM
        `t_bank` t 
    WHERE
        t.`name` LIKE '%银行%'
```
@tab 手动子查询
```java

        List<Part2<SysBank, Long, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
                .where(bank -> {
                    bank.name().like("银行");
                })
                .select(bank -> Select.PART.of(
                        bank,
                        bank.expression().subQuery(()->{
                            return bank.expression().subQueryable(SysBankCard.class)
                                    .where(bank_card -> {
                                        bank_card.bankId().eq(bank.id());
                                        bank_card.type().eq("储蓄卡");
                                    })
                                    .selectColumn(bank_card -> bank_card.id().count());
                            //.selectCount()
                        }),
                        bank.expression().subQuery(()->{
                            return bank.expression().subQueryable(SysBankCard.class)
                                    .where(bank_card -> {
                                        bank_card.bankId().eq(bank.id());
                                        bank_card.type().eq("信用卡");
                                    })
                                    .selectColumn(bank_card -> bank_card.id().count());
                            //.selectCount()
                        })
                )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        (SELECT
            COUNT(t1.`id`) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id` 
            AND t1.`type` = '储蓄卡') AS `__part__column1`,
        (SELECT
            COUNT(t3.`id`) 
        FROM
            `t_bank_card` t3 
        WHERE
            t3.`bank_id` = t.`id` 
            AND t3.`type` = '信用卡') AS `__part__column2` 
    FROM
        `t_bank` t 
    WHERE
        t.`name` LIKE '%银行%'
```
@tab 子查询转隐式group
```java

List<Part2<SysBank, Long, Long>> bankAndCounts = easyEntityQuery.queryable(SysBank.class)
        .subQueryToGroupJoin(bank -> bank.bankCards())
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.bankCards().where(card->card.type().eq("储蓄卡")).count(),
                bank.bankCards().where(card->card.type().eq("信用卡")).count()
        )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        IFNULL(t2.`__count2__`, 0) AS `__part__column1`,
        IFNULL(t2.`__count3__`, 0) AS `__part__column2` 
    FROM
        `t_bank` t 
    LEFT JOIN
        (SELECT
            t1.`bank_id` AS `bankId`, 
            COUNT((CASE WHEN t1.`type` = '储蓄卡' THEN 1 ELSE null END)) AS `__count2__`,
            COUNT((CASE WHEN t1.`type` = '信用卡' THEN 1 ELSE null END)) AS `__count3__` 
        FROM `t_bank_card` t1 
        GROUP BY
            t1.`bank_id`) t2 
    ON t2.`bankId` = t.`id` 
    WHERE
        t.`name` LIKE '%银行%'
```

:::

## 案例3

查询18岁的用户，返回用户的姓名和开户的第一张银行卡的卡号和所属银行名称

::: tabs

@tab 隐式子查询转partition
```java

List<Draft3<String, String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
                    user.age().eq(18);
        })
        .select(user -> Select.DRAFT.of(
                user.name(),
                user.bankCards().orderBy(o -> o.openTime().asc()).firstElement().code(),
                user.bankCards().orderBy(o -> o.openTime().asc()).firstElement().bank().name()

        )).toList();


    SELECT
        t.`name` AS `value1`,
        t4.`code` AS `value2`,
        t5.`name` AS `value3` 
    FROM
        `t_sys_user` t 
    LEFT JOIN
        (SELECT
            t2.`id` AS `id`, t2.`uid` AS `uid`, t2.`code` AS `code`, t2.`type` AS `type`, t2.`bank_id` AS `bank_id`, t2.`open_time` AS `open_time` FROM 
            (SELECT
                t1.`id`, t1.`uid`, t1.`code`, t1.`type`, t1.`bank_id`, t1.`open_time`, (ROW_NUMBER() OVER (PARTITION BYt1.`uid` ORDER BY t1.`open_time` ASC)) AS `__row__` 
                FROM `t_bank_card` t1
            ) t2 
        WHERE
            t2.`__row__` = 1) t4 
            ON t4.`uid` = t.`id` 
    INNER JOIN
        `t_bank` t5 
            ON t5.`id` = t4.`bank_id` 
    WHERE
        t.`age` = 18
```

:::

## 案例4
查询银行信息并且额外返回银行发布的前两张银行卡都是2002年之前的,

表达式描述的含义是在2002年后的一个都没有


::: tabs

@tab 隐式子查询

```java

        List<Part1<SysBank, Boolean>> bankCardTop2s = easyEntityQuery.queryable(SysBank.class)
                .where(bank -> {
                    bank.name().like("银行");
                })
                .select(bank -> Select.PART.of(
                        bank,
                        bank.bankCards().orderBy(o -> o.openTime().asc()).elements(0, 1)
                                .where(card -> card.openTime().ge(LocalDateTime.of(2002, 1, 1, 0, 0)))
                                .noneValue()
                )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        (NOT EXISTS((SELECT
            1 FROM (SELECT
                t1.`id`, t1.`uid`, t1.`code`, t1.`type`, t1.`bank_id`, t1.`open_time` FROM `t_bank_card` t1 
            WHERE
                t1.`bank_id` = t.`id` 
            ORDER BY
                t1.`open_time` ASC 
            LIMIT
                2) t2 
        WHERE
            t2.`open_time` >= '2002-01-01 00:00' 
        LIMIT
            1))) AS `__part__column1` 
    FROM
        `t_bank` t 
    WHERE
        t.`name` LIKE '%银行%'
```


@tab 子查询转隐式group
```java


List<Part1<SysBank, Boolean>> bankCardTop2s = easyEntityQuery.queryable(SysBank.class)
        .subQueryToGroupJoin(s->s.bankCards())
        .where(bank -> {
            bank.name().like("银行");
        })
        .select(bank -> Select.PART.of(
                bank,
                bank.bankCards().orderBy(o -> o.openTime().asc()).elements(0, 1)
                        .where(card -> card.openTime().ge(LocalDateTime.of(2002, 1, 1, 0, 0)))
                        .noneValue()
        )).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`create_time`,
        IFNULL(t3.`__none2__`, true) AS `__part__column1` 
    FROM
        `t_bank` t 
    LEFT JOIN
        (SELECT
            t2.`bank_id` AS `bankId`, (CASE 
                WHEN COUNT((CASE 
                    WHEN t2.`open_time` >= '2002-01-01 00:00' 
                        THEN 1 
                    ELSE null 
            END)) > 0 
                THEN false 
            ELSE true 
    END) AS `__none2__` FROM (SELECT
        t1.`id`, t1.`uid`, t1.`code`, t1.`type`, t1.`bank_id`, t1.`open_time` FROM `t_bank_card` t1 
    ORDER BY
        t1.`open_time` ASC 
    LIMIT
        2) t2 
GROUP BY
    t2.`bank_id`) t3 
    ON t3.`bankId` = t.`id` 
WHERE
    t.`name` LIKE '%银行%'
```
:::