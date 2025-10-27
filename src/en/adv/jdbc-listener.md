---
title: JDBC Execution Listener
order: 100
---
This listener is used to monitor SQL, parameters, exceptions, and elapsed time before and after JDBC execution. It can be used to record slow SQL.

## JdbcExecutorListener

Method | Default | Description  
--- | --- | --- 
enable | false  | Whether to use the listener
onExecuteBefore | Empty  | Used to record parameter information before listening
onExecuteAfter | Empty  | Used to listen to parameter information after listening

### JdbcExecuteBeforeArg
Parameters before execution

Method | Type| Default | Description  
--- | --- | --- | --- 
traceId | `String` | `UUID.randomUUID().toString()`  | Used to connect the tracing id before and after execution, can be overridden
sql | `String` | SQL to be executed  | Used to record parameter information before listening
sqlParameters | `List<List<SQLParameter>>` | `Collections.emptyList()`  | Used to listen to parameter information after listening
start | `long` | `System.currentTimeMillis()`  | Milliseconds when executing the current method
state | `Map<String,Object>` | null  | Used to listen to parameter information after listening

### JdbcExecuteAfterArg
Parameters after execution

Method | Type| Default | Description  
--- | --- | --- | --- 
beforeArg | `JdbcExecuteBeforeArg` | null  | Parameters before execution
rows | `int` | Affected rows  | If it's a query, this value is always 0, because the query is in stream mode and cannot know the result after JDBC returns
sqlParameters | `List<List<SQLParameter>>` | `Collections.emptyList()`  | Used to listen to parameter information after listening
exception | `Exception` | null  | Exception occurred during execution
end | `long` | `System.currentTimeMillis()`  | Milliseconds when executing the current method

## Custom Listener
Create a custom listener to monitor SQL that takes more than 3 seconds and send to monitoring platform
```java

public class LogSlowSQLListener implements JdbcExecutorListener {
    @Override
    public boolean enable() {
        return true;//Indicates that listening needs to be enabled
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //You can pass parameters through setState here
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //Get before parameters through getState
//        Map<String, Object> state = beforeArg.getState();
        //Record elapsed time operation
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //SQL that takes more than 3 seconds needs to be recorded
        //Because sqlParameters first layer greater than 1 indicates batch processing, batch processing time is usually longer, you can choose
        //not to record this sql or only record sql without recording sql parameters, handle it yourself
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //Send http request
            
            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil.sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}

```
Replace the system listener

```java
easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(false);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                //Replace the default system listening behavior
                .replaceService(JdbcExecutorListener.class, LogSlowSQLListener.class)
                .build();
```
Of course, this situation is only suitable when no external parameters need to be passed in. If we need to pass external `bean` to the framework, we can register directly

## Circular Listening
In many cases, we may send timeout SQL detected to MQ and then store it in our own database, but because storing in the database will also trigger `jdbcListener`, `eq` thoughtfully added the function to ignore jdbcListener for users to ensure that insertion into the database will not result in circular listening
```java

//Query data and remove JDBC_LISTEN behavior
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .configure(config -> {
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).toList();

//Insert data and remove JDBC_LISTEN behavior
Topic topic = new Topic();
easyEntityQuery.insertable(topic)
        .configure(config->{
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();


//Update data and remove JDBC_LISTEN behavior
Topic topic = new Topic();
easyEntityQuery.updatable(topic)
        .configure(config->{
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();

easyEntityQuery.updatable(Topic.class)
        .configure(config->{
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        })
        .setColumns(t -> {
            t.title().set("123");
        })
        .where(t -> {
            t.id().eq("123");
        })
        .executeRows();


//Delete data and remove JDBC_LISTEN behavior
Topic topic = new Topic();
easyEntityQuery.deletable(topic)
        .configure(config->{
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        }).executeRows();


easyEntityQuery.deletable(Topic.class)
        .configure(config->{
            config.getBehavior().removeBehavior(EasyBehaviorEnum.JDBC_LISTEN);
        })
        .where(t -> {
            t.id().eq("123");
        })
        .executeRows();
```

## Spring Boot Example
Suppose we have a log request `bean` registered in `spring-boot` through `@Component`
```java

@Component
public class HttpLogRequest {
    public void send(Object request){
        
    }
}


public class LogSlowSQLListener implements JdbcExecutorListener {
    //Inject through constructor
    private final HttpLogRequest httpLogRequest;

    public LogSlowSQLListener(HttpLogRequest httpLogRequest){

        this.httpLogRequest = httpLogRequest;
    }
    @Override
    public boolean enable() {
        return true;//Indicates that listening needs to be enabled
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //You can pass parameters through setState here
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //Get before parameters through getState
//        Map<String, Object> state = beforeArg.getState();
        //Record elapsed time operation
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //SQL that takes more than 3 seconds needs to be recorded
        //Because sqlParameters first layer greater than 1 indicates batch processing, batch processing time is usually longer, you can choose
        //not to record this sql or only record sql without recording sql parameters, handle it yourself
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //Send http request

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil.sqlParameterToString(sqlParameters.get(0))
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
        services.addService(httpLogRequest);//Directly register instance to easy-query internal dependency injection container
        services.addService(JdbcExecutorListener.class, LogSlowSQLListener.class);
    }
}


```

