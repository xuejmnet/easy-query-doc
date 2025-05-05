---
title: 隐式join优化
order: 10
---

`eq`中`隐式join`默认使用`left join`来实现表之间的关系但是有时候如果我们当前表是关系表的子表,也就是导航属性目标表是父表我们的表是子表,我们的关系键是外键的时候我们可以使用`inner join`来代替`left join`从而可以提高相关性能

那么如何使用`inner join`来代替`left join`呢
- 注解@ForeignKey
- 导航属性required


## 外键ForeignKey
我们在常规的导航属性中添加`@ForeignKey`表示当前表是目标表的子表当前的`selfProperty`是`targetProperty`的外键

仅在`ManyToOne`和`ManyToMany`时生效
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
    @ForeignKey
    private SysBank bank;

    /**
     * 所属用户
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}
```

筛选生成的sql
```java
 List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
                .where(bank_card -> {
                    bank_card.bank().name().eq("ICBC");
                    bank_card.user().name().eq("小明");
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
    LEFT JOIN
        `t_sys_user` t2 
            ON t2.`id` = t.`uid` 
    WHERE
        t1.`name` = 'ICBC' 
        AND t2.`name` = '小明'
```

虽然`SysBankCard`和`SysBank`还有`SysUser`都有关系,但是因为`SysBankCard`和`SysBank`有外键关系所以有`SysBankCard`的情况下一定存在`SysBank`所以系统默认会采用`inner join`来代替`left join`略微提高一下sql生成时候的性能

::: warning 说明!!!
> 当`SysBankCard`和`SysBank`都使用逻辑删除存在非物理删除的情况下,那么是应该标记外键是一个非常值得关注的事情,如果你禁用逻辑删除或者逻辑删除了父表`SysBank`那么使用inner join会让结果和预期的不符(当然这种不符是因为数据存在脏数据导致的逻辑不一致),因为逻辑删除会让数据库的实际的外键约束失效,所以用户需要自己斟酌是否使用该注解
:::

## 导航属性required
我们除了使用`@ForeignKey`外还可以再`@Navigate`处添加属性`required=true`,用来表述导航属性是一定存在的,那么框架也会选择使用`inner join`来代替`left join`，包括在一对多的情况下，因为`@ForeignKey`无法作用于`OneToMany`和`ManyToMany`，并且用户在code-first的时候并不一定会希望生成外键所以可以通过添加该属性让其使用`inner join`来代替`left join`

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
    @ForeignKey
    private SysBank bank;

    /**
     * 所属用户
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"},required = true)
    private SysUser user;
}
```


筛选生成的sql
```java
 List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
                .where(bank_card -> {
                    bank_card.bank().name().eq("ICBC");
                    bank_card.user().name().eq("小明");
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
        AND t2.`name` = '小明'
```
