---
title: 多对多(有实体)
order: 5
---

多对多关系在系统中常见的场景为用户和角色,一个人拥有多个角色，多个人又可以指向同一个角色这种情况我们视为多对多

## 用户角色


::: tabs
@tab 关系图
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

    //"userId"字符串可以使用lombok的注解 @FieldNameConstants 添加到对象UserRole上 使用的时候用UserRole.Fields.UserId
    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId",
            targetProperty = "id")
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


## 映射

`SysUser.id -> UserRole.userId`
`SysRole.id -> UserRole.roleId`


 - |self  | mappingClass | target  
---  | ---  | ---  | --- 
对象  | SysUser  | UserRole | SysRole
selfPropertyMapping  | id  | userId | -
targetPropertyMapping | - | roleId | id

 所以在SysUser内部我们通过定义`selfProperty:selfMappingProperty`和`targetMappingProperty:targetProperty`


```java
    //"userId"字符串可以使用lombok的注解 @FieldNameConstants 添加到对象UserRole上 使用的时候用UserRole.Fields.UserId
    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",//为单个主键可以不填写
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId",
            targetProperty = "id")//为单个主键可以不填写
    private List<SysRole> roles;
```


## 案例1
查询用户是小明的并且角色包含管理员的
```java
List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .where(u -> {
            u.name().eq("小明");
            u.roles().any(role->role.name().like("管理员"));
        }).toList();



-- 第1条sql数据
SELECT
    t.`id`,
    t.`company_id`,
    t.`name`,
    t.`age`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    t.`name` = '小明' 
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
            AND t1.`name` LIKE '%管理员%' LIMIT 1
        )
```

## 案例2
查询用户是小明的并且角色不包含管理员但是包含普通员工的
```java

List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .where(u -> {
            u.name().eq("小明");
            u.roles().none(role -> role.name().like("管理员"));
            u.roles().any(role -> role.name().like("普通员工"));
        }).toList();



-- 第1条sql数据
SELECT
    t.`id`,
    t.`company_id`,
    t.`name`,
    t.`age`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    t.`name` = '小明' 
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
        AND t1.`name` LIKE '%管理员%' LIMIT 1)) 
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
            AND t3.`name` LIKE '%普通员工%' LIMIT 1
        )
```

双子查询优化合并
```java


List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
        .subQueryToGroupJoin(x -> x.roles())
        .where(u -> {
            u.name().eq("小明");
            u.roles().none(role -> role.name().like("管理员"));
            u.roles().any(role -> role.name().like("普通员工"));
        }).toList();

-- 第1条sql数据
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
            (CASE WHEN COUNT((CASE WHEN t1.`name` LIKE '%管理员%' THEN 1 ELSE null END)) > 0 THEN false ELSE true END) AS `__none2__`,
            (CASE WHEN COUNT((CASE WHEN t1.`name` LIKE '%普通员工%' THEN 1 ELSE null END)) > 0 THEN true ELSE false END) AS `__any3__` 
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
    t.`name` = '小明' 
    AND IFNULL(t4.`__none2__`,true) = true 
    AND IFNULL(t4.`__any3__`,false) = true

```