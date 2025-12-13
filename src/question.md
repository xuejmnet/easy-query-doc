---
title: 常见问题(重要)❗️❗️❗️
order: 99
---


# 常见问题
这里主要汇总了一些常见的问题

## Class cast
出现以上错误大概率是你引入了spring-dev-tool或者其他热加载组件导致的,移除相关组件不是关闭是移除或者排除eq相关类
相关文档参考 Spring 的官方网站：https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#using.devtools.restart.customizing-the-classload

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


## SpringBoot Solon启动报错
```log
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'easyQueryClient' defined in class path resource [com/easy/query/sql/starter/EasyQueryStarterBuildAutoConfiguration.class]: Failed to instantiate [com.easy.query.core.api.client.EasyQueryClient]: Factory method 'easyQueryClient' threw exception with message: Please select the correct database dialect. For Spring-related configuration, set it in the yml file, for example:[easy-query.database: mysql]

```

`eq`高版本要求必须选择一个`database`不可以不选,自行构建的除外，所以只需要在yml里面明确数据库方言即可

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
easyEntityQuery.deletable(User.class).disableLogicDelete().allowDeleteStatement(true).where(u->u.id().isNotNull()).executeRows();

easyEntityQuery.deletable(User.class).disableLogicDelete().allowDeleteStatement(true).where(u->u.expression().sql("1=1")).executeRows();
```
当然你也可以设置配置`deleteThrow`为`false`这样删除就不会报错了

## proxy不存在


::: warning 报错!!!
如果遇到build后报错java:程序包xxxxxxxx.proxy不存在

原因 因为entity模式是通过java的apt编译时生成代码来实现对应的功能,所以如果您的项目存在错误的情况下那么只要不clean后重新编译那么你是能够知道具体错误点的，如果你clean了后那么可能会因为某些原因比如`Controller`里面有代码没加尾分号导致整体报错,那么也会引发apt问题而导致proxy错误,具体可以看您git前后的提交修改了什么导致的,如果一开始就无法编译通过那么原因可能是没有正确引入`sql-processor`或`sql-ksp-processor`

- 检查实体类是否存在没有编译通过的错误
- 整体项目是否能编译通过
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
        <!-- 注意顺序 如果不行将eq移到第一位 -->
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

lombok + mapstruct + easy-query 可以尝试以下顺序

<img :src="$withBase('/images/lombok_mapstruct_eq.png')">

## 关键字处理
因为sql语句添加了双引号 反引号 等操作导致大小写敏感所以可以使用`nameConversion`让java属性正确的映射到数据库


java属性  | nameConversion   | 对应数据库列  
---  | ---  | --- 
userAge  | DEFAULT 默认 | userAge
userAge  | UNDERLINED 大写字母转小写下划线| user_age
userAge  | UPPER_UNDERLINED 全大写大写字母转小写下划线| USER_AGE
userAge  | LOWER_CAMEL_CASE 小驼峰| userAge
userAge  | UPPER_CAMEL_CASE 大驼峰| UserAge

[关键字处理](/easy-query-doc/framework/key-word)

## mvn clean package失效
如果用户可以使用idea的clean和package打包但是无法使用命令行打包的情况下建议尝试以下方案
- 1.先不要单独引入`sql-processor`
- 2.外面的 lombok 需要版本号
- 3.maven-compiler-plugin 里的 lombok 不能有版本号
- 4.maven-compiler-plugin 里要增加 com.easy-query 的 sql-processor




## 编译错误无法找到正确问题
编译一直报错,无法正确找到具体的错误在哪里的解决方案  原本项目运行的好好的但是修改了什么后无法正确启动build了,编译错误一直是proxy相关的

原因说明:因为编译时依赖导致idea无法正确输出错误信息,大范围的文件修改如:框架跨版本升级导致的一些错误idea无法正确返回具体信息

通过以下步骤进行排查相关问题:

- 1.复制一份当前项目到别的目录我们叫做projectb
- 2.用idea打开projectb
- 3.全局替换projectb的注解,将@EntityProxy替换成@EntityFileProxy
- 4.maven clean一下将projectb的target全部清除掉
- 5.打开插件选择compileAll因为你用了@EntityFileProxy所以会生成到src源码目录里面
- 6.对projectb进行build吧对应的错误找到在你现在的projecta里面改掉
- 7.projectb如果已经可以编译了但是projecta还不行那么把idea关闭重启一下，或者删除`.idea`的文件夹


::: tip 说明!!!
> 注意插件记得升级到最新版本❗️❗️❗️
> 注意插件记得升级到最新版本❗️❗️❗️
> 注意插件记得升级到最新版本❗️❗️❗️
:::