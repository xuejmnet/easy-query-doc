---
title: Quick Start
order: 10
category:
  - Startup
---
## Preface
Before using `eq`, you need to have the following:
- Basic Java development environment (IDEA preferred🔥 or vscode, this article mainly targets IDEA users)
- Familiarity with tools like Maven or Gradle
- Familiarity with [Spring Boot](https://github.com/spring-projects/spring-boot) or [Solon](https://gitee.com/opensolon/solon) framework

`eq` has two core API clients: `EasyEntityQuery (strongly typed)` and `EasyQueryClient (dynamic type)`, which provide common CRUD methods.


The current latest version of `eq` is as follows:
<a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
    <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
</a>

If you cannot see the latest version of `eq`, you can check the latest version in the tags on [github](https://github.com/dromara/easy-query) or [gitee](https://gitee.com/dromara/easy-query)


## Add Dependencies
The current document only shows the simplest console demo. For specific frameworks, please refer to the following links

- Simple console [console demo](https://github.com/xuejmnet/easy-query-samples)
- [kotlin users](/easy-query-doc/en/guide/kotlin)
- [springboot users](/easy-query-doc/en/guide/spring-boot)
- [solon users](/easy-query-doc/en/guide/solon)

### 1. Simple Environment

This chapter will use the mysql database as an example. You need to introduce the following dependencies: The following is the complete `pom.xml` of the project
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.easy-query</groupId>
    <artifactId>eq-console</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <!-- Please always use the latest version -->
        <easy-query.version>3.1.27</easy-query.version>
        <hikari.version>3.3.1</hikari.version>
        <mysql.version>9.2.0</mysql.version>
        <lombok.version>1.18.40</lombok.version>
    </properties>
    <dependencies>

        <!-- Import eq core dependency -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- Import eq database dialect support dependency as needed -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- Import eq APT support dependency -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- Import data source -->
        <!-- https://mvnrepository.com/artifact/com.zaxxer/HikariCP -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>${hikari.version}</version>
        </dependency>
        <!-- Import required database driver -->
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
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

</project>
```

### 2. Install Plugin (Optional)
Although optional, it is still recommended that users install it, as it can save you a lot of time. Strongly recommend users to install the plugin
> Search for `EasyQueryAssistant` in the IDEA plugin market and install the plugin
> If you are using the community version of IDEA, you can contact the group owner in the QQ group, where there is a dedicated plugin for the community version (because the market plugin has a jar package that IDEA restricts to the Ultimate version only, so the community version needs a separately compiled plugin)

### 3. Entity Object Preparation

Create a company table and a personnel table for simple CRUD



::: tabs

@tab Company Table


```java
@Data
@Table("t_company")
@EntityProxy
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
}

```

@tab User Table

```java
@Data
@Table("t_user")
@EntityProxy
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
}

```

:::


::: tip Note!!!
> Among them, the `ProxyEntityAvailable<Company , CompanyProxy>` and `ProxyEntityAvailable<SysUser , SysUserProxy>` interfaces are quickly generated by the plugin. See the operation below for details
:::

If you want the entity to be relatively clean and don't want to add the `ProxyEntityAvailable` interface, that's also possible. See [GITHUB ISSUE](https://github.com/dromara/easy-query/issues/391) or jump to the [Entity No-Interface Mode chapter](/easy-query-doc/en/context-mode)


### 4. Generate Proxy Classes

Now the proxy class `SysUserProxy` associated with the entity class `SysUser` does not exist. IDEA cannot recognize the proxy class and cannot compile, but we can still trigger `eq`'s APT tool to generate proxy classes by building the project. `eq`'s APT will create corresponding proxy classes for all entity classes that use `@EntityProxy`. The proxy classes provide friendly prompts and type judgments for table aliases, column names, column types, etc. These proxy classes can help us better set conditional queries and assign values.

During actual development, you can use the plugin assistant to quickly generate interfaces. Please refer to the [Quick Generate Interface](/easy-query-doc/en/plugin/easy-query-implement) chapter.

After building the project, the proxy class will be generated in the specified directory. As follows:

<img  :src="$withBase('/images/startup5.png')">



::: warning Note!!!
> If EasyQueryImplement has no effect, please check if the class has added `@EntityProxy`
:::

<img  :src="$withBase('/images/startup3.png')">



::: warning Note!!!
<!-- > For versions 2.0.15+, the framework does not need to implement the `proxyTableClass` method, and the idea-plugin will not generate this method after version 0.0.57 -->
> If your project is multi-module, you only need to use `sql-processor` in the modules that need to use the @EntityProxy annotation
:::


<!-- <img src="/startup1.png"> -->


After building the project, if IDEA still cannot recognize the proxy class, you can mark the directory as a generated directory.

<img  :src="$withBase('/images/startup2.png')">

::: warning Note!!!
> If it still doesn't work, it is recommended that you click the maven refresh button on the right side of IDEA to refresh
:::

<img  :src="$withBase('/images/startup4.png')">

<!-- After building the project and generating the proxy class, you need to import the corresponding proxy class `UserProxy` in `User` -->



::: danger Note!!!
If no proxy class is generated, that is, a prompt that the `Proxy` class does not exist


- Check if there are javacTree-like errors that may be caused by a low lombok version, just upgrade
- Check if the sql-processor package is imported (if there is no `annotationProcessorPaths` below, it is recommended to import independently for each module that needs to generate proxy (in multi-module))
- If you are using `gradle`, the import should change `implement to annotationprocessor`, i.e., `annotationProcessor "com.easy-query:sql-processor:${easyQueryVersion}"`
- Set IDEA's annotation processor: Build,Execution,Deployment,Compiler,Annotation Processors, select Enable annotation processing and select Obtain processors from project classpath

- If you already have `annotationProcessorPaths`, you can add `eq`'s `apt` processing to it. If you haven't used it before, it is still recommended to import `sql-processor` separately for modules that need apt
With the following configuration, you don't need to import `sql-processor` separately in each independent `module`
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
        <!-- Note the order -->
            <path>
            <!-- lombok... -->
            </path>
            <path>
            <!-- mapstruct... -->
            </path>
            <path>
                <groupId>com.easy-query</groupId>
                <artifactId>sql-processor</artifactId>
                <version>${easy-query.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```
:::

<!-- <img src="/startup6.png"> -->


### Instantiate Query Object

#### Simple Environment

For convenience and intuitive viewing of use cases, use a console project to write. You don't need any knowledge of other frameworks, only partial knowledge of dependencies. First initialize the `EasyEntityQuery` object as follows:

```java
package com.easy.query.console;

import com.easy.query.api.proxy.client.DefaultEasyEntityQuery;
import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.easy.query.console.entity.Company;
import com.easy.query.console.entity.SysUser;
import com.easy.query.core.api.client.EasyQueryClient;
import com.easy.query.core.basic.api.database.CodeFirstCommand;
import com.easy.query.core.basic.api.database.DatabaseCodeFirst;
import com.easy.query.core.bootstrapper.EasyQueryBootstrapper;
import com.easy.query.core.logging.LogFactory;
import com.easy.query.mysql.config.MySQLDatabaseConfiguration;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.util.Arrays;

public class Main {
    private static EasyEntityQuery entityQuery;
    public static void main(String[] args) {
        LogFactory.useStdOutLogging();
        DataSource dataSource = getDataSource();
        EasyQueryClient client = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    //Perform a series of optional configurations
                    //op.setPrintSql(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        entityQuery = new DefaultEasyEntityQuery(client);

        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //Create database if it doesn't exist
        databaseCodeFirst.createDatabaseIfNotExists();
        //Automatically synchronize database tables
        CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //Execute command
        codeFirstCommand.executeWithTransaction(arg->{
            System.out.println(arg.sql);
            arg.commit();
        });
    }

    /**
     * Initialize data source
     * @return
     */
    private static DataSource getDataSource(){
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/eq_db?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setMaximumPoolSize(20);

        return dataSource;
    }
}
```

#### Simple Queries


Output SQL in the console. You can use the plugin assistant to format SQL. Please refer to the [Format SQL](../guide/config/plugin.md#Format-SQL) chapter.

## Single Table Queries


Now let's start with actual usage. If you have questions, you can refer to [Common Issues](/easy-query-doc/en/question) or join the EasyQuery official QQ group: 170029046 to ask questions

::: warning Note!!!
> When querying, generally use the table alias as the parameter name. We can use the plugin assistant for quick prompts. Please refer to the [Parameter Variable Name Prompt](../guide/config/plugin.md#Parameter-Name-Prompt) chapter.
> `eq` is the `=` operator. Calling the `eq` method may not be intuitive enough to write the method. We can use the plugin assistant for quick prompts. Please refer to the [Relational Operator Prompt](../guide/config/plugin.md#Relational-Operator-Prompt) chapter.
> If errors like no primary key or not found [id] mapping column name occur, please check if lombok is effective and if get/set methods exist
:::

### Single Query
```java
//Return the first one and not null, automatically add limit 1
Company company = entityQuery.queryable(Company.class).firstNotNull("Not found");
//Return the first one, return null if not found, automatically add limit 1
Company company = entityQuery.queryable(Company.class).firstOrNull();


//Return at most one and not null, throw error if null, throw EasyQuerySingleMoreElementException if there are multiple records
Company company = entityQuery.queryable(Company.class).where(c->c.id().eq("1")).singleNotNull("Not found");
//Return at most one, return null if not found, throw EasyQuerySingleMoreElementException if there are multiple records
Company company = entityQuery.queryable(Company.class).where(c->c.id().eq("1")).singleOrNull();
```

### Query All

By default, eq queries all fields in the entity class that match the table. You can also specify the fields to query when querying, and supports skipping and limiting the number of returned rows

```java

//Query all
List<Company> companies = entityQuery.queryable(Company.class).toList();

//Only query some columns
List<Company> companies = entityQuery.queryable(Company.class).select(c -> c.FETCHER.name().createTime()).toList();

//Query companies where id is 1
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
        }).toList();

//Multiple conditions combined with AND
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).toList();


//Multiple conditions combined with OR, see OR chapter for details
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.or(()->{
                c.id().eq("1");
                c.name().like("公司");
            });
        }).toList();


//Limit number of returned rows
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).limit(10).toList();


//Skip 10 rows and return 20 rows
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).limit(10,20).toList();
```

### Filtering


::: tip Note!!!
> Go to the dynamic filtering chapter for dynamic filtering
:::

```java

List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
            //AND name LIKE '张%'
            c.name().likeMatchLeft(firstName);
            //AND name LIKE '%三'
            c.name().likeMatchRight(lastName);
            //AND '2020-01-01' <= create_time AND create_time <= '2050-01-01'
            c.createTime().rangeClosed(startTime, endTime);
            //AND company_id IS NOT NULL
            c.name().isNotNull();

            c.name().isNotBank();
        }).toList();
```


### Sorting

::: tip Note!!!
> Go to the dynamic sorting chapter for dynamic sorting
:::

```java
//First sort by creation time in ascending order, then by name in descending order
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).orderBy(c->{
            c.createTime().asc()
            c.name().desc()

            //NULL at the end
            c.createTime().asc(OrderByModeEnum.NULLS_LAST);
            //NULL at the beginning
            c.createTime().desc(OrderByModeEnum.NULLS_FIRST);
        }).toList();
```

### Pagination

::: tip Note!!!
> See the pagination chapter for more pagination features
:::

```java

//Query pagination
EasyPageResult<Company> Company = entityQuery.queryable(Company.class).where(c -> {
    c.id().eq("1");
    c.name().like("公司");
}).toPageResult(1, 20);
```

Query a single record based on conditions:

```java
	@Test
    public void testOne() {
        //Query the first one
        User firstUser = easyEntityQuery.queryable(User.class).firstOrNull();
        Assertions.assertNotNull(firstUser);

        Assertions.assertThrows(EasyQuerySingleMoreElementException.class, () -> {
            //Query only one, throw exception if there are multiple
            easyEntityQuery.queryable(User.class).singleOrNull();
        });

        Assertions.assertTrue(exists);
    }
```

### Aggregate Queries

```java

//Check if exists
boolean exists = easyEntityQuery.queryable(Company.class).where(u -> u.name().eq("张三")).any();
//Return how many records
long count = easyEntityQuery.queryable(Company.class).count();
//Return how many records
int intCount = easyEntityQuery.queryable(Company.class).intCount();

//Sum result return

BigDecimal value = easyEntityQuery.queryable(Company.class).sumOrNull(o -> o.registerMoney());
BigDecimal value = easyEntityQuery.queryable(Company.class).sumOrDefault(o -> o.registerMoney(), BigDecimal.ZERO);
BigDecimal value = easyEntityQuery.queryable(Company.class).sumBigDecimalOrNull(o -> o.registerMoney());
BigDecimal value = easyEntityQuery.queryable(SysUser.class).sumBigDecimalOrDefault(o -> o.registerMoney(), BigDecimal.ZERO);
BigDecimal value = easyEntityQuery.queryable(SysUser.class).sumOrDefault(o -> o.balance(), BigDecimal.ZERO);
//max, min, avg and other functions work the same way
```

### Group Queries

Declare the group result.

```java
@Data
public class UserGroup {
    Integer companyId;

    Integer count;
}
```

Easy Query's grouping supports type inference. The `groupBy` method can pass in grouping fields, and in the `select` method, the type of the grouping field can be inferred.
If one grouping field is passed in, then during aggregation you can get the grouping field, i.e., `key1`. If multiple are passed in, it also works the same way

```java
    @Test
    public void testGroup() {
        //Query the number of users per company, using Draft-related types as the query result type
        List<Draft2<Integer, Long>> drafts = easyEntityQuery.queryable(SysUser.class)
                //Create group by. Before 2.3.4, use GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.count().eq(1L))
                .select(group -> Select.DRAFT.of(
                        //key1 here is the grouped companyId
                        group.key1(),
                        group.count()
                        //group.groupTable().stars().sum();//Sum for single field, the following way also works
                        //group.sum(group.groupTable().stars());
                )).toList();
        for (Draft2<Integer, Long> draft : drafts) {
            Long count = draft.getValue2();
            Assertions.assertEquals(count, 1L);
        }

        //Query the number of users per company, using a custom query result type
        List<UserGroup> userGroups = easyEntityQuery.queryable(SysUser.class)
                //Create group by. Before 2.3.4, use GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.groupTable().createTime().max().le(LocalDateTime.now()))
                .select(UserGroup.class, group -> Select.of(
                        group.groupTable().companyId().as(UserGroup::getCompanyId),
                        group.count().as(UserGroup::getCount)
                        //group.groupTable().stars().sum();//Sum for single field, the following way also works
                        //group.sum(group.groupTable().stars());
                )).toList();
        for (UserGroup userGroup : userGroups) {
            Integer count = userGroup.getCount();
            Assertions.assertEquals(count, 1);
        }
    }
```

If our UserGroup object is added to generate a proxy object, then we can customize the set
```java
@Data
@EntityProxy
public class UserGroup {
    Integer companyId;

    Integer count;
}
```


```java
//Query the number of users per company, using a custom query result type
List<UserGroup> userGroups = easyEntityQuery.queryable(SysUser.class)
        //Create group by. Before 2.3.4, use GroupKeys.TABLE1_10.of
        .groupBy(u -> GroupKeys.of(u.companyId()))
        .having(group -> group.groupTable().createTime().max().le(LocalDateTime.now()))
        .select(group -> new UserGroupProxy()
                .companyId().set(group.key1())//Assign the groupBy key to companyId. You can also use group.groupTable().companyId()
                .count().set(group.count())
        ).toList();
for (UserGroup userGroup : userGroups) {
    Integer count = userGroup.getCount();
    Assertions.assertEquals(count, 1);
}
```

## Implicit Join Multi-Table
Implicit join multi-table can make the user's development experience very convenient. We believe that if table a and table b can be joined, there must be a certain association relationship. See below for details on how to implement this
```java

public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    //Omit other fields

    /**
     * User's company id
     */
    @Column(comment = "User's company id")
    private String companyId;

    /**
     * User's company, set the association relationship between the current user's companyId and the company table's id
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}
```
Query users with the filter condition that the company name is xxx
```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            s.company().name().contains("xx有限公司");
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user` t LEFT JOIN `t_company` t1 ON t1.`id` = t.`company_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: xx有限公司(String)
```
We can see that the join operation was generated very conveniently. If you need inner join, add `required=true` at @Navigate to tell the framework that the user table will definitely have a company table
```java

    /**
     * User's company
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id},required = true)
    private Company company;
```
Execute again

```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            s.company().name().contains("xx有限公司");
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user` t INNER JOIN `t_company` t1 ON t1.`id` = t.`company_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: xx有限公司(String)
```
## Implicit Dynamic Join
When the condition of the navigation property path does not take effect, the join will not be added to the expression
```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            if(false){
                s.company().name().contains("xx有限公司");
            }
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user`
```

## Explicit Join Multi-Table

::: warning Note!!!
> After `join`, the original `where, orderBy, select`, etc. will all change. The most straightforward change is that the number of input parameters changes from one to n, where n is the number of main tables + the number of joined tables
:::
### Simple Join and Filtering
```java
//After join, if select is not specified, the main table is returned, equivalent to a join b and then select a.*
List<Company> list = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).toList();
```

### Simple Tuple Result Set
Draft types return `draft1-10` simple tuple object values stored in `value1-10`, generally used for intermediate results within methods as simple temporary storage, which can effectively reduce the creation of `class`
```java

List<Draft2<String, String>> list = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).select((c, u) -> Select.DRAFT.of(
                c.name(),
                u.name()
        )).toList();
for (Draft2<String, String> draft2 : list) {
    String companyName = draft2.getValue1();
    String userName = draft2.getValue2();
}
```

### Custom Return Results
```java
@Data
@FieldNameConstants//This annotation can make properties constant for use
public class CompanyNameAndUserNameVO {
    /**
     * Company name
     */
    private String companyName;
    /**
     * User name
     */
    private String userName;
    /**
     * User birthday
     */
    private LocalDateTime birthday;

    /**
     * User's company id
     */
    private String companyId;
}
```

#### Weak Constraint Assignment
So-called weak constraint assignment is a convention assignment: i.e., `entity.fieldName == vo.fieldName` then directly map

If we have a return result that receives company name and user name, how should we map it?
```java
List<CompanyNameAndUserNameVO> xm = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).select(CompanyNameAndUserNameVO.class, (c1, s2) -> Select.of(
                s2.FETCHER.allFields(),//Weak constraint mapping, match all fields under user with vo first
                s2.name().as(CompanyNameAndUserNameVO.Fields.userName),//Strong constraint mapping
                c1.name().as(CompanyNameAndUserNameVO.Fields.companyName)
        )).toList();


==> Preparing: SELECT t1.`birthday`,t1.`company_id`,t1.`name` AS `user_name`,t.`name` AS `company_name` FROM `t_company` t LEFT JOIN `t_user` t1 ON t.`id` = t1.`company_id` WHERE t.`id` = ? AND t1.`name` LIKE ?
==> Parameters: 1(String),%小明%(String)
```

#### Strong Constraint Assignment
First, we modify the vo to add the `@EntityProxy` annotation
```java
@Data
@EntityProxy
@FieldNameConstants//This annotation can make properties constant for use
public class CompanyNameAndUserNameVO {
    /**
     * Company name
     */
    private String companyName;
    /**
     * User name
     */
    private String userName;
    /**
     * User birthday
     */
    private LocalDateTime birthday;

    /**
     * User's company id
     */
    private String companyId;
}




List<CompanyNameAndUserNameVO> xm = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).select((c1, s2) -> new CompanyNameAndUserNameVOProxy()//Generate all fields manually set values by the plugin
                .companyName().set(c1.name()) // Company name
                .userName().set(s2.name()) // User name
                .birthday().set(s2.birthday()) // User birthday
                .companyId().set(s2.companyId()) // User's company id
        ).toList();


==> Preparing: SELECT t.`name` AS `company_name`,t1.`name` AS `user_name`,t1.`birthday` AS `birthday`,t1.`company_id` AS `company_id` FROM `t_company` t LEFT JOIN `t_user` t1 ON t.`id` = t1.`company_id` WHERE t.`id` = ? AND t1.`name` LIKE ?
==> Parameters: 1(String),%小明%(String)
```
