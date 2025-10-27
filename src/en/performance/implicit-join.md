---
title: Implicit Join Optimization
order: 10
---

In `eq`, `implicit join` uses `left join` by default to implement relationships between tables. However, sometimes if our current table is a child table of the relationship table, that is, the navigation property target table is the parent table and our table is the child table, and our relationship key is a foreign key, we can use `inner join` instead of `left join` to improve performance.

So how to use `inner join` instead of `left join`?
- Navigation property required


## Navigation Property Required
We can add the property `required=true` at `@Navigate` to indicate that the navigation property must exist. Then the framework will also choose to use `inner join` instead of `left join`, including in one-to-many situations. Because `@ForeignKey` can cause user misunderstanding when used with `ExtraFilter`, leading to inconsistent results, so even foreign keys should not use INNER JOIN. And users may not necessarily want to generate foreign keys when using code-first, so you can use `inner join` instead of `left join` by adding this property.

```java

@Table("t_bank_card")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("bank_card")
public class SysBankCard implements ProxyEntityAvailable<SysBankCard , SysBankCardProxy>, Serializable {
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
     * Affiliated bank
     */
    private String bankId;
    /**
     * User account opening time
     */
    private LocalDateTime openTime;

    /**
     * Affiliated bank
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
    @ForeignKey
    private SysBank bank;

    /**
     * Affiliated user
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"},required = true)
    private SysUser user;
}
```


Filter generated SQL
```java
 List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
                .where(bank_card -> {
                    bank_card.bank().name().eq("ICBC");
                    bank_card.user().name().eq("Xiaoming");
                }).toList();


    SELECT
        t.`id`,
        t.`uid`,
        t.`code`,
        t.`type`,
        t.`bank_id`,
        t.`open_time` 
    FROM
        `t_bank_card` t 
    INNER JOIN
        `t_bank` t1 
            ON t1.`id` = t.`bank_id` 
    INNER JOIN
        `t_sys_user` t2 
            ON t2.`id` = t.`uid` 
    WHERE
        t1.`name` = 'ICBC' 
        AND t2.`name` = 'Xiaoming'
```

