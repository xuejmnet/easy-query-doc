---
title: One-to-Many Save
order: 20
---

# One-to-Many Save
A frequently used master-detail structure table. For updating master-detail structure tables, without a good change save mechanism, it's common to delete and then re-add detail table records. However, if the detail table's id participates in business logic, this kind of save becomes inappropriate. For this kind of master-detail structure, `eq`'s `savable` can easily handle it.

::: tabs
@tab Relationship Diagram

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
     * Bank cards owned by user
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
     * Bank cards issued by bank
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

This is a very common case of two aggregate roots `User->BankCard` and `Bank->BankCard` with the same value object. However, `User` and `BankCard` are not a true aggregate root and value object relationship, because `BankCard` will not be deleted after dissociating from `User`, but `BankCard` will be deleted after dissociating from `Bank`. So when configuring, we can choose `cascade = CascadeTypeEnum.DELETE`

## One-to-Many Creation


::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2manysave1.png')">

@tab Create Object

```java

    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {

        SaveBank saveBank = new SaveBank();
        saveBank.setId("1");
        saveBank.setName("ICBC");
        saveBank.setAddress("City Plaza No. 1");
        ArrayList<SaveBankCard> saveBankCards = new ArrayList<>();
        saveBank.setSaveBankCards(saveBankCards);
        SaveBankCard card1 = new SaveBankCard();
        card1.setId("2");
        card1.setType("Savings Card");
        card1.setCode("123");
        saveBankCards.add(card1);
        SaveBankCard card2 = new SaveBankCard();
        card1.setId("3");
        card2.setType("Credit Card");
        card2.setCode("456");
        saveBankCards.add(card2);

        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
@tab sql

```sql

-- SQL statement 1
INSERT INTO `t_save_bank` (`id`, `name`, `address`)
VALUES ('1', 'ICBC', 'City Plaza No. 1')
-- SQL statement 2
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('2', 'Savings Card', '123', '1')
-- SQL statement 3
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('3', 'Credit Card', '456', '1')
```

:::

Just load the child table data into the corresponding object collection, then the framework save will automatically handle its association relationship values. Users don't need to manually assign values.

## Detail Table Differential Update

Query directly by existing id, then build new objects and put them inside the list to replace the tracked saveBank.



::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2manysave2.png')">

@tab Modification DTO
```java


/**
 * create time 2025/9/18 22:12
 * {@link com.eq.doc.domain.save.SaveBank}
 *
 * @author xuejiaming
 */
@Data
@SuppressWarnings("EasyQueryFieldMissMatch")
public class BankUpdateRequest {
    private String id;
    private String name;
    private String address;

    /**
     * Bank cards issued by bank
     **/
    private List<InternalSaveBankCards> saveBankCards;


    /**
     * {@link com.eq.doc.domain.save.SaveBankCard}
     **/
    @Data
    public static class InternalSaveBankCards {
        private String id;
        private String type;
        private String code;
    }
}
```
@tab Request JSON
```json
{
    "id":"1",
    "name": "ICBC",
    "address":"City Plaza No. 2",
    "saveBankCards":[
        {
            "id":"2",
            "type":"Savings Card",
            "code":"1234"
        },

        {
            "id":"4",
            "type":"Credit Card",
            "code":"98765"
        }
    ]
}
```
@tab API Code
```java

    @PostMapping("/update")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update(@RequestBody BankUpdateRequest request) {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();
        
        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        Set<String> requestIds = request.getSaveBankCards().stream().map(o -> o.getId()).filter(o -> o != null).collect(Collectors.toSet());
        //Remove bank cards that are not needed
        saveBank.getSaveBankCards().removeIf(o -> !requestIds.contains(o.getId()));
        Map<String, SaveBankCard> bankCardMap = saveBank.getSaveBankCards().stream().collect(Collectors.toMap(o -> o.getId(), o -> o));
        ArrayList<SaveBankCard> newCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard dbBankCard = bankCardMap.get(saveBankCard.getId());
            if(dbBankCard==null){
                SaveBankCard bankCard = new SaveBankCard();
                bankCard.setId(saveBankCard.getId());
                bankCard.setType(saveBankCard.getType());
                bankCard.setCode(saveBankCard.getCode());
                newCards.add(bankCard);
            }else{
                dbBankCard.setType(saveBankCard.getType());
                dbBankCard.setCode(saveBankCard.getCode());
            }
        }
        saveBank.getSaveBankCards().addAll(newCards);

        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
