---
title: Spring Boot Related
order: 3
---

# Pre-use Preparation
- jdk8+
- maven or gradle
- java or kotlin

If you are using kotlin, it is recommended to use gradle and ksp (`com.easy-query.sql-ksp-processor`)

[Demo](https://github.com/xuejmnet/easy-query-samples) for this chapter


::: warning Notes and Instructions!!!
> Note that if a self-built datasource `DataSource` is not a `Bean` managed by spring, the transaction will not take effect
:::


## Dependencies
We currently use springboot 3.1.0 with jdk17. Of course, please choose the appropriate version according to your actual situation. eq's `com.easy-query.sql-springboot-starter` dependency supports both `springboot2 and springboot3`

::: tip SpringBoot4!!!
> If you are using `springboot4`, then please use`com.easy-query.sql-springboot4-starter`，The related project demo is available at[项目demosb4](https://github.com/xuejmnet/demosb4)
:::

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
        <!-- Import the required database driver -->
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

## Configuration File
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
  #Supported database
  database: mysql
  #Converter between object properties and database column names
  name-conversion: underlined
  default-track: true

```

## Database Object Writing



::: tabs

@tab Company
```java
@Data
@Table("t_company")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * Company id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * Company name
     */
    private String name;

    /**
     * Company creation time
     */
    private LocalDateTime createTime;

    /**
     * Registered capital
     */
    private BigDecimal registerMoney;

    /**
     * Users owned by the company
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
     * User id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * User name
     */
    private String name;
    /**
     * User birthday
     */
    private LocalDateTime birthday;

    /**
     * User's company id
     */
    private String companyId;

    /**
     * User's company
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}

```

:::

## Startup Configuration
Automatically generate database and required tables
```java

@Configuration
public class AppConfiguration {

    public AppConfiguration(EasyEntityQuery easyEntityQuery){

        DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
        //Create database if it doesn't exist
        databaseCodeFirst.createDatabaseIfNotExists();
        //Automatically synchronize database tables
        CodeFirstCommand command = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //Execute command
        command.executeWithTransaction(arg -> {
            System.out.println(arg.sql);
            arg.commit();
        });

    }
}

```
## Add Controller
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
Access via browser
```log
==> Preparing: SELECT `id`,`name`,`create_time`,`register_money` FROM `t_company` WHERE `name` LIKE ?
==> Parameters: %123%(String)
<== Time Elapsed: 5(ms)
<== Total: 0
```


## Get Instance

In the SpringBoot environment, after starting the Spring container, `eq` has already instantiated the object. You can directly inject it as follows:

```java
@Autowired
private EasyEntityQuery easyEntityQuery;
```

## No-Dependency Configuration
Some users like to have very strong control. Here's how to implement starter without dependencies, importing `easy-query` without dependencies


### Add Configuration

First, if we need to support springboot transactions, we need to copy three source files from `easy-query`'s `springboot-starter`


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
        //No transaction currently opened, but easy query manually opened one
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

### Inject Bean


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
    @Bean("xxclient")//Use by injecting the specified name
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

### Add Configuration File
```yml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy-sharding-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root


# Configuration is not needed if starter is not imported
#easy-query:
  #enable: false
```

### Add Controller
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
