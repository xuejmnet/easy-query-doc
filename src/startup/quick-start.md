---
title: 快速开始🔥🔥🔥
---

## 简介
在使用前，我们需要知晓目前1.8.0+版本的`easy-query`提供了多种API模式，比如`lambda`、`property`、`entity`，其中`entity`是最新开发的api,使用起来非常顺畅,非常推荐
本章节将使用`entity`模式进行讲解，在`entity`模式中，`EasyEntityQuery`是核心接口，它提供了常用的增删改查方法，

## 最新版本
Easy Query目前最新版本如下：
<a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
    <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
</a>

如果法看到Easy Query的最新版本版本，可以在[github](https://github.com/dromara/easy-query)或者[gitee](https://gitee.com/dromara/easy-query)的标签处查看最新版本

## 环境准备

本章节共同作者
- Hoysing [github](https://github.com/Hoysing) [gitee](https://gitee.com/Hoysing)


我们将通过一个案例来说明Easy Query的如何使用，在此使用Easy Query之前，需要具备以下条件：
- 拥有基本的Java开发环境
- 熟悉Maven或Gradle工具
- 熟悉Spring Boot框架

### 引入依赖

#### 简单环境

本章节将以mysql数据库为例，需要引入以下依赖：
```xml
        <!-- 引入Easy Query核心依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 按需引入Easy Query的数据库支持依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-oracle</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-pgsql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mssql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-h2</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-sqlite</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-clickhouse</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-dameng</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-kingbase-es</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入支持Easy Query的APT依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入数据源 -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>${hikari.version}</version>
        </dependency>
        <!-- 引入需要的数据库驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
           <version>${mysql.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
        </dependency>
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
           <version>${hutool.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>${junit5.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>${junit5.version}</version>
        </dependency>
```
Easy Query的APT会为所有使用了`@EntityProxy`的实体类创建对应的代理类，代理类用于提供此对表别名，列名，列类型等等都提供了友好提示和类型判断，有问题可以参考[常见问题](/easy-query-doc/question)。

#### SpringBoot环境
Easy Query提供了`sql-springboot-starter`依赖以便快速整合到Spring Boot环境中，它包含了`sql-api-proxy`和各个数据库支持的依赖。
`sql-processor`是需要额外引入的，因为在Spring Boot多模块项目中使用Easy Query时，必须在每个需要生成`proxy`的`module`处的`pom.xm`引入`sql-processor`依赖或者在项目`maven`插件处进行配置，因为Easy Query的APT会为所有使用了`@EntityProxy`的实体类创建对应的代理类，代理类用于提供此对表别名，列名，列类型等等都提供了友好提示和类型判断，有问题可以参考[常见问题](/easy-query-doc/question)。
关于如何在多模块引入`sql-processor`依赖，可以参考[demo地址](https://github.com/xuejmnet/eq-multi-module)。
```xml
         <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <!-- 引入starter -->
         <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-springboot-starter</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入支持Easy Query的APT依赖 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- 引入数据源 -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>${hikari.version}</version>
        </dependency>
        <!-- 引入需要的数据库驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
           <version>${mysql.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
        </dependency>
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
           <version>${hutool.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>${junit5.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>${junit5.version}</version>
        </dependency>
```

配置`application.yml`：

```yaml
server:
  port: 8080

spring:
  profiles:
    active: dev

  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root

#配置文件
easy-query:
  #是否启动默认true
  enable: true
  #支持的数据库
  database: mysql
  #对象属性和数据库列名的转换器
  name-conversion: underlined
  #当执行物理删除是否报错,true表示报错,false表示不报错,默认true,如果配置为true,可以通过allowDeleteStament来实现允许
  delete-throw: true
  #是否打印sql 默认true 需要配置log信息才可以 默认实现sl4jimpl
  print-sql: true
  #配置为默认追踪,但是如果不添加@EasyQueryTrack注解还是不会启用所以建议开启这个如果需要只需要额外添加注解即可
  default-track: true
  #sqlNativeSegment输入和格式化无需处理单引号会自动处理为双单引号
  keep-native-style: true

```

### 数据准备

我们以经典的用户管理的相关数据作为测试用例，创建一个数据库，比如`eq`
在数据库下执行SQL准备数据，后面全部使用案例都是根据这些数据进行测试，SQL如下：
```sql
-- 删除公司表
DROP TABLE IF EXISTS company CASCADE;
-- 创建公司表
CREATE TABLE company (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    parent_id INTEGER,
    deleted BOOLEAN
);

-- 删除公司表
DROP TABLE IF EXISTS company_detail;
-- 创建公司表
CREATE TABLE IF NOT EXISTS company_detail (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    address VARCHAR(255),
    company_id INT
);



-- 删除权限表
DROP TABLE IF EXISTS permission CASCADE;
-- 创建权限表
CREATE TABLE permission (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- 删除角色表
DROP TABLE IF EXISTS role CASCADE;
-- 创建角色表
CREATE TABLE role (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- 删除角色权限关联表
DROP TABLE IF EXISTS role_permission CASCADE;
-- 创建角色权限关联表
CREATE TABLE role_permission (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    role_id INTEGER,
    permission_id INTEGER
);

-- 删除用户表
DROP TABLE IF EXISTS user CASCADE;
-- 创建用户表
CREATE TABLE user (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    balance INTEGER,
    version INTEGER,
    create_time DATETIME,
    update_time DATETIME,
    enabled BOOLEAN,
    deleted BOOLEAN,
    company_id INTEGER
);

-- 删除用户详情表
DROP TABLE IF EXISTS user_detail CASCADE;
-- 创建用户详情表
CREATE TABLE user_detail (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    signature VARCHAR(255),
    user_id INTEGER
);

-- 删除用户角色关联表
DROP TABLE IF EXISTS user_role CASCADE;
-- 创建用户角色关联表
CREATE TABLE user_role (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER,
    role_id INTEGER
);

-- 删除商品表
DROP TABLE IF EXISTS product CASCADE;

-- 创建商品表
CREATE TABLE product (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    deleted_time DATETIME,
    deleted_user_id INTEGER
);

-- 插入公司数据
INSERT INTO company (name, parent_id,deleted) VALUES ('总公司', NULL,0);
INSERT INTO company (name, parent_id,deleted) VALUES ('分公司A', 1,0);
INSERT INTO company (name, parent_id,deleted) VALUES ('分公司B', 1,0);

-- 插入测试数据到 company_detail 表
INSERT INTO company_detail (address, company_id)
VALUES ('广州市番禺区', 1),('江门市鹤山市', 2),('九江市濂溪区', 3)
;


-- 插入公司详情数据
INSERT INTO company_detail (address, company_id) VALUES ('总公司', NULL);
INSERT INTO company (name, parent_id) VALUES ('分公司A', 1);
INSERT INTO company (name, parent_id) VALUES ('分公司B', 1);


-- 插入权限数据
INSERT INTO permission (name) VALUES ('查看报表');
INSERT INTO permission (name) VALUES ('管理用户');
INSERT INTO permission (name) VALUES ('编辑内容');

-- 插入角色数据
INSERT INTO role (name) VALUES ('管理员');
INSERT INTO role (name) VALUES ('编辑员');
INSERT INTO role (name) VALUES ('用户');

-- 插入角色权限关联数据
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 1);
INSERT INTO role_permission (role_id, permission_id) VALUES (1, 2);
INSERT INTO role_permission (role_id, permission_id) VALUES (2, 3);
INSERT INTO role_permission (role_id, permission_id) VALUES (3, 1);

-- 插入用户数据
INSERT INTO user (name,balance, create_time,update_time,version, enabled,deleted, company_id) VALUES ('张三', 999,NOW(),NOW(), TRUE,1,0, 1);
INSERT INTO user (name,balance, create_time, update_time,version, enabled, deleted, company_id) VALUES ('李四', 100,NOW(),NOW(),TRUE,1,0,2);
INSERT INTO user (name,balance, create_time, update_time,version, enabled,deleted,  company_id) VALUES ('王五', 60,NOW(),NOW(), FALSE,1,0, 3);

-- 插入用户详情数据
INSERT INTO user_detail (signature, user_id) VALUES ('静水流深', 1);
INSERT INTO user_detail (signature, user_id) VALUES ('海阔天空', 2);
INSERT INTO user_detail (signature, user_id) VALUES ('岁月静好', 3);

-- 插入用户角色关联数据
INSERT INTO user_role (user_id, role_id) VALUES (1, 1);
INSERT INTO user_role (user_id, role_id) VALUES (1, 3);
INSERT INTO user_role (user_id, role_id) VALUES (2, 2);
INSERT INTO user_role (user_id, role_id) VALUES (3, 3);
```

### 实体类准备

准备相应的实体类，如下：

```java
@Table
@EntityProxy
@Data
public class Company implements ProxyEntityAvailable<Company, CompanyProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    Integer parentId;

    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = "id", targetProperty = "companyId")
    private CompanyDetail companyDetail;

    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = "id", targetProperty = "companyId")
    private List<User> users;

    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = "id", targetProperty = "companyId", extraFilter = UserNavigateExtraFilterStrategy.class)
    private List<User> enabledUsers;
}


@Table
@EntityProxy
@Data
public class CompanyDetail implements ProxyEntityAvailable<CompanyDetail, CompanyDetailProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String address;

    Integer companyId;
}

@Table
@EntityProxy
@Data
public class Permission implements ProxyEntityAvailable<Permission, PermissionProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = RolePermission.class,
            selfProperty = "id",
            selfMappingProperty = "permissionId",
            targetProperty = "id",
            targetMappingProperty = "roleId")
    private List<Role> roles;
}

@Table
@EntityProxy
@Data
public class Role implements ProxyEntityAvailable<Role, RoleProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = RolePermission.class,
            selfProperty = "id",
            selfMappingProperty = "roleId",
            targetProperty = "id",
            targetMappingProperty = "permissionId")
    private List<Permission> permissions;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "roleId",
            targetProperty = "id",
            targetMappingProperty = "userId")
    private List<User> users;
}

@Table
@EntityProxy
@Data
public class RolePermission implements ProxyEntityAvailable<RolePermission, RolePermissionProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    Integer roleId;

    Integer permissionId;
}

@Table
@EntityProxy
@Data
public class User implements ProxyEntityAvailable<User, UserProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    Date createTime;

    Date updateTime;

    BigDecimal balance;

    Integer version;

    Boolean enabled;

    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    Boolean deleted;

    Integer companyId;

    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = "companyId", targetProperty = "id")
    private Company company;

    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = "id", targetProperty = "userId")
    private UserDetail userDetail;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "userId",
            targetProperty = "id",
            targetMappingProperty = "roleId")
    private List<Role> roles;
}

@Table
@EntityProxy
@Data
public class UserDetail implements ProxyEntityAvailable<UserDetail, UserDetailProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String signature;

    Integer userId;
}@Table
@EntityProxy
@Data
public class UserRole implements ProxyEntityAvailable<UserRole, UserRoleProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    Integer userId;

    Integer roleId;
}

@EntityProxy
@Data
public class UserRole implements ProxyEntityAvailable<UserRole, UserRoleProxy> {
    Integer id;

    Integer userId;

    Integer roleId;
}
```

简单说明这些实体类之间的关系，一个用户信息，关联了用户详情，公司，而公司又关联了公司详情。同时，用户和角色之间是多对多关系，角色和权限之间也是多对多关系。它们通过`@Navigate`来声明关联关系。

像类似`CompanyProxy`的都是相应的实体类对应的代理类，这些代理类可以帮助辅助我们更好设置条件查询和设值

现在的代理类是不存在的，Idea是无法识别代理类的，也无法编译类，
但是我们依然可以通过构建项目来触发Easy Query的APT工具来生成代理类，
构建完项目后，代理类将会生成在指定的目录中。如下：

<img src="/startup1.png">


构建项目后，如果Idea依然是无法识别代理类的，那么可以将目录标记为生成目录。

<img src="/startup2.png">

::: warning 说明!!!
> 如果您还是不行那么建议您点击idea右侧的maven刷新按钮进行刷新即可
:::

<img src="/startup4.png">

构建项目，生成完代理类后，需要在`User`中引入对应的代理类`UserProxy`


::: danger 说明!!!
如果没有生成代理类，即提示`Proxy`类不存在

- 查看是否引入sql-processor包
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

<img src="/startup3.png">

::: warning 说明!!!
> 2.0.15+版本框架不需要实现`proxyTableClass`方法，idea-plugin插件在0.0.57后也将不会生成该方法
> 2.0.15+版本框架不需要实现`proxyTableClass`方法，idea-plugin插件在0.0.57后也将不会生成该方法
> 2.0.15+版本框架不需要实现`proxyTableClass`方法，idea-plugin插件在0.0.57后也将不会生成该方法
> 如果您的项目是多模块那么只需要在需要使用@EntityProxy注解的模块下使用`sql-processor`即可
:::

::: warning 说明!!!
> 如果出现no primary key或者not found [id] mapping column name之类的错误请排查lombok是否生效,是否存在get set方法
:::


### 实例化查询对象

#### 简单环境

为了方便直观查看使用案例，使用junit5进行案例讲解，首先初始化`EasyEntityQuery`对象，如下：

```java
public class EasyQueryTest {

    private static EasyEntityQuery easyEntityQuery;

    @BeforeAll
    public static void setUp() {
        DataSource dataSource = Config.geMysqlDataSource();
        //采用控制台输出打印sql
        LogFactory.useStdOutLogging();
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setPrintSql(true);
                    op.setKeepNativeStyle(true);

                    op.setDefaultTrack(true);
                })
                .useDatabaseConfigure(new H2DatabaseConfiguration())
                .build();

        easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);
    }
}
```

#### SpringBoot环境

在SpringBoot环境中，启动Spring容器后，eq已经实例化了对象，直接注入即可，如下：

```java
@Autowired
private EasyEntityQuery easyEntityQuery;
```

## 单表查询

### 查询全部

默认情况下，eq查询实体类中匹配表的所有字段，查询时也可以指定需要查询的字段。

```java
    @Test
    public void testQueryAll() {
        //查询全部
        List<User> users = easyEntityQuery.queryable(User.class).toList();
        Assertions.assertTrue(users.size() > 0);
    }
```

查询指定的列。

```java
    @Test
    public void testQueryColumns() {
        //查询指定列名
        List<User> users = easyEntityQuery.queryable(User.class)
                .select(u -> u.FETCHER.id().name().fetchProxy()).toList();
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
            Assertions.assertNotNull(user.getName());
            Assertions.assertNull(user.getCreateTime());
            Assertions.assertNull(user.getUpdateTime());
        }

        users = easyEntityQuery.queryable(User.class)
                .select(User.class, u -> Select.of(u.FETCHER.allFieldsExclude(u.createTime(), u.updateTime()))).toList();
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
            Assertions.assertNotNull(user.getName());
            Assertions.assertNull(user.getCreateTime());
            Assertions.assertNull(user.getUpdateTime());
        }

        users = easyEntityQuery.queryable(User.class)
                .select(o -> new UserProxy()
                        .selectAll(o)
                        .selectIgnores(o.createTime(), o.updateTime())
                ).toList();
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
            Assertions.assertNotNull(user.getName());
            Assertions.assertNull(user.getCreateTime());
            Assertions.assertNull(user.getUpdateTime());
        }
    }
```

### 条件查询

Easy Query默认在最外层使用`AND`作为逻辑运算符进行拼接查询。

```java
    @Test
    public void testConditionQuery() {
        //假设firstName和lastName是用户输入的值
        String firstName = "张";
        String lastName = "三";
        Date startTime = DateUtil.parse("2020-01-01");
        Date endTime = DateUtil.parse("2050-01-01");
        //条件查询
        List<User> users = easyEntityQuery.queryable(User.class)
                .where(u -> {
                    //AND name LIKE '%张%'
                    u.name().like(firstName);
                    //AND name LIKE '张%'
                    u.name().likeMatchLeft(firstName);
                    //AND name LIKE '%三'
                    u.name().likeMatchRight(lastName);
                    //AND '2020-01-01' <= create_time AND create_time <= '2050-01-01'
                    u.createTime().rangeClosed(startTime, endTime);
                    //AND company_id IS NOT NULL
                    u.companyId().isNotNull();
                })
                .toList();
        Assertions.assertTrue(users.size() > 0);

        //动态条件查询，只有非空条件才会加到SQL
        users = easyEntityQuery.queryable(User.class)
                .where(u -> {
                    //AND name LIKE '%张%'
                    u.name().like(!ObjectUtil.isEmpty(firstName), firstName);
                    //AND name LIKE '张%'
                    u.name().likeMatchLeft(!ObjectUtil.isEmpty(firstName), firstName);
                    //AND name LIKE '%三'
                    u.name().likeMatchRight(!ObjectUtil.isEmpty(lastName), lastName);
                    //AND '2020-01-01' <= create_time AND create_time <= '2050-01-01'
                    u.createTime().rangeClosed(!ObjectUtil.isEmpty(startTime), startTime, !ObjectUtil.isEmpty(endTime), endTime);
                    //AND company_id IS NOT NULL
                    u.companyId().isNotNull();
                })
                .toList();
        Assertions.assertTrue(users.size() > 0);

        //前面一个一个拼接过于麻烦,可以使用NotNullOrEmptyValueFilter.DEFAULT
        users = easyEntityQuery.queryable(User.class)
                //当传入的条件参数值非空时才会增加到条件里面,也就是说无需再一个一个使用!ObjectUtil.isEmpty(firstName)判断
                //注意只有where的条件生效。当查询的属性不使用函数时才会生效，否则无效
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
                .where(u -> {
                    //AND name LIKE '%张%'
                    u.name().like(firstName);
                    //AND name LIKE '张%'
                    u.name().likeMatchLeft(firstName);
                    //AND name LIKE '%三'
                    u.name().likeMatchRight(lastName);
                    //AND '2020-01-01' <= create_time AND create_time <= '2050-01-01'
                    u.createTime().rangeClosed(startTime, endTime);
                    //AND company_id IS NOT NULL
                    u.companyId().isNotNull();
                })
                .toList();
        Assertions.assertTrue(users.size() > 0);
    }
```

与Mybatis Plus不同，Easy Query并不是在每个条件语句中后面使用逻辑运算符，而是在外面统一声明逻辑运算符的。为了更好地理解逻辑运算符的使用，下面只使用`name`做条件进行举例说明。

`WHERE u.name LIKE ? AND u.name LIKE ? AND u.name LIKE ?`的写法如下：

```java
.where(u -> {
    u.name().like(name);
    u.name().like(name);
    u.name().like(name);
})
```

等同于：

```java
.where(u -> u.and(()->{
    u.name().like(name);
    u.name().like(name);
    u.name().like(name);
}))
```

`WHERE u.name LIKE ? OR (u.name LIKE ? AND u.name LIKE ?)`的写法如下：

```java
.where(u -> u.or(()->{
    u.name().like(name);
    u.and(()->{
        u.name().like(name);
        u.name().like(name);
    })
}))
```

根据运算符运算顺序，建议对于优先运算的`AND`加上括号，一是方便理解，二是方便写代码。

`WHERE u.name LIKE ? OR ((u.name LIKE ? AND u.name LIKE ?) AND (u.name LIKE ? OR u.name LIKE ?)) OR (u.name LIKE ? AND u.name LIKE ?)`的写法如下：

```java
.where(u -> u.or(()->{
    u.name().like(name);
    u.and(()->{
        u.and(()->{
            u.name().like(name);
            u.name().like(name);
        });
         u.or(()->{
                u.name().like(name);
                u.name().like(name);
        });
    });
    u.and(()->{
        u.name().like(name);
        u.name().like(name);
    });
}))
```

### 排序

```java
 	@Test
    public void testOrder() {
        //排序
        List<User> users = easyEntityQuery.queryable(User.class)
                .orderBy(u -> {
                    u.createTime().desc();
                    u.balance().asc();
                }).toList();
        Assertions.assertTrue(users.size() > 0);

        //排序
        easyEntityQuery.queryable(User.class)
                .orderBy(u -> {
                    //NULL排后面
                    u.createTime().asc(OrderByModeEnum.NULLS_LAST);
                    //NULL排前面
                    u.balance().desc(OrderByModeEnum.NULLS_FIRST);
                }).toList();
        Assertions.assertTrue(users.size() > 0);
    }
```

### 分页

```java
    @Test
    public void testPage() {
        //查询分页
        EasyPageResult<User> pageResult = easyEntityQuery.queryable(User.class).toPageResult(1, 20);
        Assertions.assertTrue(pageResult.getData().size() > 0);
        Assertions.assertTrue(pageResult.getTotal() > 0);
    }
```

如果要自定义查询的分页信息，我们可以声明如下：

```java
public interface PageResult<T> {
    /**
     * 返回总数
     * @return
     */
    long getTotalCount();

    /**
     * 结果内容 
     * @return
     */
    List<T> getList();
}

public class CustomPageResult<TEntity> implements PageResult<TEntity> {
    private final long total;
    private final List<TEntity> list;

    public CustomPageResult(long total, List<TEntity> list) {
        this.total = total;
        this.list = list;
    }

    @Override
    public long getTotalCount() {
        return total;
    }

    @Override
    public List<TEntity> getList() {
        return list;
    }
}

public class CustomPager<TEntity> implements Pager<TEntity,PageResult<TEntity>> {
    private final long pageIndex;
    private final long pageSize;
    private final long pageTotal;

    public CustomPager(long pageIndex, long pageSize){
        this(pageIndex,pageSize,-1);
    }
    public CustomPager(long pageIndex, long pageSize, long pageTotal){

        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.pageTotal = pageTotal;
    }

    @Override
    public PageResult<TEntity> toResult(PageAble<TEntity> query) {
      EasyPageResult<TEntity> pageResult = query.toPageResult(pageIndex, pageSize,pageTotal);
        return new CustomPageResult<>(pageResult.getTotal(),pageResult.getData());
    }
}
```

在分页查询时使用`CustomPager`。

```java
    
    @Test
    public void testCustomPage(){
        //自定义PageResult
        PageResult<User> customerPageResult = easyEntityQuery
                .queryable(User.class)
                .whereById("1")
                .toPageResult(new CustomPager<>(1, 2));
        Assertions.assertTrue(customerPageResult.getList().size() > 0);
        Assertions.assertTrue(customerPageResult.getTotalCount() > 0);
    }
```

### 单条查询

查询单条记录，根据id查询：

```java
    @Test
    public void testId() {
        Integer id = 1;
        //根据id查询，返回列表
        List<User> users = easyEntityQuery.queryable(User.class)
                .where(e -> e.id().eq(1))
                .toList();
        Assertions.assertTrue(users.size() > 0);

        //主键查询：根据id查询第一条记录，允许为空
        User idUser = easyEntityQuery.queryable(User.class)
                .findOrNull(id);
        Assertions.assertNotNull(idUser);

        //主键查询：根据id查询第一条记录，不允许为空
        idUser = easyEntityQuery.queryable(User.class)
                .findNotNull(id);
        Assertions.assertNotNull(idUser);

        //条件查询：根据id查询第一条记录，允许为空
        idUser = easyEntityQuery.queryable(User.class)
                .whereById(id)
                .firstOrNull();
        Assertions.assertNotNull(idUser);

        //条件查询：根据id查询第一条记录，不允许为空
        idUser = easyEntityQuery.queryable(User.class)
                .whereById(id)
                .firstNotNull();
        Assertions.assertNotNull(idUser);

        //条件查询：根据id只查询一条记录，允许为空，如果结果有多条记录，则抛出EasyQuerySingleMoreElementException
        idUser = easyEntityQuery.queryable(User.class)
                .whereById(id)
                .singleOrNull();
        Assertions.assertNotNull(idUser);

        //条件查询：根据id只查询一条记录，允许为空，如果结果有多条记录，则抛出EasyQuerySingleMoreElementException
        idUser = easyEntityQuery.queryable(User.class)
                .whereById(id)
                .singleNotNull();
        Assertions.assertNotNull(idUser);
    }


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

        //判断是否存在
        boolean exists = easyEntityQuery.queryable(User.class).where(u -> u.name().eq("张三")).any();
        Assertions.assertTrue(exists);
    }
```

### 聚合查询

```java
    @Test
    public void testAgg() {
        long count = easyEntityQuery.queryable(User.class).count();
        Assertions.assertTrue(count > 0);
        int intCount = easyEntityQuery.queryable(User.class).intCount();
        Assertions.assertTrue(intCount > 0);


        BigDecimal sumBalance = easyEntityQuery.queryable(User.class).sumOrNull(o -> o.balance());
        Assertions.assertNotNull(sumBalance);

        sumBalance = easyEntityQuery.queryable(User.class).sumOrDefault(o -> o.balance(), BigDecimal.ZERO);
        Assertions.assertNotNull(sumBalance);

        sumBalance = easyEntityQuery.queryable(User.class).sumBigDecimalOrNull(o -> o.balance());
        Assertions.assertNotNull(sumBalance);

        //数字类型使用BigDecimal汇总
        sumBalance = easyEntityQuery.queryable(User.class).sumBigDecimalOrDefault(o -> o.balance(), BigDecimal.ZERO);
        Assertions.assertNotNull(sumBalance);

        //数字类型使用BigDecimal汇总
        easyEntityQuery.queryable(User.class).sumOrDefault(o -> o.balance(), BigDecimal.ZERO);
        Assertions.assertNotNull(sumBalance);

    }
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
        List<Draft2<Integer, Long>> drafts = easyEntityQuery.queryable(User.class)
                .groupBy(u -> GroupKeys.TABLE1.of(u.companyId()))
                .having(group -> group.count().eq(1L))
                .select(group -> Select.DRAFT.of(
                        //此处的key1就是分组的companyId
                        group.key1(),
                        group.count()
                )).toList();
        for (Draft2<Integer, Long> draft : drafts) {
            Long count = draft.getValue2();
            Assertions.assertEquals(count, 1L);
        }

        //查询每个公司的用户数，用自定义的查询结果类型
        List<UserGroup> userGroups = easyEntityQuery.queryable(User.class)
                .groupBy(u -> GroupKeys.TABLE1.of(u.companyId()))
                .having(group -> group.groupTable().createTime().max().le(new Date()))
                .select(UserGroup.class, group -> Select.of(
                        group.groupTable().companyId().as(UserGroup::getCompanyId),
                        group.count().as(UserGroup::getCount)
                )).toList();
        for (UserGroup userGroup : userGroups) {
            Integer count = userGroup.getCount();
            Assertions.assertEquals(count, 1);
        }
    }
```

## 多表查询

### 子查询

#### 显式子查询
在调用方法时将用户和公司通过in或者exists进行关联查询称为显式子查询
```java
    @Test
    public void testExplicitSubQuery(){
        //查询存在张三用户的公司
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.id().in(
                            easyEntityQuery.queryable(User.class)
                                    .where(u -> u.name().eq("张三"))
                                    .select(u -> u.companyId())
                    );
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);

        //查询存在张三用户的公司
        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.expression().exists(() ->
                            easyEntityQuery.queryable(User.class)
                                    .where(u -> {
                                        u.companyId().eq(c.id());
                                        u.name().eq("张三");
                                    })
                    );
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);
    }
```

#### 隐式子查询
先在实体类声明有关联关系的实体类，调用方法时直接根据有关联关系的实体类来进行查询成为隐式子查询，
它不需要在每次查询时声明关联关系。

```java
@Test
    public void testSubQuery(){
        //查询存在姓张用户的公司
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().where(u -> {
                        name().eq("张三");
                    }).any();
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);

        //查询存在姓张用户的公司，与上面写法效果一样，如果将any方法替换为none方法则用于查询不存在存在姓张用户的公司
        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().any(u -> {
                        name().eq("张三");
                    });
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);


        //查询存在姓张用户的公司，与上面写法效果一样
        //联级穿透 flatElement后仅支持但条件判断,多条件会生成多个Exists函数
        //所以如果存在多条件还是建议使用where来处理 flatElement支持多层级穿透
        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    //展开users集合穿透到下方直接判断名称
                    c.users().flatElement().name().like("");
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);

        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().where(u -> {
                        name().eq("张三");
                    }).count().eq(1L);
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);
    }
```

### 一对一查询

默认情况下，eq查询实体类中匹配表的所有字段，也就是说，对于声明了关联关系的字段，eq是不会去查询的，我们可以使用`include`来查询一对一关系的关联对象，如下：

```java
    @Test
    public void testOneToOneQuery() {
        //查询用户
        List<User> users = easyEntityQuery.queryable(User.class)
                .include(u -> u.userDetail())
                .include(u -> u.company(), cq -> {
                    //cq是公司查询，c是公司，在这里可以再关联查询出公司详情
                    cq.include(c -> c.companyDetail());
                })
                .where(u -> {
                    u.name().eq("张三");
                }).toList();
        Assertions.assertTrue(users.size() > 0);
        for (User user : users) {
            Assertions.assertNotNull(user.getUserDetail());
            Assertions.assertNotNull(user.getCompany());
            Assertions.assertNotNull(user.getCompany().getCompanyDetail());
        }

        //查询公司在广州市番禺区的用户
        users = easyEntityQuery.queryable(User.class)
                .where(u -> u.company().companyDetail().address().eq("广州市番禺区")).toList();
        Assertions.assertTrue(users.size() > 0);

        //查询公司在广州市的用户
        users = easyEntityQuery.queryable(Company.class)
                //先查出广州的公司
                .where(c -> c.companyDetail().address().eq("广州市番禺区"))
                //最后查出公司查出每个公司的用户列表，因为需要将每个用户列表整合为一个用户列表，因此需要将每个用户列表展开
                .toList(c -> c.users().flatElement());
        Assertions.assertTrue(users.size() > 0);
    }
```

一般情况下，不会在实体类声明有关联关系的字段，一般在VO类中声明，可以参考[](查询结果类型转换)章节

### 一对多查询

我们可以使用`includes`来查询一对多关系的关联对象，如下：

```java
    @Test
    public void testOneToManyQuery() {
        //使用includes获取一对多关联的用户
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                .includes(c -> c.users(), c -> {
                    //当前公司关联的张三用户，如果不加条件就返回当前公司关联的所有用户
                    c.where(u -> u.name().eq("张三"));
                })
                .where(c -> {
                    //只查询存在张三用户的公司
                    c.users().where(u -> {
                        u.name().eq("张三");
                    });
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);
        for (Company company : companyList) {
            Assertions.assertNotNull(company.getUsers());
            Assertions.assertNull(company.getEnabledUsers());
        }

        //只查询存在张三用户而且用户是启用状态的公司
        companyList = easyEntityQuery.queryable(Company.class)
                //当前公司关联的已启用的用户，因为类级别上加了的额外查询条件
                .includes(c -> c.enabledUsers(), c -> {
                    //当前公司关联的张三用户，并且用户是启用的，如果不加条件就返回当前公司关联的已启用的用户
                    c.where(u -> u.name().eq("张三"));
                })
                .where(c -> c.enabledUsers().any(u -> {
                    u.name().eq("张三");
                }))
                .toList();
        Assertions.assertTrue(companyList.size() > 0);
        for (Company company : companyList) {
            Assertions.assertNull(company.getUsers());
            Assertions.assertNotNull(company.getEnabledUsers());
        }
    }
```

Easy Query支持实体类级别上添加额外的查询条件，比如查询`Company`时，除了查询关联用户外，可以查询关联的已启用的用户，

在`Company`加上如下属性：

```java
	@Navigate(value = RelationTypeEnum.OneToMany, selfProperty = "id", targetProperty = "companyId", extraFilter = UserNavigateExtraFilterStrategy.class)
    private List<User> enabledUsers;
```

`NavigateExtraFilterStrategy`用于添加额外的关联查询条件，其中`UserNavigateExtraFilterStrategy`实现了`NavigateExtraFilterStrategy`，添加了`enabledUsers`的关联查询条件，如下：

```java
public class UserNavigateExtraFilterStrategy implements NavigateExtraFilterStrategy {
    @Override
    public SQLExpression1<WherePredicate<?>> getPredicateFilterExpression(NavigateBuilder builder) {
        //parentType
        EntityMetadata entityMetadata = builder.getNavigateOption().getEntityMetadata();
        //导航属性类型
        Class<?> navigatePropertyType = builder.getNavigateOption().getNavigatePropertyType();
        //导航属性名称
        String propertyName = builder.getNavigateOption().getPropertyName();
        if (Objects.equals(Company.class, entityMetadata.getEntityClass())) {
            //关联查询enabledUsers时添加已启用的状态
            if (Objects.equals("enabledUsers", propertyName)) {
                return o -> o.eq("enabled", 1);
            }
        }
        throw new IllegalArgumentException();
    }
}
```

如果是简单环境，需要注册`UserNavigateExtraFilterStrategy`实例到Easy Query实例，如下：

```java
	QueryRuntimeContext runtimeContext = easyEntityQuery.getRuntimeContext();
	runtimeContext.getQueryConfiguration().applyNavigateExtraFilterStrategy(new UserNavigateExtraFilterStrategy());

```

如果是SpringBoot环境，将`UserNavigateExtraFilterStrategy`注册到Spring容器即可,Easy Query会自动获取所有Spring容器的`NavigateExtraFilterStrategy`进行注册。

```java
    @Test
    public void testNavigateExtraFilterStrategy(){
        //只查询存在张三用户而且用户是启用状态的公司
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                //当前公司关联的已启用的用户，因为类级别上加了的额外查询条件
                .includes(c -> c.enabledUsers(), c -> {
                    //当前公司关联的张三用户，并且用户是启用的，如果不加条件就返回当前公司关联的已启用的用户
                    c.where(u -> u.name().eq("张三"));
                })
                .where(c -> c.enabledUsers().any(u -> {
                    u.name().eq("张三");
                }))
                .toList();
        Assertions.assertTrue(companyList.size() > 0);
        for (Company company : companyList) {
            Assertions.assertNull(company.getUsers());
            Assertions.assertNotNull(company.getEnabledUsers());
        }
    }
```

### 多对多查询

我们也可以使用`includes`来查询多对多关系的关联对象，如下：

```java
    @Test
    public void testManyToManyQuery() {
        //用户为主表，查询用户的权限，扁平化查询结果
        List<Permission> permissions = easyEntityQuery.queryable(User.class)
                .where(s -> {
                    s.name().eq("张三");
                })
                .toList(x -> x.roles().flatElement().permissions().flatElement());
        Assertions.assertTrue(permissions.size() > 0);
        //用户为主表，查询用户的权限,查询指定列名
        permissions = easyEntityQuery.queryable(User.class)
                .where(s -> {
                    s.name().eq("张三");
                })
                .toList(x -> x.roles().flatElement().permissions().flatElement(p -> p.FETCHER.id().name()));
        Assertions.assertTrue(permissions.size() > 0);

        //权限为主表，查询用户的权限，根据所属用户进行条件查询
        permissions = easyEntityQuery.queryable(Permission.class)
                .where(s -> {
                    s.roles().any(role -> {
                        role.users().any(user -> {
                            user.name().eq("张三");
                        });
                    });
                }).toList();
        Assertions.assertTrue(permissions.size() > 0);
        //权限为主表，查询用户的权限，根据扁平化的所属用户进行条件查询
        permissions = easyEntityQuery.queryable(Permission.class)
                .where(s -> {
                    s.roles().flatElement().users().any(user -> {
                        user.name().eq("张三");
                    });
                }).toList();
        Assertions.assertTrue(permissions.size() > 0);
    }
```

### 显式关联查询

在前面的章节中，[](#一对一查询)，[](#一对多查询)和[](#多对多查询)直接使用关联的实体类进行查询的都是隐式关联查询，因为查询的实体类中已经声明了有关联关系的实体类。
Easy Query支持使用`leftJoin`方法进行查询，也就是在方法中声明关联其它实体类的关联条件，这就是显式关联查询。
使用`leftJoin`方法实现的显式关联查询并不能推断实体类之间是一对一，一对多还是多对多关系，因为它就是像直接使用SQL进行LEFT JOIN查询那样进行设计的，
比如查询`Company`关联`User`，如果关联关系是一对一，那么查询的数据数量就是`Company`的行数，
如果关联关系是一对对，那么查询的数据数量就是`User`的行数。

```java
    @Test
    public void testLeftJoin() {
        List<User> users = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .where((u, ud) -> {
                    u.name().eq("张三");
                    ud.signature().like("静水流深");
                })
                .toList();
        Assertions.assertTrue(users.size() > 0);

        users = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .leftJoin(Company.class, (u, ud, c) -> u.companyId().eq(c.id()))
                .where((u, ud, c) -> {
                    u.name().eq("张三");
                    ud.signature().like("静水流深");
                    c.name().eq("总公司");
                })
                .toList();
        Assertions.assertTrue(users.size() > 0);
    }
```

### 自定义查询结果类型

在[](#分组查询)章节中有用到此功能，它在关联查询时也比较常用，一般情况，我们不会在实体类中声明有关联关系的字段，而是在VO中声明。

```java
@EntityFileProxy
@Data
public class UserVo {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    private String name;

    private String companyName;

    @Navigate(value = RelationTypeEnum.OneToOne, selfProperty = "id", targetProperty = "userId")
    private UserDetail userDetail;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = UserRole.class,
            selfProperty = "id",
            selfMappingProperty = "userId",
            targetProperty = "id",
            targetMappingProperty = "roleId")
    private List<Role> roles;
}

@EntityFileProxy
@Data
public class UserDetailVo {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    String signature;
}
```

在查询时，我们可以选择自定义需要转换的列。

#### 使用临时类型
查询时，如果没有声明查询结果的返回类型，可以使用临时类型，百日`Draft`类型或者`Map`类型。
`Draft`和`Map`类型支持后续链式结果。
```java
    @Test
    public void testQueryReturnType() {
        List<Draft3<Integer, String, String>> draftList = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .leftJoin(Company.class, (u, ud, c) -> u.companyId().eq(c.id()))
                .where((u, ud, c) -> {
                    u.name().eq("张三");
                    ud.signature().like("静水流深");
                    c.name().eq("总公司");
                }).select((u, ud, c) -> Select.DRAFT.of(
                        u.id(), ud.signature(), c.name()
                )).toList();
        for (Draft3<Integer, String, String> draft : draftList) {
            Integer userId = draft.getValue1();
            Assertions.assertNotNull(userId);
            String signature = draft.getValue2();
            Assertions.assertNotNull(signature);
            String companyName = draft.getValue3();
            Assertions.assertNotNull(companyName);
        }

        //查询时，如果没有声明查询结果的返回类型，可以使用Draft类型作为返回类型
        MapKey<Integer> userIdKey = MapKeys.integerKey("userId");
        MapKey<String> signatureKey = MapKeys.stringKey("signature");
        MapKey<String> companyNameKey = MapKeys.stringKey("companyName");
        MapKey<Integer> companyIdKey = MapKeys.integerKey("companyId");


        draftList = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .where((u, ud) -> {
                    u.name().eq("张三");
                    ud.signature().like("静水流深");
                })
                .select((u, ud) -> {
                    MapTypeProxy map = new MapTypeProxy();
                    map.put(userIdKey, u.id());
                    map.put(signatureKey, ud.signature());
                    map.put(companyIdKey, u.companyId());
                    return map;
                })
                .leftJoin(Company.class, (uud, c) -> uud.get(companyIdKey).eq(c.id()))
                .select((uud, c) -> Select.DRAFT.of(
                        uud.get(userIdKey),
                        uud.get(signatureKey),
                        c.name()
                )).toList();
        for (Draft3<Integer, String, String> draft : draftList) {
            Integer userId = draft.getValue1();
            Assertions.assertNotNull(userId);
            String signature = draft.getValue2();
            Assertions.assertNotNull(signature);
            String companyName = draft.getValue3();
            Assertions.assertNotNull(companyName);
        }

        List<Map<String, Object>> resultMaps = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .leftJoin(Company.class, (u, ud, c) -> u.companyId().eq(c.id()))
                .where((u, ud, c) -> {
                    u.name().eq("张三");
                    ud.signature().like("静水流深");
                    c.name().eq("总公司");
                }).select((u, ud, c) -> {
                    MapTypeProxy map = new MapTypeProxy();
                    map.put(userIdKey, u.id());
                    map.put(signatureKey, ud.signature());
                    map.put(companyNameKey, c.name());
                    return map;
                }).toList();
        for (Map<String, Object> resultMap : resultMaps) {
            Integer userId = (Integer) resultMap.get("userId");
            Assertions.assertNotNull(userId);
            String signature = (String) resultMap.get("signature");
            Assertions.assertNotNull(signature);
            String companyName = (String) resultMap.get("companyName");
            Assertions.assertNotNull(companyName);
        }
    }
```

#### 使用引用类型
我们可以自定义引用类型作为查询结果的返回类型，但是它不支持后续链式查询
```java
    @Test
    public void testCustomQueryReturnType() {
        //使用指定的类型作为返回类型，默认为匹配的字段设值
        List<UserDetailVo> userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(UserDetailVo.class).toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getId());
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNull(userDetailVo.getSignature());
        }

        //使用指定的类型作为返回类型，需要手动设值
        userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(UserDetailVo.class, s -> Select.of(
                        //手动为匹配的字段设值,与allFields相似的方法有allFieldsExclude方法
                        s.FETCHER.allFields(),
                        //手动为不匹配的字段设值,as支持传入字段名称
                        s.userDetail().signature().as(UserDetailVo::getSignature)
                )).toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getId());
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNotNull(userDetailVo.getSignature());
        }

        //查询VO对象时自动查询关联的对象
        //注意自动筛选返回结构化数据,VO和对应的实体类的字段是一样的，比如User有userDetail和roles两个关联对象，那么UserVo也只能声明这些需要自动查询的关联对象
        List<UserVo> userVoList = easyEntityQuery.queryable(User.class)
                .where(u -> u.name().eq("张三"))
                .selectAutoInclude(UserVo.class)
                .toList();
        Assertions.assertTrue(userVoList.size() > 0);

        List<UserDetailVo> userDetailVoList = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .where(u -> u.name().eq("张三"))
                .selectAutoInclude(UserDetailVo.class, (u, ud) -> Select.of(
                        //u.FETCHER.allFields(),请注意,调用select需要加此行,调用selectAutoInclude不需要加此行，因为selectAutoInclude会自动执行allFields
                        u.userDetail().signature().as(UserDetailVo::getSignature)
                ))
                .toList();
        Assertions.assertTrue(userDetailVoList.size() > 0);
    }
```

#### 使用Proxy类型
使用`Proxy`类型作为返回结果类型，则支持后续链式结果。
```java
    @Test
    public void testCustomQueryReturnTypeWithProxy() {
        //使用指定的类型作为返回类型，需要手动为对应的Proxy设值，注意不需要指定实体类型
        List<UserDetailVo> userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s ->
                        // Proxy支持selectAll方法和selectIgnore方法
                        new UserDetailVoProxy()
                                .id().set(s.id())
                                .name().set(s.name())
                                .signature().set(s.userDetail().signature())
                )
                .toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getId());
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNotNull(userDetailVo.getSignature());
        }

        //效果同上
        userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s -> {
                    UserDetailVoProxy userDetailVoProxy = new UserDetailVoProxy();
                    userDetailVoProxy.id().set(s.id());
                    userDetailVoProxy.name().set(s.name());
                    userDetailVoProxy.signature().set(s.userDetail().signature());
                    return userDetailVoProxy;
                })
                .toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getId());
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNotNull(userDetailVo.getSignature());
        }

        //效果同上
        userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s -> new UserDetailVoProxy()
                        .selectExpression(s.id(), s.name(), s.userDetail().signature())
                )
                .toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getId());
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNotNull(userDetailVo.getSignature());
        }

        List<Draft3<Integer, String, String>> draftList = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s ->
                        // Proxy支持selectAll方法和selectIgnore方法
                        new UserDetailVoProxy()
                                .id().set(s.id())
                                .name().set(s.name())
                                .signature().set(s.userDetail().signature())
                )
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .select((u, ud) -> Select.DRAFT.of(
                        u.id(), u.name(), ud.signature()
                ))
                .toList();
        for (Draft3<Integer, String, String> draft : draftList) {
            Integer userId = draft.getValue1();
            Assertions.assertNotNull(userId);
            String name = draft.getValue2();
            Assertions.assertNotNull(name);
            String signature = draft.getValue3();
            Assertions.assertNotNull(signature);

        }
    }
```

## 写操作

### 插入

#### 插入对象

插入时，调用`insertable`方法时，必须要再调用`executeRows`方法，传入`true`代表将为插入的对象设置生成的id值。

```java
    @Test
    public void testInsert() {
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        //插入，参数可以是单个对象或对象集合
        long rows = easyEntityQuery.insertable(user).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }

```

#### 插入策略

Easy Query默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`策略进行插入，也就是默认只插入有值的列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ALL_COLUMNS`可以插入全部列。

```java
    @Test
    public void testInsertAllColumns() {
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        long rows = easyEntityQuery.insertable(user).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

#### 插入Map

Easy Query也支持插入Map对象，注意，key是列名，不是实体类的属性名，同时，不支持主键回填。

```java
    @Test
    public void testInsertMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("name", "小明");
        userMap.put("create_time", new Date());
        userMap.put("enabled", true);
        long rows = easyEntityQuery.mapInsertable(userMap) .asTable("user").executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNull(userMap.get("id"));
    }
```

### 更新

#### 更新对象

更新时，调用`updatable`方法时，必须要再调用`executeRows`方法。

```java
    @Test
    public void testUpdate() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新，参数可以是单个对象或对象集合
        easyEntityQuery.updatable(user).executeRows();
        //更新
        long rows = easyEntityQuery.updatable(user).executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

#### 更新策略

Easy Query默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`策略进行更新，也就是默认只更新有值的列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ALL_COLUMNS`可以更新全部列。

```java
    @Test
    public void testUpdateAll() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新，默认只更新有值的列，设置SQLExecuteStrategyEnum.ALL_COLUMNS可以更新全部列
        long rows = easyEntityQuery.updatable(user).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows();
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

#### 更新指定列

```java
    @Test
    public void testUpdateCustomColumn() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        //更新指定列
        updateTime.offset(DateField.SECOND, 1);
        long rows = easyEntityQuery.updatable(user)
                .setColumns(o -> o.updateTime())//多个字段使用FETCHER.setColumns(o->o.FETCHER.name().updateTime())
                .whereColumns(o -> o.id())//多个字段使用FETCHER.whereColumns(o->o.FETCHER.id().name())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //更新指定列
        updateTime.offset(DateField.SECOND, 1);
        rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //更新指定列并断言
        updateTime.offset(DateField.SECOND, 1);
        easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows(1, "更新失败");
        //断受影响行数，如果不匹配则会抛异常,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,因此当前的更新操作将失效
    }

```

#### 更新类型转换的列

Easy Query支持更新的值类型转换。

```java
    @Test
    public void testUpdateColumnType() {
        //自动转换类型
       long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.name().set(o.id().toStr());
                    //toStr和.setPropertyType(String.class)效果是一样的
                    o.name().set(o.id().setPropertyType(String.class));
                })
                .whereById("1")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 更新自增值

Easy Query支持调用`increment`方法自增值， 默认自增1，可以传入指定的参数值进行自增，另外可以使用`decrement`方法自减。

```java
    @Test
    public void testUpdateIncrement() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
                .setColumns(o -> {
                    o.version().increment();
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }

```

#### 差异更新

Easy Query支持差异更新，它可以监听被追踪的对象,并且生成差异更新语句,而不是无脑的对对象进行全字段更新,使用时需要开启当前追踪环境并且对查询出来的结果进行追踪后续即可监听到变更列实现差异化update语句

正常情况下如果用户想使用差异更新,那么需要对查询采用`asTracking`来让返回结果被追踪,或者调用`easyQuery.addTracking`来让需要更新的对象被追踪

首先，需要全局配置`default-track`为true时，差异更新才会生效。

开启差异更新后，在查询时可以使用`asTracking`来追踪查询处理的对象。

```java

    @Test
    public void testUpdateTrack() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            User user = new User();
            user.setName("新用户");
            user.setCreateTime(new Date());
            user.setVersion(1);
            easyEntityQuery.insertable(user).executeRows(true);

            User existUser = easyEntityQuery.queryable(User.class).asTracking().findNotNull(user.getId());
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }

    }


```

前面追踪的是查询结果，Easy Query提供了`addTracking`方法，可以用于追踪指定的对象，比如当查询出来的数据过多时，可以只追踪某条数据。

```java
    @Test
    public void testUpdateTrackControl() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            User user = new User();
            user.setName("新用户");
            user.setCreateTime(new Date());
            user.setVersion(1);
            easyEntityQuery.insertable(user).executeRows(true);

            User existUser = easyEntityQuery.queryable(User.class).findNotNull(user.getId());
            //如果数据量多，可以只追踪一条
            easyEntityQuery.addTracking(existUser);
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }
    }
```

在SpringBoot环境下，Easy Query支持使用`@EasyQueryTrack`进行简化操作，就像开启事务那样。

```java
    @EasyQueryTrack
    public void testUpdateTrackControl() {
        trackManager.begin();
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        user.setVersion(1);
        easyEntityQuery.insertable(user).executeRows(true);

        User existUser = easyEntityQuery.queryable(User.class).findNotNull(user.getId());
        //如果数据量多，可以只追踪一条
        easyEntityQuery.addTracking(existUser);
        existUser.setVersion(existUser.getVersion() + 1);
        easyEntityQuery.updatable(existUser).executeRows();
    }
```

#### 更新Map

Easy Query也支持更新Map对象，注意，key是列名，不是实体类的属性名。

```java
    @Test
    public void testUpdateMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", 1);
        userMap.put("update_time", new Date());
        long rows = easyEntityQuery.mapUpdatable(userMap)
                .asTable("user")
                .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
                .whereColumns("id")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

#### 更新自定义sql

```java
    @Test
    public void testUpdateCustomSQL() {
        long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.version().setSQL("ifnull({0},0)+{1}", (context) -> {
                        context.expression(o.version())
                                .value(1);
                    });
                })
                .where(o -> o.id().eq(1))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 删除

#### 逻辑删除

Easy Query支持物理删除和逻辑删除，默认情况下使用逻辑删除。

要使用逻辑删除，需要声明字段，例如：

```java
@LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
Boolean deleted;
```

调用`deletable`方法将会修改`deleted`为`true`，因此如果不声明字段，那么将会抛出异常。

```java
    @Test
    public void testLogicDelete() {
        //默认情况下，EasyQuery使用逻辑删除
        Company company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);
        long rows = easyEntityQuery.deletable(Company.class)
                .where(c -> c.name().eq("新公司"))
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //根据对象id删除
        company = new Company();
        company.setName("新公司");
        company.setDeleted(false);
        easyEntityQuery.insertable(company).executeRows(true);
        rows = easyEntityQuery.deletable(company).executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

注意`deleted`不能为`null`，因为查询时不会判断null

#### 物理删除

Easy Query也支持物理删除，需要在全局配置或者当前方法配置允许执行DELETE语句，否则执行DELETE将会抛出异常。

通过调用`disableLogicDelete`方法可以禁用逻辑删除

```java
    @Test
    public void testDelete() {
        Company company = new Company();
        company.setName("新公司");
        easyEntityQuery.insertable(company).executeRows(true);
        long rows = easyEntityQuery.deletable(company)
                .disableLogicDelete()//禁用逻辑删除,使用物理删除 生成delete语句
                .allowDeleteStatement(true)//如果不允许物理删除那么设置允许 配置项delete-throw
                .executeRows();
        Assertions.assertTrue(rows > 0);

        Assertions.assertThrows(EasyQueryInvalidOperationException.class, () -> {
            easyEntityQuery.deletable(company).disableLogicDelete().allowDeleteStatement(false).executeRows();
        });
    }
```

#### 禁用部分逻辑删除

```java
    @Test
    public void testQueryDisableLogicDelete() {
        //删除所有公司
        easyEntityQuery.deletable(Company.class).where(c -> c.id().isNotNull()).executeRows();
        //查询用户关联未删除的公司
        List<UserVo> userVos = easyEntityQuery.queryable(User.class)
                .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
                .select(UserVo.class, (u, c) -> Select.of(
                        c.name().as(UserVo::getCompanyName)
                ))
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNull(userVo.getCompanyName());
        }

        //部分禁用逻辑删除，查询用户关联全部公司
        userVos = easyEntityQuery.queryable(User.class)
                .leftJoin(Company.class, (u, c) -> u.companyId().eq(c.id()))
                .tableLogicDelete(() -> false)
                .select(UserVo.class, (u, c) -> Select.of(
                        c.name().as(UserVo::getCompanyName)
                ))
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNotNull(userVo.getCompanyName());
        }
        //查询全部数据，包括已删除的
        List<Company> companyList = easyEntityQuery.queryable(Company.class).disableLogicDelete().toList();
        for (Company company : companyList) {
            company.setDeleted(false);
        }
        //恢复全部数据，包括已删除的
        long size = easyEntityQuery.updatable(companyList).disableLogicDelete().executeRows();
        Assertions.assertEquals(companyList.size(), size);
    }
