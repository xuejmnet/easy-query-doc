---
title: Many-to-Many (With Entity)
order: 5
---

Many-to-many relationships are commonly seen in systems in scenarios like users and roles. One person has multiple roles, and multiple people can point to the same role. We view this situation as many-to-many.

## User Role


::: tabs
@tab Relationship Diagram
<img :src="$withBase('/images/user_role.svg')">

@tab SysUser
```java
@Table("t_user")
@Data
@EntityProxy
@EasyAlias("user")
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String companyId;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    //The "userId" string can use lombok's @FieldNameConstants annotation added to the UserRole object. Use it as UserRole.Fields.UserId
    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId",
            targetProperty = "id",subQueryToGroupJoin=true)//Adding subQueryToGroupJoin=true helps improve performance, user's choice
    private List<SysRole> roles;

}
```
@tab UserRole
```java
@Table("t_user_role")
@Data
@EntityProxy
public class UserRole implements ProxyEntityAvailable<UserRole , UserRoleProxy> {
    @Column(primaryKey = true)
    private String id;
    private String userId;
    private String roleId;
}
```

@tab SysRole
```java
@Table("t_role")
@Data
@EntityProxy
public class SysRole implements ProxyEntityAvailable<SysRole, SysRoleProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "roleId",
            targetMappingProperty = "userId",
            targetProperty = "id")
    private List<SysUser> users;


}
```

:::


## Mapping

`SysUser.id -> UserRole.userId`
`SysRole.id -> UserRole.roleId`


 - |self  | mappingClass | target  
---  | ---  | ---  | --- 
Object  | SysUser  | UserRole | SysRole
selfPropertyMapping  | id  | userId | -
targetPropertyMapping | - | roleId | id

 So inside SysUser, we define through `selfProperty:selfMappingProperty` and `targetMappingProperty:targetProperty`


```java
    //The "userId" string can use lombok's @FieldNameConstants annotation added to the UserRole object. Use it as UserRole.Fields.UserId
    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",//Can be omitted if it's a single primary key
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId",
            targetProperty = "id")//Can be omitted if it's a single primary key
    private List<SysRole> roles;
```


## Example 1
Query users named "XiaoMing" and whose roles include "Administrator"
```java
List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .where(u -> {
            u.name().eq("XiaoMing");
            u.roles().any(role->role.name().like("Administrator"));
        }).toList();



-- SQL statement 1
SELECT
    t.`id`,
    t.`company_id`,
    t.`name`,
    t.`age`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    t.`name` = 'XiaoMing' 
    AND EXISTS (
        SELECT
            1 
        FROM
            `t_role` t1 
        WHERE
            EXISTS (
                SELECT
                    1 
                FROM
                    `t_user_role` t2 
                WHERE
                    t2.`role_id` = t1.`id` 
                    AND t2.`user_id` = t.`id` LIMIT 1
            ) 
            AND t1.`name` LIKE '%Administrator%' LIMIT 1
        )
```

## Example 2
Query users named "XiaoMing" whose roles do not include "Administrator" but include "Regular Employee"
```java

List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .where(u -> {
            u.name().eq("XiaoMing");
            u.roles().none(role -> role.name().like("Administrator"));
            u.roles().any(role -> role.name().like("Regular Employee"));
        }).toList();



-- SQL statement 1
SELECT
    t.`id`,
    t.`company_id`,
    t.`name`,
    t.`age`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    t.`name` = 'XiaoMing' 
    AND NOT ( EXISTS (SELECT
        1 
    FROM
        `t_role` t1 
    WHERE
        EXISTS (SELECT
            1 
        FROM
            `t_user_role` t2 
        WHERE
            t2.`role_id` = t1.`id` 
            AND t2.`user_id` = t.`id` LIMIT 1) 
        AND t1.`name` LIKE '%Administrator%' LIMIT 1)) 
    AND EXISTS (
        SELECT
            1 
        FROM
            `t_role` t3 
        WHERE
            EXISTS (
                SELECT
                    1 
                FROM
                    `t_user_role` t4 
                WHERE
                    t4.`role_id` = t3.`id` 
                    AND t4.`user_id` = t.`id` LIMIT 1
            ) 
            AND t3.`name` LIKE '%Regular Employee%' LIMIT 1
        )
```

Double subquery optimization merge
```java


List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(x -> x.roles())
        .where(u -> {
            u.name().eq("XiaoMing");
            u.roles().none(role -> role.name().like("Administrator"));
            u.roles().any(role -> role.name().like("Regular Employee"));
        }).toList();

-- SQL statement 1
SELECT
    t.`id`,
    t.`company_id`,
    t.`name`,
    t.`age`,
    t.`create_time` 
FROM
    `t_user` t 
LEFT JOIN
    (
        SELECT
            t2.`user_id` AS `user_id`,
            (CASE WHEN COUNT((CASE WHEN t1.`name` LIKE '%Administrator%' THEN 1 ELSE NULL END)) > 0 THEN false ELSE true END) AS `__none2__`,
            (CASE WHEN COUNT((CASE WHEN t1.`name` LIKE '%Regular Employee%' THEN 1 ELSE NULL END)) > 0 THEN true ELSE false END) AS `__any3__` 
        FROM
            `t_role` t1 
        INNER JOIN
            `t_user_role` t2 
                ON t1.`id` = t2.`role_id` 
        GROUP BY
            t2.`user_id`
    ) t4 
        ON t4.`user_id` = t.`id` 
WHERE
    t.`name` = 'XiaoMing' 
    AND IFNULL(t4.`__none2__`,true) = true 
    AND IFNULL(t4.`__any3__`,false) = true

```