@tab sql
```sql

-- SQL statement 1
DELETE FROM `t_save_bank_card`
WHERE `id` = '3'
-- SQL statement 2
UPDATE `t_save_bank`
SET `address` = 'City Plaza No. 2'
WHERE `id` = '1'
-- SQL statement 3
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('4', 'Credit Card', '98765', '1')
-- SQL statement 4
UPDATE `t_save_bank_card`
SET `code` = '1234'
WHERE `id` = '2'
```
:::

The framework correctly handled the child table `BankCard`, correctly perceiving which bank card information needs to be deleted and which needs to be added.

Although the framework correctly handled this operation, the user implementation is still somewhat troublesome. Next, let's implement it in a simpler way. The request object and request JSON remain unchanged. We change the API interface as follows:
```java

    @PostMapping("/update2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update2(@RequestBody BankUpdateRequest request) {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();

        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        ArrayList<SaveBankCard> requestBankCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard bankCard = new SaveBankCard();
            bankCard.setId(saveBankCard.getId());//①Current handling is improper, specific situation below
            bankCard.setType(saveBankCard.getType());
            bankCard.setCode(saveBankCard.getCode());
            requestBankCards.add(bankCard);
        }
        saveBank.setSaveBankCards(requestBankCards);
        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
```sql

SELECT `id`, `name`, `address`
FROM `t_save_bank`
WHERE `id` = '1'

SELECT t.`id`, t.`type`, t.`code`, t.`uid`, t.`bank_id`
FROM `t_save_bank_card` t
WHERE t.`bank_id` IN ('1')

DELETE FROM `t_save_bank_card`
WHERE `id` = '3'

UPDATE `t_save_bank`
SET `address` = 'City Plaza No. 2'
WHERE `id` = '1'

UPDATE `t_save_bank_card`
SET `code` = '1234'
WHERE `id` = '2'
```
Create the child table that should be saved through the request interface, then merge it differentially into the navigation property through `mergeCollection`, and then through `savable` can generate the save commands needed this time differentially.

The first two SQLs query through `includes`, and the last three SQLs process differentially through `savable`.


::: warning Note!!!
> ① We are not sure whether the frontend will actually pass the correct id, so it should not be inserted directly. Other means should be used to verify whether the current id is correct. [Please see how to set the correct save primary key](/easy-query-doc/savable/set-save-key)
:::

::: danger Note!!!
> In `savable`, if the object is modified, the tracked object must be used, and the user's own new object cannot be used.
:::

## Business Key One-to-Many Save
Sometimes when we save one-to-many, we may use non-business ids as the "unique" key for saving, rather than primary keys. Of course, this uniqueness is not unique within the database. The framework considers it non-repeating for this value object under the aggregate root, but repetition is still allowed across aggregate roots.

The relationship between user and bank card is one-to-many. When we save this relationship, we can completely use the bank card number as the key to implement interaction using bank card code instead of id during save. This is also a method.


## SaveKey
The role of `SaveKey` is that when saving data, if the user does not provide primary key information, the user can find the corresponding original record according to the `SaveKey` marked by the entity, thereby achieving that the `SaveKey` under the same aggregate root is also unique at the logical level.

::: danger Note!!!
> The value of `SaveKey` cannot be null (default). Specifically based on `RelationValueFactory`, users can also set that it cannot be empty or dash values
> `SaveKey` within navigation properties of an aggregate root is not allowed to be duplicated
:::

Modify the bank card entity, add `SaveKey`
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
    @SaveKey
    private String code;
    private String uid;
    private String bankId;
}
```

