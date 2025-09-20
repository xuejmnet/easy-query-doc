---
title: 聚合根保存
---

# 聚合根保存

`eq`在`3.1.21`后实现了聚合根保存模式,能够在`track`模式下实现对聚合根对象的记录变更和对应的值对象的差异变更,实现用户无感轻松实现保存完整对象树

聚合根保存能带来什么好处

用干净整洁的代码换来复杂的关系数据保存


[本章节demo请点击链接](https://github.com/xuejmnet/eq-doc) https://github.com/xuejmnet/eq-doc

## 聚合根保存流程

<img  :src="$withBase('/images/save-flow.png')">



## 概念
在开始进入聚合根保存前我们需要先了解几个概念

### 聚合根
`a`和`b`两张表用`a`的主键去关联`b`那么`a`就是聚合根，`b`就是值对象
一句话用自己的主键作为关联关系，那么自己就是聚合根而目标导航就是值对象或者其他

### 值对象
`a`和`b`两张表用`a`的主键去关联`b`那么`a`就是聚合根，`b`就是值对象
当前对象的关联导航targetProperty为目标表的主键，那么当前表就是目标表的值对象

值对象有两种
- 级联为null，这种值对象不会继续递归遍历下级导航属性,这种值对象在聚合根保存的时候只有update 关联键的份永远不会出现`insert`和`delete`
- 级联删除,这种值对象是真正的值对象,是被当前聚合根驱动，并且会往下遍历导航属性，并且存在`insert`，`update`，`delete`三种状态


### 其他关系

非主键比如其他column进行两张表之间关联,或者是多对多无中间表又或者是path路径左匹配这种我们认为是其他关系

## 级联脱钩选项
`@Navigate`的属性`cascade`拥有如下几种枚举

类型  | 功能  
---  | --- 
AUTO  | 涉及到对象脱钩操作，系统自动处理，默认采用`set null`,如果是多对多操作中间表则无法确定需要用户自行处理
NO_ACTION  | 脱钩不做任何处理用户自行处理
SET_NULL  | 脱钩处理设置targetProperty为null,对目标记录不进行删除
DELETE | 脱钩处理设置时将目标对象删除比如`user`和`user_role`和`role`那么`user_role`可以设置为`delete`


## savable能带来什么

在没有savable的时候我们创建多对多关系需要创建user，user_role,role,并且需要对user的id赋值然后给role的id赋值，给user_role的userId和roleId赋值，这是新增需要考虑的

如果是修改则需要找出哪些需要新增，哪些需要删除，哪些需要修改，甚至如果暴力一点只能把user_role全部删除然后重新新增，但是这样会导致user_role的id变更掉，假如user_role是一张带有业务字段的中间表则这种删除后新增的方式将不再适用

有了save后我们可以怎么做呢
```java

    private final EasyEntityQuery easyEntityQuery;
    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {
        ArrayList<SysRole> sysRoles = new ArrayList<>();
        {

            SysRole sysRole = new SysRole();
            sysRole.setName("管理员");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {

            SysRole sysRole = new SysRole();
            sysRole.setName("游客");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        SysUser sysUser = new SysUser();
        sysUser.setName("小明");
        sysUser.setAge(18);
        sysUser.setCreateTime(LocalDateTime.now());
        sysUser.setSysRoleList(sysRoles);

        easyEntityQuery.savable(sysRoles).executeCommand();
        easyEntityQuery.savable(sysUser).executeCommand();
        return "ok";
    }
```

我们只需要创建user和role，然后分别对其进行保存即可,我们来看生成的sql
```sql
 ==> Preparing: INSERT INTO `t_role` (`id`,`name`,`create_time`) VALUES (?,?,?)
 ==> Parameters: 1a4c554e4b8b4cff81c87d9298b853ed(String),管理员(String),2025-09-11T22:35:31.143878(LocalDateTime)
 ==> Preparing: INSERT INTO `t_role` (`id`,`name`,`create_time`) VALUES (?,?,?)
 ==> Parameters: bb9278911ecb4fe19c8a41a4e26a7c06(String),游客(String),2025-09-11T22:35:31.143909(LocalDateTime)

 ==> Preparing: INSERT INTO `t_user` (`id`,`name`,`age`,`create_time`) VALUES (?,?,?,?)
 ==> Parameters: 2164d097983b4874859b01ef02f53340(String),小明(String),18(Integer),2025-09-11T22:35:31.143932(LocalDateTime)

 ==> Preparing: INSERT INTO `t_user_role` (`id`,`user_id`,`role_id`) VALUES (?,?,?)
 ==> Parameters: b588a3ce9c72484fba366ce7288d8f5c(String),2164d097983b4874859b01ef02f53340(String),1a4c554e4b8b4cff81c87d9298b853ed(String)
 ==> Preparing: INSERT INTO `t_user_role` (`id`,`user_id`,`role_id`) VALUES (?,?,?)
 ==> Parameters: 91b39127ba5d499f9cde6a326a49a71d(String),2164d097983b4874859b01ef02f53340(String),bb9278911ecb4fe19c8a41a4e26a7c06(String)
```

<!-- 

### 举例一对多
```java
public class SysUser{
    @Column(primaryKey = true)
    private String id;
    private String name;

    /**
     * 用户拥有的银行卡数
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"},partitionOrder = PartitionOrderEnum.IGNORE)
    private List<SysBankCard> bankCards;

}
```
`SysUser`和`SysBankCard`一对多,并且`selfProperty = {"id"}`为主键,所以我们认为`SysBankCard`是`SysUser`的值对象，所以如果你在构建`SysUser`的时候一起构建了`SysBankCard`那么会一并进行添加或者修改

```java

        SysUser sysUser = new SysUser();
        sysUser.setPhone("....");
        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");

        SysBank sysBank = new SysBank();
        sysBank.setName("....");
        sysBankCard.setBank(sysBank);

        sysUser.setBankCards(Arrays.asList(sysBankCard));

        //这么写会报错因为SysBankCard存在一个聚合根,那么会将这个聚合根的关联属性bankId赋值但是因为初始化所以sysBank还没有id会报错
//        easyEntityQuery.savable(sysUser).executeCommand();

        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(sysBank).executeCommand();
            easyEntityQuery.savable(sysUser).executeCommand();
            transaction.commit();
        }
```
我们需要先保存`sysBank`,在插入时会回写`id`，然后`savable(sysUser)`的时候会回写聚合根关联属性

### 举例多对一
```java

public class SysBankCard {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    /**
     * 银行卡号
     */
    private String code;

    /**
     * 所属银行
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"})
    private SysBank bank;

    /**
     * 所属用户
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}

```

`SysBankCard`和`SysBank`是多对一，`SysBankCard`和`SysUser`也是是多对一，那么在构建`SysBankCard`的时候因为`SysBank`和`SysUser`都是`SysBankCard`的聚合根,所以savable(new SysBankCard())，哪怕`SysBankCard`添加了对应的`SysBank`或`SysUser`也只会获取聚合根的关联关系值赋值给当前`SysBankCard`
在`savable(new SysBankCard())`的时候只会保存`SysBankCard`本身
```java

        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .whereById("123").singleNotNull();
        sysBankCard.setUser(sysUser);

        //开启事务后save
        //这次保存只会新增sysBankCard并且会把sysUser的id赋值给sysBankCard的uid字段
        easyEntityQuery.savable(sysBankCard).executeCommand();
```

### 多对多
多对多这是一个比较特殊的关联关系

首先用户需要明白这个多对多的中间表是否有业务字段,也就是除了关联关系，住建和创建时间这种通用字段外的业务字段。

用户需要明确告知框架是否在多对多保存的时候处理中间表，如果存在额外业务字段那么是无法自动保存的需要用户手动处理,或者额外添加一个当前表和中间表的一对多关系。
```java

@Data
@EntityProxy
@Table("m8_user")
@FieldNameConstants
public class M8User implements ProxyEntityAvailable<M8User , M8UserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {M8User.Fields.id},
            selfMappingProperty = {M8UserRole.Fields.userId},
            mappingClass = M8UserRole.class,
            targetProperty = {M8Role.Fields.id},
            targetMappingProperty = {M8UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)//设置为值对象那么会自动处理中间表
    private List<M8Role> roles;
}



        M8User m8User = easyEntityQuery.queryable(M8User.class)
                .includes(m -> m.roles())
                .singleNotNull();
        List<M8Role> list = easyEntityQuery.queryable(M8Role.class)
                .where(m -> {
                })
                .toList();
        m8User.getRoles().remove(0);
        m8User.getRoles().addAll(list);


        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(m8User).executeCommand();//自动移除一个UserRole并且添加和list数量一样的UserRole
            transaction.commit();
        }
```

如果存在业务字段那么请将cascade改成`cascade = CascadeTypeEnum.NO_ACTION`然后单独创建`User`和`UserRole`的导航

```java

@Data
@EntityProxy
@Table("m8_user")
@FieldNameConstants
public class M8User implements ProxyEntityAvailable<M8User, M8UserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {M8User.Fields.id},
            selfMappingProperty = {M8UserRole.Fields.userId},
            mappingClass = M8UserRole.class,
            targetProperty = {M8Role.Fields.id},
            targetMappingProperty = {M8UserRole.Fields.roleId}, cascade = CascadeTypeEnum.NO_ACTION)
    private List<M8Role> roles;

    /**
     * 新增一个导航输入因为M8UserRole存在业务字段
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {M8User.Fields.id}, targetProperty = {M8UserRole.Fields.userId})
    private List<M8UserRole> m8UserRoleList;
}


M8User user=new M8User()
M8UserRole userRole=new M8UserRole() 
userRole.setBusiness("XXXXX");
user.setM8UserRoleList(Arrays.asList(userRole))


try(Transaction transaction = easyEntityQuery.beginTransaction()){
    easyEntityQuery.savable(user).executeCommand();
    transaction.commit();
}
``` -->
