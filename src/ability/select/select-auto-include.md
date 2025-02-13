---
title: 结构化DTO selectAutoInclude
---

## 快速预览



::: tip 说明!!!
> 一行代码实现结构化对象获取
:::


<video src="/videos/selectAutoInclude.mp4" muted controls autoplay id='v' width="800"></video>
<!-- <img src="/selectAutoInclude.gif"> -->


预览里面我们采用的对象和dto分别是


::: tabs

@tab Company
```java

@Data
@Table(value = "t_company",comment = "企业表")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * 企业id
     */
    @Column(primaryKey = true,comment = "企业id",dbType = "varchar(32)")
    private String id;
    /**
     * 企业名称
     */
    @Column(comment = "企业名称",nullable = false)
    private String name;

    /**
     * 企业创建时间
     */
    @Column(comment = "企业创建时间")
    private LocalDateTime createTime;

    /**
     * 注册资金
     */
    @Column(comment = "注册资金")
    private BigDecimal registerMoney;


    @Column(comment = "测试列",dbType = "varchar(500)",renameFrom = "column")
    private String column1;



    /**
     * 企业拥有的用户
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
@Table(value = "t_user",comment = "用户表")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * 用户id
     */
    @Column(primaryKey = true,comment = "用户id",dbType = "varchar(32)")
    private String id;
    /**
     * 用户姓名
     */
    @Column(comment = "用户姓名")
    private String name;
    /**
     * 用户出生日期
     */
    @Column(comment = "用户出生日期")
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    @Column(comment = "用户所属企业id")
    private String companyId;

    /**
     * 用户所属企业
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
     * 企业id
     */
    @Column(dbType = "varchar(32)", comment = "企业id")
    private String id;
    /**
     * 企业名称
     */
    @Column(nullable = false, comment = "企业名称")
    private String name;
    /**
     * 企业创建时间
     */
    @Column(comment = "企业创建时间")
    private LocalDateTime createTime;
    /**
     * 注册资金
     */
    @Column(comment = "注册资金")
    private BigDecimal registerMoney;
    @Column(dbType = "varchar(500)", comment = "测试列", renameFrom = "column")
    private String column1;
    /**
     * 企业拥有的用户
     */
    @Navigate(value = RelationTypeEnum.OneToMany)
    private List<InternalUsers> users;


    /**
     * {@link com.easy.query.console.entity.SysUser }
     */
    @Data
    public static class InternalUsers {
        /**
         * 用户id
         */
        @Column(dbType = "varchar(32)", comment = "用户id")
        private String id;
        /**
         * 用户姓名
         */
        @Column(comment = "用户姓名")
        private String name;
        /**
         * 用户出生日期
         */
        @Column(comment = "用户出生日期")
        private LocalDateTime birthday;
        /**
         * 用户所属企业id
         */
        @Column(comment = "用户所属企业id")
        private String companyId;


    }

}

```

:::

本章节我们将展示easy-query的超强dto返回,支持结构化数据返回,非结构化平铺数据返回还有穿透结构返回

- 非结构化平铺数据
- 结构化数据返回 一对一 多对一 一对多 多对多
- 穿透结构返回 一对一 多对一 一对多 多对多

我们依然使用用户角色菜单和用户地址来描述下列接口

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

    //"userId"字符串可以使用lombok的注解 @FieldNameConstants 添加到对象UserRole上 使用的时候用UserRole.Fields.UserId
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

## 非结构化平铺数据
非机构化数据返回是我们平时在使用时最最最常见的结构返回,类似直白的sql结果

### 用户dto
```java
@Data
@FieldNameConstants
public class SysUserDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    //来自SysUserAddress.addr
    private String myAddress;
}


List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .select(SysUserDTO.class, s -> Select.of(
                s.FETCHER.allFields(),//将s表的所有字段哦度映射到SysUserDTO中
                s.address().addr().as("myAddress")//额外将用户地址映射到myAddress中
        )).toList();

//如果你不想使用字符串那么可以在SysUserDTO中使用lombok注解@FieldNameConstants

List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .select(SysUserDTO.class, s -> Select.of(
                s.FETCHER.allFields(),
                s.address().addr().as(SysUserDTO.Fields.myAddress)//当然也可以使用SysUserDTO::getMyAddress
        )).toList();
```
可能有些用户希望自己一个一个进行赋值那么我们可以这么处理
```java

@Data
@EntityProxy
public class SysUserDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    //来自SysUserAddress.addr
    private String myAddress;
}


List<SysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .select(s -> {
            SysUserDTOProxy r = new SysUserDTOProxy();
            //r.selectAll(s); 如果字段一样可以这么写直接映射
            r.id().set(s.id());
            r.name().set(s.name());
            r.createTime().set(s.createTime());
            r.myAddress().set(s.address().addr());
            return r;
        }).toList();
```


## 结构化数据返回


::: tip 说明!!!
> 右键需要生成dto的包,选择`CreateStructDTO`(安装插件最新版本即可) 选择您需要的类
> 右键需要生成dto的包,选择`CreateStructDTO`(安装插件最新版本即可) 选择您需要的类
> 右键需要生成dto的包,选择`CreateStructDTO`(安装插件最新版本即可) 选择您需要的类
:::

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
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


