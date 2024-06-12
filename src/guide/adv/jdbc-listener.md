---
title: jdbc执行监听器
---
该监听器用来监听jdbc的执行前后sql和参数还有异常和耗时,可以用来记录慢sql。

## JdbcExecutorListener

方法 | 默认 | 描述  
--- | --- | --- 
enable | false  | 表示是否使用监听器
onExecuteBefore | 空  | 用来记录监听前的参数信息
onExecuteAfter | 空  | 用来监听监听后的参数信息

### JdbcExecuteBeforeArg
执行前参数

方法 | 类型| 默认 | 描述  
--- | --- | --- | --- 
traceId | `String` | `UUID.randomUUID().toString()`  | 用来连接前后执行的追踪id,可以自己重写
sql | `String` | 执行的sql  | 用来记录监听前的参数信息
sqlParameters | `List<List<SQLParameter>>` | `Collections.emptyList()`  | 用来监听监听后的参数信息
start | `long` | `System.currentTimeMillis()`  | 执行当前方法的毫秒数
state | `Map<String,Object>` | null  | 用来监听监听后的参数信息

### JdbcExecuteAfterArg
执行后参数

方法 | 类型| 默认 | 描述  
--- | --- | --- | --- 
beforeArg | `JdbcExecuteBeforeArg` | null  | 执行前的参数
rows | `int` | 受影响行数  | 如果当前是查询那么这个值永远为0,因为查询是stream模式获取,无法在jdbc返回后知晓结果
sqlParameters | `List<List<SQLParameter>>` | `Collections.emptyList()`  | 用来监听监听后的参数信息
exception | `Exception` | null  | 执行时发生的异常
end | `long` | `System.currentTimeMillis()`  | 执行当前方法的毫秒数

## 自定义监听器
创建一个自定义监听器监听耗时3秒以上的sql,并且发送到监控平台
```java

public class LogSlowSQLListener implements JdbcExecutorListener {
    @Override
    public boolean enable() {
        return true;//表示需要开启监听
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //这边可以通过setState来传递参数
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        //因为sqlParameters第一层大于1表示是批处理,批处理的时间一般是比较多的你可以选择
        //不记录本次sql或者只记录sql不记录sql参数自行处理
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //发送http请求
            
            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil::sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}

```
替换掉系统的监听器

```java
easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(false);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                //替换掉系统的默认监听行为
                .replaceService(JdbcExecutorListener.class, LogSlowSQLListener.class)
                .build();
```
当然这种情况只适合无需外部参数传入的情况下,如果我们需要传递外部`bean`到框架内部可以直接注册

## 循环监听
很多时候我们可能会将监听到的超时sql进行mq的发送然后来存入到自己的数据库,但是因为存入数据库也会触发`jdbcListener`所以`eq`贴心的给用户添加了忽略jdbcListener的功能,保证插入到数据库不会出现循环监听
```java

//查询数据移除JDBC_LISTEN行为
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .behaviorConfigure(config -> {
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).toList();

//插入数据移除JDBC_LISTEN行为
Topic topic = new Topic();
easyEntityQuery.insertable(topic)
        .behaviorConfigure(config->{
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();


//更新数据移除JDBC_LISTEN行为
Topic topic = new Topic();
easyEntityQuery.updatable(topic)
        .behaviorConfigure(config->{
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();

easyEntityQuery.updatable(Topic.class)
        .behaviorConfigure(config->{
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        })
        .setColumns(t -> {
            t.title().set("123");
        })
        .where(t -> {
            t.id().eq("123");
        })
        .executeRows();


//删除数据移除JDBC_LISTEN行为
Topic topic = new Topic();
easyEntityQuery.deletable(topic)
        .behaviorConfigure(config->{
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();


easyEntityQuery.deletable(Topic.class)
        .behaviorConfigure(config->{
            config.removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        })
        .where(t -> {
            t.id().eq("123");
        })
        .executeRows();
```

