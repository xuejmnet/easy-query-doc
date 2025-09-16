---
title: 一对多保存
order: 20
---

# 一对多保存
一种经常会用到的主从结构表,对于主从结构表的更新在没有很好地变更保存的时候，常用的是先删除后新增从表记录,但是如果遇到从表的id是参与业务逻辑的那么这种保存则会变得不合适,对于这种主从结构`eq`的`savable`可以轻松的应对实现


::: tabs
@tab 关系图

<img :src="$withBase('/images/saven2m.png')">

@tab SaveUser
```java

@Table("t_save_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_user")
public class SaveUser implements ProxyEntityAvailable<SaveUser, SaveUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    /**
     * 用户拥有的银行卡
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveBankCard.Fields.uid})
    private List<SaveBankCard> saveBankCards;
}
```
@tab SaveBank
```java

@Table("t_save_bank")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank")
public class SaveBank implements ProxyEntityAvailable<SaveBank, SaveBankProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String name;
    private String address;

    /**
     * 银行办法的银行卡
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {SaveBank.Fields.id},
            targetProperty = {SaveBankCard.Fields.bankId},
            cascade = CascadeTypeEnum.DELETE)
    private List<SaveBankCard> saveBankCards;
}
```
@tab SaveBankCard
```java
@Table("t_save_bank_card")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank_card")
public class SaveBankCard implements ProxyEntityAvailable<SaveBankCard , SaveBankCardProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String type;
    private String code;
    private String uid;
    private String bankId;
}
```
:::

这是一个非常常见的`User->BankCard`和`Bank->BankCard`两个聚合根同一个值对象,但是`User`和`BankCard`并不是正真意义上的聚合根和值对象,因为`BankCard`并不会因为和`User`的脱钩后被删除,但是`BankCard`会因为`Bank`的脱钩而被删除,所以在配置的时候我们可以选择`cascade = CascadeTypeEnum.DELETE`

## 一对多创建
```java

    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {

        SaveBank saveBank = new SaveBank();
        saveBank.setName("工商银行");
        saveBank.setAddress("城市广场1号");
        ArrayList<SaveBankCard> saveBankCards = new ArrayList<>();
        saveBank.setSaveBankCards(saveBankCards);
        SaveBankCard card1 = new SaveBankCard();
        card1.setType("储蓄卡");
        card1.setCode("123");
        saveBankCards.add(card1);
        SaveBankCard card2 = new SaveBankCard();
        card1.setType("信用卡");
        card1.setCode("456");
        saveBankCards.add(card2);

        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
```sql
-- 第1条sql数据
INSERT INTO `t_save_bank` (`id`, `name`, `address`)
VALUES ('dbadf934e3cb4666a5e7689f3a675e83', '工商银行', '城市广场1号')
-- 第2条sql数据
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('724929f91faf404caced57e18da50578', '储蓄卡', '123', 'dbadf934e3cb4666a5e7689f3a675e83')
-- 第3条sql数据
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('1b32678d234840e5b34ef855ff4aed9f', '信用卡', '456', 'dbadf934e3cb4666a5e7689f3a675e83')
```

## 从表差异更新

直接按存在的id进行查询,然后构建新的对象放到list内部替换被追踪的saveBank即可
```java

    @PostMapping("/update")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update() {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById("dbadf934e3cb4666a5e7689f3a675e83").singleNotNull();

        //假如请求有3个bankcards,其中y一个有id另外一个没有id
        List<SaveBankCard> list = easyEntityQuery.queryable(SaveBankCard.class)
                .whereByIds(Arrays.asList("724929f91faf404caced57e18da50578"))
                .toList();
        SaveBankCard saveBankCard = new SaveBankCard();//这个是新增的
        saveBankCard.setType("储蓄卡");
        saveBankCard.setCode("789");
        list.add(saveBankCard);

        saveBank.setSaveBankCards(list);
        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```

```sql

SELECT t.`id`, t.`type`, t.`code`, t.`uid`, t.`bank_id`
FROM `t_save_bank_card` t
WHERE t.`bank_id` IN ('dbadf934e3cb4666a5e7689f3a675e83')

SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `id` IN ('724929f91faf404caced57e18da50578')

DELETE FROM `t_save_bank_card`
WHERE `id` = '1b32678d234840e5b34ef855ff4aed9f'

INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('f9884d49668d4dd3947e9b1eec3906d0', '储蓄卡', '789', 'dbadf934e3cb4666a5e7689f3a675e83')
```
框架正确的处理了子表`BankCard`，正确感知出了需要被删除和需要被新增的银行卡信息