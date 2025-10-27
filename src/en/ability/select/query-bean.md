---
title: Query Object
order: 10
---

# Query Object
`eq` provides rich expressions and intuitive expressions, allowing users to conveniently use expressions to build SQL and efficiently retrieve database object data in daily development.

They provide an elegant way to write queries with type-safe compile-time checking. Together with IDE's auto-completion feature, they are both easy to use and easy to learn.

Query Beans are generated through Java's annotation processor (APT) or Kotlin's annotation processor (KAPT || KSP).

For each entity (Entity) with `@EntityProxy` annotation, an object BeanProxy named `{BeanPackage}.proxy.{BeanName}Proxy` will be generated in the same package, with `Proxy` suffix added. Users can also customize the proxy object name in `@EntityProxy`.
For example, if the entity Bean is called Customer, a query Bean named CustomerProxy will be generated.

When the entity model changes, the query Bean will be regenerated (can be generated in real-time after installing the plugin, otherwise requires clean-build). This way developers can get compile-time checking when using these queries in applications - if a query is no longer valid, it will report an error at compile stage.

## Case

Get single user:
```java
//Return single user or null, if multiple records appear then corresponding error will be thrown
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).singleOrNull();

//Return single user and not null, if null result appears then error, if multiple records appear then error
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).singleNotNull();
```

Get first user:
```java
//Return first user or null, framework automatically adds limit 1 or top 1
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).firstOrNull();

//Return first user and not null, if null result appears then error, framework automatically adds limit 1 or top 1
SysUser xiaoMing = easyEntityQuery.queryable(SysUser.class).where(m -> {
    m.name().eq("xiao ming");
}).firstNotNull();
```
::: tip Error Interception Replacement!!!
> Can implement by replacing framework default behavior `AssertExceptionFactory` interface, see [Replace Framework Internal Behavior](/en/easy-query-doc/framework/replace-configure) for details
:::

Get all users, no limit on returned count by default. If you need to limit, you can modify through configuration option `resultSizeLimit` [Click to query configuration options](/en/easy-query-doc/framework/replace-configure)
```java
List<SysUser> users = easyEntityQuery.queryable(SysUser.class).toList();
```

Get users whose name contains `zhang san`:
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            //If you use like, you need to handle percent sign and underscore in parameters yourself
            m.name().contains("zhang san");
        }).toList();
```
Multiple conditions: Get user collection whose name contains `zhang san` and age greater than `20`:
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).toList();
```

Sorting: Get user collection whose name contains `zhang san` and age greater than `20`, sorted by age ascending:
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            m.name().contains("zhang san");
            m.age().gt(20);
        }).orderBy(m -> {
            m.age().asc();
        }).toList();
```

Multiple sorting: Get user collection whose name contains `zhang san` and age greater than `20`, sorted by age ascending, name descending:
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

