---
title: GraalVM
order: 90
---

# GraalVM
GraalVM is a high-performance multi-language runtime that supports applications written in various languages, including Java, JavaScript, Python, Ruby, R, and WebAssembly. It also provides an important feature: compiling Java applications into native executable files (Native Image).

::: tip Explanation in one sentence!!!
> GraalVM is a high-performance virtual machine that can "turn Java applications into native programs" while supporting multi-language mixed execution.
:::

This is the first native demo in eq history, proving the feasibility of eq in the native domain. Users can decide whether to use it or not as a reference.


::: warning Note!!!
> This demo is based on a specific version of eq. If you're using a different version of eq, you may need to pay attention to reflection declarations because future versions may extend new interfaces and handling. You can [view EasyQueryBuilderConfiguration](https://github.com/dromara/easy-query/blob/main/sql-core/src/main/java/com/easy/query/core/bootstrapper/EasyQueryBuilderConfiguration.java) for details
:::

## demo
The demo for this chapter is provided by [user](https://github.com/wzszsw) address: https://github.com/wzszsw/easy-query-native-demo

Specific code can refer to the demo provided by the user

## Running Steps

### Step 1
```java
public class DemoApplication {

    public static void main(String[] args) {
        EasyBeanUtil.FAST_BEAN_FUNCTION = ReflectBean::new;//Add this line in the startup item to replace the default reflection
        SpringApplication.run(DemoApplication.class, args);
    }

}
```

### Step 2
<img :src="$withBase('/images/graalvm1.png')" msg="Step 1">

### Step 3
<img :src="$withBase('/images/graalvm2.png')" msg="Step 2">

### Step 4
<img :src="$withBase('/images/graalvm3.png')" msg="Step 3">

