---
title: 一对一保存
order: 10
---

# 一对一保存
一对一是一个比较特殊的关联关系，因为一对一的关联关系往往有两种情况
- A表的id和B表的id作为关联一一对应
- A表的id和B表的非id列作为关联然后业务上逻辑一一对应(先有A表)

那么这两种情况再保存上是否有差异呢?其实是有的

第一种情况两者都是id都是主键，那么我们将认为两者互为聚合根，互为值对象。意思就是当保存A的时候B作为附带表也会被保存,反之B作为保存对象是A也会被保存

第二种情况和第一种情况有一些差异，当我们保持A表时B表也会被保存,当我们保存B表是A表将不受影响，受影响的B表的字段`aid`他会被修改为A的id,而A表不会因为`savable(B)`受影响，即两者无法互为聚合根、互为值对象


## 主键生成器
```java
@Component
public class UUIDPrimaryKey implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    /**
     * 如果需要判断之前是否有值
     *
     * @param entity
     * @param columnMetadata
     */
    @Override
    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
        if (oldValue == null) {//必须判断不然无法自动save给主键值
            PrimaryKeyGenerator.super.setPrimaryKey(entity, columnMetadata);
        }
    }
}

```

::: tabs
@tab 关系图

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
     * 用户额外信息
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveUserExt.Fields.id})
    private SaveUserExt saveUserExt;

    /**
     * 用户地址信息
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
     * 用户地址
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

我们分别定义了3个对象,分别是主键和主键一对一，主键和非主键一对一


::: tip 说明!!!
> 保存只能是由聚合根对象发起保存，然后值对象会判断是否需要修改或删除聚合根下面的值对象，无法以值对象发起保存影响聚合根
:::



- 这边以`SaveUser`作为聚合根保存那么`SaveUserExt`和`SaveUserAddress`就是值对象可以被保存
- 以`SaveUserExt`作为聚合根保存那么`SaveUser`和`SaveUserAddress`就是值对象可以被保存
- 以`SaveUserAddress`作为聚合根那么`SaveUser`和`SaveUserAddress`不会被修改保存

为什么`SaveUser->SaveUserExt`这个路径里面`SaveUser`是聚合根,因为判断聚合根的条件是关联关系`selfProperty`是否都是当前对象的主键,如果`selfProperty`都是当前对象的主键那么当前对象就是聚合根，目标对象就是值对象



::: danger 说明!!!
> `savable`要求必须开启`@EasyQueryTrack`和事务,开启追踪便于修改数据让框架感知修改路径，事务因为`savable`往往伴随多表所以必须要开启事务内部会检查事务是否开启
:::

## 一对一新增保存
```java


    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {
        SaveUser saveUser = new SaveUser();
        saveUser.setName("小明");
        saveUser.setAge(19);
        saveUser.setCreateTime(LocalDateTime.now());

        SaveUserExt saveUserExt = new SaveUserExt();
        saveUserExt.setMoney(BigDecimal.ZERO);
        saveUserExt.setHealthy(true);
        saveUser.setSaveUserExt(saveUserExt);

        SaveUserAddress saveUserAddress = new SaveUserAddress();
        saveUserAddress.setProvince("浙江省");
        saveUserAddress.setCity("绍兴市");
        saveUserAddress.setArea("越城区");
        saveUserAddress.setAddress("鲁迅故居东面");
        saveUser.setSaveUserAddress(saveUserAddress);
        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }

```

生成的sql
```sql
-- 第1条sql数据
INSERT INTO `t_save_user` (`id`, `name`, `age`, `create_time`)
VALUES ('e3df533d738c4ea3be968911aec9b9cf', '小明', 19, '2025-09-14 15:20:47.843232')
-- 第2条sql数据
INSERT INTO `t_save_user_ext` (`id`, `money`, `healthy`)
VALUES ('e3df533d738c4ea3be968911aec9b9cf', 0, true)
-- 第3条sql数据
INSERT INTO `t_save_user_addr`
	(`id`, `uid`, `province`, `city`, `area`, `address`)
VALUES ('592df120e0a0496ca2b494e62b8f09a7', 'e3df533d738c4ea3be968911aec9b9cf', '浙江省', '绍兴市', '越城区'
	, '鲁迅故居东面')
```

## 一对一级联修改
修改用户年龄和删除用户地址
```java

    @PostMapping("/updateRemove")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object updateRemove() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("小明");
                })
                .include(save_user -> save_user.saveUserAddress()) //①
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        SaveUserAddress saveUserAddress = saveUser.getSaveUserAddress();
        saveUserAddress.setAddress("鲁迅故居西面");//②

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
查看本次操作sql
```sql

UPDATE `t_save_user`
SET `age` = 38205492
WHERE `id` = 'e3df533d738c4ea3be968911aec9b9cf'

UPDATE `t_save_user_addr`
SET `address` = '鲁迅故居西面'
WHERE `id` = '592df120e0a0496ca2b494e62b8f09a7'
```

- ①用户查询附带查询地址信息，告知框架本次保存路径需要检查user和address这个路径
- ②修改值对象地址信息会差异生成对应的update操作

## 一对一级联脱钩
```java

    @PostMapping("/remove1")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object remove1() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("小明");
                })
                .include(save_user -> save_user.saveUserAddress())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        saveUser.setSaveUserAddress(null);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
默认脱钩是`auto`，框架自动处理使用`set null`，所以我们对`include`路径进行赋值null则会触发目标值对象脱钩
```sql

UPDATE `t_save_user`
SET `age` = 1171348678
WHERE `id` = 'e3df533d738c4ea3be968911aec9b9cf'

UPDATE `t_save_user_addr`
SET `uid` = NULL
WHERE `id` = '592df120e0a0496ca2b494e62b8f09a7'
```

## 值对象变更
```java

    @PostMapping("/change1")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object change1() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("小明");
                })
                .include(save_user -> save_user.saveUserAddress())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        SaveUserAddress saveUserAddress = new SaveUserAddress();
        saveUserAddress.setProvince("浙江省");
        saveUserAddress.setCity("绍兴市");
        saveUserAddress.setArea("越城区");
        saveUserAddress.setAddress("鲁迅故居南面");
        saveUser.setSaveUserAddress(saveUserAddress);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
原先的地址会议`set null`的方式脱钩，新的对象以insert方式进行关联
```sql

UPDATE `t_save_user`
SET `age` = -1404610882
WHERE `id` = 'd914e2cf30d543729126140e1217664d'

INSERT INTO `t_save_user_addr`
	(`id`, `uid`, `province`, `city`, `area`
	, `address`)
VALUES ('06a0cbb5b8b443d7b0324c6f63335550', 'd914e2cf30d543729126140e1217664d', '浙江省', '绍兴市', '越城区'
	, '鲁迅故居南面')
    
UPDATE `t_save_user_addr`
SET `uid` = NULL
WHERE `id` = 'b83cc1fce82f48d0867324777180a1c6'
```

## 主键脱钩
```java

    @PostMapping("/remove2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object remove2() {

        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .where(save_user -> {
                    save_user.name().eq("小明");
                })
                .include(save_user -> save_user.saveUserExt())
                .singleNotNull();
        saveUser.setAge(new Random().nextInt());
        saveUser.setSaveUserExt(null);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
报错框架会检查如果目标对象脱钩且互为聚合根的情况下则不允许`set null`脱钩方式
```java
com.easy.query.core.exception.EasyQueryInvalidOperationException: entity:[SaveUser.saveUserExt] targetProperty has key props,cascade cant use set null
```


## 主键脱钩删除
我们将脱钩方式改成`delete`再次尝试
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
     * 用户额外信息
     **/
    @Navigate(value = RelationTypeEnum.OneToOne,
            selfProperty = {SaveUser.Fields.id},
            targetProperty = {SaveUserExt.Fields.id},
            cascade = CascadeTypeEnum.DELETE)//修改为级联删除
    private SaveUserExt saveUserExt;

    /**
     * 用户地址信息
     **/
    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveUserAddress.Fields.uid})
    private SaveUserAddress saveUserAddress;
}

