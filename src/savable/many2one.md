---
title: 多对一保存
order: 30
---

 # 多对一保存
 多对一保存是一个特殊的保存，`savable`需要传递聚合根，但是多对一的保存以值对象为聚合根，所以多对一并不会修改导航属性，只会针对导航属性进行导航关联的字段进行值赋值修改

 多对一不允许savable的时候操作导航属性，也不允许对导航属性进行脱钩，脱钩必须有聚合根对象发起而不是值对象发起


::: danger 说明!!!
> `ManyToOne`基本上都是值对象发起目标对象为当前对象的聚合根,所以只会触发脱钩或者关联操作,并且脱钩操作只允许是`set null`所以该模式下的保存基本只会触发`update`
> 值对象的聚合根必须存在于当前追踪上下文中，不可以是手动构建出来的聚合根
:::


## 银行卡和银行
因为bankId默认为数据库非null,所以当银行卡和银行脱钩级联只能设置为delete,但是聚合根和值对象脱钩只能有聚合根发起,值对象发起的脱钩只能设置为null,所以无法通过银行卡发起和银行的脱钩


```java

@Table("t_save_bank_card")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank_card")
public class SaveBankCard implements ProxyEntityAvailable<SaveBankCard, SaveBankCardProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String type;
    @SaveKey
    private String code;
    private String uid;
    private String bankId;

    /**
     * 所属银行
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {SaveBankCard.Fields.bankId}, targetProperty = {SaveBank.Fields.id},cascade = CascadeTypeEnum.DELETE)
    private SaveBank saveBank;
}



    @PostMapping("/update1")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update1() {
        SaveBankCard saveBankCard = easyEntityQuery.queryable(SaveBankCard.class)
                .include(save_bank_card -> save_bank_card.saveBank())
                .whereById("2")
                .singleNotNull();
        saveBankCard.setSaveBank(null);
        easyEntityQuery.savable(saveBankCard).executeCommand();
        return "ok";
    }


com.easy.query.core.exception.EasyQueryInvalidOperationException: 
The cascade of object [SaveBankCard.saveBank] is set to delete. Detaching from the current aggregate root is not allowed; this operation must be initiated by the aggregate root object [SaveBank].
```

验证了我们刚才的想法,通过值对象发起的脱钩不可以是`delete`只能是`set null`


## 银行卡和用户
银行卡和用户脱钩使用set null所以我们可以通过银行卡发起和用户的脱钩
```java

@Table("t_save_bank_card")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank_card")
public class SaveBankCard implements ProxyEntityAvailable<SaveBankCard, SaveBankCardProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String type;
    @SaveKey
    private String code;
    private String uid;
    private String bankId;

    /**
     * 所属银行
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {SaveBankCard.Fields.bankId}, targetProperty = {SaveBank.Fields.id}, cascade = CascadeTypeEnum.DELETE)
    private SaveBank saveBank;

    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {SaveBankCard.Fields.uid}, targetProperty = {SaveUser.Fields.id})
    private SaveUser saveUser;
}



    @PostMapping("/update2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update2() {
        SaveBankCard saveBankCard = easyEntityQuery.queryable(SaveBankCard.class)
                .include(save_bank_card -> save_bank_card.saveUser())
                .whereById("2")
                .singleNotNull();
        saveBankCard.setSaveUser(null);
        easyEntityQuery.savable(saveBankCard).executeCommand();
        return "ok";
    }

```

```sql

-- 第1条sql数据
SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `id` = '2'
-- 第2条sql数据
SELECT t.`id`, t.`name`, t.`age`, t.`create_time`
FROM `t_save_user` t
WHERE t.`id` IN ('u1')
-- 第3条sql数据
UPDATE `t_save_bank_card`
SET `uid` = NULL
WHERE `id` = '2'
```
我们可以清晰额看到银行卡可以发起与聚合根对象`set null`的脱钩(数据库uid可为空)