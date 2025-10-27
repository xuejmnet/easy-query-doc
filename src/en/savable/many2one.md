---
title: Many-to-One Save
order: 30
---

 # Many-to-One Save
 Many-to-one save is a special save. `savable` needs to pass the aggregate root, but many-to-one save uses the value object as the aggregate root, so many-to-one will not modify the navigation property, only perform value assignment and modification to the field of navigation association on the navigation property.

 Many-to-one does not allow operating on navigation properties during savable, nor does it allow dissociating navigation properties. Dissociation must be initiated by the aggregate root object, not by the value object.


::: danger Note!!!
> `ManyToOne` basically is initiated by value objects, with the target object being the aggregate root of the current object, so only dissociation or association operations will be triggered. And dissociation operations can only be `set null`, so saves in this mode basically only trigger `update`
> The aggregate root of the value object must exist in the current tracking context and cannot be a manually constructed aggregate root
:::


## Bank Card and Bank
Because bankId is non-null in the database by default, when bank card and bank dissociate, cascade can only be set to delete. However, aggregate root and value object dissociation can only be initiated by the aggregate root. Value object-initiated dissociation can only be set to null, so dissociation between bank card and bank cannot be initiated through bank card.


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
     * Bank to which it belongs
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

This verifies our earlier idea. Value object-initiated dissociation cannot be `delete`, only `set null`.


## Bank Card and User
Bank card and user dissociation uses set null, so we can initiate dissociation from user through bank card
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
     * Bank to which it belongs
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

-- SQL statement 1
SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `id` = '2'
-- SQL statement 2
SELECT t.`id`, t.`name`, t.`age`, t.`create_time`
FROM `t_save_user` t
WHERE t.`id` IN ('u1')
-- SQL statement 3
UPDATE `t_save_bank_card`
SET `uid` = NULL
WHERE `id` = '2'
```
We can clearly see that bank card can initiate `set null` dissociation with the aggregate root object (database uid can be null)