As long as the instance object `HttpLogRequest` is directly injected into the container, then all services inside easy-query can directly obtain `HttpLogRequest`, so `LogSlowSQLListener` can also obtain it


## Solon

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
        return true;//Indicates that listening needs to be enabled
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //You can pass parameters through setState here
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //Get before parameters through getState
//        Map<String, Object> state = beforeArg.getState();
        //Record elapsed time operation
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //SQL that takes more than 3 seconds needs to be recorded
        //Because sqlParameters first layer greater than 1 indicates batch processing, batch processing time is usually longer, you can choose
        //not to record this sql or only record sql without recording sql parameters, handle it yourself
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //Send http request

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil.sqlParameterToString(sqlParameters.get(0))
            }
            Exception exception = afterArg.getException();
        }
    }
}
```
`solon` is the same, inject the required `bean`, the difference is that `solon` injects through listening to subscription events
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


::: warning Notice!!!
> If solon cannot obtain bean at app onEvent, you can use lazy loading method
:::
```java

public class LogSlowSQLListener implements JdbcExecutorListener {

    private final ServiceProvider serviceProvider;

    public LogSlowSQLListener(ServiceProvider serviceProvider){

        this.serviceProvider = serviceProvider;
    }
    @Override
    public boolean enable() {
        return true;//Indicates that listening needs to be enabled
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {
        //You can pass parameters through setState here
//        HashMap<String, Object> state = new HashMap<>();
//        arg.setState(state);
    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        //It is recommended to use asynchronous thread pool to send http to avoid performance impact
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //Get before parameters through getState
//        Map<String, Object> state = beforeArg.getState();
        //Record elapsed time operation
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //SQL that takes more than 3 seconds needs to be recorded
        //Because sqlParameters first layer greater than 1 indicates batch processing, batch processing time is usually longer, you can choose
        //not to record this sql or only record sql without recording sql parameters, handle it yourself
        if(elapsed>=3*1000 && beforeArg.getSqlParameters().size()<=1){
            //Get registered bean instance through serviceProvider
            AppContext service = serviceProvider.getService(AppContext.class);
            HttpLogRequest httpLogRequest = service.getBean(HttpLogRequest.class);
            //Send http request

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            if(sqlParameters.size()==1){
                String params =  EasySQLUtil.sqlParameterToString(sqlParameters.get(0))
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

## Practical LogSlowSQLListener
```java

public class LogSlowSQLListener implements JdbcExecutorListener {
    private static final Logger log = LoggerFactory.getLogger(LogSlowSQLListener.class);
    private final long slowMillis;

    public LogSlowSQLListener(long slowMillis){

        this.slowMillis = slowMillis;
    }

    @Override
    public boolean enable() {
        return true;
    }

    @Override
    public void onExecuteBefore(JdbcExecuteBeforeArg arg) {

    }

    @Override
    public void onExecuteAfter(JdbcExecuteAfterArg afterArg) {
        JdbcExecuteBeforeArg beforeArg = afterArg.getBeforeArg();
        //Get before parameters through getState
//        Map<String, Object> state = beforeArg.getState();
        //Record elapsed time operation
        long elapsed = afterArg.getEnd() - beforeArg.getStart();
        //SQL that takes more than 3 seconds needs to be recorded
        //Because sqlParameters first layer greater than 1 indicates batch processing, batch processing time is usually longer, you can choose
        //not to record this sql or only record sql without recording sql parameters, handle it yourself
        if (elapsed >= slowMillis && beforeArg.getSqlParameters().size() <= 5) {
            //Send http request

            String sql = beforeArg.getSql();
            List<List<SQLParameter>> sqlParameters = beforeArg.getSqlParameters();
            String sqlParameter = getSQLParameter(sqlParameters);
            Exception exception = afterArg.getException();
            if (exception == null) {
                log.error("!!!!!!execute sql slow,elapsed:{}(ms),sql:{},parameters:{}", elapsed, sql, sqlParameter);
            } else {
                log.error("!!!!!!execute sql slow,elapsed:{}(ms),sql:{},parameters:{},error:{}", elapsed, sql, sqlParameter, exception.getMessage(), exception);
            }
        }
    }

    private String getSQLParameter(List<List<SQLParameter>> sqlParameters) {
        if (EasyCollectionUtil.isEmpty(sqlParameters)) {
            return null;
        }
        if (sqlParameters.size() == 1) {
            return EasySQLUtil.sqlParameterToString(sqlParameters.get(0));
        }
        StringBuilder sb = new StringBuilder();
        for (List<SQLParameter> sqlParameter : sqlParameters) {
            sb.append(EasySQLUtil.sqlParameterToString(sqlParameter)).append("\n");
        }
        return sb.toString();
    }
}



//Dependency injection


public class MyStarterConfigurer implements StarterConfigurer {
    private final DbProperties dbProperties;

    public MyStarterConfigurer(DbProperties dbProperties) {

        this.dbProperties = dbProperties;
    }

    @Override
    public void configure(ServiceCollection services) {
        services.addService(JdbcExecutorListener.class, new LogSlowSQLListener(dbProperties.getSlowMillis()));
    }
}
```

