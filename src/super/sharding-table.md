---
title: 分表
order: 10
---

`easy-query`提供了高效,高性能的分片机制,完美的屏蔽分片带来的业务复杂度,不同于`sharding-jdbc`的sql的`antlr`解析采用自带的表达式解析性能高效,并且不同于`ShardingSphere-Proxy`的代理模式,导致未分片的对象也需要走代理,并且需要多次jdbc,`easy-query`采用客户端分片保证分片下的高性能查询结果返回,并且原生orm框架自带无需使用额外组件,更少的依赖来保证程序的健壮与可控

## 注意3.x后分片需要手动开启
springboot默认yml设置sharding: true
控制台请替换服务
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
                //这一句
                .replaceService(EntityExpressionExecutor.class, ShardingEntityExpressionExecutor.class)
                .build();
```

## 创建表
我们以订单表为例来实现订单的简单取模分表,将订单表按5取模进行分表分为t_order_00、t_order_01....t_order_04

::: code-tabs
@tab 数据库对象
```java
//数据库对象
@Data
@Table(value = "order",shardingInitializer = OrderShardingInitializer.class)
public class OrderEntity {
    @Column(primaryKey = true)
    @ShardingTableKey //标记当前属性为分片键
    @UpdateIgnore
    private String id;
    private String uid;
    private Integer orderNo;
    private Integer status;
    private LocalDateTime createTime;
}

//分片初始化器,和5进行取模,获取2位后缀00-04
@Component
public class OrderShardingInitializer extends AbstractShardingTableModInitializer<OrderEntity> {
    /**
     * 设置模几我们模5就设置5
     * @return
     */
    @Override
    protected int mod() {
        return 5;
    }

    /**
     * 编写模5后的尾巴长度默认我们设置2就是左补0
     * @return
     */
    @Override
    protected int tailLength() {
        return 2;
    }
}

//分片的路由,路由使用默认封装的取模配置模数和后缀长度
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
@tab sql脚本

```sql

CREATE DATABASE IF NOT EXISTS easy_sample CHARACTER SET 'utf8mb4';
USE easy_sample;
create table order_00
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
create table order_01
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
create table order_02
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
create table order_03
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
create table order_04
(
    id varchar(32) not null comment '主键ID'primary key,
    uid varchar(50) not null comment '用户id',
    order_no int not null comment '订单号',
    status int not null comment '订单状态',
    create_time datetime not null comment '创建时间'
)comment '订单表';
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
  #entity映射到dto/vo使用属性匹配模式
  mapping-strategy: property_first
```

我们设置了最大连接数100,分片可用连接池数50

## 新增

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
        return "成功插入:"+l;
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

## 修改
进修改时间所以只会变更时间
```java
@GetMapping("/edit")
@EasyQueryTrack
public Object edit() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"1")).firstNotNull("未找到对应的订单");
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


并发更新，将订单状态为2的数据改为3,并且需要支持并发操作
```java

@GetMapping("/concurrentEdit")
@EasyQueryTrack
public Object concurrentEdit() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"2")).firstNotNull("未找到对应的订单");
    if(!Objects.equals(2,orderEntity.getStatus())){
        throw new RuntimeException("订单状态不是2");
    }
    orderEntity.setCreateTime(LocalDateTime.now());
    orderEntity.setStatus(3);
    easyQuery.updatable(orderEntity)
            .whereColumns(o->o.columnKeys().column(OrderEntity::getStatus))
            .executeRows(1,"并发修改失败");
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

## 删除

```java

@GetMapping("/delete")
public Object delete() {
    OrderEntity orderEntity = easyQuery.queryable(OrderEntity.class)
            .asTracking()
            .where(o->o.eq(OrderEntity::getId,"3")).firstNotNull("未找到对应的订单");
    orderEntity.setCreateTime(LocalDateTime.now());
    easyQuery.deletable(orderEntity)
            .allowDeleteStatement(true)
            .executeRows();
    return orderEntity;
}
```

使用分片键删除可以精确到对应的分片表
```log
: ==> http-nio-8081-exec-3, name:ds0, Preparing: SELECT `id`,`uid`,`order_no`,`status`,`create_time` FROM `order_01` WHERE `id` = ? LIMIT 1
: ==> http-nio-8081-exec-3, name:ds0, Parameters: 3(String)
: <== http-nio-8081-exec-3, name:ds0, Time Elapsed: 6(ms)
: <== Total: 1
: ==> http-nio-8081-exec-3, name:ds0, Preparing: DELETE FROM `order_01` WHERE `id` = ?
: ==> http-nio-8081-exec-3, name:ds0, Parameters: 3(String)
: <== http-nio-8081-exec-3, name:ds0, Total: 1
```