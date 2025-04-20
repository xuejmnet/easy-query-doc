---
title: where子查询
order: 3
---

`where子查询`区别于`select子查询`生成的必须是执行片段而不是类型片段,如果在where内部使用类型片段那么该片段将不会生效

提供支持子查询包括`exists`、`not exists`、`in`、`not in`,并且有手动和自动两种方式

以下是错误的演示❌
```java

List<SysUser> cards = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            //必须添加any或者none相关的执行函数让其变成执行片段
            //或者使用count让其生成类型片段后进行比较操作
            user.bankCards().where(card -> card.type().eq("储蓄卡"));
        }).toList();
```


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
筛选用户条件是用户拥有至少一张储蓄卡


::: tabs

@tab 隐式子查询

```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.bankCards().any(card -> card.type().eq("储蓄卡"));
        }).toList();



    SELECT
        t.`id`,
        t.`name`,
        t.`phone`,
        t.`age`,
        t.`create_time` 
    FROM
        `t_sys_user` t 
    WHERE
        EXISTS (SELECT
            1 FROM `t_bank_card` t1 
        WHERE
            t1.`uid` = t.`id` 
            AND t1.`type` = '储蓄卡' 
        LIMIT
            1)
```
@tab 显式子查询
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(user -> user.bankCards())
        .where(user -> {
            
            user.expression().exists(()->{
                return user.expression().subQueryable(SysBankCard.class)
                        .where(bank_card -> {
                            bank_card.uid().eq(user.id());
                            bank_card.type().eq("储蓄卡");
                        });
            });
        }).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`phone`,
        t.`age`,
        t.`create_time` 
    FROM
        `t_sys_user` t 
    WHERE
        EXISTS (SELECT
            1 FROM `t_bank_card` t1 
        WHERE
            t1.`uid` = t.`id` 
            AND t1.`type` = '储蓄卡')
```
@tab 子查询转隐式Group
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(user -> user.bankCards())
        .where(user -> {
            user.bankCards().any(card -> card.type().eq("储蓄卡"));
        }).toList();


    SELECT
        t.`id`,
        t.`name`,
        t.`phone`,
        t.`age`,
        t.`create_time` 
    FROM
        `t_sys_user` t 
    LEFT JOIN
        (SELECT
            t1.`uid` AS `uid`, (CASE 
                WHEN COUNT((CASE 
                    WHEN t1.`type` = '储蓄卡' 
                        THEN 1 
                    ELSE null 
            END)) > 0 
                THEN true 
            ELSE false 
    END) AS `__any2__` FROM `t_bank_card` t1 
GROUP BY
    t1.`uid`) t2 
    ON t2.`uid` = t.`id` 
WHERE
    IFNULL(t2.`__any2__`, false) = true
```

:::

## 案例2
查询用户拥有两张储蓄卡的用户列表

::: tabs

@tab 隐式子查询

```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {

            user.bankCards().where(card->card.type().eq("储蓄卡")).count().eq(2L);
            
        }).toList();


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
            WHERE
                t1.`uid` = t.`id` 
                AND t1.`type` = '储蓄卡'
        ) = 2
``
@tab 显式子查询
```java


List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {

            user.expression().subQuery(()->{
                return user.expression().subQueryable(SysBankCard.class)
                        .where(bank_card -> {
                            bank_card.uid().eq(user.id());
                            bank_card.type().eq("储蓄卡");
                        }).selectCount();
            }).eq(2L);


        }).toList();


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
            WHERE
                t1.`uid` = t.`id` 
                AND t1.`type` = '储蓄卡'
        ) = 2
```
@tab 子查询转隐式Group
```java


List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(user -> user.bankCards())
        .where(user -> {

            user.bankCards().where(card->card.type().eq("储蓄卡")).count().eq(2L);
            
        }).toList();

    SELECT
        t.`id`,
        t.`name`,
        t.`phone`,
        t.`age`,
        t.`create_time` 
    FROM
        `t_sys_user` t 
    LEFT JOIN
        (SELECT
            t1.`uid` AS `uid`, COUNT((CASE 
                WHEN t1.`type` = '储蓄卡' 
                    THEN 1 
                ELSE null 
        END)) AS `__count2__` FROM `t_bank_card` t1 
    GROUP BY
        t1.`uid`) t2 
        ON t2.`uid` = t.`id` 
