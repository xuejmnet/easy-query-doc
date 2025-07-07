---
title: EasyQueryImplement
order: 10
category:
  - plugin
---

# 代理对象自动实现
`eq`使用了java的apt技术(kotlin下是ksp技术)利用编译时生成源代码的方式生成对象的代理对象,用户要操作的对象即为代理对象


## 生成代理类


现在实体类`SysUser`关联的代理类`SysUserProxy`是不存在的，Idea是无法识别代理类，也无法进行编译，但是我们依然可以通过构建项目来触发`eq`的APT工具来生成代理类。`eq`的APT会为所有使用了`@EntityProxy`的实体类创建对应的代理类，代理类用于提供此对表别名，列名，列类型等等都提供了友好提示和类型判断，这些代理类可以帮助辅助我们更好设置条件查询和设值。


构建完项目后，代理类将会生成在指定的目录中。如下：

<img  :src="$withBase('/images/startup5.png')">



::: warning 说明!!!
> 如果EasyQueryImplement没有效果请检查类是否添加了`@EntityProxy`
:::

<img  :src="$withBase('/images/startup3.png')">



::: warning 说明!!!
<!-- > 2.0.15+版本框架不需要实现`proxyTableClass`方法，idea-plugin插件在0.0.57后也将不会生成该方法 -->
> 如果您的项目是多模块那么只需要在需要使用@EntityProxy注解的模块下使用`sql-processor`即可
:::


<!-- <img src="/startup1.png"> -->


构建项目后，如果Idea依然是无法识别代理类的，那么可以将目录标记为生成目录。

<img  :src="$withBase('/images/startup2.png')">

::: warning 说明!!!
> 如果您还是不行那么建议您点击idea右侧的maven刷新按钮进行刷新即可
:::

<img  :src="$withBase('/images/startup4.png')">

<!-- 构建项目，生成完代理类后，需要在`User`中引入对应的代理类`UserProxy` -->



::: danger 说明!!!
如果没有生成代理类，即提示`Proxy`类不存在


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

<!-- <img src="/startup6.png"> -->