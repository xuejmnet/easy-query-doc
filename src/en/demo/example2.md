---
title: Object Relational Query Case 2 ✨
order: 7
category:
  - Guide
tag:
  - example
---

Display of user role menu information tables


## Relational Objects

- User, Role, Menu typical many-to-many association relationship (implicit subquery)
- User and user address are in a one-to-one relationship (implicit join)


::: code-tabs
@tab User

```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId")
    private List<SysRole> roles;

    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "userId")
    private SysUserAddress address;

}

```

@tab Role

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
            selfMappingProperty = "roleId",
            targetMappingProperty = "userId")
    private List<SysUser> users;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = RoleMenu.class,
            selfMappingProperty = "roleId",
            targetMappingProperty = "menuId")
    private List<SysMenu> menus;

}
```
@tab User Role

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

@tab Menu

```java
@Table("t_menu")
@Data
@EntityProxy
public class SysMenu implements ProxyEntityAvailable<SysMenu , SysMenuProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String route;
    private String icon;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = RoleMenu.class,
            selfMappingProperty = "menuId",
            targetMappingProperty = "roleId")
    private List<SysRole> roles;

}
```

@tab Role Menu

```java

@Table("t_role_menu")
@Data
@EntityProxy
public class RoleMenu implements ProxyEntityAvailable<RoleMenu , RoleMenuProxy> {
    @Column(primaryKey = true)
    private String id;
    private String roleId;
    private String menuId;

}
```

@tab User Address

```java

@Table("t_user_address")
@Data
@EntityProxy
public class SysUserAddress implements ProxyEntityAvailable<SysUserAddress , SysUserAddressProxy> {
    @Column(primaryKey = true)
    private String id;
    private String userId;
    private String province;
    private String city;
    private String area;
    private String addr;

}
```

:::

## Many-to-Many Explanation

<!-- <img src="/NaviagetRelationManyToMany.jpg"  width="500"> -->

## Case 1
Query users in Hangzhou or Shaoxing
```java

        List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //Implicit subquery will automatically join user table and address table
                    s.or(()->{
                        s.address().city().eq("杭州市");
                        s.address().city().eq("绍兴市");
                    });
                }).toList();
SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_user` t 
LEFT JOIN
    `t_user_address` t1 
        ON t1.`user_id` = t.`id` 
WHERE
    (
        t1.`city` = '杭州市' 
        OR t1.`city` = '绍兴市'
    )
```

Query a user named Xiaoming and return Xiaoming's name and address
```java

        List<Draft2<String, String>> userNameAndAddr = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.name().eq("小明");
                }).select(s -> Select.DRAFT.of(
                        s.name(),
                        s.address().addr()//Implicit join because the user returns the address information from the address table
                )).toList();

SELECT
    t.`name` AS `value1`,
    t1.`addr` AS `value2` 
FROM
    `t_user` t 
LEFT JOIN
    `t_user_address` t1 
        ON t1.`user_id` = t.`id` 
WHERE
    t.`name` = '小明'
```

Query a user named Xiaoming and return the user's name, address, and role count
```java

    List<Draft3<String, String, Long>> userNameAndAddrAndRoleCount = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                s.name().eq("小明");
            }).select(s -> Select.DRAFT.of(
                    s.name(),
                    s.address().addr(),
                    s.roles().count()//Implicit subquery returns the number of roles the user has
            )).toList();
            
SELECT
    t.`name` AS `value1`,
    t1.`addr` AS `value2`,
    (SELECT
        COUNT(*) 
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
    ) AS `value3` 
FROM
    `t_user` t 
LEFT JOIN
    `t_user_address` t1 
        ON t1.`user_id` = t.`id` 
WHERE
    t.`name` = '小明'         
           
```

## Case 2
Query users who have a role named "Receiver"
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //Filter condition is that there is a role named "Receiver" in the role collection
                    s.roles().where(role -> {
                        role.name().eq("收货员");
                    }).any();
                }).toList();

SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    EXISTS (
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
            AND t1.`name` = '收货员' LIMIT 1
        )
```

## Case 3

Query users who have roles ending with "员" and have more than 5 such roles, meaning the user must have at least 5 or more roles ending with "员"
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //Filter condition is that the role collection has role names ending with "员"
                    s.roles().where(role -> {
                        role.name().likeMatchRight("员");
                    }).count().gt(5L);//count greater than 5
                }).toList();


-- 1st SQL data
SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    (
        SELECT
            COUNT(*) 
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
            AND t1.`name` LIKE '%员'
        ) > 5
```


## Case 4
Query users whose any role was not created after 2022
```java


LocalDateTime localDateTime = LocalDateTime.of(2022, 1, 1, 0, 0);
List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
        .where(s -> {
            //Filter condition is that the maximum time in the role collection cannot be greater than 2022
            s.roles().max(role -> role.createTime()).lt(localDateTime);
        }).toList();

SELECT
    t.`id`,
    t.`name`,
    t.`create_time` 
FROM
    `t_user` t 
WHERE
    (
        SELECT
            MAX(t1.`create_time`) 
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
        ) < '2022-01-01 00:00'
```

## Case 5

::: warning Note!!!
> If you need to return database table objects instead of custom StructDTO, you need to manually `include`, otherwise the framework will not return the to-many side
:::

Query each user and their first 3 earliest created roles (supports pagination). Suitable for comments and the first N sub-comments
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                //The preceding expression indicates to return roles, the following indicates how to return, returning 3 in chronological order
                .include(s -> s.roles(),x->{
                    x.orderBy(r->r.createTime().asc()).limit(3);
                })
                .toList();
```

## Case 6
Query menus under user Xiaoming

Method 2 and Method 3 generate the same SQL, both using implicit subqueries. Method 1 uses multiple queries to filter users and get menu information under the user.
```java

//Method 1: Multiple queries
        List<SysMenu> menus = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.name().eq("小明");
                })
                .toList(x -> x.roles().flatElement().menus().flatElement());


//Method 2: One query
        List<SysMenu> menus = easyEntityQuery.queryable(SysMenu.class)
                .where(s -> {
                    //Determine if there is a role under the menu where the user of the role is named Xiaoming
                    s.roles().any(role -> {
                        role.users().any(user -> {
                            user.name().eq("小明");
                        });
                    });
                }).toList();

//Method 3: Flattened query
        List<SysMenu> menus = easyEntityQuery.queryable(SysMenu.class)
                .where(s -> {
                    //Determine if there is a role under the menu where the user of the role is named Xiaoming
                    //s.roles().flatElement().users().flatElement().name().eq("小明");//If there's only one condition for name, you can write it this way
                    //flatElement means abandoning the current table's query. For example, roles table has no conditions, so there's no need to directly flatten to filter users under roles
                    s.roles().flatElement().users().any(user -> {
                        user.name().eq("小明");
                    });
                }).toList();

-- 1st SQL data
SELECT
    t.`id`,
    t.`name`,
    t.`route`,
    t.`icon` 
FROM
    `t_menu` t 
WHERE
    EXISTS (
        SELECT
            1 
        FROM
            `t_role` t1 
        WHERE
            EXISTS (
                SELECT
                    1 
                FROM
                    `t_role_menu` t2 
                WHERE
                    t2.`role_id` = t1.`id` 
                    AND t2.`menu_id` = t.`id` LIMIT 1
            ) 
            AND EXISTS (
                SELECT
                    1 
                FROM
                    `t_user` t3 
                WHERE
                    EXISTS (
                        SELECT
                            1 
                        FROM
                            `t_user_role` t4 
                        WHERE
                            t4.`user_id` = t3.`id` 
                            AND t4.`role_id` = t1.`id` LIMIT 1
                    ) 
                    AND t3.`name` = '小明' LIMIT 1
                ) LIMIT 1
        )
```