## springboot为例
假设我们有这个一个日志请求`bean`通过`@Component`注册到了`springboot`中
```java

@Component
public class HttpLogRequest {
    public void send(Object request){
        
    }
}


public class LogSlowSQLListener implements JdbcExecutorListener {
    //通过构造函数注入
    private final HttpLogRequest httpLogRequest;

    public LogSlowSQLListener(HttpLogRequest httpLogRequest){

        this.httpLogRequest = httpLogRequest;
    }
    @Override
    public boolean enable() {
        return true;//表示需要开启监听
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //这边可以通过setState来传递参数
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        //因为sqlParameters第一层大于1表示是批处理,批处理的时间一般是比较多的你可以选择
        //不记录本次sql或者只记录sql不记录sql参数自行处理
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //发送http请求

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil::sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}


@Component
public class MyStarterConfigurer implements StarterConfigurer {
    @Autowired
    private HttpLogRequest httpLogRequest;
    @Override
    public void configure(ServiceCollection services) {
        services.addService(httpLogRequest);//直接注册实例到easy-query内部的依赖注入容器里面
        services.addService(JdbcExecutorListener.class, LogSlowSQLListener.class);
    }
}


```

只要将实例对象`HttpLogRequest`直接注入到容器中,那么easy-query内部的所有服务都可以直接获取到`HttpLogRequest`，所以`LogSlowSQLListener`也可以获取到


## solon

```java

@Component
public class HttpLogRequest {
    public void send(Object request){

    }
}


public class LogSlowSQLListener implements JdbcExecutorListener {
    private final HttpLogRequest httpLogRequest;

    public LogSlowSQLListener(HttpLogRequest httpLogRequest){

        this.httpLogRequest = httpLogRequest;
    }
    @Override
    public boolean enable() {
        return true;//表示需要开启监听
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //这边可以通过setState来传递参数
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        //因为sqlParameters第一层大于1表示是批处理,批处理的时间一般是比较多的你可以选择
        //不记录本次sql或者只记录sql不记录sql参数自行处理
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //发送http请求

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil::sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}
```
`solon`也是一样将需要的`bean`注入进来，不同的是`solon`通过监听订阅事件注入即可
```java

public class App {
    public static void main(String[] args) {
        Solon.start(App.class,args,app->{
            app.onEvent(EasyQueryBuilderConfiguration.class,e->{
                HttpLogRequest httpLogRequest = app.context().getBean(HttpLogRequest.class);
                e.replaceService(httpLogRequest);
                e.replaceService(JdbcExecutorListener.class,LogSlowSQLListener.class);
            });
        });
    }
}
```


::: warning 说明!!!
> 如果solon在app处onEvent无法获取bean那么可以通过延迟获取的方式
:::
```java

public class LogSlowSQLListener implements JdbcExecutorListener {

    private final ServiceProvider serviceProvider;

    public LogSlowSQLListener(ServiceProvider serviceProvider){

        this.serviceProvider = serviceProvider;
    }
    @Override
    public boolean enable() {
        return true;//表示需要开启监听
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //这边可以通过setState来传递参数
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //为了不影响性能建议采用异步线程池发送http,同步的话会影响性能
        //通过serviceProvider来获取注册的bean实例
        AppContext service = serviceProvider.getService(AppContext.class);
        HttpLogRequest httpLogRequest = service.getBean(HttpLogRequest.class);
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        //因为sqlParameters第一层大于1表示是批处理,批处理的时间一般是比较多的你可以选择
        //不记录本次sql或者只记录sql不记录sql参数自行处理
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //发送http请求

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil::sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}



public class App {
    public static void main(String[] args) {
        Solon.start(App.class,args,app->{
            app.onEvent(EasyQueryBuilderConfiguration.class,e->{
//                HttpLogRequest httpLogRequest = app.context().getBean(HttpLogRequest.class);
                e.replaceService(app.context());
                e.replaceService(JdbcExecutorListener.class,LogSlowSQLListener.class);
            });
        });
    }
}
```