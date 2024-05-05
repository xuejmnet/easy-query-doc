---
title: 快速了解api🔥🔥🔥
---

## 快速查询
`easy-query`提供了一套快速查询的api,这套api支持`sql`模式的增删改查和join,也支持`stream`模式的对象函数查询扩展

### 快速筛选
首先我们定义一个`user`用户信息对象
```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime;

    @Override
    public Class<SysUserProxy> proxyTableClass() {
        return SysUserProxy.class;
    }
}
```

筛选用户名称包含小明的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->s.name().like("小明"))
    .toList()
```
筛选用户名称包含小明并且是2020年以前创建的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->{
            s.name().like("小明");
            s.createTime().lt(LocalDateTime.of(2020,1,1,0,0))
    })
    .toList()
```
筛选用户名称包含小明的或者名称包含小红的
```java
easyEntityQuery.queryable(SysUser.class)
    .where(s->{
        s.or(()->{
            s.name().like("小明");
            s.name().like("小红");
        })

    })
    .toList()
```
假设我们存在一张表是用户地址信息表
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
筛选用户叫做小明并且地址是绍兴的
```java

easyEntityQuery.queryable(SysUser.class)
    .leftJoin(SysUserAddress.class,(s,a)->s.id().eq(a.userId()))
    .where((s,a)->{
            s.name().like("小明");
            a.area().eq("绍兴");
    })
    .toList()
```

::: tip 说明!!!
> 上述这个模式我们称之为显式join,就是手动将用户表和用户地址表进行join
:::
接下来我们在用户表上添加一个对象关联关系,一对一用户地址表,用来表明一个用户有一个地址
```java
@Table("t_user")
@Data
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private LocalDateTime createTime; 

    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "userId")
    private SysUserAddress address;

    @Override
    public Class<SysUserProxy> proxyTableClass() {
        return SysUserProxy.class;
    }
}
```
接下来我们再次来筛选用户叫做小明并且地址是绍兴的
```java

easyEntityQuery.queryable(SysUser.class)
    .where(s->{
            s.name().like("小明");
            s.address().area().eq("绍兴");
    })
    .toList()
```
::: tip 说明!!!
> 上述这个模式我们称之为隐式join,就是因为用户表里面已经约定好和用户地址的对应关系,所以无需手动join也可以实现筛选
:::