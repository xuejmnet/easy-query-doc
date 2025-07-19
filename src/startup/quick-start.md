---
title: 快速体验
order: 2
category:
  - Startup
---
## 前言
在此使用`eq`之前，需要具备以下条件：
- 拥有基本的Java开发环境(idea优先🔥 也可以是vscode本文主要针对idea用户)
- 熟悉Maven或Gradle等工具工具
- 熟悉[Spring Boot](https://github.com/spring-projects/spring-boot) 或 [Solon](https://gitee.com/opensolon/solon) 框架

`eq`核心api客户端有两个为`EasyEntityQuery(强类型)`和`EasyQueryClient(动态类型)`它提供了常用的增删改查方法，


目前`eq`的最新版本如下：
<a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
    <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
</a>

如果法看到`eq`的最新版本版本，可以在[github](https://github.com/dromara/easy-query)或者[gitee](https://gitee.com/dromara/easy-query)的标签处查看最新版本

## 环境准备

如果想要快速搭建环境，请克隆以下项目
- 简单的控制台[demo](https://github.com/xuejmnet/easy-query-samples)
- 热心网友提供demo [github](https://github.com/Hoysing/easy-query-sample)或者[gitee](https://gitee.com/Hoysing/easy-query-sample)的案例项目

## 引入依赖

### 1.简单环境

本章节将以mysql数据库为例，需要引入以下依赖：如下是项目的完整的`pom.xml`
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
        <!-- 请永远使用最新版 -->
        <easy-query.version>3.0.57</easy-query.version>
        <hikari.version>3.3.1</hikari.version>
        <mysql.version>9.2.0</mysql.version>
        <lombok.version>1.18.36</lombok.version>
    </properties>
    <dependencies>

        <!-- 引入eq核心依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 按需引入eq的数据库方言支持依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入支持eq的APT依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入数据源 -->
        <!-- https://mvnrepository.com/artifact/com.zaxxer/HikariCP -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>${hikari.version}</version>
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
            <version>${lombok.version}</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

</project>
```

### 2.安装插件(可选)
虽然是可选但是还是建议用户安装,可以让您节约非常多的时间,墙裂推荐用户安装插件
> 在idea插件市场搜索`EasyQueryAssistant`并安装插件
> 如果您是idea的社区版那么可以进入qq群联系群主里面有社区版专属插件(因为市场的插件有一个jar包是idea限制了仅旗舰版可用所以社区版需要单独编译的插件)

### 3.实体对象准备

创建一个企业表和人员表来进行简单的crud



::: tabs

@tab 企业表


```java
@Data
@Table("t_company")
@EntityProxy
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
}

```

@tab 用户表

```java
@Data
@Table("t_user")
@EntityProxy
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
}

```

:::


::: tip 说明!!!
> 其中`ProxyEntityAvailable<Company , CompanyProxy> `和`ProxyEntityAvailable<SysUser , SysUserProxy>`接口由插件快速生成具体请看下方操作
:::


### 4.生成代理类

现在实体类`SysUser`关联的代理类`SysUserProxy`是不存在的，Idea是无法识别代理类，也无法进行编译，但是我们依然可以通过构建项目来触发`eq`的APT工具来生成代理类。`eq`的APT会为所有使用了`@EntityProxy`的实体类创建对应的代理类，代理类用于提供此对表别名，列名，列类型等等都提供了友好提示和类型判断，这些代理类可以帮助辅助我们更好设置条件查询和设值。

真正开发时可以使用插件助手快速生成接口，请参考[快速生成接口](/easy-query-doc/plugin/easy-query-implement)章节。

构建完项目后，代理类将会生成在指定的目录中。如下：

<img  :src="$withBase('/images/startup5.png')">



::: warning 说明!!!
> 如果EasyQueryImplement没有效果请检查类是否添加了`@EntityProxy`
:::

<img  :src="$withBase('/images/startup3.png')">



::: warning 说明!!!
<!-- > 2.0.15+版本框架不需要实现`proxyTableClass`方法，idea-plugin插件在0.0.57后也将不会生成该方法 -->
> 如果您的项目是多模块那么只需要在需要使用@EntityProxy注解的模块下使用`sql-processor`即可
:::


<!-- <img src="/startup1.png"> -->


构建项目后，如果Idea依然是无法识别代理类的，那么可以将目录标记为生成目录。

<img  :src="$withBase('/images/startup2.png')">

::: warning 说明!!!
> 如果您还是不行那么建议您点击idea右侧的maven刷新按钮进行刷新即可
:::

<img  :src="$withBase('/images/startup4.png')">

<!-- 构建项目，生成完代理类后，需要在`User`中引入对应的代理类`UserProxy` -->



::: danger 说明!!!
如果没有生成代理类，即提示`Proxy`类不存在


- 检查是否存在javacTree之类的错误可能是由于lombok版本过低升级即可
- 查看是否引入sql-processor包（如果没有如下`annotationProcessorPaths`那么建议各自需要生成proxy的模块独立引入(多模块下)）
- 如果您是`gralde`那么引入应该是`implement改为annotationprocesser`即`annotationProcessor "com.easy-query:sql-processor:${easyQueryVersion}"`
- 设置idea的注解处理器 Build,Execution,Deployment,Compiler,Annotation Processors 选择Enable annotation processing 并且选择Obtain processors from project classpath

- 如果您之前已经存在`annotationProcessorPaths`那么你可以在里面添加`eq`的`apt`处理，如果未使用过那么还是建议需要apt的模块单独引入`sql-processor`
以下配置那么在各个独立`module`处不需要在引入`sql-processor`
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
        <!-- 注意顺序 -->
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


### 实例化查询对象

#### 简单环境

为了方便直观查看使用案例，使用控制台项目进行编写您无需其余框架的任何知识仅依赖项的部分知识即可，首先初始化`EasyEntityQuery`对象，如下：

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
                    //进行一系列可以选择的配置
                    //op.setPrintSql(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        entityQuery = new DefaultEasyEntityQuery(client);

        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //如果不存在数据库则创建
        databaseCodeFirst.createDatabaseIfNotExists();
        //自动同步数据库表
        CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //执行命令
        codeFirstCommand.executeWithTransaction(arg->{
            System.out.println(arg.sql);
            arg.commit();
        });
    }

    /**
     * 初始化数据源
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

#### 简单的查询


在控制台输出输出的SQL可以使用插件助手格式化SQL，请参考[格式化SQL](../guide/config/plugin.md#格式化SQL)章节。

## 单表查询


下面开始真正的使用，如果有问题可以参考[常见问题](/easy-query-doc/question)或者加入EasyQuery官方QQ群:170029046 进行提问

::: warning 说明!!!
> 查询时一般使用使用表别名作为参数名，我们可以使用插件助手快速提示，请参考[参数变量名提示](../guide/config/plugin.md#参数名提示)章节。
> `eq`是`=`运算符，调用`eq`方法可能不够直观地编写方法，我们可以使用插件助手快速提示，请参考[关系运算符提示](../guide/config/plugin.md#关系运算符提示)章节。
> 如果出现no primary key或者not found [id] mapping column name之类的错误请排查lombok是否生效,是否存在get set方法
:::

### 单个查询
```java
//返回第一条且不为null自动添加limit 1
Company company = entityQuery.queryable(Company.class).firstNotNull("找不到");
//返回第一条查询不到则返回null自动添加limit 1
Company company = entityQuery.queryable(Company.class).firstOrNull();


//返回至多一条且不为null 如果null则报错 如果结果有多条记录，则抛出EasyQuerySingleMoreElementException
Company company = entityQuery.queryable(Company.class).where(c->c.id().eq("1")).singleNotNull("找不到");
//返回至多一条,查询不到则返回null 如果结果有多条记录，则抛出EasyQuerySingleMoreElementException
Company company = entityQuery.queryable(Company.class).where(c->c.id().eq("1")).singleOrNull();
```

### 查询全部

默认情况下，eq查询实体类中匹配表的所有字段，查询时也可以指定需要查询的字段。并且支持跳过条数和限制返回条数

```java

//查询全部
List<Company> companies = entityQuery.queryable(Company.class).toList();

//仅查询部分列
List<Company> companies = entityQuery.queryable(Company.class).select(c -> c.FETCHER.name().createTime()).toList();

//查询企业筛选id是1的
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
        }).toList();

