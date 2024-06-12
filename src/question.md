---
title: 常见问题(重要)❗️❗️❗️
---
# 常见问题
这里主要汇总了一些常见的问题
## SpringBoot 启动报错
```log
java.lang.IllegalStateException: Unable to load cache item
	at org.springframework.cglib.core.internal.LoadingCache.createEntry(LoadingCache.java:79) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.internal.LoadingCache.get(LoadingCache.java:34) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator$ClassLoaderData.get(AbstractClassGenerator.java:134) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator.create(AbstractClassGenerator.java:319) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createHelper(Enhancer.java:572) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createClass(Enhancer.java:419) ~[spring-core-5.3.29.jar:5.3.29]
```
主要原因是
- 缺少aop依赖
- aop组件版本不对

解决办法添加对应的依赖

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-aop</artifactId>
		</dependency>
```
如果不想使用aop可以禁用默认加载aop追踪 在`application.yml`同级目录下添加`easy-query-track:enable:false`
```yml
easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  start-time-job: true

easy-query-track:
  # 默认是true
  enable: false
```

## 没有生成Proxy
如果没有生成`Proxy`请先确定是否引入`sql-api-proxy`包,如果使用`@EntityProxy`请确定是否引入`sql-processor`各个生成的模块都需要,如果是`@EntityFileProxy`请确认是否引用插件。
插件可以有效的提升用户体验



## 如果插件报错
如果idea报错`Slow operations are prohibited on EDT. See SlowOperations.assertSlowOperationsAreAllowed javadoc`

那么就双击`shift`输入`Registry...`然后在弹出的地方搜索`slow` 将`ide.slow.operations.assertion`的`value`勾去掉

## 阿里镜像找不到依赖？

```text
Could not find artifact xxxxx:pom:xxxx
in alimaven (http://maven.aliyun.com/nexus/content/groups/public/)
```

这个是因为目前阿里云镜像正在维护，可以替换为腾讯云或者华为云的镜像源，更改 Maven 安装目录下的 settings.xml 文件， 添加如下配置：

腾讯云：

```xml
<mirror>
    <id>tencent-cloud</id>
    <mirrorOf>*</mirrorOf>
    <name>tencent-cloud</name>
    <url>https://mirrors.cloud.tencent.com/nexus/repository/maven-public/</url>
</mirror>
```

华为云：

```xml
<mirror>
    <id>huawei-cloud</id>
    <mirrorOf>*</mirrorOf>
    <name>huawei-cloud</name>
    <url>https://mirrors.huaweicloud.com/repository/maven/</url>
</mirror>
```

## 删除错误
'DELETE' statement without 'WHERE' clears all data in the table

这个错误是因为eq默认不允许删除不显式指定where,您可以进行如下操作
```java
//随便添加一个条件即可
easyEntityQuery.deletable(User.class).disableLogicDelete()allowDeleteStatement(true).where(u->u.id().isNotNull()).executeRows();

easyEntityQuery.deletable(User.class).disableLogicDelete()allowDeleteStatement(true).where(u->u.expression().sql("1=1")).executeRows();
```

## proxy不存在
如果遇到build后报错java:程序包xxxxxxxx.proxy不存在

- 查看是否引入sql-processor包
- 设置idea的注解处理器 Build,Execution,Deployment,Compiler,Annotation Processors 选择Enable annotation processing 并且选择Obtain processors from project classpath