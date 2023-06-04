---
title: 基础配置Kotlin
order: 10
---

# 安装软件

## spring-boot工程
```xml
<properties>
    <easy-query.version>last-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-kt-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```

## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`easy-query`获取最新安装包



## spring-boot初始化
```xml
<properties>
    <easy-query.version>last-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-kt-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
//依赖注入
@Autowired
private EasyKtQuery easyKtQuery;
```

## 非spring-boot初始化
```xml

<properties>
    <easy-query.version>last-version</easy-query.version>
</properties>
<!--  提供了以kotlin语法强类型,如果不引用也可以使用只是无法使用lambda表达式来表示属性只能用字符串 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api4kt</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
    <scope>compile</scope>
</dependency>
```
```java
//非强类型api
 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
 .setDataSource(dataSource)
 .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
//强类型api
 EasyKtQuery easyKtQuery = new DefaultEasyKtQuery(easyQueryClient);
```
