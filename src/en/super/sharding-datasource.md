---
title: Database Sharding
order: 20
---
`easy-query` provides an efficient, high-performance sharding mechanism that perfectly shields the business complexity brought by sharding. Unlike `sharding-jdbc`'s SQL `antlr` parsing, it adopts its own expression parsing for high efficiency, and unlike `ShardingSphere-Proxy`'s proxy mode, which causes unsharded objects to also go through the proxy and requires multiple JDBC operations, `easy-query` adopts client-side sharding to ensure high-performance query result returns under sharding, and the native ORM framework comes with it without requiring additional components, with fewer dependencies to ensure program robustness and controllability

## Create Database
Let's take order table as an example to implement simple modulo database sharding of orders. We divide the order table by modulo 5 into ds0, ds1, ds2, ds3, ds4, a total of 5 data sources

::: code-tabs
@tab Database Object
```java
//Database object

@Data
@Table(value = "ds_order",shardingInitializer = DsOrderShardingInitializer.class)
public class DsOrderEntity {
    @Column(primaryKey = true)
    @ShardingDataSourceKey
    @UpdateIgnore
    private String id;
    private String uid;
    private Integer orderNo;
    private Integer status;
    private LocalDateTime createTime;
}

//Sharding initializer, modulo 5, get ds0-ds4, a total of 5 data sources, each data source has only one table
@Component
public class DsOrderShardingInitializer implements EntityShardingInitializer<DsOrderEntity> {
    @Override
    public void configure(ShardingEntityBuilder<DsOrderEntity> builder) {
        EntityMetadata entityMetadata = builder.getEntityMetadata();
        String tableName = entityMetadata.getTableName();
        List<String> tables = Collections.singletonList(tableName);
        LinkedHashMap<String, Collection<String>> initTables = new LinkedHashMap<String, Collection<String>>();
        initTables.put("ds0", tables);
        initTables.put("ds1", tables);
        initTables.put("ds2", tables);
        initTables.put("ds3", tables);
        initTables.put("ds4", tables);
        builder.actualTableNameInit(initTables);
    }
}

//Sharding route, route uses default abstract database sharding route AbstractDataSourceRoute, write RouteFunction
@Component
public class DsOrderDataSourceRoute extends AbstractDataSourceRoute<DsOrderEntity> {

    @Override
    protected RouteFunction<String> getRouteFilter(TableAvailable table, Object shardingValue, ShardingOperatorEnum shardingOperator, boolean withEntity) {
        int i = shardingValue.toString().hashCode();
        int dsNumber = Math.abs(i % 5); //0-5
        String dataSource = "ds" + dsNumber;
        switch (shardingOperator) {
            case EQUAL: //Only support == operation
                return ds -> dataSource.compareToIgnoreCase(ds) == 0;
            default:
                return t -> true;
        }
    }
}
```
@tab SQL Script

```sql

CREATE DATABASE IF NOT EXISTS easy_sample CHARACTER SET 'utf8mb4';
USE easy_sample;
create table ds_order
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';


CREATE DATABASE IF NOT EXISTS easy_sample1 CHARACTER SET 'utf8mb4';
USE easy_sample1;
create table ds_order
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';


CREATE DATABASE IF NOT EXISTS easy_sample2 CHARACTER SET 'utf8mb4';
USE easy_sample2;
create table ds_order
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';


CREATE DATABASE IF NOT EXISTS easy_sample3 CHARACTER SET 'utf8mb4';
USE easy_sample3;
create table ds_order
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';


CREATE DATABASE IF NOT EXISTS easy_sample4 CHARACTER SET 'utf8mb4';
USE easy_sample4;
create table ds_order
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';
```
:::


## Configuration File
Because sharding involves cross-table aggregation, it is necessary to set the default data source connection pool size and set the available data source size for sharding
```yml

server:
  port: 8081

spring:

  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy_sample?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root
    druid:
      initial-size: 10
      max-active: 100

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  defaultDataSourceMergePoolSize: 50
  #entity mapping to dto/vo uses property matching mode
  mapping-strategy: property_first
```

We set the maximum number of connections to 100 and the sharding available connection pool number to 50 to ensure that at least 50 connections can be used for non-sharding. Of course, the other 50 non-sharding connections will compete with sharding connections

## Add Additional Data Sources

By default, the data source name under Spring Boot is ds0, so we need to add 4 additional data sources