//多个条件and组合
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).toList();


//多个条件or组合 具体请看or章节
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.or(()->{
                c.id().eq("1");
                c.name().like("公司");
            });
        }).toList();


//限制返回条数
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).limit(10).toList();


//跳过10条然后返回20条数
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).limit(10,20).toList();
```

### 筛选


::: tip 说明!!!
> 动态筛选去动态筛选章节
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


### 排序

::: tip 说明!!!
> 动态排序去动态排序章节
:::

```java
//先按创建时间正序后按姓名倒序
List<Company> companies = entityQuery.queryable(Company.class)
        .where(c -> {
            c.id().eq("1");
            c.name().like("公司");
        }).orderBy(c->{
            c.createTime().asc()
            c.name().desc()

            //NULL排后面
            c.createTime().asc(OrderByModeEnum.NULLS_LAST);
            //NULL排前面
            c.createTime().desc(OrderByModeEnum.NULLS_FIRST);
        }).toList();
```

### 分页

::: tip 说明!!!
> 更多分页功能请详见分页章节
:::

```java

//查询分页
EasyPageResult<Company> Company = entityQuery.queryable(Company.class).where(c -> {
    c.id().eq("1");
    c.name().like("公司");
}).toPageResult(1, 20);
```

查询单条记录，根据条件查询：

```java
	@Test
    public void testOne() {
        //查询第一条
        User firstUser = easyEntityQuery.queryable(User.class).firstOrNull();
        Assertions.assertNotNull(firstUser);

        Assertions.assertThrows(EasyQuerySingleMoreElementException.class, () -> {
            //只查询一条，如果有多条则抛出异常
            easyEntityQuery.queryable(User.class).singleOrNull();
        });

        Assertions.assertTrue(exists);
    }
