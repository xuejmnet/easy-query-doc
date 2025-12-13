---
title: DTO Mapping Basics
order: 30
---


## DTO Mapping Basics
`selectAutoInclude`


::: tip Note!!!
> One line of code to implement structured object retrieval
:::


<video :src="$withBase('/videos/selectAutoInclude.mp4')" muted loop autoplay id='v' width="800"></video>
<!-- <img src="/selectAutoInclude.gif"> -->


In the preview, we use the following objects and DTOs


::: tabs

@tab Company
```java

@Data
@Table(value = "t_company",comment = "Company table")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * Company id
     */
    @Column(primaryKey = true,comment = "Company id",dbType = "varchar(32)")
    private String id;
    /**
     * Company name
     */
    @Column(comment = "Company name",nullable = false)
    private String name;

    /**
     * Company creation time
     */
    @Column(comment = "Company creation time")
    private LocalDateTime createTime;

    /**
     * Registered capital
     */
    @Column(comment = "Registered capital")
    private BigDecimal registerMoney;


    @Column(comment = "Test column",dbType = "varchar(500)",oldName = "column")
    private String column1;



    /**
     * Users owned by the company
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {Company.Fields.id},
            targetProperty = {SysUser.Fields.companyId})
    private List<SysUser> users;
}
```
@tab SysUser
```java

@Data
@Table(value = "t_user",comment = "User table")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * User id
     */
    @Column(primaryKey = true,comment = "User id",dbType = "varchar(32)")
    private String id;
    /**
     * User name
     */
    @Column(comment = "User name")
    private String name;
    /**
     * User birth date
     */
    @Column(comment = "User birth date")
    private LocalDateTime birthday;

    /**
     * Company id that user belongs to
     */
    @Column(comment = "Company id that user belongs to")
    private String companyId;

    /**
     * Company that user belongs to
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}

```
@tab CompanyDTO
```java

@Data
@ToString
public class CompanyDTO {


    /**
     * Company id
     */
    @Column(dbType = "varchar(32)", comment = "Company id")
    private String id;
    /**
     * Company name
     */
    @Column(nullable = false, comment = "Company name")
    private String name;
    /**
     * Company creation time
     */
    @Column(comment = "Company creation time")
    private LocalDateTime createTime;
    /**
     * Registered capital
     */
    @Column(comment = "Registered capital")
    private BigDecimal registerMoney;
    @Column(dbType = "varchar(500)", comment = "Test column", oldName = "column")
    private String column1;
    /**
     * Users owned by the company
     */
    @Navigate(value = RelationTypeEnum.OneToMany)
    private List<InternalUsers> users;


    /**
     * {@link com.easy.query.console.entity.SysUser }
     */
    @Data
    public static class InternalUsers {
        /**
         * User id
         */
        @Column(dbType = "varchar(32)", comment = "User id")
        private String id;
        /**
         * User name
         */
        @Column(comment = "User name")
        private String name;
        /**
         * User birth date
         */
        @Column(comment = "User birth date")
        private LocalDateTime birthday;
        /**
         * Company id that user belongs to
         */
        @Column(comment = "Company id that user belongs to")
        private String companyId;


    }

}

```

:::

In this chapter, we will demonstrate easy-query's powerful DTO return, supporting structured data return, unstructured flat data return, and transparent structure return

- Unstructured flat data
- Structured data return: one-to-one, many-to-one, one-to-many, many-to-many
- Transparent structure return: one-to-one, many-to-one, one-to-many, many-to-many

We still use users, roles, menus, and user addresses to describe the following interfaces

::: tabs

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

    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "userId")
    private SysUserAddress address;

    //"userId" string can use lombok annotation @FieldNameConstants added to UserRole object, use UserRole.Fields.UserId when using
    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfMappingProperty = "userId",
            targetMappingProperty = "roleId")
    private List<SysRole> roles;

}
```

@tab SysUserAddress
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

@tab RoleMenu
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

@tab SysMenu
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

:::

## Unstructured Flat Data
Unstructured data return is the most common structure return we use, similar to straightforward SQL results

### User DTO
```java
@Data
@FieldNameConstants
public class SysUserDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    //From SysUserAddress.addr
    private String myAddress;
}


