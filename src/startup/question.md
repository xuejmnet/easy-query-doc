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

如果出现如下错误
```log
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'easyQueryInitializeOption' defined in class path resource [com/easy/query/sql/starter/EasyQueryStarterAutoConfiguration.class]: Unsatisfied dependency expressed through method 'easyQueryInitializeOption' parameter 1; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'java.util.Map<java.lang.String, com.easy.query.core.basic.extension.version.VersionStrategy>' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {}

```


可能是springboot版本太低导致没有的依赖不是以空map返回而是报错

建议重写bean
```java
//    @Bean
//    @ConditionalOnMissingBean
//    public EasyQueryInitializeOption easyQueryInitializeOption(Map<String, Interceptor> interceptorMap,
//                                                               Map<String, VersionStrategy> versionStrategyMap,
//                                                               Map<String, LogicDeleteStrategy> logicDeleteStrategyMap,
//                                                               Map<String, ShardingInitializer> shardingInitializerMap,
//                                                               Map<String, EncryptionStrategy> encryptionStrategyMap,
//                                                               Map<String, ValueConverter<?, ?>> valueConverterMap,
//                                                               Map<String, TableRoute<?>> tableRouteMap,
//                                                               Map<String, DataSourceRoute<?>> dataSourceRouteMap,
//                                                               Map<String, ValueUpdateAtomicTrack<?>> valueUpdateAtomicTrackMap,
//                                                               Map<String, JdbcTypeHandler> jdbcTypeHandlerMap,
//                                                               Map<String, ColumnValueSQLConverter> columnValueSQLConverterMap,
//                                                               Map<String, IncrementSQLColumnGenerator> incrementSQLColumnGeneratorMap
//    ) {
//        return new EasyQueryInitializeOption(interceptorMap,
//                versionStrategyMap,
//                logicDeleteStrategyMap,
//                shardingInitializerMap,
//                encryptionStrategyMap,
//                valueConverterMap,
//                tableRouteMap,
//                dataSourceRouteMap,
//                valueUpdateAtomicTrackMap,
//                jdbcTypeHandlerMap,
//                columnValueSQLConverterMap,
//                incrementSQLColumnGeneratorMap);
//    }


    @Bean
    @Primary
    public EasyQueryInitializeOption easyQueryInitializeOption(Map<String, Interceptor> interceptorMap
    ) {
        return new EasyQueryInitializeOption(interceptorMap,
                versionStrategyMap,
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap());
    }
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


::: warning 报错!!!
如果遇到build后报错java:程序包xxxxxxxx.proxy不存在

- 检查是否存在javacTree之类的错误可能是由于lombok版本过低升级即可
- 查看是否引入sql-processor包（如果没有如下`annotationProcessorPaths`那么建议各自需要生成proxy的模块独立引入(多模块下)）
- 如果您是`gralde`那么引入应该是`implement改为annotationprocesser`即`annotationProcessor "com.easy-query:sql-processor:${easyQueryVersion}"`
- 设置idea的注解处理器 Build,Execution,Deployment,Compiler,Annotation Processors 选择Enable annotation processing 并且选择Obtain processors from project classpath

- 如果您之前已经存在`annotationProcessorPaths`那么你可以在里面添加`eq`的`apt`处理，如果未使用过那么还是建议需要apt的模块单独引入`sql-processor`
以下配置那么在各个独立`module`处不需要在引入`sql-processor`
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
        <!-- 注意顺序 -->
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