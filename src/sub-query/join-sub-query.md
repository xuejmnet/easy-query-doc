---
title: join子查询
order: 6
---

`join子查询`在大部分的OLAP中都会遇到常见的就是`JOIN GROUP 视图`虽然大部分的`JOIN GROUP`都可以转换成`隐式GROUP`但是免不了一些特殊的情况


接下来我们就来手动构建一个`join子查询`如果您已经由之前的`from 子查询`章节的了解相信当前章节对您应该是非常轻松的

## 案例

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

我们依然使用`银行:银行卡:用户`这个案例分别是一对多对一

## 案例
查询银行,返回银行名称和每家银行发行的银行卡数量
```java

//首先我们先构建一个group视图表
EntityQueryable<Draft2Proxy<String, Long>, Draft2<String, Long>> groupBankCardCountQuery = easyEntityQuery.queryable(SysBankCard.class)
        .groupBy(bank_card -> GroupKeys.of(bank_card.bankId()))
        .select(group -> Select.DRAFT.of(
                group.key1(),//value1
                group.count()//value2
        ));


List<Draft2<String, Long>> list1 = easyEntityQuery.queryable(SysBank.class)
        .leftJoin(groupBankCardCountQuery, (bank, cardGroup) -> bank.id().eq(cardGroup.value1()))
        .select((bank, cardGroup) -> Select.DRAFT.of(
                bank.name(),
                cardGroup.value2()
        )).toList();


    SELECT
        t.`name` AS `value1`,
        t3.`value2` AS `value2` 
    FROM
        `t_bank` t 
    LEFT JOIN
        (SELECT
            t1.`bank_id` AS `value1`, COUNT(*) AS `value2` FROM `t_bank_card` t1 
        GROUP BY
            t1.`bank_id`) t3 
     ON t.`id` = t3.`value1`
```


如果我们用cte视图呢  就是一个简单join   

```java
EntityQueryable<Draft2Proxy<String, Long>, Draft2<String, Long>> groupBankCardCountQuery = easyEntityQuery.queryable(SysBankCard.class)
                .groupBy(bank_card -> GroupKeys.of(bank_card.bankId()))
                .select(group -> Select.DRAFT.of(
                        group.key1(),//value1
                        group.count()//value2
                )).toCteAs();//多了一个转成cte表

        List<Draft2<String, Long>> list1 = easyEntityQuery.queryable(SysBank.class)
                .leftJoin(groupBankCardCountQuery, (bank, cardGroup) -> bank.id().eq(cardGroup.value1()))
                .select((bank, cardGroup) -> Select.DRAFT.of(
                        bank.name(),
                        cardGroup.value2()
                )).toList();



    WITH `with_Draft2` AS (SELECT
        t1.`bank_id` AS `value1`, COUNT(*) AS `value2` FROM `t_bank_card` t1 
    GROUP BY
        t1.`bank_id`)
        
  
    SELECT
        t.`name` AS `value1`,
        t3.`value2` AS `value2` 
    FROM
        `t_bank` t 
    LEFT JOIN
        `with_Draft2` t3 
            ON t.`id` = t3.`value1`
```

但是我们其实可以用更加简单的语法隐式group来实现刚才的需求,我相信如果你一路看来文档那么我已经在多出地方已经演示了相关的功能


有那么一瞬间世界都安静了
```java

List<Draft2<String, Long>> list1 =   easyEntityQuery.queryable(SysBank.class)
        .subQueryToGroupJoin(bank -> bank.bankCards())
        .select(bank -> Select.DRAFT.of(
                bank.name(),
                bank.bankCards().count()
        )).toList();



    SELECT
        t.`name` AS `value1`,
        IFNULL(t2.`__count2__`, 0) AS `value2` 
    FROM
        `t_bank` t 
    LEFT JOIN
        (SELECT
            t1.`bank_id` AS `bankId`, COUNT(*) AS `__count2__` FROM `t_bank_card` t1 
        GROUP BY
            t1.`bank_id`) t2 
    ON t2.`bankId` = t.`id`
```