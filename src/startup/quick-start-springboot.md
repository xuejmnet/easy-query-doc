---
title: SpringBoot快速开始🔥🔥🔥
---
一般我们创建springboot项目有两种一种是单模块,一种是多模块,接下来我会分别实现这两种模块下`easy-query`应该如何集成

## 单模块
首先我们创建springboot项目或者maven项目
具体的`pom.xml`如下
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.17</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>org.easy-query</groupId>
    <artifactId>springbootdemo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>springbootdemo</name>
    <description>springbootdemo</description>
    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <maven.install.skip>true</maven.install.skip>
        <maven.deploy.skip>true</maven.deploy.skip>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <!--druid依赖-->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.21</version>
        </dependency>
        <!-- mysql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.31</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.18</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>2.0.25</version>
        </dependency>
        <!-- 不需要在引入因为starter已经引入了 -->
        <!-- <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${project.version}</version>
            <scope>compile</scope>
        </dependency> -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-springboot-starter</artifactId>
            <version>2.0.25</version>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>

```

配置`application.yml`
```yml
server:
  port: 8080

spring:
  profiles:
    active: dev

  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root

#配置文件
easy-query:
  #是否启动默认true
  enable: true
  #支持的数据库
  database: mysql
  #对象属性和数据库列名的转换器
  name-conversion: underlined
  #当执行物理删除是否报错,true表示报错,false表示不报错,默认true,如果配置为true,可以通过allowDeleteStament来实现允许
  delete-throw: true
  #是否打印sql 默认true 需要配置log信息才可以 默认实现sl4jimpl
  print-sql: true
  #配置为默认追踪,但是如果不添加@EasyQueryTrack注解还是不会启用所以建议开启这个如果需要只需要额外添加注解即可
  default-track: true
  #sqlNativeSegment输入和格式化无需处理单引号会自动处理为双单引号
  keep-native-style: true
```
编写数据库对象

::: code-tabs
@tab 数据库对象
```java
//import com.easy.query.core.annotation.Table;
//import com.easy.query.core.annotation.Column;
//@Data //如果您有lombok
@Table("t_topic")//注意必须使用easy-query的注解
@EntityProxy
public class Topic{

    @Column(primaryKey = true)//注意必须使用easy-query的注解
    private String id;
    private Integer stars;
    private String title;
    private String name;
    private LocalDateTime createTime;

    //get set方法...
}
```
@tab 数据库脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
:::

手动实现`ProxyEntityAvailable`接口或者使用插件实现(推荐)
::: tip 说明!!!
> 使用插件就右键`Generate/生成`选择`EntityQueryImplement`(菜单如果不知道就是生成get/set的地方,还是不知道就是windows就是jalt+insert,mac就是command+n)
> `TopicProxy`如果您没有安装插件那么就是在编写好上述代码后进行build会在target目录生成,如果生成后无法引用则标记annotations目录为generated sources root,具体请看下方截图
:::
```java
//import com.easy.query.core.annotation.Table;
//import com.easy.query.core.annotation.Column;
//@Data //如果您有lombok
@Table("t_topic")//注意必须使用easy-query的注解
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic,TopicProxy>{

    @Column(primaryKey = true)//注意必须使用easy-query的注解
    private String id;
    private Integer stars;
    private String title;
    private String name;
    private LocalDateTime createTime;

    //get set方法...
}
```

<img src="/startup2.png">



::: warning 说明!!!
> 如果您有洁癖不想实现这个接口也是可以的,就是在使用的时候使用`easyProxyQuery`而不是`easyEntityQuery`
> 只是有些框架是一套试题的情况下那么不需要实现接口也可以用entityQuery的api仅此而已正常使用还是推荐大家实现`ProxyEntityAvailable`接口
> 不是很推荐使用起来会稍微麻烦一点[点击查看两者的区别](/easy-query-doc/startup/diff-proxy)
> 不是很推荐使用起来会稍微麻烦一点[点击查看两者的区别](/easy-query-doc/startup/diff-proxy)
> 不是很推荐使用起来会稍微麻烦一点[点击查看两者的区别](/easy-query-doc/startup/diff-proxy)
```java
//easyEntityQuery.queryable(SysUser.class)
//easyProxyQuery.queryable(SysUserProxy.createTable())
```
:::


依赖注入`easyEntityQuery`即可完美使用

```java
//依赖注入

//强类型api
@Autowired
private EasyEntityQuery easyEntityQuery;//(强力推荐🔥🔥🔥)
//强类型api
@Autowired
private EasyProxyQuery easyProxyQuery;//(强力推荐🔥🔥🔥)

//动态类型api
@Autowired
private EasyQueryClient easyQueryClient;//通过字符串属性方式来实现查询

```

## 多模块
多模块和单模块的区别就是在需要生成Proxy的模块引入`sql-processor`包即可
```xml
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>last-version</version>
</dependency>
```
如果不清楚具体样例可以参考如下源码

[demo地址](https://github.com/xuejmnet/eq-multi-module) https://github.com/xuejmnet/eq-multi-module

多模块项目需要注意的是需要在您需要使用APT技术也就是使用注解`@EntityPorxy`的模块添加`sql-processor`,更多问题可以参考[常见问题](/easy-query-doc/question)