---
title: Common Issues (Important)❗️❗️❗️
order: 99
---


# Common Issues
This section summarizes some common issues

## Class cast
If you encounter the above error, it's likely because you've introduced spring-dev-tool or other hot-reload components. Remove (not disable) the related components or exclude eq-related classes.
Refer to Spring's official documentation: https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.devtools.restart.customizing-the-classload

## SpringBoot Startup Error
```log
java.lang.IllegalStateException: Unable to load cache item
	at org.springframework.cglib.core.internal.LoadingCache.createEntry(LoadingCache.java:79) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.internal.LoadingCache.get(LoadingCache.java:34) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator$ClassLoaderData.get(AbstractClassGenerator.java:134) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator.create(AbstractClassGenerator.java:319) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createHelper(Enhancer.java:572) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createClass(Enhancer.java:419) ~[spring-core-5.3.29.jar:5.3.29]
```
Main reasons are:
- Missing aop dependency
- Incorrect aop component version

Solution: add the corresponding dependency

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-aop</artifactId>
		</dependency>
```
If you don't want to use aop, you can disable default aop tracking loading. Add `easy-query-track:enable:false` in the same directory as `application.yml`
```yml
easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  start-time-job: true

easy-query-track:
  # Default is true
  enable: false
```


## SpringBoot Solon Startup Error
```log
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'easyQueryClient' defined in class path resource [com/easy/query/sql/starter/EasyQueryStarterBuildAutoConfiguration.class]: Failed to instantiate [com.easy.query.core.api.client.EasyQueryClient]: Factory method 'easyQueryClient' threw exception with message: Please select the correct database dialect. For Spring-related configuration, set it in the yml file, for example:[easy-query.database: mysql]

