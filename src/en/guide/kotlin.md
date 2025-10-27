---
title: Kotlin KSP Configuration
order: 7
---

# Kotlin Configuration
`eq` not only supports Java but also supports the use of `kotlin` language. We will use KSP to implement Kotlin-related processing

The source code for this chapter is available on Git. Please obtain it yourself if needed [Click to get it](https://github.com/xuejmnet/easy-query-samples)

## Creating a Kotlin Project
### Adding Dependencies

`build.gradle` file

```gradle
plugins {
    kotlin("jvm") version "1.9.21"
    id("com.google.devtools.ksp") version "1.9.21-1.0.15"
}

group = "com.test"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {

    implementation(kotlin("stdlib"))
    implementation("com.easy-query:sql-core:3.0.41")
    implementation("com.easy-query:sql-mysql:3.0.41")
    implementation("com.easy-query:sql-api-proxy:3.0.41")
//    annotationProcessor("com.easy-query:sql-processor:3.0.41")
    ksp("com.easy-query:sql-ksp-processor:3.0.41")
    implementation("com.mysql:mysql-connector-j:9.2.0")
    implementation("com.zaxxer:HikariCP:3.3.1")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(17)
    // Add generated code to the compilation path.
    // Without this configuration, gradle commands can still execute normally,
    // but Intellij cannot find the generated source code.
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}

```

### Adding Database Objects
```java
@Table("t_topic")
@EntityProxy
class Topic {
    @Column(primaryKey = true)
    var id:String?=null;
    var stars:Int?=null;
    var title:String?=null;
}
```

### Generating Proxy Objects
After building the current project, you can see the corresponding generated `TopicProxy` class in the build module

<img :src="$withBase('/images/kt-build.jpg')">

### Quick Interface Implementation with Plugin
If you have the plugin installed, you can quickly implement the interface using the plugin, or you can implement it yourself

<img :src="$withBase('/images/kt-impl.jpg')">

### Final Topic Class
```kotlin
package com.test.entity

import com.easy.query.core.annotation.Column
import com.easy.query.core.annotation.EntityProxy
import com.easy.query.core.annotation.Table

import com.easy.query.core.proxy.ProxyEntityAvailable;

import com.test.entity.proxy.TopicProxy;


//Can also use data class

@Table("t_topic")
@EntityProxy
class Topic : ProxyEntityAvailable<Topic, TopicProxy> {
    @Column(primaryKey = true)
    var id:String?=null;
    var stars:Int?=null;
    var title:String?=null;
}
```

### Writing Test Code
```kotlin

package com.test

import com.easy.query.api.proxy.client.DefaultEasyEntityQuery
import com.easy.query.core.api.client.DefaultEasyQueryClient
import com.easy.query.core.bootstrapper.EasyQueryBootstrapper
import com.easy.query.core.logging.LogFactory
import com.easy.query.mysql.config.MySQLDatabaseConfiguration
import com.test.entity.Topic
import com.zaxxer.hikari.HikariDataSource

fun main() {

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
    var entityQuery = DefaultEasyEntityQuery(easyQueryClient)
    var toList = easyQueryClient.queryable(Topic::class.java)
        .toList()
    var toList1 = entityQuery.queryable(Topic::class.java)
        .where {
            it.id().eq("123")
        }.toList()

}
```

## Kotlin Infix Expressions
If you want to use infix for operator comparisons, upgrade `eq` to `3.1.43+` and the plugin to `0.1.67+`, then implement a DSL infix operation yourself as follows
```kotlin
package com.test.entity

import com.easy.query.core.expression.parser.core.SQLTableOwner
import com.easy.query.core.proxy.SQLColumn
import com.easy.query.core.proxy.predicate.DSLColumnComparePredicate
import com.easy.query.core.proxy.predicate.DSLFunctionComparePredicate
import com.easy.query.core.proxy.predicate.DSLValuePredicate
import com.easy.query.core.proxy.predicate.aggregate.DSLSQLFunctionAvailable


infix fun <TProperty> DSLValuePredicate<TProperty>.eq(value: TProperty?) = this.eq(value)
infix fun <TProperty, TProxy, TProp> DSLColumnComparePredicate<TProperty>.eq(
    column: SQLColumn<TProxy, TProp>,
) {
    this.eq(column)
}
infix fun <TProperty, T> DSLFunctionComparePredicate<TProperty>.eq(column: T)
        where T : SQLTableOwner, T : DSLSQLFunctionAvailable {
    this.eq(column)
}
```
This way the above expression can be written like this
```kotlin
  var toList1 = entityQuery.queryable(Topic::class.java)
        .where {
            it.id eq "123"
        }.toList()

```
