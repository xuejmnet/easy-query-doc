---
title: 集合关系任意对象
order: 90
---

# 集合关系任意对象

正常我们做关联关系会使用一对多的情况下有时候需要使用第一个或者第n个

## dsl partition
正常我们可以使用一对多关系的`first`来进行处理
```java
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.bankCards().orderBy(card->card.openTime().desc()).first().type().eq("123");
        }).toList();
```

## cte视图第一个

定义视图
```java


@Table("bank_card_first")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("bank_card_first")
public class FirstSysBankCard implements ProxyEntityAvailable<FirstSysBankCard, FirstSysBankCardProxy>, Serializable, EntityCteViewer<FirstSysBankCard> {
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

    @Override
    public Supplier<Query<FirstSysBankCard>> viewConfigure(QueryRuntimeContext runtimeContext) {
        return () -> {
            SQLClientApiFactory sqlClientApiFactory = runtimeContext.getSQLClientApiFactory();
            ClientQueryable<SysBankCard> queryable = sqlClientApiFactory.createQueryable(SysBankCard.class, runtimeContext);
            return new EasyEntityQueryable<>(SysBankCardProxy.createTable(), queryable).select(m -> Select.PART.of(
                            m,
                            m.expression().rowNumberOver().partitionBy(m.uid()).orderByDescending(m.openTime())
                    ))
                    .where(card -> {
                        card.partColumn1().eq(1L);
                    }).select(FirstSysBankCard.class, u -> Select.of(
                            u.entityTable().FETCHER.allFields()
                    ));
        };
    }
}

```

对象关系定义
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

    @Navigate(value = RelationTypeEnum.OneToOne,
            selfProperty = {"id"},
            targetProperty = {"bankId"})
    private FirstSysBankCard firstBankCard;
}

```

查询
```java

WITH `bank_card_first` AS (
    
    SELECT
    t2.`id`, t2.`uid`, t2.`code`, t2.`type`, t2.`bank_id`, t2.`open_time` FROM 
    
    (SELECT
        t1.`id`, t1.`uid`, t1.`code`, t1.`type`, t1.`bank_id`, t1.`open_time`, (ROW_NUMBER() OVER (PARTITION 
    BY
        t1.`uid` 
    ORDER BY
        t1.`open_time` DESC)) AS `__part__column1` FROM `t_bank_card` t1) t2 
WHERE
    t2.`__part__column1` = 1) 

SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_bank` t 
LEFT JOIN
    `bank_card_first` t4 
        ON t4.`bank_id` = t.`id` 
WHERE
    t4.`type` = '123'
```