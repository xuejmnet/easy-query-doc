---
title: spring-boot相关
order: 3
---

# 使用前准备
- jdk8+
- maven或gradle
- java或kotlin

如果您是kotlin那么建议使用gradle和ksp(`com.easy-query.sql-ksp-processor`)

本章节[demo](https://github.com/xuejmnet/easy-query-samples)


::: warning 注意点及说明!!!
> 注意自行构建的数据源如果`DataSource`不是被spring接管的`Bean`那么事务将不会生效
:::


## 依赖
我们目前使用jdk17的springboot 3.1.0版本当然根据实际情况请选择自己合适的版本即可，eq的`com.easy-query.sql-springboot-starter`依赖支持`springboot2和springboot3`


::: tabs

@tab maven
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.easy-query</groupId>
    <artifactId>eq-multi</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <modules>
        <module>web-site</module>
        <module>application</module>
        <module>dto</module>
        <module>domain</module>
    </modules>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <easy-query.version>3.1.27</easy-query.version>
        <mysql.version>9.2.0</mysql.version>
        <hikaricp.version>3.3.1</hikaricp.version>
        <lombok.version>1.18.40</lombok.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-springboot-starter</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入需要的数据库驱动 -->
        <!-- https://mvnrepository.com/artifact/com.mysql/mysql-connector-j -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>${mysql.version}</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.40</version>
            <scope>provided</scope>
        </dependency>
        <!-- https://mvnrepository.com/artifact/com.alibaba/druid -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>1.2.15</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>


</project>
```
:::

## 配置文件
`application.yml`
```yml
server:
  port: 8080

spring:

  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/eq-multi-db?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root

easy-query:
  #支持的数据库
  database: mysql
  #对象属性和数据库列名的转换器
  name-conversion: underlined
  default-track: true

```

## 数据库对象编写



::: tabs

@tab Company
```java
@Data
@Table("t_company")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * 企业id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 企业名称
     */
    private String name;

    /**
     * 企业创建时间
     */
    private LocalDateTime createTime;

    /**
     * 注册资金
     */
    private BigDecimal registerMoney;

    /**
     * 企业拥有的用户
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {Company.Fields.id},
            targetProperty = {SysUser.Fields.companyId})
    private List<SysUser> users;
}

```
@tab SysUser
```java
@Data
@Table("t_user")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * 用户id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 用户姓名
     */
    private String name;
    /**
     * 用户出生日期
     */
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    private String companyId;

    /**
     * 用户所属企业
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}

```

:::

## 启动配置
自动生成数据库和数据库所需的表
```java

@Configuration
public class AppConfiguration {

    public AppConfiguration(EasyEntityQuery easyEntityQuery){

        DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
        //如果不存在数据库则创建
        databaseCodeFirst.createDatabaseIfNotExists();
        //自动同步数据库表
        CodeFirstCommand command = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //执行命令
        command.executeWithTransaction(arg -> {
            System.out.println(arg.sql);
            arg.commit();
        });

    }
}

```
## 添加控制器
```java

@Slf4j
@RestController
@RequiredArgsConstructor(onConstructor_ = @Autowired)
@RequestMapping("/api/test")
public class TestController {
    private final EasyEntityQuery entityQuery;

    @GetMapping("/say")
    public Object say(){
        return entityQuery.queryable(Company.class).where(c -> c.name().like("123")).toList();
    }
}

```
浏览器输入地址访问
```log
==> Preparing: SELECT `id`,`name`,`create_time`,`register_money` FROM `t_company` WHERE `name` LIKE ?
==> Parameters: %123%(String)
<== Time Elapsed: 5(ms)
<== Total: 0
```


## 获取实例

在SpringBoot环境中，启动Spring容器后，`eq`已经实例化了对象，直接注入即可，如下：

```java
@Autowired
private EasyEntityQuery easyEntityQuery;
```

## 无依赖配置
有些用户喜欢拥有非常强的强迫症,这边给出如何自行处理实现类starter,无依赖引入`easy-query`


### 添加配置

首先我们如果需要支持springboot的事务需要再`easy-query`的`springboot-strater`处拷贝三个源码文件


```java

public class SpringConnectionManager extends DefaultConnectionManager {

    public SpringConnectionManager(EasyQueryDataSource easyDataSource, EasyConnectionFactory easyConnectionFactory, EasyDataSourceConnectionFactory easyDataSourceConnectionFactory) {
        super(easyDataSource, easyConnectionFactory, easyDataSourceConnectionFactory);
    }

    @Override
    public boolean currentThreadInTransaction() {
        return TransactionSynchronizationManager.isActualTransactionActive() || isOpenTransaction();
    }

    @Override
    public void closeEasyConnection(EasyConnection easyConnection) {
        if(easyConnection==null){
            return;
        }
        //当前没开事务,但是easy query手动开启了
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            if (super.isOpenTransaction()) {
                return;
            }
        } else {
            if (super.isOpenTransaction()) {
                throw new EasyQueryException("repeat transaction can't closed connection");
            }
        }
        DataSourceWrapper dataSourceUnit = easyDataSource.getDataSourceNotNull(easyConnection.getDataSourceName(), ConnectionStrategyEnum.ShareConnection);
        DataSourceUtils.releaseConnection(easyConnection.getConnection(), dataSourceUnit.getDataSourceUnit().getDataSource());
    }
}


public class SpringDataSourceUnit extends DefaultDataSourceUnit {
    public SpringDataSourceUnit(String dataSourceName, DataSource dataSource, int mergePoolSize, boolean warningBusy) {
        super(dataSourceName,dataSource,mergePoolSize,warningBusy);
    }

    @Override
    protected Connection getConnection() throws SQLException {
        return DataSourceUtils.getConnection(dataSource);
    }
}


public class SpringDataSourceUnitFactory implements DataSourceUnitFactory {
    private final EasyQueryOption easyQueryOption;

    public SpringDataSourceUnitFactory(EasyQueryOption easyQueryOption){

        this.easyQueryOption = easyQueryOption;
    }
    @Override
    public DataSourceUnit createDataSourceUnit(String dataSourceName, DataSource dataSource, int mergePoolSize) {
        return new SpringDataSourceUnit(dataSourceName,dataSource,mergePoolSize,easyQueryOption.isWarningBusy());
    }
}


```

### 注入bean


```java

@Configuration
public class EasyQueryConfiguration {
    
    @Bean("xxDataSource")
    public DataSource oracleDataSource(){
        return DataSourceBuilder.create()
                .url("....")
                .driverClassName("....")
                .username("root")
                .password("root")
                .build();
    }
    @Bean("xxclient")//使用的时候通过注入指定名称即可
    public EasyQueryClient easyQueryClient(@Qualifier("xxDataSource") DataSource dataSource){
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)
                .optionConfigure(builder -> {
//                    builder.setDeleteThrowError(easyQueryProperties.getDeleteThrow());
//                    builder.setInsertStrategy(easyQueryProperties.getInsertStrategy());
//                    builder.setUpdateStrategy(easyQueryProperties.getUpdateStrategy());
//                    builder.setMaxShardingQueryLimit(easyQueryProperties.getMaxShardingQueryLimit());
//                    builder.setExecutorMaximumPoolSize(easyQueryProperties.getExecutorMaximumPoolSize());
//                    builder.setExecutorCorePoolSize(easyQueryProperties.getExecutorCorePoolSize());
//                    builder.setThrowIfRouteNotMatch(easyQueryProperties.isThrowIfRouteNotMatch());
//                    builder.setShardingExecuteTimeoutMillis(easyQueryProperties.getShardingExecuteTimeoutMillis());
//                    builder.setQueryLargeColumn(easyQueryProperties.isQueryLargeColumn());
//                    builder.setMaxShardingRouteCount(easyQueryProperties.getMaxShardingRouteCount());
//                    builder.setExecutorQueueSize(easyQueryProperties.getExecutorQueueSize());
//                    builder.setDefaultDataSourceName(easyQueryProperties.getDefaultDataSourceName());
//                    builder.setDefaultDataSourceMergePoolSize(easyQueryProperties.getDefaultDataSourceMergePoolSize());
//                    builder.setMultiConnWaitTimeoutMillis(easyQueryProperties.getMultiConnWaitTimeoutMillis());
//                    builder.setWarningBusy(easyQueryProperties.isWarningBusy());
//                    builder.setInsertBatchThreshold(easyQueryProperties.getInsertBatchThreshold());
//                    builder.setUpdateBatchThreshold(easyQueryProperties.getUpdateBatchThreshold());
//                    builder.setPrintSql(easyQueryProperties.isPrintSql());
//                    builder.setStartTimeJob(easyQueryProperties.isStartTimeJob());
//                    builder.setDefaultTrack(easyQueryProperties.isDefaultTrack());
//                    builder.setRelationGroupSize(easyQueryProperties.getRelationGroupSize());
//                    builder.setNoVersionError(easyQueryProperties.isNoVersionError());
//                    builder.setReverseOffsetThreshold(easyQueryProperties.getReverseOffsetThreshold());
                })
                .useDatabaseConfigure(new XXXDatabaseConfiguration())
                .build();

        return easyQueryClient;
    }
    
    @Bean("xxeq")
    public EasyEntityQuery easyEntityQuery(@Qualifier("xxclient")EasyQueryClient easyQueryClient){
        return new DefaultEasyEntityQuery(easyQueryClient);
    }
}
```

### 添加配置文件
```yml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy-sharding-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root


# 不引入starter则配置是不需要的
#easy-query:
  #enable: false
```

### 添加控制器
```java

@RestController
@RequestMapping("/my")
public class MyController {
    @Autowired
    private EasyEntityQuery easyEntityQuery;
    @GetMapping("/test")
    public Object test() {
        return "hello world";
    }
}
```