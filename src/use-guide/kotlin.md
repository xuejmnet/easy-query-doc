---
title: kotlin配置使用
---

# kotlin配置使用
`eq`不但支持java也支持`kotlin`语言的使用,本次我们将使用k2在gradle下进行kotlin的简单的配置和使用



<!-- ## 创建koltin项目
### 添加依赖

`build.gradle`文件

```gradle
plugins {
    id 'org.jetbrains.kotlin.jvm' version '2.0.21'
}

group = 'com.easy-query'
version = '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    implementation "com.easy-query:sql-api-proxy:2.4.14"
    implementation "com.easy-query:sql-mysql:2.4.14"
    implementation "com.zaxxer:HikariCP:3.3.1"
    implementation "com.mysql:mysql-connector-j:9.2.0"


    annotationProcessor "com.easy-query:sql-ksp-processor:2.4.14"
    testImplementation 'org.jetbrains.kotlin:kotlin-test'
}

test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(17)
}
``` -->