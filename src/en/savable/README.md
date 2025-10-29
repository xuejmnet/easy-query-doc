---
title: Aggregate Root Save
---

# Aggregate Root Save

`eq` implemented aggregate root save mode after `3.1.24`, which can track changes to aggregate root objects and differential changes to corresponding value objects in `track` mode, enabling users to save complete object trees effortlessly.

What benefits does aggregate root save bring?

Use clean and tidy code in exchange for complex relational data saving


[Click the link for the demo in this chapter](https://github.com/xuejmnet/eq-doc) https://github.com/xuejmnet/eq-doc

## Aggregate Root Save Flow

<img  :src="$withBase('/images/save-flow.png')">



## Concepts
Before starting with aggregate root save, we need to understand several concepts

### Aggregate Root
If tables `a` and `b` use `a`'s primary key to associate with `b`, then `a` is the aggregate root, and `b` is the value object.
In one sentence: using your own primary key as the association relationship means you are the aggregate root, and the target navigation is a value object or other.

### Value Object
If tables `a` and `b` use `a`'s primary key to associate with `b`, then `a` is the aggregate root, and `b` is the value object.
If the current object's association navigation targetProperty is the target table's primary key, then the current table is a value object of the target table.

There are two types of value objects:
- Cascade is null, this kind of value object will not continue to recursively traverse lower-level navigation properties, this kind of value object only has the share of updating association keys during aggregate root save, and will never have `insert` and `delete`
- Cascade delete, this kind of value object is a true value object, driven by the current aggregate root, and will traverse down navigation properties, with three states: `insert`, `update`, `delete`


### Other Relationships

Associations between two tables using non-primary keys like other columns, or many-to-many without a mapping table, or path left-match, these we consider as other relationships

## Cascade Dissociate Options
The `cascade` property of `@Navigate` has the following enumerations

Type  | Function  
---  | --- 
AUTO  | When it comes to object dissociation operations, the system handles automatically, by default using `set null`, if it's a many-to-many operation on the mapping table, it cannot be determined and needs to be handled by the user themselves
NO_ACTION  | Dissociation does no processing, user handles it themselves
SET_NULL  | Dissociation processing sets targetProperty to null, does not delete the target record
DELETE | Dissociation processing deletes the target object, for example `user` and `user_role` and `role`, then `user_role` can be set to `delete`

## API Introduction

API  | Function  
---  | --- 
configure  | Configure options for the current save expression, such as not processing the root node, letting the user handle it themselves for concurrent judgment
savePath  | Explicitly specify which object paths to save during saving
ignoreRoot | Ignore root node save, insert and update
removeRoot | Remove root node including removing remaining other include nodes

## What can savable bring

Before savable, when creating a many-to-many relationship, we needed to create user, user_role, role, and needed to assign values to user's id, then to role's id, then to user_role's userId and roleId. This is what needs to be considered for insertion.

If it's an update, we need to find which ones need to be added, which ones need to be deleted, and which ones need to be updated. Even if we're brutal, we can only delete all user_role and then re-insert them, but this would cause the user_role's id to change. If user_role is a mapping table with business fields, then this deletion-then-insertion method will no longer be applicable.

What can we do with save?
```java

    private final EasyEntityQuery easyEntityQuery;
    @PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {
        ArrayList<SysRole> sysRoles = new ArrayList<>();
        {

            SysRole sysRole = new SysRole();
            sysRole.setName("Administrator");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {

            SysRole sysRole = new SysRole();
            sysRole.setName("Guest");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        SysUser sysUser = new SysUser();
        sysUser.setName("XiaoMing");
        sysUser.setAge(18);
        sysUser.setCreateTime(LocalDateTime.now());
        sysUser.setSysRoleList(sysRoles);

        easyEntityQuery.savable(sysRoles).executeCommand();
        easyEntityQuery.savable(sysUser).executeCommand();
        return "ok";
    }
```

We only need to create user and role, then save them respectively. Let's look at the generated SQL:
```sql
 ==> Preparing: INSERT INTO `t_role` (`id`,`name`,`create_time`) VALUES (?,?,?)
 ==> Parameters: 1a4c554e4b8b4cff81c87d9298b853ed(String),Administrator(String),2025-09-11T22:35:31.143878(LocalDateTime)
 ==> Preparing: INSERT INTO `t_role` (`id`,`name`,`create_time`) VALUES (?,?,?)
 ==> Parameters: bb9278911ecb4fe19c8a41a4e26a7c06(String),Guest(String),2025-09-11T22:35:31.143909(LocalDateTime)

 ==> Preparing: INSERT INTO `t_user` (`id`,`name`,`age`,`create_time`) VALUES (?,?,?,?)
 ==> Parameters: 2164d097983b4874859b01ef02f53340(String),XiaoMing(String),18(Integer),2025-09-11T22:35:31.143932(LocalDateTime)

 ==> Preparing: INSERT INTO `t_user_role` (`id`,`user_id`,`role_id`) VALUES (?,?,?)
 ==> Parameters: b588a3ce9c72484fba366ce7288d8f5c(String),2164d097983b4874859b01ef02f53340(String),1a4c554e4b8b4cff81c87d9298b853ed(String)
 ==> Preparing: INSERT INTO `t_user_role` (`id`,`user_id`,`role_id`) VALUES (?,?,?)
 ==> Parameters: 91b39127ba5d499f9cde6a326a49a71d(String),2164d097983b4874859b01ef02f53340(String),bb9278911ecb4fe19c8a41a4e26a7c06(String)
```

<!-- 

### Example One-to-Many
```java
public class SysUser{
    @Column(primaryKey = true)
    private String id;
    private String name;

    /**
     * Number of bank cards owned by user
     */
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {"id"}, targetProperty = {"uid"},partitionOrder = PartitionOrderEnum.IGNORE)
    private List<SysBankCard> bankCards;

}
```
`SysUser` and `SysBankCard` are one-to-many, and `selfProperty = {"id"}` is the primary key, so we consider `SysBankCard` to be a value object of `SysUser`. So if you construct `SysBankCard` when building `SysUser`, they will be added or modified together.

```java

        SysUser sysUser = new SysUser();
        sysUser.setPhone("....");
        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");

        SysBank sysBank = new SysBank();
        sysBank.setName("....");
        sysBankCard.setBank(sysBank);

        sysUser.setBankCards(Arrays.asList(sysBankCard));

        //This writing will error because SysBankCard has an aggregate root, then it will assign the association property bankId of this aggregate root, but because it's initialized, sysBank doesn't have an id yet and will error
//        easyEntityQuery.savable(sysUser).executeCommand();

        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(sysBank).executeCommand();
            easyEntityQuery.savable(sysUser).executeCommand();
            transaction.commit();
        }
```
We need to save `sysBank` first. During insertion, the `id` will be written back, then when `savable(sysUser)`, the aggregate root association property will be written back.

### Example Many-to-One
```java

public class SysBankCard {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    /**
     * Bank card number
     */
    private String code;

    /**
     * Bank to which it belongs
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"})
    private SysBank bank;

    /**
     * User to which it belongs
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}

```

`SysBankCard` and `SysBank` are many-to-one, `SysBankCard` and `SysUser` are also many-to-one. When constructing `SysBankCard`, since both `SysBank` and `SysUser` are aggregate roots of `SysBankCard`, savable(new SysBankCard()) will only get the association relationship values of the aggregate roots and assign them to the current `SysBankCard`, even if `SysBankCard` has corresponding `SysBank` or `SysUser` added.
During `savable(new SysBankCard())`, only `SysBankCard` itself will be saved.
```java

        SysBankCard sysBankCard = new SysBankCard();
        sysBankCard.setCode("....");
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .whereById("123").singleNotNull();
        sysBankCard.setUser(sysUser);

        //Save after opening transaction
        //This save will only add sysBankCard and will assign sysUser's id to sysBankCard's uid field
        easyEntityQuery.savable(sysBankCard).executeCommand();
```

### Many-to-Many
Many-to-many is a relatively special association relationship.

First, users need to understand whether this many-to-many mapping table has business fields, that is, business fields other than association relationships, primary keys, and creation time and other general fields.

Users need to explicitly tell the framework whether to handle the mapping table during many-to-many save. If there are extra business fields, automatic save is not possible and users need to handle manually, or add an additional one-to-many relationship between the current table and the mapping table.
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
            targetMappingProperty = {M8UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)//Set as value object then it will automatically handle the mapping table
    private List<M8Role> roles;
}



        M8User m8User = easyEntityQuery.queryable(M8User.class)
                .include(m -> m.roles())
                .singleNotNull();
        List<M8Role> list = easyEntityQuery.queryable(M8Role.class)
                .where(m -> {
                })
                .toList();
        m8User.getRoles().remove(0);
        m8User.getRoles().addAll(list);


        try(Transaction transaction = easyEntityQuery.beginTransaction()){
            easyEntityQuery.savable(m8User).executeCommand();//Automatically remove one UserRole and add the same number of UserRole as the list
            transaction.commit();
        }
```

If there are business fields, please change cascade to `cascade = CascadeTypeEnum.NO_ACTION`, then separately create navigation for `User` and `UserRole`

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
     * Add a navigation input because M8UserRole has business fields
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