```

#### 自定义逻辑删除策略

Easy Query除了支持简单的逻辑删除字段，还支持自定义逻辑删除策略

在类中声明策略：
```java
@EntityProxy
@Table
@Data
public class Product implements ProxyEntityAvailable<Product, ProductProxy> {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM, strategyName = "MyLogicDelStrategy")
    LocalDateTime deletedTime;

    Integer deletedUserId;
}
```

自定义策略：
```java
public class CustomLogicDelStrategy extends AbstractLogicDeleteStrategy {
    @Override
    protected SQLExpression1<WherePredicate<Object>> getPredicateFilterExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.isNull(propertyName);
    }

    @Override
    protected SQLExpression1<ColumnSetter<Object>> getDeletedSQLExpression(LogicDeleteBuilder builder, String propertyName) {
        return o -> o.set(propertyName, LocalDateTime.now())
                .set("deletedUserId", 1);
    }

    @Override
    public String getStrategy() {
        return "CustomLogicDelStrategy";
    }

    @Override
    public Set<Class<?>> allowedPropertyTypes() {
        return new HashSet<>(Arrays.asList(LocalDateTime.class));
    }
}
```
注意，调用多次使用了`CustomLogicDelStrategy`的删除方法时，只会调用一次`CustomLogicDelStrategy`实例的接口方法，


注册策略：
```java
        QueryRuntimeContext runtimeContext = easyEntityQuery.getRuntimeContext();
        QueryConfiguration queryConfiguration = runtimeContext.getQueryConfiguration();
        queryConfiguration.applyLogicDeleteStrategy(new CustomLogicDelStrategy());
