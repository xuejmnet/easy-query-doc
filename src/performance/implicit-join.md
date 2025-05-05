---
title: 隐式join优化
order: 10
---

`eq`中`隐式join`默认使用`left join`来实现表之间的关系但是有时候如果我们当前表是关系表的子表,也就是导航属性目标表是父表我们的表是子表,我们的关系键是外键的时候我们可以使用`inner join`来代替`left join`从而可以提高相关性能

那么如何使用`inner join`来代替`left join`呢
- 导航属性required


## 导航属性required
我们可以使用`@Navigate`处添加属性`required=true`,用来表述导航属性是一定存在的,那么框架也会选择使用`inner join`来代替`left join`，包括在一对多的情况下，因为`@ForeignKey`在配合`ExtraFilter`的时候存在用户误解导致结果不一致的问题，所以哪怕是外键也不应该使用INNER JOIN，并且用户在code-first的时候并不一定会希望生成外键所以可以通过添加该属性让其使用`inner join`来代替`left join`

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
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required=true)
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
