---
title: kotlin代理模式
---

`easy-query`的代理模式通过apt生成动态代码执行数据库操作,并且框架提供了自动apt编译插件修改entity数据库对象无需build也会自动修改对应的apt文件,进首页qq群后或者后续等待作者发布....

## 新建项目

<img src="/kapt1.png">

## 添加依赖
```xml

<!-- mysql驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
</dependency>
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${last-version}</version>
</dependency>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${last-version}</version>
</dependency>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${last-version}</version>
</dependency>
```

## 添加kapt设置
将下面的代码插入到`plugins`下的`plugin`下的`executions`
```xml
<execution>
    <id>kapt</id>
    <goals>
        <goal>kapt</goal>
    </goals>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>com.easy-query</groupId>
                <artifactId>sql-processor</artifactId>
                <version>${last-version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</execution>
```
## 新增数据库对象
data class
```java

@Table("t_topic")
@EntityProxy
 class Topic{
    @Column(primaryKey = true)
    var id:String?=null;
    var stars:Int?=null;
    var stars2:Int?=null;
    var stars3:Int?=null;
    var stars4:Int?=null;
    var stars6:Int?=null;
}

```
## 编译

<img src="/kapt3.png">
生成代码

<img src="/kapt4.png">

## 运行

```java
import com.easy.query.api.proxy.client.DefaultEasyProxyQuery
import com.easy.query.core.bootstrapper.EasyQueryBootstrapper
import com.easy.query.core.logging.LogFactory
import com.easy.query.mysql.config.MySQLDatabaseConfiguration
import com.zaxxer.hikari.HikariDataSource
import entity.proxy.TopicProxy

fun main(args: Array<String>) {
    println("Hello World!")
    var hikariDataSource = HikariDataSource()
    hikariDataSource.jdbcUrl =
        "jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true";
    hikariDataSource.username = "root";
    hikariDataSource.password = "root";
    hikariDataSource.driverClassName = "com.mysql.cj.jdbc.Driver";
    hikariDataSource.maximumPoolSize = 20;
    LogFactory.useStdOutLogging();

    var easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(hikariDataSource)
        .useDatabaseConfigure(MySQLDatabaseConfiguration())
        .build()
        //如果实现了ProxyEntityAvailable(可用插件生成则可以使用EasyEntityQuery)
    var easyEntityQuery = DefaultEasyEntityQuery(easyQueryClient)

    var toList2 = easyEntityQuery.queryable(topic)
        .where {
            it.id().eq("1")
            it.stars3()eq(,1)
        }
        .toList()
}

Connected to the target VM, address: '127.0.0.1:58734', transport: 'socket'
Hello World!
Program arguments: 
SLF4J: Failed to load class "org.slf4j.impl.StaticLoggerBinder".
SLF4J: Defaulting to no-operation (NOP) logger implementation
SLF4J: See http://www.slf4j.org/codes.html#StaticLoggerBinder for further details.
Logging initialized using 'class com.easy.query.core.logging.stdout.StdOutImpl' adapter.
==> Preparing: SELECT `id`,`stars`,`stars2`,`stars3`,`stars4`,`stars6` FROM `t_topic` WHERE `id` = ? AND `stars3` = ?
==> Parameters: 1(String),1(Integer)
SELECT `id`,`stars`,`stars2`,`stars3`,`stars4`,`stars6` FROM `t_topic` WHERE `id` = ? AND `stars3` = ?
java.sql.SQLSyntaxErrorException: Unknown column 'stars2' in 'field list'
```
运行只要有对应的sql打印就说明已经ok
::: warning 注意点及说明!!!
> 如果无法提示有对应的TopicProxy那么请刷新下maven
:::


## 错误


::: warning 注意点及说明!!!
> 如果出现错误`类文件具有错误的版本 55.0, 应为 52.0`请修改项目jdk和pom的一致
:::

<img src="/kapt2.png">

## 完整的pom
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <artifactId>untitled2</artifactId>
    <groupId>com.xjm</groupId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>consoleApp</name>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <kotlin.code.style>official</kotlin.code.style>
        <kotlin.compiler.jvmTarget>11</kotlin.compiler.jvmTarget>
    </properties>

    <repositories>
        <repository>
            <id>mavenCentral</id>
            <url>https://repo1.maven.org/maven2/</url>
        </repository>
    </repositories>

    <build>
        <sourceDirectory>src/main/kotlin</sourceDirectory>
        <testSourceDirectory>src/test/kotlin</testSourceDirectory>
        <plugins>
            <plugin>
                <groupId>org.jetbrains.kotlin</groupId>
                <artifactId>kotlin-maven-plugin</artifactId>
                <version>1.8.0</version>
                <executions>
                    <execution>
                        <id>kapt</id>
                        <goals>
                            <goal>kapt</goal>
                        </goals>
                        <configuration>
                            <annotationProcessorPaths>
                                <path>
                                    <groupId>com.easy-query</groupId>
                                    <artifactId>sql-processor</artifactId>
                                    <version>${last-version}</version>
                                </path>
                            </annotationProcessorPaths>
                        </configuration>
                    </execution>
                    <execution>
                        <id>compile</id>
                        <phase>compile</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <id>test-compile</id>
                        <phase>test-compile</phase>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>2.22.2</version>
            </plugin>
            <plugin>
                <artifactId>maven-failsafe-plugin</artifactId>
                <version>2.22.2</version>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>1.6.0</version>
                <configuration>
                    <mainClass>MainKt</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

    <dependencies>
        <!-- mysql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>3.3.1</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${last-version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${last-version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${last-version}</version>
        </dependency>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-test-junit5</artifactId>
            <version>1.8.0</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.8.2</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.jetbrains.kotlin</groupId>
            <artifactId>kotlin-stdlib-jdk8</artifactId>
            <version>1.8.0</version>
        </dependency>
    </dependencies>

</project>
```