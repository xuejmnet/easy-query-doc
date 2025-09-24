---
title: GraalVM
order: 90
---

# GraalVM
GraalVM 是一个高性能的多语言运行时（runtime），它支持以多种语言编写的应用程序，包括 Java、JavaScript、Python、Ruby、R 以及 WebAssembly 等，同时它也提供了一个重要特性：将 Java 应用程序编译为原生可执行文件（Native Image）。

::: tip 一句话解释!!!
> GraalVM 是一个可以把 Java 应用“变成原生程序”的高性能虚拟机，同时支持多语言混合执行。
:::

这是eq史上第一个native的demo,证明了在eq在native领域的可行性,具体是否使用用户自行选择参考


::: warning 说明!!!
> 本次demo是基于特定eq的版本,如果你是不同版本的eq那么反射声明可能需要注意因为后续版本可能扩展新的接口等处理具体可以[查看EasyQueryBuilderConfiguration](https://github.com/dromara/easy-query/blob/main/sql-core/src/main/java/com/easy/query/core/bootstrapper/EasyQueryBuilderConfiguration.java)
:::

## demo
本章节demo由[用户提供](https://github.com/wzszsw) 地址:https://github.com/wzszsw/easy-query-native-demo

具体代码可以参考用户提供的demo

## 运行步骤

### 步骤1
```java
public class DemoApplication {

    public static void main(String[] args) {
        EasyBeanUtil.FAST_BEAN_FUNCTION = ReflectBean::new;//启动项添加这句话替换默认的反射
        SpringApplication.run(DemoApplication.class, args);
    }

}
```

### 步骤2
<img :src="$withBase('/images/graalvm1.png')" msg="第一步">

### 步骤3
<img :src="$withBase('/images/graalvm2.png')" msg="第一步">

### 步骤4
<img :src="$withBase('/images/graalvm3.png')" msg="第一步">