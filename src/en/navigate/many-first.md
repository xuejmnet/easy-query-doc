---
title: Collection Relationship Any Object
order: 90
---

# Collection Relationship Any Object

Normally, when we do association relationships with one-to-many situations, sometimes we need to use the first or nth object.

## dsl partition
Normally we can use the `first` of one-to-many relationships to handle this
```java
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.bankCards().orderBy(card->card.openTime().desc()).first().type().eq("123");
        }).toList();
```

## cte view first

Define view
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
     * Bank card number
     */
    private String code;
    /**
     * Bank card type: debit card, savings card
     */
    private String type;
    /**
     * Bank to which it belongs
     */
    private String bankId;
    /**
     * User account opening time
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

Object relationship definition
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
     * Bank cards owned
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

Query
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

