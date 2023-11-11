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
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        if(elapsed>=3*1000){
            //发送http请求
            
            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
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
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        if(elapsed>=3*1000){
            //发送http请求

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
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
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //通过getState来获取before的参数
//        Map<String, Object> state = beforeArg.getState();
        //记录耗时操作
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //耗时3秒以上的sql需要记录
        if(elapsed>=3*1000){
            //发送http请求

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
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