---
title: Many-to-Many Save
order: 40
---

# Many-to-Many Save
A very special kind of save, because both self and target are aggregate roots and neither can affect the other's table. They are associated through a mapping table. Many-to-many has many modes:
- Many-to-many with mapping table, and the mapping table has no business properties, such as user, user_role, role
- Many-to-many with mapping table, and the mapping table has business properties. For example, company, company_user, user. Companies and users have an employment relationship. For example, outsourced personnel and a certain company. A company can employ multiple outsourced personnel, and multiple outsourced personnel can also take orders from multiple companies at the same time.
- Many-to-many without mapping table. For example, this is a forced association. For example, a user has multiple bank cards, and a person also has multiple books. But bank cards and books can also be forcibly associated many-to-many through userId. This kind of association has no mapping table association. Of course, we have no way to save it.

## Initialization


::: tip Mapping Table Auto-generated!!!
> If and only if the navigation property is many-to-many and there is a mapping table, and the cascade delete is configured as `DELETE` (`cascade = CascadeTypeEnum.DELETE`), the mapping table will be automatically added and deleted. If the cascade table is configured as `AUTO` or `SET_NULL`, the framework will consider the mapping table to be involved in business logic and will not automatically handle the mapping table, only the values of the association relationship columns in the mapping table
:::


::: tabs

@tab Flow Diagram
<img :src="$withBase('/images/many2manysave1.png')">

@tab entity
```java

@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser, SysUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {SysUser.Fields.id},
            selfMappingProperty = {UserRole.Fields.userId},
            mappingClass = UserRole.class,
            targetProperty = {SysRole.Fields.id},
            targetMappingProperty = {UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)
    private List<SysRole> sysRoleList;
}
```

@tab API interface
```java

    @PostMapping("/create")
    @EasyQueryTrack
    public Object create() {
        ArrayList<SysRole> sysRoles = new ArrayList<>();
        {
            SysRole sysRole = new SysRole();
            sysRole.setId("r1");
            sysRole.setName("Administrator");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {
            SysRole sysRole = new SysRole();
            sysRole.setId("r2");
            sysRole.setName("Guest2");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        {

            SysRole sysRole = new SysRole();
            sysRole.setId("r3");
            sysRole.setName("Guest3");
            sysRole.setCreateTime(LocalDateTime.now());
            sysRoles.add(sysRole);
        }
        ArrayList<SysUser> sysUsers = new ArrayList<>();

        {
            SysUser sysUser = new SysUser();
            sysUser.setId("u1");
            sysUser.setName("XiaoMing");
            sysUser.setAge(18);
            sysUser.setCreateTime(LocalDateTime.now());
            sysUser.setSysRoleList(Arrays.asList(sysRoles.get(0),sysRoles.get(1)));
            sysUsers.add(sysUser);
        }
        {
            SysUser sysUser = new SysUser();
            sysUser.setId("u2");
            sysUser.setName("XiaoHong");
            sysUser.setAge(18);
            sysUser.setCreateTime(LocalDateTime.now());
            sysUser.setSysRoleList(Arrays.asList(sysRoles.get(1),sysRoles.get(2)));
            sysUsers.add(sysUser);
        }
        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysRoles).executeCommand();
            easyEntityQuery.savable(sysUsers).executeCommand();
            return null;
        });
        return "ok";
    }
```

@tab sql
```sql

-- SQL statement 1
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r1', 'Administrator', '2025-09-21 18:44:29.196043')
-- SQL statement 2
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r2', 'Guest2', '2025-09-21 18:44:29.196095')
-- SQL statement 3
INSERT INTO `t_role` (`id`, `name`, `create_time`)
VALUES ('r3', 'Guest3', '2025-09-21 18:44:29.196099')
-- SQL statement 4
INSERT INTO `t_user` (`id`, `name`, `age`, `create_time`)
VALUES ('u1', 'XiaoMing', 18, '2025-09-21 18:44:29.196131')
-- SQL statement 5
INSERT INTO `t_user` (`id`, `name`, `age`, `create_time`)
VALUES ('u2', 'XiaoHong', 18, '2025-09-21 18:44:29.196246')
-- SQL statement 6
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('a58f4700a8804ae49d241fc7c2a941e6', 'u1', 'r1')
-- SQL statement 7
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('6093c72e89d6484fbaa9219b485f4e5f', 'u1', 'r2')
-- SQL statement 8
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('eadfb13ff44d471ea1e7c821dcfd233a', 'u2', 'r2')
-- SQL statement 9
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('1d765be1efb44780826aa82715d75c55', 'u2', 'r3')
```

:::

Note that we didn't operate on any mapping table here. All are automatically generated by the framework (if many-to-many is not configured as cascade delete, relationships will not be automatically created and deleted). Many-to-many cascade does not cascade delete the `role` table, but cascade deletes the mapping table, which is `user_role`.

## When Users Need to Modify Roles
Originally user u1 had two roles r1 and r2. Now we want r2 and r3. How should we handle this?

::: tabs

@tab dto
```java

@Data
public class UserRoleRequest {
    private String userId;
    private List<String> roleIds;
}

```

