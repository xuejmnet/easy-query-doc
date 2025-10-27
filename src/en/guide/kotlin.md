---
title: Kotlin Configuration with KSP
order: 7
---

# Kotlin Configuration

Easy-query supports not only Java but also Kotlin! We use KSP (Kotlin Symbol Processing) for code generation.

Source code for this chapter is available on GitHub: [Get it here](https://github.com/xuejmnet/easy-query-samples)

## Creating a Kotlin Project

### Add Dependencies

`build.gradle` file:

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
    
    // Use KSP instead of annotationProcessor
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
    
    // Add generated code to compilation path
    // Without this config, gradle commands work fine,
    // but IntelliJ cannot find the generated sources
    sourceSets.main {
        kotlin.srcDir("build/generated/ksp/main/kotlin")
    }
}
```

### Create Database Entity

```kotlin
@Table("t_topic")
@EntityProxy
class Topic {
    @Column(primaryKey = true)
    var id: String? = null
    var stars: Int? = null
    var title: String? = null
}
```

### Generate Proxy Object

After building the project, you can see the generated `TopicProxy` class in the build directory:

<img :src="$withBase('/images/kt-build.jpg')">

### Quick Interface Implementation with Plugin

If you have the Easy-query plugin installed, you can quickly implement the interface. Otherwise, implement it manually:

<img :src="$withBase('/images/kt-impl.jpg')">

### Final Topic Class

```kotlin
package com.test.entity

import com.easy.query.core.annotation.Column
import com.easy.query.core.annotation.EntityProxy
import com.easy.query.core.annotation.Table
import com.easy.query.core.proxy.ProxyEntityAvailable
import com.test.entity.proxy.TopicProxy

// Can also use data class

@Table("t_topic")
@EntityProxy
class Topic : ProxyEntityAvailable<Topic, TopicProxy> {
    @Column(primaryKey = true)
    var id: String? = null
    var stars: Int? = null
    var title: String? = null
}
```

### Write Test Code

```kotlin
package com.test

import com.easy.query.api.proxy.client.DefaultEasyEntityQuery
import com.easy.query.core.bootstrapper.EasyQueryBootstrapper
import com.easy.query.core.logging.LogFactory
import com.easy.query.mysql.config.MySQLDatabaseConfiguration
import com.test.entity.Topic
import com.zaxxer.hikari.HikariDataSource

fun main() {
    println("Hello World!")

    var hikariDataSource = HikariDataSource()
    hikariDataSource.jdbcUrl =
        "jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true"
    hikariDataSource.username = "root"
    hikariDataSource.password = "root"
    hikariDataSource.driverClassName = "com.mysql.cj.jdbc.Driver"
    hikariDataSource.maximumPoolSize = 20
    LogFactory.useStdOutLogging()

    var easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(hikariDataSource)
        .useDatabaseConfigure(MySQLDatabaseConfiguration())
        .build()
    
    var entityQuery = DefaultEasyEntityQuery(easyQueryClient)
    
    // Method 1: Using EasyQueryClient
    var toList = easyQueryClient.queryable(Topic::class.java)
        .toList()
    
    // Method 2: Using EasyEntityQuery
    var toList1 = entityQuery.queryable(Topic::class.java)
        .where {
            it.id().eq("123")
        }.toList()
}
```

## Kotlin Infix Expressions

If you prefer using infix notation for operators, upgrade to `eq 3.1.43+` and plugin `0.1.67+`, then implement your own DSL infix operators:

### Define Infix Operators

```kotlin
package com.test.entity

import com.easy.query.core.expression.parser.core.SQLTableOwner
import com.easy.query.core.proxy.SQLColumn
import com.easy.query.core.proxy.predicate.DSLColumnComparePredicate
import com.easy.query.core.proxy.predicate.DSLFunctionComparePredicate
import com.easy.query.core.proxy.predicate.DSLValuePredicate
import com.easy.query.core.proxy.predicate.aggregate.DSLSQLFunctionAvailable

// Define infix operators
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

### Use Infix Notation

```kotlin
var toList1 = entityQuery.queryable(Topic::class.java)
    .where {
        it.id eq "123"  // Infix notation!
    }.toList()
```

## Complete Example

### Project Structure

