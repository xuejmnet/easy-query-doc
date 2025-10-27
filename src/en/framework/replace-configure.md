---
title: Replacing Framework Behavior❗️❗️❗️
order: 40
---

# Replacing Framework Behavior
`easy-query` internally provides a simple dependency injection container by default, which is very lightweight and only supports constructor injection without circular dependency support. However, it provides a very comprehensive way to replace the framework's internal behavior. Users can replace all interfaces within the framework and completely customize the implementation themselves.

## Interfaces That Can Be Replaced
The framework internally uses extensive dependency injection and is developed using interface dependency mode, so it's easy to replace. What can we replace?
::: tip Note!!!
> Specific code is subject to the latest version of the source code. If you find any discrepancies, you can also submit a PR to help us fix the documentation
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

## Custom NameConversion
Here we use `NameConversion` as an example to demonstrate how to replace the default framework behavior
### springboot environment
By default, the springboot-starter framework implements an empty `StarterConfigurer`, so we can use `@Primary` to implement replacement
```java
//Create a new class to implement the NameConversion interface
public class MyNameConversion implements NameConversion {
    @Override
    public String convert(String name) {
        return "["+name+"]";
    }
}

//Implement a startup configuration
public class MyStarterConfigurer implements StarterConfigurer {
    @Override
    public void configure(ServiceCollection services) {
        //addService will add if it doesn't exist, or replace if it exists
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

### Non-springboot environment
Use the default `bootstrapper` method `replaceService` to implement replacement
```java
//Create a new class to implement the NameConversion interface
public class MyNameConversion implements NameConversion {
    @Override
    public String convert(String name) {
        return "["+name+"]";
    }
}

 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(true);//Set to not allow physical deletion
                    op.setPrintSql(true);//Set to print executed SQL info in log.info mode
                    ......//Here used to configure system default configuration options
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//Set dialect syntax etc. to MySQL
                .replaceService(NameConversion.class, MyNameConversion.class)//Placed last can replace all previous methods
                .build();
```

### Solon environment replacing default behavior

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