```

### 聚合查询

```java

//判断是否存在
boolean exists = easyEntityQuery.queryable(Company.class).where(u -> u.name().eq("张三")).any();
//返回有多少条
long count = easyEntityQuery.queryable(Company.class).count();
//返回有多少条
int intCount = easyEntityQuery.queryable(Company.class).intCount();

//sum求和结果返回

BigDecimal value = easyEntityQuery.queryable(Company.class).sumOrNull(o -> o.registerMoney());
BigDecimal value = easyEntityQuery.queryable(Company.class).sumOrDefault(o -> o.registerMoney(), BigDecimal.ZERO);
BigDecimal value = easyEntityQuery.queryable(Company.class).sumBigDecimalOrNull(o -> o.registerMoney());
BigDecimal value = easyEntityQuery.queryable(SysUser.class).sumBigDecimalOrDefault(o -> o.registerMoney(), BigDecimal.ZERO);
BigDecimal value = easyEntityQuery.queryable(SysUser.class).sumOrDefault(o -> o.balance(), BigDecimal.ZERO);
//max min avg 等函数同理
```

### 分组查询

声明分组结果。

```java
@Data
public class UserGroup {
    Integer companyId;

    Integer count;
}
```

Easy Query的分组支持类型推断，`groupBy`方法可以传入分组的字段，在`select`方法中可以推断出到分组字段的类型。
如果传入一个分组字段，那么聚合时可以获取分组字段，即`key1`，如果传入多个也是以此类推

```java
    @Test
    public void testGroup() {
        //查询每个公司的用户数，使用Draft相关类型作为查询结果类型
        List<Draft2<Integer, Long>> drafts = easyEntityQuery.queryable(SysUser.class)
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.count().eq(1L))
                .select(group -> Select.DRAFT.of(
                        //此处的key1就是分组的companyId
                        group.key1(),
                        group.count()
                        //group.groupTable().stars().sum();//对单字段求和下面方式也行
                        //group.sum(group.groupTable().stars());
                )).toList();
        for (Draft2<Integer, Long> draft : drafts) {
            Long count = draft.getValue2();
            Assertions.assertEquals(count, 1L);
        }

        //查询每个公司的用户数，用自定义的查询结果类型
        List<UserGroup> userGroups = easyEntityQuery.queryable(SysUser.class)
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.groupTable().createTime().max().le(LocalDateTime.now()))
                .select(UserGroup.class, group -> Select.of(
                        group.groupTable().companyId().as(UserGroup::getCompanyId),
                        group.count().as(UserGroup::getCount)
                        //group.groupTable().stars().sum();//对单字段求和下面方式也行
                        //group.sum(group.groupTable().stars());
                )).toList();
        for (UserGroup userGroup : userGroups) {
            Integer count = userGroup.getCount();
            Assertions.assertEquals(count, 1);
        }
    }
```

如果我们的UserGroup对象添加生成代理对象那么可以自定义进行set
```java
@Data
@EntityProxy
public class UserGroup {
    Integer companyId;

    Integer count;
}
```


```java
//查询每个公司的用户数，用自定义的查询结果类型
List<UserGroup> userGroups = easyEntityQuery.queryable(SysUser.class)
        //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
        .groupBy(u -> GroupKeys.of(u.companyId()))
        .having(group -> group.groupTable().createTime().max().le(LocalDateTime.now()))
        .select(group -> new UserGroupProxy()
                .companyId().set(group.key1())//将groupBy的key给companyId您也可以使用group.groupTable().companyId()
                .count().set(group.count())
        ).toList();
for (UserGroup userGroup : userGroups) {
    Integer count = userGroup.getCount();
    Assertions.assertEquals(count, 1);
}
```

## 隐式join多表
隐式join多表可以让用户的开发体验变得非常方便,我们认为a表和b表之所以能join那么肯定是有一定的关联关系,具体如何实现请看下下面
```java

