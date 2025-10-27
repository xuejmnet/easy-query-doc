---
title: One-to-One Save
order: 10
---

# One-to-One Save
One-to-one is a relatively special association relationship because one-to-one associations often have two situations:
- Table A's id and Table B's id are associated in a one-to-one correspondence
- Table A's id and Table B's non-id column are associated and then logically correspond one-to-one in the business (Table A comes first)

So are there differences in saving between these two situations? Actually, there are.

In the first situation, both are ids and primary keys, so we will consider both to be mutually aggregate roots and value objects. This means that when saving A, B as an attached table will also be saved. Conversely, when B is saved as the object, A will also be saved.

In the second situation, there are some differences from the first. When we save Table A, Table B will also be saved. When we save Table B, Table A will not be affected. What is affected is Table B's field `aid`, which will be modified to A's id, while Table A will not be affected by `savable(B)`, meaning both cannot be mutually aggregate roots and mutually value objects.

<!-- ## Primary Key Generator
```java
@Component
public class UUIDPrimaryKey implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    /**
     * If need to check if there was a previous value
     *
     * @param entity
     * @param columnMetadata
     */
    @Override
    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
        if (oldValue == null) {//Must check otherwise cannot automatically save to primary key value
            PrimaryKeyGenerator.super.setPrimaryKey(entity, columnMetadata);
        }
    }
}

``` -->

::: tabs
@tab Relationship Diagram

