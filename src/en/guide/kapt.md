---
title: Kotlin KAPT Configuration
order: 8
---

`easy-query`'s proxy mode generates dynamic code through APT to execute database operations, and the framework provides automatic APT compilation plugin. When you modify entity database objects, there's no need to build - the corresponding APT files will be automatically modified. Please join the QQ group on the homepage or wait for the author's release....

## Creating a New Project

<img :src="$withBase('/images/kapt1.png')">

## Adding Dependencies
```xml

<!-- MySQL driver -->
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
    <version>Use the latest version number</version>
</dependency>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>Use the latest version number</version>
</dependency>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>Use the latest version number</version>
</dependency>
```

## Adding KAPT Configuration
Insert the following code under `executions` under `plugin` under `plugins`
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
                <version>Use the latest version number</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</execution>
```
## Adding Database Objects
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
## Compilation

<img :src="$withBase('/images/kapt3.png')">
Generated code

<img :src="$withBase('/images/kapt4.png')">

## Running

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
        //If ProxyEntityAvailable is implemented (can be generated using the plugin, then you can use EasyEntityQuery)
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
As long as there's corresponding SQL printed when running, it means it's already OK
::: warning Notes and Explanation!!!
> If there's no prompt for the corresponding TopicProxy, please refresh Maven
:::


## Errors


::: warning Notes and Explanation!!!
> If you encounter the error `class file has wrong version 55.0, should be 52.0`, please modify the project JDK and pom to be consistent
:::

<img :src="$withBase('/images/kapt2.png')">

## Complete pom
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://maven.apache.org/POM/4.0.0"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd')">
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
                                    <version>Use the latest version number</version>
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
        <!-- MySQL driver -->
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
            <version>Use the latest version number</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>Use the latest version number</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>Use the latest version number</version>
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

