---
title: Solon Integration
order: 6
---

# Solon Framework Integration

Easy-query officially supports Solon framework starting from version `^1.2.6`, adapting the ORM capabilities for this domestic framework.

## What is Solon?

[Solon](https://solon.noear.org/) is **a new ecosystem-style Java application development framework: Faster, Smaller, Simpler.**

- Starts 5-10x faster
- QPS 2-3x higher
- Memory usage reduced by 1/3 to 1/2
- Package size can shrink to 1/2 to 1/10
- Supports JDK 8, 11, 17, 20, and GraalVM native image

## Get Latest Version

Search for `com.easy-query` on [Maven Central](https://central.sonatype.com/)

## Quick Start

### Create Java Maven Project

<img :src="$withBase('/images/easy-qeury-solon-web-install.png')">

### Add Dependencies

```xml
<!-- Required -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-solon-plugin</artifactId>
    <version>Use latest version</version>
</dependency>

<!-- If using EasyEntityQuery, include APT processor -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>Use latest version</version>
</dependency>

<!-- Add datasource -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>

<!-- Add database driver -->
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

<!-- Solon framework -->
<dependency>
    <groupId>org.noear</groupId>
    <artifactId>solon-web</artifactId>
    <version>2.9.3</version>
</dependency>
```

### Configure DataSource

```java
@Configuration
public class WebConfiguration {
    @Bean(name = "db1", typed = true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource) {
        return dataSource;
    }
}
```

### Create Controller

```java
@Controller
@Mapping("/test")
public class TestController {
    @Mapping(value = "/hello", method = MethodType.GET)
    public String hello() {
        return "Hello World";
    }
}
```

### Configure application.yml

```yml
# Database configuration
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

# Easy-query configuration
easy-query:
  # Custom logger class (optional)
  # log-class: ...
  db1:
    # Supported: mysql, pgsql, h2, mssql, dameng, mssql_row_number, kingbase_es
    database: mysql
    # Name conversion: underlined, default, lower_camel_case, upper_camel_case, upper_underlined
    name-conversion: underlined
    # Throw exception on physical delete (excluding manual SQL)
    delete-throw: true

# Logging configuration
solon.logging.logger:
  "root": # Default logger config
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

### Start Solon

```java
public class Main {
    public static void main(String[] args) {
        Solon.start(Main.class, args, (app) -> {
            app.cfg().loadAdd("application.yml");
        });
    }
}

// Visit: http://localhost:8080/test/hello
// Returns: Hello World
```

## Query with Easy-query

### Create Entity

```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic, TopicProxy> {
    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```

### Use in Controller

```java
@Controller
@Mapping("/test")
public class TestController {

    /**
     * Must be one of the configured data sources
     */
    @Db("db1")  // Use @Db from sql-solon-plugin
    private EasyEntityQuery easyEntityQuery;
    
    @Mapping(value = "/hello", method = MethodType.GET)
    public String hello() {
        return "Hello World";
    }
    
    @Mapping(value = "/queryTopic", method = MethodType.GET)
    public Object queryTopic() {
        return easyEntityQuery.queryable(Topic.class)
            .where(o -> o.stars().ge(2))
            .toList();
    }
}

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `stars` >= ?
// Parameters: 2(Integer)
// Total: 101
```

<img :src="$withBase('/images/easy-query-solon-web-query-topic.png')" />

## Advanced Configuration

### Complete Configuration Options

```yml
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

easy-query:
  # Custom logger class
  # log-class: ...
  db1:
    # Database type: mysql, pgsql, h2, mssql, dameng, mssql_row_number, kingbase_es
    database: mysql
    # Name conversion: underlined, default, lower_camel_case, upper_camel_case, upper_underlined
    name-conversion: underlined
    # Throw exception on physical delete
    delete-throw: true
    
    # Entity to DTO/VO mapping strategy
    # Options: property_only, column_only, column_and_property, property_first
    mapping-strategy: property_first
    
    # Insert column strategy: all_columns, only_not_null_columns, only_null_columns
    insert-strategy: only_not_null_columns
    
    # Update column strategy: all_columns, only_not_null_columns, only_null_columns
    update-strategy: all_columns
    
    # Query large columns (LOB)
    query-large-column: true
    
    # Error on update/delete without version
    no-version-error: true
    
    # Sharding connection mode: system_auto, memory_strictly, connection_strictly
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
    
    # Sharding query mode in transaction: serializable, concurrency
    # sharding-query-in-transaction: ...

solon.logging.logger:
  "root":
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

## Custom Components

::: danger Important
Since Solon supports multiple data sources, each data source may have different interceptors, key generators, or enum handlers. All components need to be registered separately for each data source.
:::

### Custom Logical Delete Strategy

```java
public class MyLogicDelStrategy extends AbstractLogicDeleteStrategy {
    /**
     * Allow datetime type properties
     */
    private final Set<Class<?>> allowTypes = new HashSet<>(
        Arrays.asList(LocalDateTime.class)
    );
    
    @Override
    protected SQLActionExpression1<WherePredicate<Object>> getPredicateFilterExpression(
        LogicDeleteBuilder builder, 
        String propertyName
    ) {
        return o -> o.isNull(propertyName);
    }

    @Override
    protected SQLActionExpression1<ColumnSetter<Object>> getDeletedSQLExpression(
        LogicDeleteBuilder builder, 
        String propertyName
    ) {
        // ❌ Wrong: now is evaluated once
        // LocalDateTime now = LocalDateTime.now();
        // return o -> o.set(propertyName, now);
        
        // ✅ Correct: evaluated on each execution
        return o -> o.set(propertyName, LocalDateTime.now());
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
    @Bean(name = "db1", typed = true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource) {
        return dataSource;
    }
    
    @Bean
    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration) {
        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
        // configuration.applyEncryptionStrategy(...);
        // configuration.applyInterceptor(...);
        // configuration.applyShardingInitializer(...);
        // configuration.applyValueConverter(...);
        // configuration.applyValueUpdateAtomicTrack(...);
    }
}
```

### Configure Single Data Source

```java
@Configuration
public class DemoConfiguration {
    @Bean(name = "db1", typed = true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource) {
        return dataSource;
    }

    /**
     * Configure plugins: logical delete, encryption, interceptors, 
     * sharding initializers, value converters, atomic updates
     */
    @Bean
    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration) {
        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
        configuration.applyEncryptionStrategy(...);
        configuration.applyInterceptor(...);
        configuration.applyShardingInitializer(...);
        configuration.applyValueConverter(...);
        configuration.applyValueUpdateAtomicTrack(...);
    }

    /**
     * Add table/database routing and data sources for sharding
     */
    @Bean
    public void db1QueryRuntimeContext(@Db("db1") QueryRuntimeContext runtimeContext) {
        TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();
        DataSourceRouteManager dataSourceRouteManager = runtimeContext.getDataSourceRouteManager();
        
        tableRouteManager.addRoute(...);
        dataSourceRouteManager.addRoute(...);

        DataSourceManager dataSourceManager = runtimeContext.getDataSourceManager();
        dataSourceManager.addDataSource(key, dataSource, poolSize);
    }
}
```

### Configure All Data Sources Globally

```java
public class App {
    public static void main(String[] args) {
        Solon.start(App.class, args, app -> {
            app.onEvent(EasyQueryBuilderConfiguration.class, e -> {
                // Distinguish data sources by e.getName() if needed
                e.replaceServiceFactory(QueryConfiguration.class, s -> {
                    QueryConfiguration queryConfiguration = new QueryConfiguration(
                        s.getService(EasyQueryOption.class),
                        s.getService(Dialect.class),
                        s.getService(NameConversion.class),
                        s.getService(EasyTimeJobManager.class)
                    );
                    
                    // Apply global configurations
                    // queryConfiguration.applyInterceptor();
                    // queryConfiguration.applyLogicDeleteStrategy();
                    // queryConfiguration.applyValueConverter();
                    
                    return queryConfiguration;
                });
            });
        });
    }
}
```

## Multi-Data Source Example

### Configure Multiple Data Sources

```yml
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/database1?...
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

db2:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/database2?...
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

easy-query:
  db1:
    database: mysql
    name-conversion: underlined
  db2:
    database: mysql
    name-conversion: underlined
```

### Use Different Data Sources

```java
@Configuration
public class DataSourceConfiguration {
    @Bean(name = "db1", typed = true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource ds) {
        return ds;
    }
    
    @Bean(name = "db2", typed = true)
    public DataSource db2DataSource(@Inject("${db2}") HikariDataSource ds) {
        return ds;
    }
}

@Controller
@Mapping("/users")
public class UserController {
    @Db("db1")
    private EasyEntityQuery db1Query;
    
    @Db("db2")
    private EasyEntityQuery db2Query;
    
    @Mapping("/db1")
    public List<User> getUsersFromDb1() {
        return db1Query.queryable(User.class).toList();
    }
    
    @Mapping("/db2")
    public List<User> getUsersFromDb2() {
        return db2Query.queryable(User.class).toList();
    }
}
```

## See Also

- [Spring Boot Integration](./spring-boot.md)
- [Multi-Data Source Configuration](./sb-multi-datasource.md)
- [Quick Start](../startup/quick-start.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