After Spring Boot starts, we can manually construct data sources by obtaining connection strings through the database or other methods. After startup, ds1-ds4, a total of 4 data sources will be created, plus one default data source, totaling 5

```java

@Component
public class ShardingInitRunner implements ApplicationRunner {
    @Autowired
    private EasyQuery easyQuery;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Map<String, DataSource> dataSources = createDataSources();
        DataSourceManager dataSourceManager = easyQuery.getRuntimeContext().getDataSourceManager();
        for (Map.Entry<String, DataSource> stringDataSourceEntry : dataSources.entrySet()) {

            dataSourceManager.addDataSource(stringDataSourceEntry.getKey(), stringDataSourceEntry.getValue(), 60);
        }
        System.out.println("Initialization complete");
    }

    private Map<String, DataSource> createDataSources() {
        HashMap<String, DataSource> stringDataSourceHashMap = new HashMap<>();
        for (int i = 1; i < 5; i++) {
            //Can query through database or store additional data sources through other methods
            DataSource dataSource = createDataSource("ds" + i, "jdbc:mysql://127.0.0.1:3306/easy_sample"+i+"?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true", "root", "root");
            stringDataSourceHashMap.put("ds" + i, dataSource);
        }
        return stringDataSourceHashMap;
    }

    private DataSource createDataSource(String dsName, String url, String username, String password) {

        // Set properties
        Properties properties = new Properties();
        properties.setProperty("name", dsName);
        properties.setProperty("driverClassName", "com.mysql.cj.jdbc.Driver");
        properties.setProperty("url", url);
        properties.setProperty("username", username);
        properties.setProperty("password", password);
        properties.setProperty("initialSize", "10");
        properties.setProperty("maxActive", "100");
        try {
            return DruidDataSourceFactory.createDataSource(properties);
        } catch (Exception e) {
            throw new EasyQueryException(e);
        }
    }
}

```



## Insert

```java

@RestController
@RequestMapping("/orderShardingDataSource")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OrderShardingDataSourceController {
    private final EasyQuery easyQuery;

    @GetMapping("/add")
    public Object add() {
        ArrayList<DsOrderEntity> orderEntities = new ArrayList<>(100);
        List<String> users = Arrays.asList("xiaoming", "xiaohong", "xiaolan");

        for (int i = 0; i < 10; i++) {
            DsOrderEntity orderEntity = new DsOrderEntity();
            orderEntity.setId(String.valueOf(i));
            int i1 = i % 3;
            String uid = users.get(i1);
            orderEntity.setUid(uid);
            orderEntity.setOrderNo(i);
            orderEntity.setStatus(i1);
            orderEntity.setCreateTime(LocalDateTime.now());
            orderEntities.add(orderEntity);
        }
        long l = easyQuery.insertable(orderEntities).executeRows();
        return "Successfully inserted:"+l;
    }
}

```

