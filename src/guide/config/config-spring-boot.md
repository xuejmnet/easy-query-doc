---
title: SpringBoot配置
---

# SpringBoot配置


## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`easy-query`获取最新安装包



## spring-boot工程
```xml
<properties>
    <easy-query.version>last-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
```yml
#配置文件
easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  delete-throw: true
  print-sql: true
```
```java
//依赖注入
@Autowired
private EasyQueryClient easyQueryClient;//通过字符串属性方式来实现查询

//推荐
@Autowired
private EasyQuery easyQuery;//对EasyQueryClient的增强通过lambda方式实现查询(推荐)

//推荐
@Autowired
private EasyProxyQuery easyProxyQuery;//对EasyQueryClient的增强通过apt代理模式实现强类型(推荐)
```