List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .select(s -> new ClassProxy<>(SysUserDTO.class)
            .selectAll(s)//Map all fields from table s to SysUserDTO
            .field("myAddress").set(s.address().addr())//Additionally map user address to myAddress
        ).toList();

//If you don't want to use strings, you can use lombok annotation @FieldNameConstants in SysUserDTO

List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .select(s -> new ClassProxy<>(SysUserDTO.class)
            .selectAll(s)//Map all fields from table s to SysUserDTO
            .columns(
                s.address().addr().as(UserDTO.Fields.myAddress)//You can also use SysUserDTO::getMyAddress
            )
        ).toList();
```
Some users may want to assign values one by one, then we can handle it like this
```java

@Data
@EntityProxy
public class SysUserDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    //From SysUserAddress.addr
    private String myAddress;
}


List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .select(s -> {
            SysUserDTOProxy r = new SysUserDTOProxy();
            //r.selectAll(s); If fields are the same, you can write this to map directly
            r.id().set(s.id());
            r.name().set(s.name());
            r.createTime().set(s.createTime());
            r.myAddress().set(s.address().addr());
            return r;
        }).toList();
```


## Structured Data Return


::: tip Note!!!
> Right-click on the package that needs to generate dto, select `CreateStructDTO` (install the latest version of the plugin) and select the class you need
> Right-click on the package that needs to generate dto, select `CreateStructDTO` (install the latest version of the plugin) and select the class you need
> Right-click on the package that needs to generate dto, select `CreateStructDTO` (install the latest version of the plugin) and select the class you need
:::

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * This file is automatically generated by easy-query structured dto mapping
 * {@link com.easy.query.test.entity.blogtest.SysUser }
 *
 * @author easy-query
 */
@Data
public class StructSysUserDTO {

    private String id;
    private String name;
    private LocalDateTime createTime;
    @Navigate(value = RelationTypeEnum.OneToOne)
    private InternalAddress address;
    @Navigate(value = RelationTypeEnum.ManyToMany)
    private List<InternalRoles> roles;


    /**
     * {@link com.easy.query.test.entity.blogtest.SysUserAddress }
     */
    @Data
    public static class InternalAddress {
        private String id;
        private String userId;
        private String province;
        private String city;
        private String area;
        private String addr;
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysRole }
     */
    @Data
    public static class InternalRoles {
        private String id;
        private String name;
        private LocalDateTime createTime;
        @Navigate(value = RelationTypeEnum.ManyToMany)
        private List<InternalMenus> menus;
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysMenu }
     */
    @Data
    public static class InternalMenus {
        private String id;
        private String name;
        private String route;
        private String icon;
    }
}


//Can directly filter structured DTOs
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .selectAutoInclude(StructSysUserDTO.class).toList();
```

If we need to query structured data whose corresponding roles need extra filtering, such as roles with name "admin" need to be filtered, how should `selectAutoInclude` handle it?

```java

//Can directly filter structured DTOs
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        //Manual include(s) will override selectAutoInclude
        .include(s->s.roles(),roleQuery->roleQuery.where(role->role.name().eq("admin")))
        .where(s -> s.name().like("XiaoMing"))
        .selectAutoInclude(StructSysUserDTO.class).toList();
```

If our structured DTO needs an extra field from another table, what should we do? `selectAutoInclude` supports extra filtering on the main table. If you need to customize the from table, you can assign it through the second parameter expression. Of course, `@NavigateJoin` can also do this normally

