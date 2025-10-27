---
title: Solon Related
order: 6
---


## Domestic Framework Solon Configuration

`easy-query` officially supports `Solon` adaptation of the ORM part of the domestic framework in `^1.2.6`.

## What is Solon
[`Solon`](https://solon.noear.org/) **Java's new ecological application development framework: faster, smaller, simpler.**

Starts 5 ~ 10 times faster; QPS 2 ~ 3 times higher; runtime memory savings of 1/3 ~ 1/2; packaging can be reduced to 1/2 ~ 1/10; supports JDK8, JDK11, JDK17, JDK20, and GraalVM native image.



## Getting the Latest

Search for `com.easy-query` on [https://central.sonatype.com/](https://central.sonatype.com/) to get the latest packages

## Quick Start
## Creating a New Java Maven Project

<img :src="$withBase('/images/easy-qeury-solon-web-install.png')">

### Adding Project Dependencies
```xml
<!-- Required -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-solon-plugin</artifactId>
    <version>Use the latest version number</version>
</dependency>
<!-- If you use EasyEntityQuery, you need to include this APT reference -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>Use the latest version number</version>
</dependency>
<!-- Include data source as needed-->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>
<!-- Include corresponding database driver as needed -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.31</version>
</dependency>
<!-- Optional -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.40</version>
</dependency>
<!-- Include corresponding version as per actual framework -->
<dependency>
    <groupId>org.noear</groupId>
    <artifactId>solon-web</artifactId>
    <version>2.9.3</version>
</dependency>
```

### Creating DataSource Injection
```java
@Configuration
public class WebConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
}

```

### Adding Controller
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

### Solon Startup
```yml
# Add configuration file
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver


easy-query: 
  # Configure custom log
  # log-class: ...
  db1:
    # Supports mysql pgsql h2 mssql dameng mssql_row_number kingbase_es, other databases are being adapted
    database: mysql
    # Supports underlined default lower_camel_case upper_camel_case upper_underlined
    name-conversion: underlined
    # Throw exception on physical deletion, not including manual SQL
    delete-throw: true

# Logger level configuration example
solon.logging.logger:
  "root": #Default logger configuration
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

//Access URL http://localhost:8080/test/hello

//Returns Hello World
```

### easy-query Query
```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic  implements ProxyEntityAvailable<Topic, TopicProxy> {

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
     * Note: Must be one of the configured multi-data sources
     */
    @Db("db1")//Note: Use the Db annotation from the sql-solon-plugin package here
    private EasyEntityQuery easyEntityQuery;
    @Mapping(value = "/hello",method = MethodType.GET)
    public String hello(){
        return "Hello World";
    }
    @Mapping(value = "/queryTopic",method = MethodType.GET)
    public Object queryTopic(){
        return easyEntityQuery.queryable(Topic.class)
                .where(o->o.stars().ge(2))
                .toList();
    }
}


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `stars` >= ?
==> Parameters: 2(Integer)
<== Time Elapsed: 17(ms)
<== Total: 101

```

<img :src="$withBase('/images/easy-query-solon-web-query-topic.png')" />


### Solon Configuration easy-query Personalization
```yml
# Add configuration file
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

easy-query: 
  # Configure custom log
  # log-class: ...
  db1:
    # Supports mysql pgsql h2 mssql dameng mssql_row_number kingbase_es, other databases are being adapted
    database: mysql
    # Supports underlined default lower_camel_case upper_camel_case upper_underlined
    name-conversion: underlined
    # Throw exception on physical deletion, not including manual SQL
    delete-throw: true
    # Entity mapping to dto/vo uses property matching mode
    # Supports property_only column_only column_and_property property_first
    mapping-strategy: property_first
    # Insert column strategy all_columns only_not_null_columns only_null_columns
    insert-strategy: only_not_null_columns 
    # Update column strategy all_columns only_not_null_columns only_null_columns
    update-strategy: all_columns 
    # Still query large fields. If not querying, it's recommended to set updateIgnore to prevent update allcolumn from changing it to null
    query-large-column: true
    # Error on update/delete without version number
    no-version-error: true
    # Sharding connection mode system_auto memory_strictly connection_strictly
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
    # warning-column-miss: ...
    # sharding-fetch-size: ...
    # Sharding query mode in transaction serializable concurrency
    # sharding-query-in-transaction: ....

# Logger level configuration example. If print-sql is configured but the corresponding log is not configured, it will not print
solon.logging.logger:
  "root": #Default logger configuration
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

### Additional Configuration

::: danger Note!!!
> Because Solon supports multi-data sources, each data source may have different interceptors, primary key generators, or enum handlers, so all components need to be handled and registered separately by users
:::

#### Logical Deletion
```java

public class MyLogicDelStrategy extends AbstractLogicDeleteStrategy {
    /**
     * Allow datetime type properties
     */
    private final Set<Class<?>> allowTypes=new HashSet<>(Arrays.asList(LocalDateTime.class));
    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o->o.isNull(propertyName);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
//        LocalDateTime now = LocalDateTime.now();
//        return o->o.set(propertyName,now);
        //The above is wrong usage. If the now value is obtained, then this now becomes a fixed value rather than a dynamic value
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

### All Solon Configurations

Configure for a single data source. For affecting all data sources, see the section below on affecting all data sources
```java
@Configuration
public class DemoConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }

//    /**
//     * Configure additional plugins, such as custom logical deletion, encryption strategy, interceptor, sharding initializer, value converter, atomic update tracking
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
//     * Add sharding table or database routing, sharding data sources
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

### Configuration Affecting All Data Sources
```java
public class App {
    public static void main(String[] args) {
        Solon.start(App.class,args,app->{
            app.onEvent(EasyQueryBuilderConfiguration.class,e->{
                //If you need to distinguish data sources, you can use e.getName()
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