### Save User Bank Card
```java

    @PostMapping("/createUser")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object createUser() {

        SaveUser saveUser = new SaveUser();
        saveUser.setId("1");
        saveUser.setName("XiaoMing");
        saveUser.setAge(20);
        List<SaveBankCard> saveBankCards = easyEntityQuery.queryable(SaveBankCard.class)
                .whereByIds(Arrays.asList("2", "3"))
                .toList();
        saveUser.setSaveBankCards(saveBankCards);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
```sql
-- SQL statement 1
SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `id` IN ('2', '3')
-- SQL statement 2
INSERT INTO `t_save_user` (`id`, `name`, `age`)
VALUES ('1', 'XiaoMing', 20)
-- SQL statement 3
UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '2'
-- SQL statement 4
UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '3'
```

### Request to Change User Bank Card
When uploading the request, don't pass the existing bank card id (of course in actual business we definitely pass the bank card id), only pass the code, which is the bank card number, to handle one-to-many save.

- First query the current user and include query of the user's bank card information
- Query the requested bank card information, then set and replace the user's bank card
- Save the framework will automatically compare based on differential data to generate differential SQL to implement save function
::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2manysave3.png')">

@tab DTO
```java

/**
 * create time 2025/9/18 22:12
 * {@link com.eq.doc.domain.save.SaveUser}
 *
 * @author xuejiaming
 */
@Data
@SuppressWarnings("EasyQueryFieldMissMatch")
public class UserUpdateRequest {
    private String id;
    private String name;
    private Integer age;

    /**
     * Bank cards issued by bank
     **/
    private List<InternalSaveBankCards> saveBankCards;


    /**
     * {@link com.eq.doc.domain.save.SaveBankCard}
     **/
    @Data
    public static class InternalSaveBankCards {
        private String code;
    }
}
```
@tab API
```java

    @PostMapping("/update3")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update3(@RequestBody UserUpdateRequest request) {
        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .includes(save_user -> save_user.saveBankCards())
                .singleNotNull();

        saveUser.setName(request.getName());
        saveUser.setAge(request.getAge());
        List<String> codes = request.getSaveBankCards().stream().map(o -> o.getCode()).toList();
        List<SaveBankCard> requestBankCards = easyEntityQuery.queryable(SaveBankCard.class)
                .where(save_bank_card -> {
                    save_bank_card.code().in(codes);
                }).toList();

        saveUser.setSaveBankCards(requestBankCards);
        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab JSON
```json
{
    "id":"1",
    "name": "XiaoMing",
    "age": 20,
    "saveBankCards":[
        {
            "type":"Savings Card",
            "code":"123"
        },

        {
            "type":"Credit Card",
            "code":"789"
        }
    ]
}
```
@tab sql
```sql

SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`

SELECT t.`id`, t.`type`, t.`code`, t.`uid`, t.`bank_id`
FROM `t_save_bank_card` t
WHERE t.`uid` IN ('1')

SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `code` IN ('123', '789')

UPDATE `t_save_bank_card`
SET `uid` = NULL
WHERE `id` = '3'

UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '4'
```

:::


This time we found that the framework can correctly reflect adding one `code:789` and then dissociating `code:456`. But users will find a problem. Actually, we should drive with bank card as the aggregate root. Bank card chooses user instead of user as aggregate root choosing bank card.

## Mapping Table One-to-Many Save
In the user-role many-to-many model structure, `eq` also supports defining one-to-many relationships, such as `user->user_role`. This kind of one-to-many is because many-to-many in a sense is two one-to-many pointing to the same mapping table, so we can implement corresponding differential save by directly handling the mapping table relationship.

Converting many-to-many relationships to one-to-many saves can make saving perform better than using many-to-many completely. For specific content, please [jump to the many-to-many chapter to view](/easy-query-doc/savable/many2many)

