---
title: Quick Preview (Must Read) 🔥🔥🔥
order: 3
category:
  - Startup
---

# Quick JOIN
Unlike traditional ORMs, `eq` supports both `explicit joins` and `implicit joins`. For common business operations, we believe that data across tables is not isolated. In 90% of scenarios, when joining any two tables, the ON conditions should be the same. We configure these identical conditions as object properties using an object-oriented approach - this is called navigation properties, which are object relationships. Common relationships include `one-to-one`, `one-to-many`, `many-to-one`, and `many-to-many`, represented in database entities as either single object properties or collection properties.

`eq` supports converting these object relationships into database SQL expressions for querying data. By writing `DSL` in an object-oriented way, it shields the complexity of database statements and allows business code to be written in a form that developers can easily read.




## Establish Object Relationships
First, let's establish a relatively simple user model to describe the current object relationships:
- User `SysUser`
- Bank Card `SysBankCard`
- Bank `SysBank`
We currently have these three tables: each bank has corresponding bank cards, and each user has corresponding bank cards. User and bank card is one-to-many, bank and bank card is also one-to-many, and user and bank can form a many-to-many relationship through bank cards.




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
     * Bank cards owned by the user
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
     * Bank card type: debit card or savings card
     */
    private String type;
    /**
     * Bank ID
     */
    private String bankId;
    /**
     * Account opening time
     */
    private LocalDateTime openTime;

    /**
     * Belonging bank
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
    @ForeignKey//Optional
    private SysBank bank;

    /**
     * Belonging user
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
     * Bank cards owned
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {"id"},
            targetProperty = {"bankId"})
    private List<SysBankCard> bankCards;
}

```

:::

## Implicit JOIN
Query bank cards where the card owner's name is "小明"
```java

List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.user().name().eq("小明");
        }).toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t LEFT JOIN `t_sys_user` t1 ON t1.`id` = t.`uid` WHERE t1.`name` = ?
==> Parameters: 小明(String)
```

Query bank cards where the card owner's phone contains `1234` and the card is from ICBC
```java

List<SysBankCard> list1 = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.user().phone().like("1234");
            bank_card.bank().name().eq("工商银行");
        }).toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t LEFT JOIN `t_sys_user` t1 ON t1.`id` = t.`uid` INNER JOIN `t_bank` t2 ON t2.`id` = t.`bank_id` WHERE t1.`phone` LIKE ? AND t2.`name` = ?
==> Parameters: %1234%(String),工商银行(String)
```
Query Xiaoming's bank card information at ICBC, return `[name|bank|card number]` sorted by card number in ascending order

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

## Dynamic JOIN
Query bank cards with an optional cardholder name filter

The following query supports dynamic joins. If the query condition is present, it will automatically join the user table; otherwise, it won't - truly achieving an `intelligent ORM`
```java

String queryName=null;
List<SysBankCard> xmCards = easyEntityQuery.queryable(SysBankCard.class)
        //If the query condition doesn't meet requirements, it won't be added to the condition
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
        .where(bank_card -> {
            bank_card.user().name().eq(queryName);
        })
        .toList();

==> Preparing: SELECT t.`id`,t.`uid`,t.`code`,t.`type`,t.`bank_id`,t.`open_time` FROM `t_bank_card` t
```

## Mixed JOIN
`eq` not only supports `explicit join`, but also `implicit join`, and most importantly, supports `explicit + implicit mixed usage` - something other ORMs cannot do
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


## Super Strong Filtering🔥🔥🔥
Filter users who have at least 2 ICBC bank cards and have not opened an account at CCB

Advanced ORM writing style:
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


-- 1st SQL
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

Many people believe that ORM-generated SQL is poor, leading to performance issues. Let's see `eq`'s most powerful subquery merge `implicit group join`

Same condition as above

Filter users who have at least 2 ICBC bank cards and have not opened an account at CCB

- Configure subquery to `group join`, supported since framework `2.8.16^` by setting `@Navigate(subQueryToGroupJoin = true)`
- Expression configuration `.configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))`


Super ORM writing style:
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))//Enable implicit group join
        // .configure(o->{//When we have many subqueries, after upgrading to 2.8.14, you can configure the behavior to convert all subqueries to group join
        //     o.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN);
        // })
        .where(user -> {
            //At least 2 ICBC bank cards
            user.bankCards().where(card -> {
                card.bank().name().eq("工商银行");
            }).count().ge(2L);

            //No CCB card
            user.bankCards().none(card -> {
                card.bank().name().eq("建设银行");
            });
        }).toList();


-- 1st SQL
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

Using database analysis can quickly optimize the original 10-second double subquery to only 100ms, and most importantly, it's a hundred times more readable than native SQL (DSL reading)

## PARTITION BY

Filter users whose first bank card is from ICBC (the first opened bank card is from ICBC)
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //User's first opened bank card is from ICBC
            user.bankCards().orderBy(x->x.openTime().asc()).first().bank().name().eq("工商银行");
        }).toList();



-- 1st SQL
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

If there are multiple conditions, you can define a local variable
```java

List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //User's first opened bank card is from ICBC
            SysBankCardProxy first=user.bankCards().orderBy(x->x.openTime().asc()).first();
            first.bank().name().eq("工商银行");
            first.code().eq("123");
        }).toList();
```

## SELECT Subquery
```java
 List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
                .where(user -> {
                    user.name().like("小明");

                }).select(user -> Select.DRAFT.of(
                        user.name(),
                        //Types of the user's first two opened bank cards
                        user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).joining(x -> x.type(),",")
                )).toList();

-- 1st SQL
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

## Quick Arbitrary Subquery
Filter users whose name contains Xiaoming and whose first two opened bank cards are not from Hangzhou Bank, return user name and the types of the user's first two bank cards
```java

List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.name().like("小明");
            user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).none(x->x.bank().name().eq("杭州银行"));
        }).select(user -> Select.DRAFT.of(
                user.name(),
                //Types of the user's first two opened bank cards
                user.bankCards().orderBy(x -> x.openTime().asc()).elements(0, 1).joining(x -> x.type(),",")
        )).toList();


-- 1st SQL
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

## Super Ultimate Subquery to Group🔥🔥🔥
Filter users whose name contains Xiaoming, and all the first three savings cards are not opened in banks established before 2000, and return user name and bank names of savings cards separated by commas
```java


List<Draft2<String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
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


SELECT t.`name` AS `value1`, t4.`__joining3__` AS `value2`
FROM `t_sys_user` t
	LEFT JOIN (
		SELECT t3.`uid` AS `__group_key1__`
			, COUNT(CASE 
				WHEN t5.`create_time` >= '2000-01-01 00:00' THEN 1
				ELSE NULL
			END) <= 0 AS `__none2__`
			, GROUP_CONCAT(t5.`name` SEPARATOR ',') AS `__joining3__`
		FROM (
			SELECT t2.`id` AS `id`, t2.`uid` AS `uid`, t2.`code` AS `code`, t2.`type` AS `type`, t2.`bank_id` AS `bank_id`
				, t2.`open_time` AS `open_time`, t2.`__row__` AS `__row__`
			FROM (
				SELECT t1.`id` AS `id`, t1.`uid` AS `uid`, t1.`code` AS `code`, t1.`type` AS `type`, t1.`bank_id` AS `bank_id`
					, t1.`open_time` AS `open_time`, ROW_NUMBER() OVER (PARTITION BY t1.`uid` ORDER BY t1.`open_time` ASC) AS `__row__`
				FROM `t_bank_card` t1
				WHERE t1.`type` = '储蓄卡'
			) t2
			WHERE t2.`__row__` >= 1
				AND t2.`__row__` <= 3
		) t3
			INNER JOIN `t_bank` t5 ON t5.`id` = t3.`bank_id`
		GROUP BY t3.`uid`
	) t4
	ON t4.`__group_key1__` = t.`id`
WHERE t.`name` LIKE '%小明%'
	AND IFNULL(t4.`__none2__`, true) = true
```