```
可以看到`SaveUserExt`可以被正确的删除
```sql
DELETE FROM `t_save_user_ext`
WHERE `id` = '356645d67b924614bbdc20c4aa495b6e'

UPDATE `t_save_user`
SET `age` = 1926895323
WHERE `id` = '356645d67b924614bbdc20c4aa495b6e'
```


## 值对象所属权变更
```java

    @PostMapping("/create2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create2() {
        ArrayList<SaveUser> users = new ArrayList<>();
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("小明1的id");
            saveUser.setName("小明1");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("小明1的家的id");
            saveUserAddress.setProvince("浙江省");
            saveUserAddress.setCity("绍兴市");
            saveUserAddress.setArea("越城区");
            saveUserAddress.setAddress("小明1的家");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("小明2的id");
            saveUser.setName("小明2");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("小明2的家的id");
            saveUserAddress.setProvince("浙江省");
            saveUserAddress.setCity("绍兴市");
            saveUserAddress.setArea("越城区");
            saveUserAddress.setAddress("小明2的家");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        easyEntityQuery.savable(users).executeCommand();
        return "ok";
    }


    @PostMapping("/change2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object change2() {

        List<SaveUser> list = easyEntityQuery.queryable(SaveUser.class)
                .include(save_user -> save_user.saveUserAddress())
                .toList();
        SaveUser xm1 = list.get(0);
        SaveUserAddress xm1address = xm1.getSaveUserAddress();
        SaveUser xm2 = list.get(1);
        SaveUserAddress xm2address = xm2.getSaveUserAddress();
        xm1.setSaveUserAddress(xm2address);
        xm2.setSaveUserAddress(xm1address);

        easyEntityQuery.savable(list).executeCommand();
        return "ok";
    }
```
新增小明1和小明2两个对象,分别交换两个用户地址
```java
com.easy.query.core.exception.EasyQueryInvalidOperationException: relation value not equals,entity:[SaveUserAddress],property:[uid],value:[b8aefc1c7ef040379839d26af91765d3],should:[8f5a841478164e97b09db58107ace085]. Current OwnershipPolicy does not allow reassignment.
```
提示错误无法变更对象所有权,框架为了保证数据的误操作和正确性默认不允许用户变更对象的所有权,也就是值对象无法轻易变更所属的聚合根,我们可以通过配置让框架支持所有权变更
```java
easyEntityQuery.savable(list).ownershipPolicy(OwnershipPolicyEnum.AllowOwnershipChange).executeCommand();
```
通过添加`ownershipPolicy(OwnershipPolicyEnum.AllowOwnershipChange)`让框架支持值对象所有权的变更
```sql

UPDATE `t_save_user_addr`
SET `uid` = '小明1的id'
WHERE `id` = '小明2的家的id'

UPDATE `t_save_user_addr`
SET `uid` = '小明2的id'
WHERE `id` = '小明1的家的id'

```