---
title: 国产框架Solon配置
---

## 国产框架Solon配置

`easy-query`在`^1.2.6`正式支持`Solon`适配国产框架的orm部分。

## 什么是Solon
[`Solon`](https://solon.noear.org/) **Java 新的生态型应用开发框架：更快、更小、更简单。**

启动快 5 ～ 10 倍；qps 高 2～ 3 倍；运行时内存节省 1/3 ~ 1/2；打包可以缩到 1/2 ~ 1/10；同时支持 jdk8, jdk11, jdk17, jdk20, graalvm native image。



## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`com.easy-query`获取最新安装包

## 快速开始
## 新建java maven项目

<img src="/easy-qeury-solon-web-install.png">

### 添加项目依赖
```xml
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-solon-plugin</artifactId>
    <version>latest-version</version>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.31</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.18</version>
</dependency>
<dependency>
    <groupId>org.noear</groupId>
    <artifactId>solon-web</artifactId>
    <version>2.9.3</version>
</dependency>
```

### 新建DataSource注入
```java
@Configuration
public class WebConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
}

```

### 新增控制器
```java

@Controller
@Mapping("/test")
public class TestController {
    @Mapping(value = "/hello",method = MethodType.GET)
    public String hello(){
        return "Hello World";
    }
}
```

### Solon启动
```yml
# 添加配置文件
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

# 记录器级别的配置示例
solon.logging.logger:
  "root": #默认记录器配置
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

```java
public class Main {
    public static void main(String[] args) {
        Solon.start(Main.class,args,(app)->{
            app.cfg().loadAdd("application.yml");
        });
    }
}

//输入url http://localhost:8080/test/hello

//返回Hello World
```

### easy-query查询
```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}


@Controller
@Mapping("/test")
public class TestController {

    /**
     * 注意必须是配置多数据源的其中一个
     */
    @Db("db1")
    private EasyQuery easyQuery;
    @Mapping(value = "/hello",method = MethodType.GET)
    public String hello(){
        return "Hello World";
    }
    @Mapping(value = "/queryTopic",method = MethodType.GET)
    public Object queryTopic(){
        return easyQuery.queryable(Topic.class)
                .where(o->o.ge(Topic::getStars,2))
                .toList();
    }
}


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `stars` >= ?
==> Parameters: 2(Integer)
<== Time Elapsed: 17(ms)
<== Total: 101

```

<img src="/easy-query-solon-web-query-topic.png" />


### Solon配置easy-query个性化
```yml
# 添加配置文件
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

easy-query: 
  # 配置自定义日志
  # log-class: ...
  db1:
    # 支持mysql pgsql h2 mssql dameng mssql_row_number kingbase_es等其余数据库在适配中
    database: mysql
    # 支持underlined default lower_camel_case upper_camel_case upper_underlined
    name-conversion: underlined
    # 物理删除时抛出异常 不包括手写sql的情况
    delete-throw: true
    # 插入列策略 all_columns only_not_null_columns only_null_columns
    insert-strategy: only_not_null_columns 
    # 更新列策略 all_columns only_not_null_columns only_null_columns
    update-strategy: all_columns 
    # 大字段依旧查询 如果不查询建议设置为updateIgnore防止update allcolumn将其改为null
    query-large-column: true
    # 更新删除无版本号报错
    no-version-error: true
    # 分片链接模式 system_auto memory_strictly connection_strictly
    # connection-mode: ...
    # max-sharding-query-limit: ...
    # executor-maximum-pool-size: ...
    # executor-core-pool-size: ...
    # throw-if-route-not-match: ...
    # sharding-execute-timeout-millis: ...
    # max-sharding-route-count: ...
    # executor-queue-size: ...
    # default-data-source-name: ...
    # default-data-source-merge-pool-size: ...
    # multi-conn-wait-timeout-millis: ...
    # warning-busy: ...
    # insert-batch-threshold: ...
    # update-batch-threshold: ...
    # print-sql: ...
    # start-time-job: ...
    # default-track: ...
    # relation-group-size: ...
    # keep-native-style: ...
    # warning-column-miss: ...
    # sharding-fetch-size: ...
    # 事务中分片读取模式 serializable concurrency
    # sharding-query-in-transaction: ....

# 记录器级别的配置示例 配置了print-sql没有配置对应的log也不会打印
solon.logging.logger:
  "root": #默认记录器配置
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

### 额外配置

#### 逻辑删除
```java

public class MyLogicDelStrategy extends AbstractLogicDeleteStrategy {
    /**
     * 允许datetime类型的属性
     */
    private final Set<Class<?>> allowTypes=new HashSet<>(Arrays.asList(LocalDateTime.class));
    @Override
    protected SQLExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o->o.isNull(propertyName);
    }

    @Override
    protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
//        LocalDateTime now = LocalDateTime.now();
//        return o->o.set(propertyName,now);
        //上面的是错误用法,将now值获取后那么这个now就是个固定值而不是动态值
        return o->o.set(propertyName, LocalDateTime.now());
    }

    @Override
    public String getStrategy() {
        return "MyLogicDelStrategy";
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return allowTypes;
    }
}


@Configuration
public class DemoConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
    @Bean
    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration){
        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//        configuration.applyEncryptionStrategy(...);
//        configuration.applyInterceptor(...);
//        configuration.applyShardingInitializer(...);
//        configuration.applyValueConverter(...);
//        configuration.applyValueUpdateAtomicTrack(...);
    }
    
}

```

### Solon所有配置

针对单个数据源进行配置,如果需要影响到所有数据源看下面的影响到所有数据源
```java
@Configuration
public class DemoConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }

//    /**
//     * 配置额外插件,比如自定义逻辑删除,加密策略,拦截器,分片初始化器,值转换,原子追踪更新
//     * @param configuration
//     */
//    @Bean
//    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration){
//        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//        configuration.applyEncryptionStrategy(...);
//        configuration.applyInterceptor(...);
//        configuration.applyShardingInitializer(...);
//        configuration.applyValueConverter(...);
//        configuration.applyValueUpdateAtomicTrack(...);
//    }

//    /**
//     * 添加分表或者分库的路由,分库数据源
//     * @param runtimeContext
//     */
//    @Bean
//    public void db1QueryRuntimeContext(@Db("db1") QueryRuntimeContext runtimeContext){
//        TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();
//        DataSourceRouteManager dataSourceRouteManager = runtimeContext.getDataSourceRouteManager();
//        tableRouteManager.addRoute(...);
//        dataSourceRouteManager.addRoute(...);
//
//        DataSourceManager dataSourceManager = runtimeContext.getDataSourceManager();
//
//        dataSourceManager.addDataSource(key, dataSource, poolSize);
//    }
}
```

### 配置影响到所有的数据源
```java
public class App {
    public static void main(String[] args) {
        Solon.start(App.class,args,app->{
            app.onEvent(EasyQueryBuilderConfiguration.class,e->{
                //如果需要区分数据源可以通过e.getName()来区分
                e.replaceServiceFactory(QueryConfiguration.class, s->{
                    QueryConfiguration queryConfiguration = new QueryConfiguration(s.getService(EasyQueryOption.class)
                            ,s.getService(Dialect.class)
                            ,s.getService(NameConversion.class)
                            ,s.getService(EasyTimeJobManager.class)
                    );
//                    queryConfiguration.applyInterceptor();
//                    queryConfiguration.applyLogicDeleteStrategy();
//                    queryConfiguration.applyValueConverter();
                    return queryConfiguration;
                });
            });
        });
    }
}
```