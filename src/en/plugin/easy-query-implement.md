---
title: Quick Generate ProxyEntityAvailable
order: 10
category:
  - plugin
---

# EasyQueryImplement

## Automatic Proxy Object Implementation
`eq` uses Java's APT technology (KSP technology in Kotlin) to generate proxy objects for objects by generating source code at compile time. The objects that users operate on are proxy objects.


## Generate Proxy Classes


The proxy class `SysUserProxy` associated with the entity class `SysUser` does not currently exist. Idea cannot recognize the proxy class and cannot compile it, but we can still trigger `eq`'s APT tool to generate the proxy class by building the project. `eq`'s APT will create corresponding proxy classes for all entity classes that use `@EntityProxy`. Proxy classes provide friendly hints and type checking for table aliases, column names, column types, etc. These proxy classes can help us better set condition queries and assignments.


After building the project, the proxy classes will be generated in the specified directory as follows:

<img  :src="$withBase('/images/startup5.png')">



::: warning Note!!!
> If EasyQueryImplement doesn't work, please check if the class has added `@EntityProxy`
:::

<img  :src="$withBase('/images/startup3.png')">



::: warning Note!!!
<!-- > Framework version 2.0.15+ does not need to implement the `proxyTableClass` method, and the idea-plugin plugin will not generate this method after 0.0.57 -->
> If your project is multi-module, you only need to use `sql-processor` in the modules that need to use the @EntityProxy annotation
:::


<!-- <img src="/startup1.png"> -->


After building the project, if Idea still cannot recognize the proxy classes, you can mark the directory as a generated directory.

<img  :src="$withBase('/images/startup2.png')">

::: warning Note!!!
> If it still doesn't work, it's recommended to click the Maven refresh button on the right side of Idea to refresh
:::

<img  :src="$withBase('/images/startup4.png')">

<!-- After building the project and generating the proxy classes, you need to import the corresponding proxy class `UserProxy` in `User` -->



::: danger Note!!!
If the proxy class is not generated, i.e., it prompts that the `Proxy` class does not exist


- Check if there are errors like javacTree, which may be caused by a low version of lombok. Upgrade it.
- Check if the sql-processor package is imported (if there is no `annotationProcessorPaths` as shown below, it is recommended to import independently in each module that needs to generate proxies (in multi-module projects))
- If you are using `gradle`, the import should be changed from `implement` to `annotationprocessor`, i.e., `annotationProcessor "com.easy-query:sql-processor:${easyQueryVersion}"`
- Set Idea's annotation processor: Build, Execution, Deployment, Compiler, Annotation Processors, select Enable annotation processing and select Obtain processors from project classpath

- If you already have `annotationProcessorPaths`, you can add `eq`'s `apt` processing to it. If you haven't used it before, it's still recommended to import `sql-processor` separately in the modules that need apt.
With the following configuration, you don't need to import `sql-processor` separately in each individual `module`:
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
        <!-- Note the order. If it doesn't work, move eq to the first position -->
            <path>
            <!-- lombok... -->
            </path>
            <path>
            <!-- mapstruct... -->
            </path>
            <path>
                <groupId>com.easy-query</groupId>
                <artifactId>sql-processor</artifactId>
                <version>${easy-query.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```
:::

<!-- <img src="/startup6.png"> -->

