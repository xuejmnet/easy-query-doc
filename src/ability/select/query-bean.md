---
title: 查询对象
order: 10
---

# 查询对象
`eq`提供了丰富的表达式和符合用户直觉的表达式,让用户可以在日常开发中非常方便的使用表达式来构建sql,高效的获取数据库对象数据

但它们提供了一种优雅的方式来编写具有 类型安全（type safe）编译时检查的查询。配合 IDE 的自动补全功能，它们既易于使用，也容易上手。

查询 Bean 是通过 Java 的注解处理器（APT）或 Kotlin 的注解处理器（KAPT || KSP）生成的。

对于每一个实体（Entity）添加了`@EntityProxy`注解，都会生成一个同包名下`{BeanPackage}.proxy.{BeanName}Proxy`的对象 BeanProxy，名称后面会加上`Proxy`用户也可以在`@EntityProxy`中自定义代理对象名称。
例如，如果实体 Bean 叫 Customer，则会生成一个名为 CustomerProxy 的查询 Bean。

当实体模型发生变更时，查询 Bean 会被重新生成（安装插件后可以实时生成,否则需要clean-build）。这样开发者在应用中使用这些查询时可以获得编译时检查 —— 如果查询不再合法，就会在编译阶段报错。

## 案例

获取单个用户
```java
//返回单个用户或者null,如果出现多条记录那么则会抛出对应错误
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).singleOrNull();

//返回单个用户且不为null,如果出现null结果则报错,如果出现多条记录则会抛出错误
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).singleNotNull();
```

获取第一个用户
```java
//返回第一个用户或者null框架自动添加limit 1或者top 1
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).firstOrNull();

//返回第一个用户且不为null,如果出现null结果则报错 框架自动添加limit 1或者top 1
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).firstNotNull();
```
::: tip 错误拦截替换!!!
> 可以通过替换框架默认行为`AssertExceptionFactory`接口来实现,具体参考[替换框架内部行为](/easy-query-doc/framework/replace-configure)
:::



获取所有用户，默认不限制返回条数,如果需要限制可以通过配置项修改`resultSizeLimit` [点击查询配置项](/easy-query-doc/framework/replace-configure)
```java
List<SysUser> users = easyEntityQuery.queryable(SysUser.class).toList();
```

获取姓名为包含`zhang san`的用户
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            //如果你使用like那么要自行处理参数的百分号和下划线
            m.name().contains("zhang san");
        }).toList();
```
多条件:获取姓名包含`zhang san`且年龄大于`20`的用户集合
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).toList();
```

排序 获取姓名包含`zhang san`且年龄大于`20`的用户集合按年龄正序
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).orderBy(m -> {
            m.age().asc();
        }).toList();
```

多重排序 获取姓名包含`zhang san`且年龄大于`20`的用户集合按年龄正序,姓名倒序
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).orderBy(m -> {
            m.age().asc();
            m.name().desc();
        }).toList();
```


