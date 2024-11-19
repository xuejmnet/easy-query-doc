---
title: NavigateFlat
---

# 说明
`NavigateFlat`注解使用在VO或者DTO对应的属性上,拥有可以直接获取对象关系的任意节点属性,比如在用户、角色、菜单中我们可以在用户的DTO中直接返回用户拥有的角色id集合和菜单id集合

没有n+1的复杂度,拥有高性能的获取

属性  | 默认值 | 描述  
--- | --- | --- 
value | RelationMappingTypeEnum.AUTO | 指定flat的对象是单个还是多个默认自动(后续应该会自动推断删除这个值),目前不需要设置
mappingPath | {} | 当前属性添加`@NavigateFlat`后要拉取的数据路径
pathAlias | "" | 用于代替mappingPath的强类型属性支持插件生成路径,获取的值是当前类下的静态属性

假如我们的对应关系是如下的
```java
public class SysUser{
    private String id;
    ...

    @Navigate(ManyToMany....)
    private List<SysRole> roles;
}
public class SysRole{
    private String id;
    ...

    @Navigate(ManyToMany....)
    private List<SysMenu> menus;
}
public class SysMenu{
    private String id;
    ...

}
```


## 案例

```java
public class UserDTO{
    private String id;
    private String name;
    //告诉框架获取路径是用户下的roles下的id
    @NavigateFlat(mappingPath = {
            "roles",
            "id"
    })
    private List<String> roleIds;

    //告诉框架获取的路径是用户下的roles下的menus下的id
    @NavigateFlat(mappingPath = {
            "roles",
            "menus",
            "id"
    })
    private List<String> menuIds;
}

```
当然很多时候我们没有办法记住这个路径是如何的所以我们可以通过插件提供的`NaviatePathGenerate`快速生成

我们可以再对应的DTO上填写注解`@see`和`@link`只需要添加默认一个即可，注意将光标放到对应的属性上即呼出`NaviatePathGenerate`即可
```java
/**
 * @see SysUser
 * {@link SysUser}
 */
public class UserDTO{
    private String id;
    private String name;
    //告诉框架获取路径是用户下的roles下的id

    private static final MappingPath ROLE_IDS_PATH = SysUserProxy.TABLE.roles().flatElement().id();

    @NavigateFlat(pathAlias = "ROLE_IDS_PATH")
    private List<String> roleIds;

    //告诉框架获取的路径是用户下的roles下的menus下的id
    private static final MappingPath MENU_IDS_PATH = SysUserProxy.TABLE.roles().flatElement().menus().flatElement().id();

    @NavigateFlat(pathAlias = "MENU_IDS_PATH")
    private List<String> menuIds;
}
```
当属性是一对多或者多对多的时候需要再对应的属性后添加`flatElement`来展开

除了基本类型我们也可以穿透获取对象


```java
/**
 * @see SysUser
 * {@link SysUser}
 */
public class UserDTO{
    private String id;
    private String name;

    //告诉框架获取的路径是用户下的roles下的menus
    private static final MappingPath MENUS_PATH = SysUserProxy.TABLE.roles().flatElement().menus().flatElement();

    @NavigateFlat(pathAlias = "MENUS_PATH")
    private List<MenuDTO> menus;

    public static class MenuDTO{
        private String id;
        private String name;
    }
}
```
那么有人会问我们是否可以使用`@Naviagte`如果你只需要获取`roles`那么是可以的但是如果你需要放弃`roles`获取`role`下面的`menus`那么是不可以的

NavigateFlat可以做到获取基本类型集合或者基本类型也可以穿透获取任意节点的任意数据,并且拥有非常智能的合并如果在同一个对象下那么`eq`会非常智能的合并两个查询


那么我们添加好注解后如何获取数据呢

## selectAutoInclude
我们可以通过`selectAutoInclude`让框架自动为我们拉取需要的数据并且会以最优解来查询数据
```java
eq.queryable(SysUser.class)
    .where(u->{
        u.name().like("小明")
    })
    .selectAutoInclude(UserDTO.class)
    .toList();
```