```

Higher versions of `eq` require that you must select a `database` and cannot leave it unselected, except for self-built ones. So you just need to explicitly specify the database dialect in the yml file

## Proxy Not Generated
If `Proxy` is not generated, first confirm whether the `sql-api-proxy` package is imported. If using `@EntityProxy`, please confirm whether `sql-processor` is imported for each module that needs generation. If using `@EntityFileProxy`, please confirm whether the plugin is referenced.
The plugin can effectively improve user experience



## If the Plugin Reports Error
If idea reports error `Slow operations are prohibited on EDT. See SlowOperations.assertSlowOperationsAreAllowed javadoc`

Then double-click `shift`, enter `Registry...`, then search for `slow` in the pop-up, and uncheck the `value` of `ide.slow.operations.assertion`

## Aliyun Mirror Cannot Find Dependency?

```text
Could not find artifact xxxxx:pom:xxxx
in alimaven (http://maven.aliyun.com/nexus/content/groups/public/)
```

This is because Aliyun mirror is currently under maintenance. You can replace it with Tencent Cloud or Huawei Cloud mirror sources. Modify the settings.xml file in the Maven installation directory and add the following configuration:

Tencent Cloud:

```xml
<mirror>
    <id>tencent-cloud</id>
    <mirrorOf>*</mirrorOf>
    <name>tencent-cloud</name>
    <url>https://mirrors.cloud.tencent.com/nexus/repository/maven-public/</url>
</mirror>
```

Huawei Cloud:

```xml
<mirror>
    <id>huawei-cloud</id>
    <mirrorOf>*</mirrorOf>
    <name>huawei-cloud</name>
    <url>https://mirrors.huaweicloud.com/repository/maven/</url>
</mirror>
```

## Delete Error
'DELETE' statement without 'WHERE' clears all data in the table

This error is because eq does not allow deletion without explicitly specifying where by default. You can perform the following operations
```java
//Just add any condition
easyEntityQuery.deletable(User.class).disableLogicDelete()allowDeleteStatement(true).where(u->u.id().isNotNull()).executeRows();

easyEntityQuery.deletable(User.class).disableLogicDelete()allowDeleteStatement(true).where(u->u.expression().sql("1=1")).executeRows();
```
Of course, you can also set the configuration `deleteThrow` to `false`, so deletion will not report an error

## proxy Does Not Exist


::: warning Error!!!
If you encounter an error after build: java: package xxxxxxxx.proxy does not exist

Reason: Because entity mode uses Java's apt compile-time code generation to implement corresponding functions, if your project has errors, as long as you don't clean and recompile, you can know the specific error point. If you clean, it may cause apt problems due to some reasons, such as missing semicolon in `Controller` code causing overall errors, which will also cause proxy errors. You can check what modifications were made before and after git commit. If it can't compile from the beginning, the reason may be that `sql-processor` or `sql-ksp-processor` is not correctly imported

- Check if there are compilation errors in entity classes
- Can the entire project compile successfully
- Check if there are javacTree-like errors, which may be caused by low lombok version, just upgrade
- Check if the sql-processor package is imported (if there is no `annotationProcessorPaths` below, it is recommended to import independently for each module that needs to generate proxy (in multi-module))
- If you are using `gradle`, the import should change `implement to annotationprocessor`, i.e., `annotationProcessor "com.easy-query:sql-processor:${easyQueryVersion}"`
- Set idea's annotation processor: Build,Execution,Deployment,Compiler,Annotation Processors, select Enable annotation processing and select Obtain processors from project classpath

- If you already have `annotationProcessorPaths`, you can add `eq`'s `apt` processing to it. If you haven't used it before, it is still recommended to import `sql-processor` separately for modules that need apt
With the following configuration, you don't need to import `sql-processor` separately in each independent `module`
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
        <!-- Note the order, if it doesn't work, move eq to the first position -->
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

lombok + mapstruct + easy-query can try the following order

<img :src="$withBase('/images/lombok_mapstruct_eq.png')">

## Keyword Processing
Because SQL statements add double quotes, backticks, etc., causing case sensitivity, you can use `nameConversion` to correctly map java properties to the database


java property  | nameConversion   | corresponding database column  
---  | ---  | --- 
userAge  | DEFAULT default | userAge
userAge  | UNDERLINED uppercase to lowercase underscore| user_age
userAge  | UPPER_UNDERLINED all uppercase with underscore| USER_AGE
userAge  | LOWER_CAMEL_CASE lower camel case| userAge
userAge  | UPPER_CAMEL_CASE upper camel case| UserAge

[Keyword Processing](/easy-query-doc/en/framework/key-word)

## mvn clean package Ineffective
If users can use idea's clean and package to build but cannot use command line to build, it is recommended to try the following solutions
- 1. First, do not import `sql-processor` separately
- 2. The outer lombok needs version number
- 3. lombok in maven-compiler-plugin cannot have version number
- 4. maven-compiler-plugin needs to add com.easy-query's sql-processor




## Compilation Error Cannot Find Correct Problem
Compilation keeps reporting errors, unable to correctly find where the specific error is. Solution: The original project was running fine, but after modifying something, build cannot start correctly, and compilation errors are always proxy-related

Reason: Due to compile-time dependencies, idea cannot correctly output error information. Large-scale file modifications such as framework cross-version upgrades cause some errors that idea cannot correctly return specific information

Investigate related problems through the following steps:

- 1. Copy a copy of the current project to another directory, let's call it projectb
- 2. Open projectb with idea
- 3. Globally replace projectb's annotations, replace @EntityProxy with @EntityFileProxy
- 4. maven clean projectb to clear all targets
- 5. Open the plugin and select compileAll because you used @EntityFileProxy, it will be generated to the src source code directory
- 6. Build projectb to find the corresponding errors and fix them in your current projecta
- 7. If projectb can already compile but projecta still can't, close idea and restart, or delete the `.idea` folder


::: tip Note!!!
> Remember to upgrade the plugin to the latest version❗️❗️❗️
> Remember to upgrade the plugin to the latest version❗️❗️❗️
> Remember to upgrade the plugin to the latest version❗️❗️❗️
:::