```

```java
    @Test
    public void testCustomLogicDelete() {
        Product product = new Product();
        product.setName("香蕉");
        easyEntityQuery.insertable(product).executeRows(true);
        easyEntityQuery.deletable(product).executeRows();
        easyEntityQuery.deletable(product).executeRows();
    }
```

### 更新或插入

Easy Query提供了`conflictThen`方法，它用于插入或更新操作

`conflictThen`方法的第一个参数指定需要更新的列，第二个参数指定需要判断的列，支持多列(mysql不支持指定所以设置了也无效)，如果这些列对应的值已存在，那么执行更新操作，否则执行插入操作，插入的是全部列。

下面将测试已存在匹配项，Easy Query进行更新的情况。

```java
    @Test
    public void testOnConflictThenUpdate() {
        //根据id字段判断是否存在匹配项，此处存在，更新全部列
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        Date updateTime = new Date();
        user.setUpdateTime(updateTime);
        long rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.allFields())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //根据id字段判断是否存在匹配项，此处存在，更新指定列
        user = easyEntityQuery.queryable(User.class).findNotNull(1);
        updateTime = new Date();
        user.setUpdateTime(updateTime);
        rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.updateTime())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

下面将测试不存在匹配项，Easy Query进行插入的情况。

```java
    @Test
    public void testOnConflictThenInsert() {
        //根据id字段判断是否存在匹配项，此处不存在，插入全部列
        User user = new User();
        Date createTime = new Date();
        user.setName("新用户");
        user.setCreateTime(createTime);
        user.setVersion(1);
        user.setEnabled(true);
        long rows = easyEntityQuery.insertable(user)
                //mysql不支持使用多列进行判断是否存在匹配项
                .onConflictThen(null, o -> o.FETCHER.id())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

### 事务

Easy Query默认提供手动开启事务的功能,并且在springboot下可以跨非代理方法生效,唯一限制就是当前线程内的

事务相关方法如下：

| 方法                                                      | 默认值 | 描述                                                         |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| beginTransaction                                          | null   | 参数表示数据库隔离级别,默认采用`datasource`的可以自定义 Connection.TRANSACTION_READ_UNCOMMITTED,Connection.TRANSACTION_READ_COMMITTED,Connection.TRANSACTION_REPEATABLE_READ,* Connection.TRANSACTION_SERIALIZABLE. |
| Transaction.commit                                        |        | 提交事务                                                     |
| Transaction.rollback                                      |        | 回滚事务                                                     |
| registerListener(TransactionListener transactionBehavior) |        | 设置当前事务的执行行为,包括提交前提交后等处理                |
| close                                                     |        | 关闭事务,如果事务未提交则自动调用回滚                        |

#### 简单环境

使用Easy Query开启事务，如下：

```java

    @Test
    public void testTransaction() {
        try (Transaction transaction = easyEntityQuery.beginTransaction()) {
            User user = new User();
            user.setName("新用户");
            user.setVersion(1);
            user.setEnabled(true);
            easyEntityQuery.insertable(user).executeRows();
            easyEntityQuery.insertable(user).executeRows();
            if (true) {
                throw new RuntimeException("模拟异常");
            }
            transaction.commit();
        }
    }
```

#### SpringBoot环境

Easy Query支持Spring事务注解，因此不用调用`beginTransaction`方法开启事务了

```java

    @Transaction
    public void testTransaction() {
        User user = new User();
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        easyEntityQuery.insertable(user).executeRows();
        easyEntityQuery.insertable(user).executeRows();
        if (true) {
            throw new RuntimeException("模拟异常");
        }
    }
```
