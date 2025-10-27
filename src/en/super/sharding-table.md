---
title: Table Sharding
order: 10
---

`easy-query` provides an efficient, high-performance sharding mechanism that perfectly shields the business complexity brought by sharding. Unlike `sharding-jdbc`'s SQL `antlr` parsing, it adopts its own expression parsing for high efficiency, and unlike `ShardingSphere-Proxy`'s proxy mode, which causes unsharded objects to also go through the proxy and requires multiple JDBC operations, `easy-query` adopts client-side sharding to ensure high-performance query result returns under sharding, and the native ORM framework comes with it without requiring additional components, with fewer dependencies to ensure program robustness and controllability

## Note: Sharding needs to be manually enabled after 3.x
Spring Boot default yml setting sharding: true
Console please replace service
```java

        easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(false);
                    op.setExecutorCorePoolSize(1);
                    op.setExecutorMaximumPoolSize(0);
                    op.setMaxShardingQueryLimit(10);
                    op.setShardingOption(easyQueryShardingOption);
                    op.setDefaultDataSourceName("ds2020");
                    op.setThrowIfRouteNotMatch(false);
                    op.setMaxShardingRouteCount(512);
                    op.setDefaultDataSourceMergePoolSize(20);
                    op.setStartTimeJob(true);
                    op.setReverseOffsetThreshold(10);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                //This line
                .replaceService(EntityExpressionExecutor.class, ShardingEntityExpressionExecutor.class)
                .build();
```

## Create Table
Let's take order table as an example to implement simple modulo table sharding of orders. We divide the order table by modulo 5 into t_order_00, t_order_01....t_order_04

::: code-tabs
@tab Database Object
```java
//Database object
@Data
@Table(value = "order",shardingInitializer = OrderShardingInitializer.class)
public class OrderEntity {
    @Column(primaryKey = true)
    @ShardingTableKey //Mark current property as sharding key
    @UpdateIgnore
    private String id;
    private String uid;
    private Integer orderNo;
    private Integer status;
    private LocalDateTime createTime;
}

//Sharding initializer, modulo 5, get 2-digit suffix 00-04
@Component
public class OrderShardingInitializer extends AbstractShardingTableModInitializer<OrderEntity> {
    /**
     * Set the modulo number, we set 5 for modulo 5
     * @return
     */
    @Override
    protected int mod() {
        return 5;
    }

    /**
     * Write the tail length after modulo 5, default we set 2, which is left-padded with 0
     * @return
     */
    @Override
    protected int tailLength() {
        return 2;
    }
}

//Sharding route, route uses default encapsulated modulo configuration modulus and suffix length
@Component
public class OrderTableRoute extends AbstractModTableRoute<OrderEntity> {
    @Override
    protected int mod() {
        return 5;
    }

    @Override
    protected int tailLength() {
        return 2;
    }
}
```
@tab SQL Script

```sql

CREATE DATABASE IF NOT EXISTS easy_sample CHARACTER SET 'utf8mb4';
USE easy_sample;
create table order_00
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';
create table order_01
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';
create table order_02
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';
create table order_03
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    uid varchar(50) not null comment 'User id',
    order_no int not null comment 'Order number',
    status int not null comment 'Order status',
    create_time datetime not null comment 'Create time'
)comment 'Order table';
create table order_04
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

We set the maximum number of connections to 100 and the sharding available connection pool number to 50

## Insert

```java