@tab API interface
```java

    @PostMapping("/update")
    @EasyQueryTrack
    public Object update(@RequestBody UserRoleRequest request) {
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .include(user -> user.sysRoleList())
                .whereById(request.getUserId()).singleNotNull();

        List<SysRole> list = easyEntityQuery.queryable(SysRole.class).whereByIds(request.getRoleIds())
                .toList();
        sysUser.setSysRoleList(list);

        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysUser).executeCommand();
            return null;
        });

        return "ok";
    }
```
@tab json
```json
{
    "userId":"u1",
    "roleIds":["r2","r3"]
}
```

:::

```sql

-- SQL statement 1
SELECT `id`, `company_id`, `name`, `age`, `create_time`
FROM `t_user`
WHERE `id` = 'u1'
-- SQL statement 2
SELECT `user_id`, `role_id`
FROM `t_user_role`
WHERE `user_id` IN ('u1')
-- SQL statement 3
SELECT t.`id`, t.`name`, t.`create_time`
FROM `t_role` t
WHERE t.`id` IN ('r1', 'r2')
-- SQL statement 4
SELECT `id`, `name`, `create_time`
FROM `t_role`
WHERE `id` IN ('r2', 'r3')
-- SQL statement 5
DELETE FROM `t_user_role`
WHERE `user_id` = 'u1'
	AND `role_id` = 'r1'
-- SQL statement 6
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('81ded72bc9554e428ea2ea5089b5961b', 'u1', 'r3')
```

The first three SQLs are used to query how many roles user u1 currently has. The fourth SQL is used to query whether the requested roleIds are in the system. The fifth and sixth SQLs delete the `u1-r1` relationship and insert the `u1-r3` relationship through differential changes.

## Optimization
A simple role change but too many queries were executed. Next, we will talk about a convenient way to implement changes to the mapping table, thereby implementing changes to the relationship between user and role.

1. Create a one-to-many relationship between user and user_role
```java

@Table("t_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser, SysUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;


    /**
     *
     **/
    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {SysUser.Fields.id},
            selfMappingProperty = {UserRole.Fields.userId},
            mappingClass = UserRole.class,
            targetProperty = {SysRole.Fields.id},
            targetMappingProperty = {UserRole.Fields.roleId}, cascade = CascadeTypeEnum.DELETE)
    private List<SysRole> sysRoleList;

    /**
     * Create userRole relationship
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {SysUser.Fields.id}, targetProperty = {UserRole.Fields.userId},cascade = CascadeTypeEnum.DELETE)
    private List<UserRole> userRoleList;
}
```
Note that the entity relationship cascade here is delete.

2. Add SaveKey, because we can't know the corresponding relationship during save, so we can implement business logic uniqueness through savekey
```java
@Table("t_user_role")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("user_role")
public class UserRole implements ProxyEntityAvailable<UserRole , UserRoleProxy> {
    @Column(primaryKey = true,primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    @SaveKey
    private String userId;
    @SaveKey
    private String roleId;
}
```

Write API
```java

    @PostMapping("/update2")
    @EasyQueryTrack
    public Object update2(@RequestBody UserRoleRequest request) {
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class)
                .include(user -> user.userRoleList())
                .whereById(request.getUserId()).singleNotNull();

        List<SysRole> list = easyEntityQuery.queryable(SysRole.class).whereByIds(request.getRoleIds())
                .toList();
        ArrayList<UserRole> userRoles = new ArrayList<>();
        for (SysRole sysRole : list) {
            UserRole userRole = new UserRole();
            userRole.setUserId(sysUser.getId());
            userRole.setRoleId(sysRole.getId());
            userRoles.add(userRole);
        }
        sysUser.setUserRoleList(userRoles);

        transactionTemplate.execute(status->{
            easyEntityQuery.savable(sysUser).executeCommand();
            return null;
        });

        return "ok";
    }
```
You can see the logic is still clear
```json
{
    "userId":"u1",
    "roleIds":["r2","r3"]
}
```

```sql


-- SQL statement 1
SELECT `id`, `company_id`, `name`, `age`, `create_time`
FROM `t_user`
WHERE `id` = 'u1'
-- SQL statement 2
SELECT t.`id`, t.`user_id`, t.`role_id`
FROM `t_user_role` t
WHERE t.`user_id` IN ('u1')
-- SQL statement 3
SELECT `id`, `name`, `create_time`
FROM `t_role`
WHERE `id` IN ('r2', 'r3')
-- SQL statement 4
DELETE FROM `t_user_role`
WHERE `id` = '3c9def3553d643739fa5236b3b11186f'
-- SQL statement 5
INSERT INTO `t_user_role` (`id`, `user_id`, `role_id`)
VALUES ('b37b6e75f0854a809d8c8753296307b3', 'u1', 'r3')
```

Finally, by turning the intermediate variable into one-to-many, we can reduce one SQL this time. And these SQLs are indispensable. First, we must know whether the user exists and need to know how many user_role the user currently has. Second, we need to know whether the roleId requested by the user exists in the database, so SQL 3 is also essential. Then comes the differential diff SQL. So far, our many-to-many save is also all completed.

