---
title: entity和proxy的api区别
---


首先如果您无法接受`entityQuery`模式需要对象实现`ProxyEntityAvailable`接口的也可以换成`easyProxyQuery`来查询两者出了部分功能不太一样本质是一样的


::: tip 说明!!!
> 部分使用代理对象的地方需要使用`EntityProxy.createTable()`来创建创建后两者是一样的,所以具体使用哪种用户自行抉择
:::

## 查询
easyEntityQuery对象因为泛型感知已经知晓Proxy所以可以直接通过`class`来获取查询,而Proxy因为数据库对象是孤单对象没有具体的proxy绑定只有Proxy能够感知到数据库对象所以两种在创建的时候会不一样

```java
//entity
easyEntityQuery.queryable(SysUser.class).where(o->o.id().eq("123"));

easyEntityQuery.queryable(SysUser.class)
.leftJoin(Topic.class,(user,topic)->user.id().eq(topic.id()))

//proxy
easyProxyQuery.queryable(SysUserProxy.createTable()).where(o->o.id().eq("123"));

easyProxyQuery.queryable(SysUserProxy.createTable())
.leftJoin(TopicProxy.createTable(),(user,topic)->user.id().eq(topic.id()))
```

## 插入
```java
//entity
easyEntityQuery.insertable(new SysUser())....

//proxy
easyProxyQuery.insertable(new SysUser()).useProxy(SysUserProxy.createTable())....

```

## 修改
```java
//entity
//对象更新包括对象集合
easyEntityQuery.updateable(new SysUser())....
//自定义更新
easyEntityQuery.updateable(SysUser.class)....

//proxy
//对象更新包括对象集合如果后续不需要处理column信息那么不需要useProxy
easyProxyQuery.updateable(new SysUser())).useProxy(SysUserProxy.createTable())....


//自定义更新
easyProxyQuery.updateable(SysUserProxy.createTable())....

```



## 删除
```java
//entity
//对象更新包括对象集合
easyEntityQuery.deletable(new SysUser())....
//自定义更新
easyEntityQuery.upddeletableteable(SysUser.class)....

//proxy
//对象更新包括对象集合如果后续不需要处理column信息那么不需要useProxy
easyProxyQuery.updateable(new SysUser())).useProxy(SysUserProxy.createTable())....


//自定义删除
easyProxyQuery.deletable(SysUserProxy.createTable())....
