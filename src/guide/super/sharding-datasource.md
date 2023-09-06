---
title: 分库
order: 20
---
`easy-query`提供了高效,高性能的分片机制,完美的屏蔽分片带来的业务复杂度,不同于`sharding-jdbc`的sql的`antlr`解析采用自带的表达式解析性能高效,并且不同于`ShardingSphere-Proxy`的代理模式,导致未分片的对象也需要走代理,并且需要多次jdbc,`easy-query`采用客户端分片保证分片下的高性能查询结果返回,并且原生orm框架自带无需使用额外组件,更少的依赖来保证程序的健壮与可控

## 创建数据库
我们以订单表为例来实现订单的简单取模分库,将订单表按5取模进行分库分为ds0,ds1,ds2,ds3,ds4一共5个数据源

::: code-tabs
@tab sql脚本

```sql

CREATE DATABASE IF NOT EXISTS easy_sample CHARACTER SET 'utf8mb4';
USE easy_sample;
create table ds_order
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';


CREATE DATABASE IF NOT EXISTS easy_sample1 CHARACTER SET 'utf8mb4';
USE easy_sample1;
create table ds_order
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';


CREATE DATABASE IF NOT EXISTS easy_sample2 CHARACTER SET 'utf8mb4';
USE easy_sample2;
create table ds_order
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';


CREATE DATABASE IF NOT EXISTS easy_sample3 CHARACTER SET 'utf8mb4';
USE easy_sample3;
create table ds_order
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';


CREATE DATABASE IF NOT EXISTS easy_sample4 CHARACTER SET 'utf8mb4';
USE easy_sample4;
create table ds_order
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
```
@tab 数据库对象
```java
//数据库对象

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

//分片初始化器,和5进行取模,获取ds0-ds4一共5个数据源每个数据源都只有一张表
@Component
public class DsOrderShardingInitializer implements EntityShardingInitializer<DsOrderEntity> {
    @Override
    public void configure(ShardingEntityBuilder<DsOrderEntity> builder) {
        EntityMetadata entityMetadata = builder.getEntityMetadata();
        String tableName = entityMetadata.getTableName();
        List<String> tables = Collections.singletonList(tableName);
        LinkedHashMap<String, Collection<String>> initTables = new LinkedHashMap<String, Collection<String>>() {{
            put("ds0", tables);
            put("ds1", tables);
            put("ds2", tables);
            put("ds3", tables);
            put("ds4", tables);
        }};
        builder.actualTableNameInit(initTables);
    }
}

//分片的路由,路由使用默认抽象的分库路由AbstractDataSourceRoute,编写RouteFunction
@Component
public class DsOrderDataSourceRoute extends AbstractDataSourceRoute<DsOrderEntity> {

    @Override
    protected RouteFunction<String> getRouteFilter(TableAvailable table, Object shardingValue, ShardingOperatorEnum shardingOperator, boolean withEntity) {
        int i = shardingValue.toString().hashCode();
        int dsNumber = Math.abs(i % 5); //0-5
        String dataSource = "ds" + dsNumber;
        switch (shardingOperator) {
            case EQUAL: //仅支持==操作
                return ds -> dataSource.compareToIgnoreCase(ds) == 0;
            default:
                return t -> true;
        }
    }
}
```
:::


## 配置文件
因为分片涉及到跨表聚合所以需要设置默认数据源的连接池大小，并且设置分片可用数据源大小
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
```

我们设置了最大连接数100,分片可用连接池数50保证至少有50个连接可以给非分片用,当然另外50个非分片会和分片进行竞争

## 添加额外数据源

默认springboot下的数据源name为ds0所以我们还需要额外添加4个数据源

springboot启动后我们可以通过数据库或者其他方式来获取链接字符串来手动构建datasource,启动后会创建ds1-ds4一共4个数据源额外加一个默认数据源一共5个

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
        System.out.println("初始化完成");
    }

    private Map<String, DataSource> createDataSources() {
        HashMap<String, DataSource> stringDataSourceHashMap = new HashMap<>();
        for (int i = 1; i < 5; i++) {
            //可以通过数据库查询或者其他方式来存储额外数据源
            DataSource dataSource = createDataSource("ds" + i, "jdbc:mysql://127.0.0.1:3306/easy_sample"+i+"?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true", "root", "root");
            stringDataSourceHashMap.put("ds" + i, dataSource);
        }
        return stringDataSourceHashMap;
    }

    private DataSource createDataSource(String dsName, String url, String username, String password) {

        // 设置properties
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



## 新增

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
        return "成功插入:"+l;
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

name ds0-ds4分别对应分库插入的数据源。


## 修改
进修改时间所以只会变更时间
```java

@GetMapping("/edit")
@EasyQueryTrack
public Object edit() {
    DsOrderEntity orderEntity = easyQuery.queryable(DsOrderEntity.class)
            .asTracking()
            .where(o->o.eq(DsOrderEntity::getId,"1")).firstNotNull("未找到对应的订单");
    orderEntity.setCreateTime(LocalDateTime.now());
    easyQuery.updatable(orderEntity)
            .executeRows();
    return orderEntity;
}
```
对象更新可以通过id直接路由到对应的库保证用户无感更新,且数据高性能更新
```log
: ==> http-nio-8081-exec-4, name:ds4, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `ds_order` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-4, name:ds4, Parameters: 1(String)
: <== http-nio-8081-exec-4, name:ds4, Time Elapsed: 26(ms)
: <== Total: 1
: ==> http-nio-8081-exec-4, name:ds4, Preparing: UPDATE `ds_order` SET `create_time` = ? WHERE `id` = ?
: ==> http-nio-8081-exec-4, name:ds4, Parameters: 2023-09-05T08:47:48.703659(LocalDateTime),1(String)
: <== http-nio-8081-exec-4, name:ds4, Total: 1
```

java并发更新
```java

@GetMapping("/concurrentEdit")
@EasyQueryTrack
public Object concurrentEdit() {
    DsOrderEntity orderEntity = easyQuery.queryable(DsOrderEntity.class)
            .asTracking()
            .where(o->o.eq(DsOrderEntity::getId,"2")).firstNotNull("未找到对应的订单");
    if(!Objects.equals(2,orderEntity.getStatus())){
        throw new RuntimeException("订单状态不是2");
    }
    orderEntity.setCreateTime(LocalDateTime.now());
    orderEntity.setStatus(3);
    easyQuery.updatable(orderEntity)
            .whereColumns(o->o.columnKeys().column(DsOrderEntity::getStatus))
            .executeRows(1,"并发修改失败");
    return orderEntity;
}
```
并发更新分库,高性能命中对应的库
```log
: ==> http-nio-8081-exec-1, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `ds_order` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 2(String)
: <== http-nio-8081-exec-1, name:ds0, Time Elapsed: 6(ms)
: <== Total: 1
: ==> http-nio-8081-exec-1, name:ds0, Preparing: UPDATE `ds_order` SET `status` = ?,`create_time` = ? WHERE `id` = ? AND `status` = ?
: ==> http-nio-8081-exec-1, name:ds0, Parameters: 3(Integer),2023-09-05T08:54:19.189373(LocalDateTime),2(String),2(Integer)
: <== http-nio-8081-exec-1, name:ds0, Total: 1
```