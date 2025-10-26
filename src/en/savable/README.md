---
title: Aggregate Root Saving
---

# Aggregate Root Saving

`eq` implemented aggregate root saving mode after `3.1.24`, which can achieve tracking changes to aggregate root objects and differential changes to corresponding value objects in `track` mode, allowing users to easily save complete object trees without feeling

What benefits can aggregate root saving bring

Clean and tidy code in exchange for complex relational data saving


[Click the link for this chapter demo](https://github.com/xuejmnet/eq-doc) https://github.com/xuejmnet/eq-doc

## Aggregate Root Saving Process

<img  :src="$withBase('/images/save-flow.png')">



## Concepts
Before entering aggregate root saving, we need to understand several concepts first

### Aggregate Root
Tables `a` and `b` use `a`'s primary key to associate with `b`, then `a` is the aggregate root, and `b` is a value object
In one sentence: using your own primary key as the association relationship, then you are the aggregate root and the target navigation is a value object or other

### Value Object
Tables `a` and `b` use `a`'s primary key to associate with `b`, then `a` is the aggregate root, and `b` is a value object
If the targetProperty of the current object's associated navigation is the target table's primary key, then the current table is a value object of the target table

There are two types of value objects:
- Cascade null, this value object will not continue to recursively traverse sub-navigation properties. This value object only has the share of updating the association key when saving the aggregate root, and will never have `insert` and `delete`
- Cascade delete, this value object is a real value object, driven by the current aggregate root, and will traverse navigation properties downward, and has three states: `insert`, `update`, `delete`


### Other Relationships

Non-primary keys such as other columns associated between two tables, or many-to-many without intermediate table, or path left matching, we consider these as other relationships

## Cascade Decoupling Options
The property `cascade` of `@Navigate` has the following enumerations

Type  | Function  
---  | --- 
AUTO  | Involves object decoupling operations, the system automatically handles them, using `set null` by default. If it's a many-to-many operation intermediate table, it cannot be determined and needs to be handled by the user
NO_ACTION  | Decoupling does nothing and is handled by the user
SET_NULL  | Decoupling processing sets targetProperty to null, does not delete target records
DELETE | Decoupling processing deletes the target object, for example `user` and `user_role` and `role`, then `user_role` can be set to `delete`

## API Introduction

API  | Function  
---  | --- 
configure  | Configure options for the current save expression, such as not processing the root node, allowing users to handle it themselves for concurrent judgment
savePath  | Explicitly save which object paths when saving
ignoreRoot | Ignore the save insertion and modification of the root node
removeRoot | Remove the root node including removing the remaining other include nodes

## What can savable bring

Before savable, when we create many-to-many relationships, we need to create user, user_role, role, and need to assign id to user, then assign id to role, assign userId and roleId to user_role. This is what needs to be considered for insertion

If it's modification, we need to find out which ones need to be added, which ones need to be deleted, which ones need to be modified. Even if it's more violent, we can only delete all user_role and then add them again, but this will cause the user_role id to change. If user_role is an intermediate table with business fields, then this deletion followed by addition method will no longer be applicable

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

We only need to create user and role, then save them separately. Let's look at the generated SQL
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
