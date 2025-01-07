---
title: 基础配置Kotlin
order: 10
---

# 安装软件

## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`com.easy-query`获取最新安装包

## spring-boot工程
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-kt-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```

## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`com.easy-query`获取最新安装包



## spring-boot初始化
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-kt-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
```yml
#配置文件
easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  #如果执行物理删除delete语句将会报错 如果改为false,后续可以通过allowDeleteStatment来允许
  delete-throw: true
  #打印sql显示(需要框架默认有日志以 log.info打印)
  print-sql: true
  #sqlNativeSegment输入和格式化无需处理单引号会自动处理为双单引号
  keep-native-style: true
  #entity映射到dto/vo使用属性匹配模式
  #支持 property_only column_only column_and_property
  mapping-strategy: property_only
```
```java

//依赖注入
@Autowired
private EasyQueryClient easyQueryClient;//通过字符串属性方式来实现查询

//推荐
@Autowired
private EasyKtQuery easyKtQuery;//对EasyQueryClient的增强通过lambda方式实现查询(推荐)

//推荐
@Autowired
private EasyProxyQuery easyProxyQuery;//对EasyQueryClient的增强通过apt代理模式实现强类型(推荐)
```

## 非spring-boot初始化

::: tip 说明!!!
> 使用代理模式的话非springboot环境必须要安装`sql-api-proxy`和`sql-processor`,springboot环境`starter`已经包含了
:::
```xml

<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了代理模式支持apt模式以非lambda形式的强类型sql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了apt自动生成代理对象  如果使用EntityFileProxy使用插件那么可以不引入这个包-->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
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
//强类型api
 EasyProxyuery easyProxyQuery = new DefaultEasyProxyQuery(easyQueryClient);
//使用新版本api对象查询
EntityQuery entityQuery = new DefaultEntityQuery(easyQueryClient);
```
