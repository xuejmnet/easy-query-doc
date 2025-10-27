---
title: WHERE Subquery
order: 4
---

`where subqueries` differ from `select subqueries` in that they generate execution fragments.


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

## Exists

```java
// Query users who have at least one savings card
// exists
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.or(() -> {
            user.expression().exists(
                easyEntityQuery.queryable(SysBankCard.class)
                        .where(bankCard -> {
                            bankCard.uid().eq(user.id());
                            bankCard.type().eq("储蓄卡");//Savings card
                        })
            );
        })).toList();
        

    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (EXISTS (SELECT
            1 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡'))
```

### Implicit exists


```java
// Query users who have at least one savings card
//In this case, we can write it in a simpler way
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //Use where for navigation properties, will generate exists
            user.bankCards().where(bankCard -> {
                bankCard.type().eq("储蓄卡");//Savings card
            });
        }).toList();


    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        EXISTS (SELECT
            1 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡')
```

## Not Exists
```java
// Query users who have no savings cards
//not exists
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.or(() -> {
            user.expression().notExists(
                easyEntityQuery.queryable(SysBankCard.class)
                        .where(bankCard -> {
                            bankCard.uid().eq(user.id());
                            bankCard.type().eq("储蓄卡");//Savings card
                        })
            );
        })).toList();




    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (NOT EXISTS (SELECT
            1 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡'))
```

### Implicit not exists
```java
// Query users who have no savings cards
//In this case, we can write it in a simpler way
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //Use where+any(false) for navigation properties, will generate not exists
            user.bankCards().any(false,bankCard -> {
                bankCard.type().eq("储蓄卡");//Savings card
            });
        }).toList();



    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        NOT EXISTS (SELECT
            1 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡')
```


## IN
```java
//in explicit
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.or(() -> {
            user.id().in(
                    easyEntityQuery.queryable(SysBankCard.class)
                            .where(bankCard -> {
                                bankCard.type().eq("储蓄卡");//Savings card
                            }).select(b -> b.uid())
            );
        })).toList();


    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (`id` IN (SELECT
            t1.`uid` AS `uid` 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`type` = '储蓄卡'))
```

## NOT IN
```java
//not in explicit
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> user.or(() -> {
            user.id().notIn(
                    easyEntityQuery.queryable(SysBankCard.class)
                            .where(bankCard -> {
                                bankCard.type().eq("储蓄卡");//Savings card
                            }).select(b -> b.uid())
            );
        })).toList();



    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (`id` NOT IN (SELECT
            t1.`uid` AS `uid` 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`type` = '储蓄卡'))
```



::: warning Warning!!!
> Direct subqueries under where, the single result generated in where will not use `EXISTS` or `IN`, but will use direct = comparison. If you need to use `EXISTS` or `IN`, please wrap it with .or() to isolate.
:::


## Case
Query users who have exactly two savings cards

```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //Use count()
            user.bankCards().where(bank_card -> bank_card.type().eq("储蓄卡")).count().eq(2L);
        }).toList();



    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡') = 2
```


```java

//Use where in combination with count()
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.bankCards().where(bank_card -> bank_card.type().eq("储蓄卡")).where().count().eq(2L);
        }).toList();


    SELECT
        `id`,
        `name`,
        `phone`,
        `age`,
        `create_time` 
    FROM
        `t_sys_user` 
    WHERE
        (SELECT
            COUNT(*) 
        FROM
            `t_bank_card` t1 
        WHERE
            t1.`uid` = `id` 
            AND t1.`type` = '储蓄卡') = 2
```



## Multiple Nested Subqueries

```java

//Find companies where users have an average age >= 18
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(company -> {
            company.users().avg(u -> u.age()).ge(BigDecimal.valueOf(18));
        }).toList();
        


    SELECT
        `id`,
        `name`,
        `create_time` 
    FROM
        `t_company` 
    WHERE
        IFNULL((SELECT
            AVG(t1.`age`) 
        FROM
            `t_user` t1 
        WHERE
            t1.`company_id` = `id`),
        0) >= 18
```

```java
//Find companies where at least one user has an age >= 18
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(company -> {
            company.users().where(u -> u.age().ge(18));
        }).toList();


    SELECT
        `id`,
        `name`,
        `create_time` 
    FROM
        `t_company` 
    WHERE
        EXISTS (SELECT
            1 
        FROM
            `t_user` t1 
        WHERE
            t1.`company_id` = `id` 
            AND t1.`age` >= 18)
```