public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    //省略其他字段

    /**
     * 用户所属企业id
     */
    @Column(comment = "用户所属企业id")
    private String companyId;

    /**
     * 用户所属企业，将当前用户的companyId和企业表的id进行关联关系设置
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}
```
查询用户筛选条件为企业名称为xxx的
```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            s.company().name().contains("xx有限公司");
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user` t LEFT JOIN `t_company` t1 ON t1.`id` = t.`company_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: xx有限公司(String)
```
我们看非常方便的生成了join操作如果你需要inner join那么在@Navigate处添加`required=true`告知框架用户表一定会有企业表
```java

    /**
     * 用户所属企业
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id},required = true)
    private Company company;
```
再次执行

```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            s.company().name().contains("xx有限公司");
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user` t INNER JOIN `t_company` t1 ON t1.`id` = t.`company_id` WHERE t1.`name` LIKE CONCAT('%',?,'%')
==> Parameters: xx有限公司(String)
```
## 隐式动态join
当我们导航属性路径的条件不生效的时候那么jion将不会添加到表达式内
```java
List<SysUser> users = entityQuery.queryable(SysUser.class)
        .where(s -> {
            if(false){
                s.company().name().contains("xx有限公司");
            }
        }).toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`birthday`,t.`company_id` FROM `t_user`
```

## 显式join多表

::: warning 说明!!!
> `join`后原本的`where、orderBy、select`等都会有所变化,最直白的变化就是入参个数由原先的一个变成n个n就是主表数量+join表数量
:::
### 简单join和筛选
```java
//当join后不指定select则返回主表相当于a join b 然后select a.*
List<Company> list = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).toList();
```

### 简单元组结果集
草稿类型返回`draft1-10`的简单元组对象值分别存储于`value1-10`一般用于方法内部的中间结果的简单临时存储,可以有效的减少`class`的创建
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

### 自定义返回结果
```java
@Data
@FieldNameConstants//该注解可以将属性进行常量化使用
public class CompanyNameAndUserNameVO {
    /**
     * 企业名称
     */
    private String companyName;
    /**
     * 用户姓名
     */
    private String userName;
    /**
     * 用户出生日期
     */
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    private String companyId;
}
```

#### 弱约束赋值
所谓的弱约束赋值是一种约定赋值：即`entity.filedName == vo.fieldName`则直接映射

加入我们有一个返回结果接受企业姓名和用户姓名那么应该如何映射呢
```java
List<CompanyNameAndUserNameVO> xm = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).select(CompanyNameAndUserNameVO.class, (c1, s2) -> Select.of(
                s2.FETCHER.allFields(),//弱约束映射将user下的全字段先和vo进行匹配
                s2.name().as(CompanyNameAndUserNameVO.Fields.userName),//强约束映射
                c1.name().as(CompanyNameAndUserNameVO.Fields.companyName)
        )).toList();


==> Preparing: SELECT t1.`birthday`,t1.`company_id`,t1.`name` AS `user_name`,t.`name` AS `company_name` FROM `t_company` t LEFT JOIN `t_user` t1 ON t.`id` = t1.`company_id` WHERE t.`id` = ? AND t1.`name` LIKE ?
==> Parameters: 1(String),%小明%(String)
```

#### 强约束赋值
首先我们对vo进行修改添加`@EntityProxy`注解
```java
@Data
@EntityProxy
@FieldNameConstants//该注解可以将属性进行常量化使用
public class CompanyNameAndUserNameVO {
    /**
     * 企业名称
     */
    private String companyName;
    /**
     * 用户姓名
     */
    private String userName;
    /**
     * 用户出生日期
     */
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    private String companyId;
}




List<CompanyNameAndUserNameVO> xm = entityQuery.queryable(Company.class)
        .leftJoin(SysUser.class, (c, u) -> c.id().eq(u.companyId()))
        .where((c, u) -> {
            c.id().eq("1");
            u.name().like("小明");
        }).select((c1, s2) -> new CompanyNameAndUserNameVOProxy()//由插件生成全字段手动set值
                .companyName().set(c1.name()) // 企业名称
                .userName().set(s2.name()) // 用户姓名
                .birthday().set(s2.birthday()) // 用户出生日期
                .companyId().set(s2.companyId()) // 用户所属企业id
        ).toList();


==> Preparing: SELECT t.`name` AS `company_name`,t1.`name` AS `user_name`,t1.`birthday` AS `birthday`,t1.`company_id` AS `company_id` FROM `t_company` t LEFT JOIN `t_user` t1 ON t.`id` = t1.`company_id` WHERE t.`id` = ? AND t1.`name` LIKE ?
==> Parameters: 1(String),%小明%(String)
```