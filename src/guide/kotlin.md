---
title: kotlin配置ksp使用
order: 7
---

# kotlin配置使用
`eq`不但支持java也支持`kotlin`语言的使用,我们将使用ksp来实现kotlin的相关处理

本章源代码在git上如果需要请自行获取[点我获取](https://github.com/xuejmnet/easy-query-samples)

## 创建koltin项目
### 添加依赖

`build.gradle`文件

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
    // 将生成的代码添加到编译路径中。
    // 没有这个配置，gradle命令仍然可以正常执行，
    // 但是, Intellij无法找到生成的源码。
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}

```

### 添加数据库对象
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

### 生成代理对象
将当前项目build后可以再对应的build模块看到对应生产的`TopicProxy`类

<img :src="$withBase('/images/kt-build.jpg')">

### 插件快速实现接口
你如果安装了插件可以通过插件快速时间接口,当然你也可以自己去实现

<img :src="$withBase('/images/kt-impl.jpg')">

### 最终的Topic类
```kotlin
package com.test.entity

import com.easy.query.core.annotation.Column
import com.easy.query.core.annotation.EntityProxy
import com.easy.query.core.annotation.Table

import com.easy.query.core.proxy.ProxyEntityAvailable;

import com.test.entity.proxy.TopicProxy;


//也可以用data class

@Table("t_topic")
@EntityProxy
class Topic : ProxyEntityAvailable<Topic, TopicProxy> {
    @Column(primaryKey = true)
    var id:String?=null;
    var stars:Int?=null;
    var title:String?=null;
}
```

### 编写测试代码
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

## kotlin中缀表达式
如果您希望使用中缀来进行操作符比较那么将`eq`升级到`3.1.43+`并且插件升级到`0.1.67+` 自己实现一个DSL中缀操作即可如下
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
这样上述表达式可以这么写
```kotlin
  var toList1 = entityQuery.queryable(Topic::class.java)
        .where {
            it.id eq "123"
        }.toList()

```