```log
: ==> SHARDING_EXECUTOR_1, name:ds0, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_1, name:ds0, Parameters: 2(String),xiaolan(String),2(Integer),2(Integer),2023-09-04T22:02:31.509635(LocalDateTime)
: ==> SHARDING_EXECUTOR_5, name:ds3, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_5, name:ds3, Parameters: 0(String),xiaoming(String),0(Integer),0(Integer),2023-09-04T22:02:31.509610(LocalDateTime)
: ==> SHARDING_EXECUTOR_4, name:ds4, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_4, name:ds4, Parameters: 1(String),xiaohong(String),1(Integer),1(Integer),2023-09-04T22:02:31.509631(LocalDateTime)
: ==> SHARDING_EXECUTOR_2, name:ds2, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_2, name:ds2, Parameters: 4(String),xiaohong(String),4(Integer),1(Integer),2023-09-04T22:02:31.509640(LocalDateTime)
: ==> SHARDING_EXECUTOR_3, name:ds1, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_3, name:ds1, Parameters: 3(String),xiaoming(String),3(Integer),0(Integer),2023-09-04T22:02:31.509637(LocalDateTime)
: <== SHARDING_EXECUTOR_1, name:ds0, Total: 1
: ==> SHARDING_EXECUTOR_1, name:ds0, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_1, name:ds0, Parameters: 7(String),xiaohong(String),7(Integer),1(Integer),2023-09-04T22:02:31.509647(LocalDateTime)
: <== SHARDING_EXECUTOR_4, name:ds4, Total: 1
: ==> SHARDING_EXECUTOR_4, name:ds4, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_4, name:ds4, Parameters: 6(String),xiaoming(String),6(Integer),0(Integer),2023-09-04T22:02:31.509645(LocalDateTime)
: <== SHARDING_EXECUTOR_5, name:ds3, Total: 1
: ==> SHARDING_EXECUTOR_5, name:ds3, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_5, name:ds3, Parameters: 5(String),xiaolan(String),5(Integer),2(Integer),2023-09-04T22:02:31.509642(LocalDateTime)
: <== SHARDING_EXECUTOR_2, name:ds2, Total: 1
: ==> SHARDING_EXECUTOR_2, name:ds2, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_2, name:ds2, Parameters: 9(String),xiaoming(String),9(Integer),0(Integer),2023-09-04T22:02:31.509652(LocalDateTime)
: <== SHARDING_EXECUTOR_3, name:ds1, Total: 1
: <== SHARDING_EXECUTOR_4, name:ds4, Total: 1
: <== SHARDING_EXECUTOR_1, name:ds0, Total: 1
: ==> SHARDING_EXECUTOR_3, name:ds1, Preparing: INSERT INTO `ds_order` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
: ==> SHARDING_EXECUTOR_3, name:ds1, Parameters: 8(String),xiaolan(String),8(Integer),2(Integer),2023-09-04T22:02:31.509650(LocalDateTime)
: <== SHARDING_EXECUTOR_5, name:ds3, Total: 1
: <== SHARDING_EXECUTOR_3, name:ds1, Total: 1
: <== SHARDING_EXECUTOR_2, name:ds2, Total: 1
```

name ds0-ds4 respectively correspond to the data sources for sharded insertions.


## Update
Only update time so only time will be changed
```java

@GetMapping("/edit")
@EasyQueryTrack
public Object edit() {
    DsOrderEntity orderEntity = easyQuery.queryable(DsOrderEntity.class)
            .asTracking()
            .where(o->o.eq(DsOrderEntity::getId,"1")).firstNotNull("Order not found");
    orderEntity.setCreateTime(LocalDateTime.now());
    easyQuery.updatable(orderEntity)
            .executeRows();
    return orderEntity;
}
```
Object update can directly route to the corresponding database through id, ensuring seamless user updates and high-performance data updates
```log
: ==> http-nio-8081-exec-4, name:ds4, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `ds_order` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-4, name:ds4, Parameters: 1(String)
: <== http-nio-8081-exec-4, name:ds4, Time Elapsed: 26(ms)
: <== Total: 1
: ==> http-nio-8081-exec-4, name:ds4, Preparing: UPDATE `ds_order` SET `create_time` = ? WHERE `id` = ?
: ==> http-nio-8081-exec-4, name:ds4, Parameters: 2023-09-05T08:47:48.703659(LocalDateTime),1(String)
: <== http-nio-8081-exec-4, name:ds4, Total: 1
```

Java concurrent update
```java

@GetMapping("/concurrentEdit")
@EasyQueryTrack
public Object concurrentEdit() {
    DsOrderEntity orderEntity = easyQuery.queryable(DsOrderEntity.class)
            .asTracking()
            .where(o->o.eq(DsOrderEntity::getId,"2")).firstNotNull("Order not found");
    if(!Objects.equals(2,orderEntity.getStatus())){
        throw new RuntimeException("Order status is not 2");
    }
    orderEntity.setCreateTime(LocalDateTime.now());
    orderEntity.setStatus(3);
    easyQuery.updatable(orderEntity)
            .whereColumns(o->o.columnKeys().column(DsOrderEntity::getStatus))
            .executeRows(1,"Concurrent modification failed");
    return orderEntity;
}
```
Concurrent update of sharded database, high-performance hit to the corresponding database
```log
: ==> http-nio-8081-exec-1, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `ds_order` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 2(String)
: <== http-nio-8081-exec-1, name:ds0, Time Elapsed: 6(ms)
: <== Total: 1
: ==> http-nio-8081-exec-1, name:ds0, Preparing: UPDATE `ds_order` SET `status` = ?,`create_time` = ? WHERE `id` = ? AND `status` = ?
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 3(Integer),2023-09-05T08:54:19.189373(LocalDateTime),2(String),2(Integer)
: <== http-nio-8081-exec-1, name:ds0, Total: 1
```