//可以直接筛选出结构化DTO
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(StructSysUserDTO.class).toList();
```

假如我们需要查询的结构化数据对应的roles需要额外筛选,譬如name是管理员的roles才需要被筛选出来那么`selectAutoInclude`应该如何处理？

```java

//可以直接筛选出结构化DTO
List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        //手动include(s)会覆盖掉selectAutoInclude
        .includes(s->s.roles(),roleQuery->roleQuery.where(role->role.name().eq("管理员")))
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(StructSysUserDTO.class).toList();
```

如果我们结构化DTO需要多一个额外字段由其他表来的那么我们该怎么办呢,`selectAutoInclude`支持对主表进行额外筛选如果需要从表也要自定义那么请将第二个参数表达式进行对其进行赋值即可,当然正常情况下`@NavigateJoin`也可以做到

主表添加`Topic.stars`
```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
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
        ....省略
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysRole }
     */
    @Data
    public static class InternalRoles {
        ....省略
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysMenu }
     */
    @Data
    public static class InternalMenus {
        ....省略
    }
}



List<StructSysUserDTO> users = easyEntityQuery.queryable(SysUser.class)
        .leftJoin(Topic.class,(s, t2) -> s.id().eq(t2.id()))
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(StructSysUserDTO.class,(s, t2)->Select.of(
                //////s.FETCHER.allFields(),请注意不需要添加这一行因为selectAutoInclude会自动执行allFields
                t2.stars().nullOrDefault(1).as(StructSysUserDTO.Fields.topicStars)//这样我们就将结构化主表字段增加了额外字段
        )).toList();
```

## 动态排序和返回限制

基于上述的返回结果我们可能在某些特定的情况下需要自定义返回的二级甚至三级结构的排序和返回数量那么我们应该如何处理呢

```java

/**
 * this file automatically generated by easy-query struct dto mapping
 * 当前文件是easy-query自动生成的 结构化dto 映射
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
    },offset = 2,limit = 5)//生成的sql效果将会变成order by create_time asc,update_time desc (null first|last 由框架自行处理) limit 2,5
    private List<InternalRoles> roles;


    /**
     * {@link com.easy.query.test.entity.blogtest.SysUserAddress }
     */
    @Data
    public static class InternalAddress {
        ....省略
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysRole }
     */
    @Data
    public static class InternalRoles {
        ....省略
    }


    /**
     * {@link com.easy.query.test.entity.blogtest.SysMenu }
     */
    @Data
    public static class InternalMenus {
        ....省略
    }
}
```
::: tip 说明!!!
> 在大部分情况我们可能已经够用了,但是在有些情况下可能用户还是需要动态来控制多层级下的列表条件之类的,那么我们应该如何来快速实现呢,请跳转至[配置SelectAutoInclude](/easy-query-doc/ability/select/select-auto-include-configurable)
:::



## 穿透结构返回
快速返回用户拥有的菜单,因为用户和菜单中间由角色进行关联并且两者都是多对多所以如果需要自行实现那么是非常麻烦的一件事情

用户和菜单之间隔着角色的多对多所以如果想要获取用户的菜单id直接可以通过这种方式快速筛选

方式1 仅获取用户拥有的菜单id
```java
List<String> menuIds = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .toList(s -> s.roles().flatElement().menus().flatElement().id());
```
方式2 仅获取用户拥有的菜单id和菜单名称
```java

List<SysMenu> menuIdNames = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .toList(s -> s.roles().flatElement().menus().flatElement(x->x.FETCHER.id().name()));
```
方式三返回用户DTO和用户拥有的菜单id集合和角色id集合
```java

@Data
public class SysUserFlatDTO {
    private String id;
    private String name;
    private LocalDateTime createTime;
    
    //穿透获取用户下的roles下的menus下的id 如果穿透获取的是非基本类型那么对象只能是数据库对象而不是dto对象
    // @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
    //         SysUser.Fields.roles,
    //         SysRole.Fields.menus,
    //         SysMenu.Fields.id
    // })
    // private List<String> menuIds;

//上下两种都可以 下面这种可以通过插件生成NavigatePathGenerate
    private static final MappingPath MENU_IDS_PATH= SysUserProxy.TABLE.roles().flatElement().menus().flatElement().id();

    @NavigateFlat(pathAlias = "MENU_IDS_PATH")
    private List<String> menuIds;

//非基本对象也可以直接返回数据库对象
//    @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
//            SysUser.Fields.roles,
//            SysRole.Fields.menus
//    })
//    private List<SysMenu> menu;

    @NavigateFlat(value = RelationMappingTypeEnum.ToMany,mappingPath = {
            SysUser.Fields.roles,
            SysMenu.Fields.id
    })
    private List<String> roleIds;
}


List<SysUserFlatDTO> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> s.name().like("小明"))
        .selectAutoInclude(SysUserFlatDTO.class).toList();
```