```
project/
├── build.gradle
├── src/
│   ├── main/
│   │   └── kotlin/
│   │       └── com/test/
│   │           ├── entity/
│   │           │   ├── Topic.kt
│   │           │   └── InfixOperators.kt
│   │           └── Main.kt
│   └── test/
│       └── kotlin/
└── build/
    └── generated/
        └── ksp/
            └── main/
                └── kotlin/
                    └── com/test/entity/proxy/
                        └── TopicProxy.kt
```

### Advanced Query Examples

```kotlin
// Complex query with multiple conditions
var posts = entityQuery.queryable(Post::class.java)
    .where {
        it.title() like "%kotlin%"
        it.stars() ge 10
        it.createTime() gt LocalDateTime.now().minusDays(7)
    }
    .orderBy {
        it.stars().desc()
        it.createTime().desc()
    }
    .toList()

// Using infix notation
var posts2 = entityQuery.queryable(Post::class.java)
    .where {
        it.title() like "%kotlin%"
        it.stars() ge 10
        it.createTime() gt LocalDateTime.now().minusDays(7)
    }
    .orderBy {
        it.stars().desc()
        it.createTime().desc()
    }
    .toList()

// Join query
var results = entityQuery.queryable(Post::class.java)
    .leftJoin(User::class.java) { post, user ->
        post.userId() eq user.id()
    }
    .where { post, user ->
        user.name() like "%john%"
    }
    .select { post, user ->
        Select.of(
            post.title(),
            user.name()
        )
    }
    .toList()
```

## Kotlin-Specific Features

### Data Classes

```kotlin
@Table("t_user")
@EntityProxy
data class User(
    @Column(primaryKey = true)
    var id: String? = null,
    var name: String? = null,
    var email: String? = null,
    var createTime: LocalDateTime? = null
) : ProxyEntityAvailable<User, UserProxy>
```

### Nullable Safety

Kotlin's null safety works seamlessly with Easy-query:

```kotlin
// Kotlin nullable types are respected
var user = entityQuery.queryable(User::class.java)
    .where {
        it.id() eq "123"
    }
    .singleOrNull()  // Returns User? (nullable)

// Safe call operator
user?.name?.let { println("User name: $it") }

// Elvis operator
val userName = user?.name ?: "Unknown"
```

### Extension Functions

Create extension functions for common queries:

```kotlin
// Extension function on EntityQuery
fun <T> EntityQuery<T>.whereIdEquals(id: String) = this.where {
    it.id() eq id
}

// Usage
var user = entityQuery.queryable(User::class.java)
    .whereIdEquals("123")
    .singleOrNull()
```

## Common Issues

### Issue: Proxy Class Not Found

**Problem**: `TopicProxy` cannot be resolved

**Solution**: 
1. Build the project: `./gradlew build`
2. Refresh Gradle in IntelliJ
3. Verify `build/generated/ksp/main/kotlin` is marked as source root

### Issue: KSP Version Mismatch

**Problem**: Compilation error about KSP version

**Solution**: Ensure KSP version matches Kotlin version:
```gradle
plugins {
    kotlin("jvm") version "1.9.21"
    id("com.google.devtools.ksp") version "1.9.21-1.0.15"
    // The KSP version should match the Kotlin version
}
```

### Issue: Nullable Type Warnings

**Problem**: Warnings about nullable types

**Solution**: Use nullable types consistently:
```kotlin
// ✅ Good
var title: String? = null

// ❌ Avoid
var title: String = ""  // Use null instead of empty string
```

## Performance Tips

Kotlin-specific optimizations:

```kotlin
// ✅ Use inline functions for better performance
inline fun <T> query(block: () -> List<T>): List<T> = block()

// ✅ Use sequences for large datasets
entityQuery.queryable(User::class.java)
    .toList()
    .asSequence()
    .filter { it.age > 18 }
    .map { it.name }
    .toList()

// ✅ Use destructuring
val (id, name, email) = entityQuery.queryable(User::class.java)
    .where { it.id() eq "123" }
    .select { Select.of(it.id(), it.name(), it.email()) }
    .single()
```

## See Also

- [KAPT Configuration](./kapt.md) - Alternative to KSP
- [Quick Start](../startup/quick-start.md)
- [Entity Configuration](../framework/annotation.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

