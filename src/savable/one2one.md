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

<!-- ## 主键生成器
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

``` -->

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


::: tabs

@tab 流程图
<img :src="$withBase('/images/one2onesave1.png')">

@tab 插入代码
```java

    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {
        SaveUser saveUser = new SaveUser();
        saveUser.setId("1");
        saveUser.setName("小明");
        saveUser.setAge(19);
        saveUser.setCreateTime(LocalDateTime.now());

        SaveUserExt saveUserExt = new SaveUserExt();
        saveUserExt.setId("2");
        saveUserExt.setMoney(BigDecimal.ZERO);
        saveUserExt.setHealthy(true);
        saveUser.setSaveUserExt(saveUserExt);

        SaveUserAddress saveUserAddress = new SaveUserAddress();
        saveUserAddress.setId("3");
        saveUserAddress.setProvince("浙江省");
        saveUserAddress.setCity("绍兴市");
        saveUserAddress.setArea("越城区");
        saveUserAddress.setAddress("鲁迅故居东面");
        saveUser.setSaveUserAddress(saveUserAddress);
        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab sql
```sql

INSERT INTO `t_save_user` (`id`, `name`, `age`, `create_time`)
VALUES ('1', '小明', 19, '2025-09-16 21:39:48.077398')


INSERT INTO `t_save_user_ext` (`id`, `money`, `healthy`)
VALUES ('1', 0, true)

INSERT INTO `t_save_user_addr`
        (`id`, `uid`, `province`, `city`, `area`
        , `address`)
VALUES ('3', '1', '浙江省', '绍兴市', '越城区'
        , '鲁迅故居东面')
```

:::


本次新增操作我们只对当前数据进行了主键的赋值(有主键生成器可以不赋值),并没有对数据的关系键进行赋值,但是`savable`模式可以自动帮我们识别并且复制对应的数据，如`t_save_user_addr`的`uid`属性自动赋值为`1`

注意:我们在`springboot`或者`solon`进行save操作必须要在`@EasyQueryTrack`范围内进行的查询才会被追踪，并且`include`或`loadInclude`都可以被视为用户需要被保存的路径,
`@Transactional`事务注解只需要在`savable`调用执行时进行开启事务即可,否则会进行报错,并且可以不需要包含前面的那一部分查询操作

## 一对一级联修改
修改用户年龄和修改用户地址



::: tabs

@tab 流程图
<img :src="$withBase('/images/one2onesave2.png')">

@tab 修改代码
```java

    @PostMapping("/updateAddr")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object updateAddr() {

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

@tab 生成的sql

```sql


SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = '小明'

SELECT t.`id`, t.`uid`, t.`province`, t.`city`, t.`area`
        , t.`address`
FROM `t_save_user_addr` t
WHERE t.`uid` IN ('1')

UPDATE `t_save_user`
SET `age` = 180270105
WHERE `id` = '1'

UPDATE `t_save_user_addr`
SET `address` = '鲁迅故居西面'
WHERE `id` = '3'
```

:::


- ①用户查询附带查询地址信息，告知框架本次保存路径需要检查user和address这个路径
- ②修改值对象地址信息会差异生成对应的update操作

## 一对一级联脱钩



::: tabs

@tab 流程图
<img :src="$withBase('/images/one2onesave3.png')">

@tab 对象脱钩代码

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
@tab sql
```sql
SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = '小明'

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
默认脱钩是`auto`，框架自动处理使用`set null`，所以我们对`include`路径进行赋值null则会触发目标值对象脱钩



## 值对象变更
除了将目标对象设置为null外，我们还可以通过新创建一个对象来替换原来的对象,那么原来的对象就会对聚合进行脱钩,新的对象就会和聚合根进行关联


::: tabs

@tab 流程图
<img :src="$withBase('/images/one2onesave4.png')">

@tab 变更代码

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
        saveUserAddress.setId("4");
        saveUserAddress.setProvince("浙江省");
        saveUserAddress.setCity("绍兴市");
        saveUserAddress.setArea("越城区");
        saveUserAddress.setAddress("鲁迅故居南面");
        saveUser.setSaveUserAddress(saveUserAddress);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab sql
```sql


SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`
WHERE `name` = '小明'

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
VALUES ('4', '1', '浙江省', '绍兴市', '越城区'
        , '鲁迅故居南面')

UPDATE `t_save_user_addr`
SET `uid` = NULL
WHERE `id` = '3'
```
:::

原先的地址会议`set null`的方式脱钩，新的对象以insert方式进行关联

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
WHERE `id` = '1'

UPDATE `t_save_user`
SET `age` = 1926895323
WHERE `id` = '1'
```



## 值对象所属权变更
`eq`的所属权变更支持不同聚合更之间同级对象树深度的值对象进行任意交换,来达到对象所属权变更,但是默认不允许对象所属权变更这种相对危险的操作需要用户手动允许后才可以支持

对象所属权变更相对复杂用户可以[跳转到对应的章节进行查看](/easy-query-doc/savable/ownership)