Add `Topic.stars` to the main table
```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * This file is automatically generated by easy-query structured dto mapping
 * {@link com.easy.query.test.entity.blogtest.SysUser }
 *
 * @author easy-query
 */
@Data
@FieldNameConstants
public class StructSysUserDTO {

    private String id;
    private String name;
    private LocalDateTime createTime;
    private Integer topicStars;
    @Navigate(value = RelationTypeEnum.OneToOne)
    private InternalAddress address;
    @Navigate(value = RelationTypeEnum.ManyToMany)
    private List<InternalRoles> roles;


    /**
     * {@link com.easy.query.test.entity.blogtest.SysUserAddress }
     */
    @Data
    public static class InternalAddress {
        ....omitted
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysRole }
     */
    @Data
    public static class InternalRoles {
        ....omitted
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysMenu }
     */
    @Data
    public static class InternalMenus {
        ....omitted
    }
}


//Can also be done through @NavigateFlat or EXTRA_AUTO_INCLUDE_CONFIGURE which will be discussed in later chapters
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(Topic.class,(s, t2) -> s.id().eq(t2.id()))
        .where(s -> s.name().like("XiaoMing"))
        .selectAutoInclude(StructSysUserDTO.class,(s, t2)->Select.of(
                //////s.FETCHER.allFields(), please note that you don't need to add this line because selectAutoInclude will automatically execute allFields
                t2.stars().nullOrDefault(1).as(StructSysUserDTO.Fields.topicStars)//This way we added extra fields to the structured main table fields
        )).toList();
```

## Dynamic Sorting and Return Limit

Based on the above return results, we may need to customize the sorting and return quantity of the second or even third level structure in some specific cases, so how should we handle it

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * This file is automatically generated by easy-query structured dto mapping
 * {@link com.easy.query.test.entity.blogtest.SysUser }
 *
 * @author easy-query
 */
@Data
@FieldNameConstants
public class StructSysUserDTO {

    private String id;
    private String name;
    private LocalDateTime createTime;
    private Integer topicStars;
    @Navigate(value = RelationTypeEnum.OneToOne)
    private InternalAddress address;
    @Navigate(value = RelationTypeEnum.ManyToMany, orderByProps = {
            @OrderByProperty(property = "createTime", asc = true,mode = OrderByPropertyModeEnum.NULLS_FIRST),
            @OrderByProperty(property = "updateTime", asc = false,mode = OrderByPropertyModeEnum.NULLS_LAST)
    },offset = 2,limit = 5)//The generated SQL effect will become order by create_time asc,update_time desc (null first|last handled by the framework itself) limit 2,5
    private List<InternalRoles> roles;


    /**
     * {@link com.easy.query.test.entity.blogtest.SysUserAddress }
     */
    @Data
    public static class InternalAddress {
        ....omitted
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysRole }
     */
    @Data
    public static class InternalRoles {
        ....omitted
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysMenu }
     */
    @Data
    public static class InternalMenus {
        ....omitted
    }
}
```
::: tip Note!!!
> In most cases, we may have had enough, but in some cases, users may still need to dynamically control list conditions under multiple levels, so how should we quickly implement it? Please jump to [Configure SelectAutoInclude](/easy-query-doc/en/dto-query/map2)
:::



## Transparent Structure Return NavigateFlat
Quickly return menus owned by users. Since users and menus are connected by roles through many-to-many relationships, it would be very troublesome to implement it yourself

Users and menus are separated by role's many-to-many, so if you want to get user menu ids, you can quickly filter them in this way

Method 1: Only get menu ids owned by the user
```java
List<String> menuIds = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .toList(s -> s.roles().flatElement().menus().flatElement().id());
```
Method 2: Only get menu ids and menu names owned by the user
```java

List<SysMenu> menuIdNames = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .toList(s -> s.roles().flatElement().menus().flatElement(x->x.FETCHER.id().name()));
```
Method 3: Return user DTO and menu id collection and role id collection owned by the user
```java
/**
 * {@link SysUser}
 */
@Data
public class SysUserFlatDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    
    //Transparently get the id under menus under roles under user. If the transparently obtained is not a basic type, the object can only be a database object, not a dto object
    @NavigateFlat(pathAlias = "roles.menus.id")//Add comment {@link SysUser} to dto to point to entity, plugin supports intelligent hints
    private List<String> menuIds;



    @NavigateFlat(pathAlias = "roles.id")
    private List<String> roleIds;
}


List<SysUserFlatDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("XiaoMing"))
        .selectAutoInclude(SysUserFlatDTO.class).toList();
```


