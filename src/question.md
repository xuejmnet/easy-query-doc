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