WHERE
    IFNULL(t2.`__count2__`, 0) = 2
```

@tab 显式子查询2
```java
//常量在左

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.expression().constant(2L).eq(
                    user.expression().subQueryable(SysBankCard.class)
                            .where(bank_card -> {
                                bank_card.uid().eq(user.id());
                                bank_card.type().eq("储蓄卡");
                            }).selectCount()
            );

        }).toList();




    SELECT
        t.`id`,
        t.`name`,
        t.`phone`,
        t.`age`,
        t.`create_time` 
    FROM
        `t_sys_user` t 
    WHERE
        2 = (
            SELECT
                COUNT(*) 
            FROM
                `t_bank_card` t1 
            WHERE
                t1.`uid` = t.`id` 
                AND t1.`type` = '储蓄卡'
        )
```
:::



::: danger 说明!!!
> 手动子查询的创建方式有两种一种是`eq实例`创建一个queryable一种是通过表达式内部的`expression().subQeuryable()`，在使用时我们应该尽可能的使用上下文来创建子查询表达式,区别就是`eq实例`创建的表达式必须子查询作为左侧的表而不是外部表作为左侧表而`expression().subQeuryable()`创建的子查询则不需要考虑这个问题
:::

## 数据库对象模型
::: tabs
@tab 企业表
```java
@Table("t_company")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("com")
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = SysUser.Fields.companyId)
    private List<SysUser> users;
}
```

@tab 用户表
```java
@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = Fields.companyId)
    private Company company;
}
```
::: 

### 查询企业存在用户成年的
```java
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().where(u -> {
                        u.age().gt(18);
                }).any();
        }).toList();
//当上述子查询有且只有一个条件比如age>18有且只有一个条件时,并且是用来断言当前条件的,那么可以使用flatElement来展开如下写法和上述写法一样

List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().any(u->u.age().gt(18));
                com.users().flatElement().age().gt(18);
        }).toList();

SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_company` t 
WHERE
    EXISTS (
        SELECT
            1 
        FROM
            `t_user` t1 
        WHERE
            t1.`company_id` = t.`id` 
            AND t1.`age` > 18 LIMIT 1
    )
```




### 查询企业存条件是企业所有用户平均年龄大于18
```java
List<Company> list = easyEntityQuery.queryable(Company.class)
        .where(com -> {
                com.users().avg(u->u.age()).gt(BigDecimal.valueOf(18));
        }).toList();



SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_company` t 
WHERE
    IFNULL((SELECT
        AVG(t1.`age`) 
    FROM
        `t_user` t1 
    WHERE
        t1.`company_id` = t.`id`),0) > '18'
```





## EXISTS

::: tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
        .where(o -> o.id().eq("1" ));

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.expression().exists(() -> {
                return subQueryable.where(q -> q.id().eq(o.id()));
        })).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 1
```


::: 


## NOT EXISTS

::: tabs
@tab 对象模式
```java
//SELECT * FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<BlogEntityProxy, BlogEntity> subQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("1" ));

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.expression().notExists(() -> {
                    return subQueryable.where(q -> q.id().eq(o.id()));
                })).toList();

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE NOT EXISTS (SELECT 1 FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ? AND t1.`id` = t.`id`)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 3(ms)
<== Total: 100
```


::: 


## IN

::: tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .selectColumn(o -> o.id());//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().in(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),123(String)
<== Time Elapsed: 4(ms)
<== Total: 0
```


::: 

## NOT IN

::: tabs
@tab 对象模式

```java
//SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?
        EntityQueryable<StringProxy, String> idQueryable = easyEntityQuery.queryable(BlogEntity.class)
                .where(o -> o.id().eq("123" ))
                .selectColumn(o -> o.id());//如果子查询in string那么就需要select string，如果integer那么select要integer 两边需要一致

        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> o.id().notIn(idQueryable)).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`id` NOT IN (SELECT t1.`id` FROM `t_blog` t1 WHERE t1.`deleted` = ? AND t1.`id` = ?)
==> Parameters: false(Boolean),1(String)
<== Time Elapsed: 4(ms)
<== Total: 100
```
::: 