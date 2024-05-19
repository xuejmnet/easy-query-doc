---
title: 对象关系查询案例2 ✨
---

用户角色菜单信息表的展示


## 关系对象

- 用户、角色、菜单典型的多对多关联关系(隐式子查询)
- 其中用户和用户所在地址为一对一关系(隐式join)

::: code-tabs
@tab 用户

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

    @Override
    public Class<SysUserProxy> proxyTableClass() {
        return SysUserProxy.class;
    }
}
```

@tab 角色

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

    @Override
    public Class<SysRoleProxy> proxyTableClass() {
        return SysRoleProxy.class;
    }
}
```
@tab 用户角色

```java
@Table("t_user_role")
@Data
@EntityProxy
public class UserRole implements ProxyEntityAvailable<UserRole , UserRoleProxy> {
    @Column(primaryKey = true)
    private String id;
    private String userId;
    private String roleId;

    @Override
    public Class<UserRoleProxy> proxyTableClass() {
        return UserRoleProxy.class;
    }
}
```

@tab 菜单

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

    @Override
    public Class<SysMenuProxy> proxyTableClass() {
        return SysMenuProxy.class;
    }
}
```

@tab 角色菜单

```java

@Table("t_role_menu")
@Data
@EntityProxy
public class RoleMenu implements ProxyEntityAvailable<RoleMenu , RoleMenuProxy> {
    @Column(primaryKey = true)
    private String id;
    private String roleId;
    private String menuId;

    @Override
    public Class<RoleMenuProxy> proxyTableClass() {
        return RoleMenuProxy.class;
    }
}
```

@tab 用户地址

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

    @Override
    public Class<SysUserAddressProxy> proxyTableClass() {
        return SysUserAddressProxy.class;
    }
}
```

:::

## 案例1
查询杭州或绍兴的用户
```java

        List<SysUser> userInHz = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //隐式子查询会自动join用户表和地址表
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

查询用户叫做小明的返回小明的姓名和小明所在地址
```java

        List<Draft2<String, String>> userNameAndAddr = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.name().eq("小明");
                }).select(s -> Select.DRAFT.of(
                        s.name(),
                        s.address().addr()//隐式join因为用户返回了地址标的地址信息
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

查询用户叫做小明的返回用户的姓名地址和角色数量
```java

    List<Draft3<String, String, Long>> userNameAndAddrAndRoleCount = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                s.name().eq("小明");
            }).select(s -> Select.DRAFT.of(
                    s.name(),
                    s.address().addr(),
                    s.roles().count()//隐式子查询返回用户拥有的角色数量
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

## 案例2
查询用户下面存在角色是`收货员`的用户
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //筛选条件为角色集合里面有角色名称叫做收货员的
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

## 案例3

查询用户下面存在角色是`XX员`,并且存在个数大于5个的用户,就是说需要满足用户下面的角色是`xx员`的起码有5个及以上的
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    //筛选条件为角色集合里面有角色名称叫做xx员的
                    s.roles().where(role -> {
                        role.name().likeMatchRight("员");
                    }).count().gt(5L);//count数量大于5个
                }).toList();


-- 第1条sql数据
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


## 案例4
查询用户下面存在的任意角色不大于2022年创建的
```java


LocalDateTime localDateTime = LocalDateTime.of(2022, 1, 1, 0, 0);
List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
        .where(s -> {
            //筛选条件为角色集合里面有角色最大时间不能大于2022年的
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

## 案例5

::: warning 说明!!!
> 如果你需要返回数据库表对象而不是自定义StructDTO那么需要自行`include/includes`否则框架不会返回对多的那一方
:::

查询每个用户和前3个最早创建的角色(支持分页)适用于评论和评论子表前N个
```java

        List<SysUser> 收货员 = easyEntityQuery.queryable(SysUser.class)
                //前面的表达式表示要返回roles后面的表示如何返回返回按时间正序的3个
                .includes(s -> s.roles(),x->{
                    x.orderBy(r->r.createTime().asc()).limit(3);
                })
                .toList();
```

## 案例6
查询用户小明下面的菜单

方式2和方式3生成的sql一样都是隐式子查询,方式1采用的是多次查询筛选用户获取用户下的菜单信息
```java

//方式1多次查询
        List<SysMenu> menus = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.name().eq("小明");
                })
                .toList(x -> x.roles().flatElement().menus().flatElement());


//方式2一次次查询
        List<SysMenu> menus = easyEntityQuery.queryable(SysMenu.class)
                .where(s -> {
                    //判断菜单下的角色存在角色的用户叫做小明的
                    s.roles().any(role -> {
                        role.users().any(user -> {
                            user.name().eq("小明");
                        });
                    });
                }).toList();

//方式3展开查询
        List<SysMenu> menus = easyEntityQuery.queryable(SysMenu.class)
                .where(s -> {
                    //判断菜单下的角色存在角色的用户叫做小明的
                    //s.roles().flatElement().users().flatElement().name().eq("小明");//如果只有一个条件name可以这么写

                    //flatElement表示放弃当前表的查询比如roles表因为没有条件所以不需要直接展开即可对roles下的users进行筛选
                    s.roles().flatElement().users().any(user -> {
                        user.name().eq("小明");
                    });
                }).toList();

-- 第1条sql数据
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