@RestController
@RequestMapping("/orderShardingTable")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class OrderShardingTableController {
    private final EasyQuery easyQuery;

    @GetMapping("/add")
    public Object add() {
        ArrayList<OrderEntity> orderEntities = new ArrayList<>(100);
        List<String> users = Arrays.asList("xiaoming", "xiaohong", "xiaolan");

        for (int i = 0; i < 10; i++) {
            OrderEntity orderEntity = new OrderEntity();
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
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_03` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 0(String),xiaoming(String),0(Integer),0(Integer),2023-09-02T15:15:29.391349(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_04` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 1(String),xiaohong(String),1(Integer),1(Integer),2023-09-02T15:15:29.391420(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_00` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 2(String),xiaolan(String),2(Integer),2(Integer),2023-09-02T15:15:29.391433(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_01` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 3(String),xiaoming(String),3(Integer),0(Integer),2023-09-02T15:15:29.391445(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_02` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 4(String),xiaohong(String),4(Integer),1(Integer),2023-09-02T15:15:29.391457(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_03` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 5(String),xiaolan(String),5(Integer),2(Integer),2023-09-02T15:15:29.391469(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_04` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 6(String),xiaoming(String),6(Integer),0(Integer),2023-09-02T15:15:29.391481(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_00` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 7(String),xiaohong(String),7(Integer),1(Integer),2023-09-02T15:15:29.391492(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_01` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 8(String),xiaolan(String),8(Integer),2(Integer),2023-09-02T15:15:29.391504(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
 : ==> http-nio-8081-exec-4, name:ds0, Preparing: INSERT INTO `order_02` (`id`,`uid`,`order_no`,`status`,`create_time`) VALUES (?,?,?,?,?)
 : ==> http-nio-8081-exec-4, name:ds0, Parameters: 9(String),xiaoming(String),9(Integer),0(Integer),2023-09-02T15:15:29.391516(LocalDateTime)
 : <== http-nio-8081-exec-4, name:ds0, Total: 1
```

## Update
Only update time so only time will be changed
```java
@GetMapping("/edit")
@EasyQueryTrack
public Object edit() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"1")).firstNotNull("Order not found");
    orderEntity.setCreateTime(LocalDateTime.now());
    easyQuery.updatable(orderEntity)
            .executeRows();
    return orderEntity;
}
```
```log
: ==> http-nio-8081-exec-1, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `order_04` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 1(String)
: <== http-nio-8081-exec-1, name:ds0, Time Elapsed: 20(ms)
: <== Total: 1
: ==> http-nio-8081-exec-1, name:ds0, Preparing: UPDATE `order_04` SET `create_time` = ? WHERE `id` = ?
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 2023-09-02T15:20:13.029025(LocalDateTime),1(String)
: <== http-nio-8081-exec-1, name:ds0, Total: 1
```


Concurrent update, change order status from 2 to 3, and support concurrent operations
```java

@GetMapping("/concurrentEdit")
@EasyQueryTrack
public Object concurrentEdit() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"2")).firstNotNull("Order not found");
    if(!Objects.equals(2,orderEntity.getStatus())){
        throw new RuntimeException("Order status is not 2");
    }
    orderEntity.setCreateTime(LocalDateTime.now());
    orderEntity.setStatus(3);
    easyQuery.updatable(orderEntity)
            .whereColumns(o->o.columnKeys().column(OrderEntity::getStatus))
            .executeRows(1,"Concurrent modification failed");
    return orderEntity;
}
```
```log

: ==> http-nio-8081-exec-1, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `order_00` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 2(String)
: <== http-nio-8081-exec-1, name:ds0, Time Elapsed: 5(ms)
: <== Total: 1
: ==> http-nio-8081-exec-1, name:ds0, Preparing: UPDATE `order_00` SET `status` = ?,`create_time` = ? WHERE `id` = ? AND `status` = ?
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 3(Integer),2023-09-02T15:23:51.745936(LocalDateTime),2(String),2(Integer)
: <== http-nio-8081-exec-1, name:ds0, Total: 1
```

## Delete

```java

@GetMapping("/delete")
public Object delete() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"3")).firstNotNull("Order not found");
    orderEntity.setCreateTime(LocalDateTime.now());
    easyQuery.deletable(orderEntity)
            .allowDeleteStatement(true)
            .executeRows();
    return orderEntity;
}
```

Using sharding key to delete can accurately target the corresponding sharding table
```log
: ==> http-nio-8081-exec-3, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `order_01` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-3, name:ds0, Parameters: 3(String)
: <== http-nio-8081-exec-3, name:ds0, Time Elapsed: 6(ms)
: <== Total: 1
: ==> http-nio-8081-exec-3, name:ds0, Preparing: DELETE FROM `order_01` WHERE `id` = ?
: ==> http-nio-8081-exec-3, name:ds0, Parameters: 3(String)
: <== http-nio-8081-exec-3, name:ds0, Total: 1
```

