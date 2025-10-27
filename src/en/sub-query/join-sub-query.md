---
title: JOIN Subquery
order: 6
---

`JOIN subqueries` are commonly encountered in most OLAP scenarios, with the most common being `JOIN GROUP views`. Although most `JOIN GROUP` operations can be converted to `implicit GROUP`, some special cases are unavoidable.


Next, we'll manually construct a `JOIN subquery`. If you've already understood the previous `FROM subquery` chapter, the current chapter should be very easy for you.

## Case

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
     * User's bank cards count
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
     * Owning bank
     */
    private String bankId;
    /**
     * Account opening time
     */
    private LocalDateTime openTime;

    /**
     * Owning bank
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
    @ForeignKey//Optional
    private SysBank bank;

    /**
     * Owning user
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

We still use the `Bank:BankCard:User` case, which is one-to-many-to-one

## Case
Query banks, return bank name and the number of bank cards issued by each bank
```java

//First we construct a group view table
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


If we use CTE view, it's a simple join   

```java
EntityQueryable<Draft2Proxy<String, Long>, Draft2<String, Long>> groupBankCardCountQuery = easyEntityQuery.queryable(SysBankCard.class)
                .groupBy(bank_card -> GroupKeys.of(bank_card.bankId()))
                .select(group -> Select.DRAFT.of(
                        group.key1(),//value1
                        group.count()//value2
                )).toCteAs();//Added convert to CTE table

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

But we can actually use simpler syntax with implicit group to implement the above requirement. I believe if you've been reading the documentation, I've demonstrated related functionality in many places.


For a moment, the world was silent
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

