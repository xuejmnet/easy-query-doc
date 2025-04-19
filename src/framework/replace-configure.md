---
title: 替换框架行为❗️❗️❗️
order: 4
---

# 替换框架行为
`easy-query`默认内部提供了一个简易的依赖注入容器,非常轻量且仅支持构造函数注入,不支持循环依赖,但是提供了非常完善的替换框架内部行为的方式,用户可以替换掉框架内部的所有接口,完全可以自行自定义实现，

## 可以被替换的接口
框架内部使用了大量的依赖注入,并且使用接口依赖模式开发,所以很轻松可以替换掉,那么我们可以替换掉哪一些呢
::: tip 说明!!!
> 具体代码以最新版源码为准,您如果发现有不一样的也可以提交pr来帮我们修复文档
:::
```java

    private void defaultConfiguration() {
        
        replaceService(EasyQueryDataSource.class, DefaultEasyQueryDataSource.class)
                .replaceService(Dialect.class, DefaultDialect.class)
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)
                .replaceService(QueryConfiguration.class)
                .replaceService(EntityMetadataManager.class, DefaultEntityMetadataManager.class)
                .replaceService(SQLExpressionInvokeFactory.class, DefaultSQLExpressionInvokeFactory.class)
                .replaceService(ExpressionBuilderFactory.class, DefaultEasyExpressionBuilderFactory.class)
                .replaceService(SQLClientApiFactory.class, DefaultSQLClientApiFactory.class)
                .replaceService(TrackManager.class, DefaultTrackManager.class)
                .replaceService(EasyPageResultProvider.class, DefaultEasyPageResultProvider.class)
                .replaceService(EasyPrepareParser.class, DefaultEasyPrepareParser.class)
                .replaceService(ConnectionManager.class, DefaultConnectionManager.class)
                .replaceService(DataSourceRouteManager.class, DefaultDataSourceRouteManager.class)
                .replaceService(DataSourceRouter.class, ShardingDataSourceRouter.class)
                .replaceService(DataSourceRouteEngine.class, DefaultDataSourceRouteEngine.class)
                .replaceService(TableRouteManager.class, DefaultTableRouteManager.class)
                .replaceService(TableRouter.class, ShardingTableRouter.class)
                .replaceService(TableRouteEngine.class, DefaultTableRouteEngine.class)
                .replaceService(RouteContextFactory.class, DefaultRouteContextFactory.class)
                .replaceService(RewriteContextFactory.class, DefaultRewriteContextFactory.class)
                .replaceService(ExecutionContextFactory.class, DefaultExecutionContextFactory.class)
                .replaceService(EntityExpressionExecutor.class, DefaultEntityExpressionExecutor.class)
//                .replaceService(EntityExpressionExecutor.class, ShardingEntityExpressionExecutor.class)
                .replaceService(ShardingExecutorService.class, DefaultEasyShardingExecutorService.class)
                .replaceService(ExpressionFactory.class, DefaultEasyExpressionFactory.class)
                .replaceService(ShardingComparer.class, JavaLanguageShardingComparer.class)
                .replaceService(JdbcTypeHandlerManager.class, EasyJdbcTypeHandlerManager.class)
                .replaceService(QueryRuntimeContext.class, DefaultEasyQueryRuntimeContext.class)
                .replaceService(EasyDataSourceConnectionFactory.class, DefaultEasyDataSourceConnectionFactory.class)
                .replaceService(EasyConnectionFactory.class, DefaultEasyConnectionFactory.class)
                .replaceService(DataSourceManager.class, DefaultDataSourceManager.class)
                .replaceService(ShardingQueryCountManager.class, DefaultShardingQueryCountManager.class)
                .replaceService(ColumnFunctionFactory.class, DefaultColumnFunctionFactory.class)
                .replaceService(RouteDescriptorFactory.class, DefaultRouteDescriptorFactor.class)
                .replaceService(DataSourceUnitFactory.class, DefaultDataSourceUnitFactory.class)
                .replaceService(SQLSegmentFactory.class, DefaultSQLSegmentFactory.class)
                .replaceService(EasyTimeJobManager.class, DefaultEasyTimeJobManager.class)
                .replaceService(IncludeProcessorFactory.class, EasyIncludeProcessorFactory.class)
                .replaceService(IncludeParserEngine.class, DefaultIncludeParserEngine.class)
                .replaceService(WhereObjectQueryExecutor.class, DefaultWhereObjectQueryExecutor.class)
                .replaceService(ObjectSortQueryExecutor.class, DefaultObjectSortQueryExecutor.class)
                .replaceService(JdbcExecutorListener.class, EmptyJdbcExecutorListener.class)
                .replaceService(AssertExceptionFactory.class, DefaultAssertExceptionFactory.class)
                .replaceService(SQLParameterPrintFormat.class, DefaultSQLParameterPrintFormat.class)
                .replaceService(SQLFunc.class, SQLFuncImpl.class)
                .replaceService(EasyQueryClient.class, DefaultEasyQueryClient.class);
    }
```

## 自定义NameConversion
这边以`NameConversion`作为例子来演示我们如何替换掉默认的框架行为
### springboot环境
默认springboot-starter框架实现了一个空的`StarterConfigurer`，所以我们可以通过`@Primary`来实现替换
```java
//新建一个类来实现接口NameConversion
public class MyNameConversion implements NameConversion {
    @Override
    public String convert(String name) {
        return "["+name+"]";
    }
}

//实现一个启动配置
public class MyStarterConfigurer implements StarterConfigurer {
    @Override
    public void configure(ServiceCollection services) {
        //addService如果不存在就添加存在就替换
        services.addService(NameConversion.class, MyNameConversion.class);
    }
}

@Configuration
public class MyConfiguration {
    @Bean("MyStarterConfigurer")
    @Primary
    public StarterConfigurer starterConfigurer(){
        return new MyStarterConfigurer();
    }
}

```

### 非springboot环境
通过默认的`bootstrapper`的方法`replaceService`来实现替换
```java
//新建一个类来实现接口NameConversion
public class MyNameConversion implements NameConversion {
    @Override
    public String convert(String name) {
        return "["+name+"]";
    }
}

 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(true);//设置不允许物理删除
                    op.setPrintSql(true);//设置以log.info模式打印执行sql信息
                    ......//此处用于配置系统默认配置选项
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//设置方言语法等为mysql的
                .replaceService(NameConversion.class, MyNameConversion.class)//放在最后面可以替换掉前面所有方法
                .build();
```

### solon环境替换默认行为

```java
public class App {
    public static void main(String[] args) {
        Solon.start(App.class,args,app->{
            app.onEvent(EasyQueryBuilderConfiguration.class,e->{
                e.replaceService(originalSerivce.class,replaceService.class);
            });
        });
    }
}
```