<img :src="$withBase('/images/save121.png')">

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
     * User extra information
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveUserExt.Fields.id})
    private SaveUserExt saveUserExt;

    /**
     * User address information
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveUserAddress.Fields.uid})
    private SaveUserAddress saveUserAddress;
}
```
@tab SaveUserExt
```java

@Table("t_save_user_ext")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_user_ext")
public class SaveUserExt implements ProxyEntityAvailable<SaveUserExt , SaveUserExtProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private BigDecimal money;
    private Boolean healthy;


    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {Fields.id}, targetProperty = {SaveUser.Fields.id})
    private SaveUser saveUser;

    /**
     * User address
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUserExt.Fields.id}, targetProperty = {SaveUserAddress.Fields.uid})
    private SaveUserAddress saveUserAddress;
}
```
@tab SaveUserAddress
```java

@Table("t_save_user_addr")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_user_addr")
public class SaveUserAddress implements ProxyEntityAvailable<SaveUserAddress , SaveUserAddressProxy>{
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String uid;
    private String province;
    private String city;
    private String area;
    private String address;

    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {Fields.uid}, targetProperty = {SaveUser.Fields.id})
    private SaveUser saveUser;

    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {Fields.uid}, targetProperty = {SaveUserExt.Fields.id})
    private SaveUserExt saveUserExt;
}
```

:::

We have defined 3 objects respectively, which are primary key to primary key one-to-one, and primary key to non-primary key one-to-one.


::: tip Note!!!
> Save can only be initiated by aggregate root objects, then value objects will judge whether they need to modify or delete value objects under the aggregate root. It cannot initiate save from value objects to affect the aggregate root
:::



- Here, with `SaveUser` as the aggregate root for save, then `SaveUserExt` and `SaveUserAddress` are value objects that can be saved
- With `SaveUserExt` as the aggregate root for save, then `SaveUser` and `SaveUserAddress` are value objects that can be saved
- With `SaveUserAddress` as the aggregate root, then `SaveUser` and `SaveUserAddress` will not be modified or saved

Why is `SaveUser` the aggregate root in the `SaveUser->SaveUserExt` path? Because the condition for judging aggregate root is whether the association relationship `selfProperty` are all the primary keys of the current object. If `selfProperty` are all the primary keys of the current object, then the current object is the aggregate root, and the target object is a value object.



::: danger Note!!!
> `savable` requires that `@EasyQueryTrack` and transactions must be enabled. Enable tracking to facilitate modification data so that the framework can sense modification paths. Transactions are required because `savable` often involves multiple tables, so transactions must be enabled. Internally, it will check whether transactions are enabled
:::

## One-to-One Insert Save


::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2onesave1.png')">

@tab Insert Code
```java

    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {
        SaveUser saveUser = new SaveUser();
        saveUser.setId("1");
        saveUser.setName("XiaoMing");
        saveUser.setAge(19);
        saveUser.setCreateTime(LocalDateTime.now());

        SaveUserExt saveUserExt = new SaveUserExt();
        saveUserExt.setId("2");
        saveUserExt.setMoney(BigDecimal.ZERO);
        saveUserExt.setHealthy(true);
        saveUser.setSaveUserExt(saveUserExt);

        SaveUserAddress saveUserAddress = new SaveUserAddress();
        saveUserAddress.setId("3");
        saveUserAddress.setProvince("Zhejiang Province");
        saveUserAddress.setCity("Shaoxing City");
        saveUserAddress.setArea("Yuecheng District");
        saveUserAddress.setAddress("East of Lu Xun's Former Residence");
        saveUser.setSaveUserAddress(saveUserAddress);
        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab sql
```sql

INSERT INTO `t_save_user` (`id`, `name`, `age`, `create_time`)
VALUES ('1', 'XiaoMing', 19, '2025-09-16 21:39:48.077398')


INSERT INTO `t_save_user_ext` (`id`, `money`, `healthy`)
VALUES ('1', 0, true)

INSERT INTO `t_save_user_addr`
        (`id`, `uid`, `province`, `city`, `area`
        , `address`)
VALUES ('3', '1', 'Zhejiang Province', 'Shaoxing City', 'Yuecheng District'
        , 'East of Lu Xun's Former Residence')
```

:::


For this insert operation, we only assigned primary keys to the current data (can be omitted if there's a primary key generator), and did not assign data relationship keys, but the `savable` mode can automatically help us identify and copy corresponding data, such as the `uid` property of `t_save_user_addr` is automatically assigned to `1`.

Note: Our save operations in `springboot` or `solon` must be performed within the `@EasyQueryTrack` scope for queries to be tracked, and both `include` and `loadInclude` can be considered as paths that the user needs to be saved.
The `@Transactional` transaction annotation only needs to enable transactions when calling `savable` execution, otherwise it will report an error, and it doesn't need to include the previous query operation.

## One-to-One Cascade Modification
Modify user age and modify user address



::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2onesave2.png')">

@tab Modification Code
```java

    @PostMapping("/updateAddr")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object updateAddr() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("XiaoMing");
                })
                .include(save_user -> save_user.saveUserAddress()) //①
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        SaveUserAddress saveUserAddress = saveUser.getSaveUserAddress();
        saveUserAddress.setAddress("West of Lu Xun's Former Residence");//②

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```

@tab Generated SQL

```sql


SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = 'XiaoMing'

SELECT t.`id`, t.`uid`, t.`province`, t.`city`, t.`area`
        , t.`address`
FROM `t_save_user_addr` t
WHERE t.`uid` IN ('1')

UPDATE `t_save_user`
SET `age` = 180270105
WHERE `id` = '1'

UPDATE `t_save_user_addr`
SET `address` = 'West of Lu Xun's Former Residence'
WHERE `id` = '3'
```

:::


- ① User query with address information query, telling the framework that this save path needs to check the user and address path
- ② Modifying the value object address information will generate corresponding update operation with difference

## One-to-One Cascade Dissociation



::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2onesave3.png')">

@tab Object Dissociation Code

```java

    @PostMapping("/remove1")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object remove1() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("XiaoMing");
                })
                .include(save_user -> save_user.saveUserAddress())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        saveUser.setSaveUserAddress(null);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab sql
```sql
SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = 'XiaoMing'

SELECT t.`id`, t.`uid`, t.`province`, t.`city`, t.`area`
        , t.`address`
FROM `t_save_user_addr` t
WHERE t.`uid` IN ('1')

UPDATE `t_save_user`
SET `age` = 1077657513
WHERE `id` = '1'

UPDATE `t_save_user_addr`
SET `uid` = NULL
WHERE `id` = '3'
```

:::
Default dissociation is `auto`. The framework handles automatically using `set null`, so we assign null to the `include` path to trigger target value object dissociation.



## Value Object Change
Besides setting the target object to null, we can also replace the original object by creating a new object. Then the original object will dissociate from the aggregate, and the new object will associate with the aggregate root.


::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/one2onesave4.png')">

@tab Change Code

```java

    @PostMapping("/change1")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object change1() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("XiaoMing");
                })
                .include(save_user -> save_user.saveUserAddress())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        SaveUserAddress saveUserAddress = new SaveUserAddress();
        saveUserAddress.setId("4");
        saveUserAddress.setProvince("Zhejiang Province");
        saveUserAddress.setCity("Shaoxing City");
        saveUserAddress.setArea("Yuecheng District");
        saveUserAddress.setAddress("South of Lu Xun's Former Residence");
        saveUser.setSaveUserAddress(saveUserAddress);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab sql
```sql


SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = 'XiaoMing'

SELECT t.`id`, t.`uid`, t.`province`, t.`city`, t.`area`
        , t.`address`
FROM `t_save_user_addr` t
WHERE t.`uid` IN ('1')

UPDATE `t_save_user`
SET `age` = 148600114
WHERE `id` = '1'

INSERT INTO `t_save_user_addr`
        (`id`, `uid`, `province`, `city`, `area`
        , `address`)
VALUES ('4', '1', 'Zhejiang Province', 'Shaoxing City', 'Yuecheng District'
        , 'South of Lu Xun's Former Residence')

UPDATE `t_save_user_addr`
SET `uid` = NULL
WHERE `id` = '3'
```
:::

The original address will dissociate in a `set null` manner, and the new object will associate in an insert manner

## Primary Key Dissociation
```java

    @PostMapping("/remove2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object remove2() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("XiaoMing");
                })
                .include(save_user -> save_user.saveUserExt())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        saveUser.setSaveUserExt(null);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
Error: The framework will check if the target object is dissociating and mutually an aggregate root, then `set null` dissociation is not allowed
```java
com.easy.query.core.exception.EasyQueryInvalidOperationException: entity:[SaveUser.saveUserExt] targetProperty has key props,cascade cant use set null
```


## Primary Key Dissociate Delete
We change the dissociation method to `delete` and try again
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
     * User extra information
     **/
    @Navigate(value = RelationTypeEnum.OneToOne,
            selfProperty = {SaveUser.Fields.id},
            targetProperty = {SaveUserExt.Fields.id},
            cascade = CascadeTypeEnum.DELETE)//Modify to cascade delete
    private SaveUserExt saveUserExt;

    /**
     * User address information
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveUserAddress.Fields.uid})
    private SaveUserAddress saveUserAddress;
}

```
You can see that `SaveUserExt` can be deleted correctly
```sql
DELETE FROM `t_save_user_ext`
WHERE `id` = '1'

UPDATE `t_save_user`
SET `age` = 1926895323
WHERE `id` = '1'
```



## Value Object Ownership Change
`eq`'s ownership change supports arbitrary exchange of value objects of the same object tree depth between different aggregate roots, to achieve object ownership change. However, by default, object ownership change, which is a relatively dangerous operation, is not allowed and needs to be manually allowed by the user.

Object ownership change is relatively complex. Users can [jump to the corresponding chapter to view](/easy-query-doc/savable/ownership)

