---
title: 简介
---
## 简介

Easy Query是新一代的ORM框架，它不需要像Mybatis那样，每创建一个实体类，就需要创建对应的`Mapper`类和xml文件，它可以直接传入实体类作为参数进行增删改查操作，在Mybatis中，写动态条件查询，总是要书写重复的判空和拼接SQL操作，使用Easy Query的条件过滤器可以简化这些操作。相比Spring Data JPA的`EntityManager`，它没有`EntityManager`的对象状态管理等繁琐的处理，它比`EntityManager`更细粒度，更灵活，可以选择查询的字段，支持简单类型的字段，以及有关联关系的字段。

## 作者
本章节共同作者
- Hoysion [github](https://github.com/Hoysion) [gitee](https://gitee.com/Hoysing)

### 特性

- 无实体查询,无实体更新,无实体新增,无实体删除等操作
- 动态条件,form表单查询,有值就添加到条件,没值就忽略 [DynamicWhere](/easy-query-doc/guide/query/dynamic-where)
- 动态排序,form表单排序,前端指定排序 [DynamicOrderBy](/easy-query-doc/guide/query/dynamic-sort)
- 对象关系结构化VO自动组装返回,支持一对多一对一结果筛选,排序,limit
- 多数据源,动态多数据源，支持`SpringEL`，使用场景多租户(一个租户一个库) [DynamicDataSource](/easy-query-doc/guide/config/muti-datasource)
- 软删除，软删除部分禁用启用非常方便，软删除记录删除时间,删除人 [LogicDelete](/easy-query-doc/guide/adv/logic-delete)
- 自定义错误异常快速针对`firstNotNull`、`singleNotNull`、`required` [Exception](/easy-query-doc/practice/configuration/exception)
- 枚举和数据库映射,数据脱敏,数据编码存储解码获取,枚举属性,json或者数组,计算属性等 [ValueConverter,ColumnValueSQLConverter](/easy-query-doc/guide/prop/)
- 数据填充,自动赋值创建人创建时间,修改人修改时间 [拦截器](/easy-query-doc/guide/adv/interceptor)、 [对象实战](/easy-query-doc/practice/entity/)
- 慢sql监听拦截,自动上报预警 [jdbc执行监听器](/easy-query-doc/guide/adv/jdbc-listener)
- 数据库列的加密和加密后的模糊查询企业级解决方案 [数据库列加密](/easy-query-doc/guide/adv/column-encryption)
- 分库分表，读写分离 [分库分表，读写分离](/easy-query-doc/guide/super/) (敬请期待已经完成功能文档还在完善中)
- VO对象直接返回 [自定义vo列返回](/easy-query-doc/guide/query/select)
- 数据库对象模型关联查询：一对多、一对一、多对多、多对一 [对象关系查询](/easy-query-doc/startup/nodsl)
- 对象关系关联查询`nosql`不仅仅是`sql`联级筛选,支持额外条件过滤比如公用中间表,多对多关联+type区分 [联级筛选Include Filter](/easy-query-doc/guide/query/relation-filter)
- [对象关系查询](/easy-query-doc/startup/nodsl)、[SQL查询](/easy-query-doc/startup/sql)强类型语法的sql查询语法
- 智能的差异识别更新、并发更新 [更新、追踪](/easy-query-doc/guide/basic/update)
- 自带分页方法和无依赖分页链式返回 [分页](/easy-query-doc/guide/query/paging)
- Embeddable、ValueObject对象 [值对象](/easy-query-doc/guide/adv/value-object)
- 数据权限,业务权限拦截器,我能查看我下面的所有组,组长可以查询所有组员的数据,组员查看自己的数据
- 原生sql片段使用,方便开发人员使用数据库特有的函数或者方言
- java函数数据库封装支持各个数据库
- group感知,在众多orm中极少数orm才会支持的group感知
- 无任何依赖的框架,不会有任何冲突
- sql多表查询支持join、in、exists等子查询
- idea插件提供更加高效快速的开发效率和开发体验
- sql上下文泛型限制
- 大数据流式查询防止oom
- 自带便捷的`batch`批处理
- 动态报名支持对查询的表名进行动态设置可以再非分库分表模式下直接操作对应表
- 配合`easy-cache`实现缓存的便捷使用并且是一个企业级别的延迟双删
- insert or update语法方言 [InsertOrUpdate](/easy-query-doc/guide/basic/insertOrUpdate)
- 计算属性,额外计算列比如年龄是动态的而不是固定的,所以年龄应该是`(当前时间-出生日期)`,复杂计算属性比如班级表存在学生数量这个属性这个属性应该是`select count(*) from student where class_id=?`



### 支持的数据库

`easy-query`目前已经抽象了表达式,所以原则上支持所有数据库,只需要自定义实现对应数据库的增删改查接口即可,也就是[`sql-db-support`open in new window](https://github.com/xuejmnet/easy-query/tree/main/sql-db-support) 所以如果不支持对应的sql那么你可以自行扩展或者提交相应的issue

| 数据库名称          | 包名            | springboot配置   | solon配置        |
| ------------------- | --------------- | ---------------- | ---------------- |
| MySQL               | sql-mysql       | mysql            | mysql            |
| PostgresSQL         | sql-pgsql       | pgsql            | pgsql            |
| SqlServer           | sql-mssql       | mssql            | mssql            |
| SqlServer RowNumber | sql-mssql       | mssql_row_number | mssql_row_number |
| H2                  | sql-h2          | h2               | h2               |
| 达梦dameng          | sql-dameng      | dameng           | dameng           |
| 人大金仓KingbaseES  | sql-kingbase-es | kingbase_es      | kingbase_es      |
| Oracle              | sql-oracle      | oracle           | oracle           |
| SQLite              | sql-sqlite      | sqlite           | sqlite           |
| ClickHouse          | sql-clickhouse  | clickhouse       | clickhouse       |



## 环境准备

### 引入依赖

#### 简单环境

以mysql数据库为例，请按需引入以下依赖：

```xml
    <dependencies>
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>4.0.3</version>
        </dependency>


 		<!-- 如果使用mysql数据库，则引入对应驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.46</version>
        </dependency>
        <!-- 如果使用mysql数据库，则引入其它的eq的mysql支持 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>2.0.25</version>
        </dependency>
        
        <!-- 如果使用h2数据库，则引入对应驱动 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>1.4.200</version>
        </dependency>
         <!-- 如果使用h2数据库，则引入其它的eq的h2支持 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-h2</artifactId>
            <version>2.0.25</version>
        </dependency>

        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>2.0.25</version>
        </dependency>
        
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>2.0.25</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.8.2</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.8.2</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
        </dependency>
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.16</version>
        </dependency>
    </dependencies>
```



#### SpringBoot环境



```xml
    <dependencies>
         <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>4.0.3</version>
        </dependency>


 		<!-- 如果使用mysql数据库，则引入对应驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>5.1.46</version>
        </dependency>
        
        <!-- 引入starter，此依赖包含了各个数据库的支持 -->
         <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-springboot-starter</artifactId>
            <version>2.0.25</version>
        </dependency>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>2.0.25</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.8.2</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.8.2</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
        </dependency>
        <dependency>
            <groupId>cn.hutool</groupId>
            <artifactId>hutool-all</artifactId>
            <version>5.8.16</version>
        </dependency>
    </dependencies>
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

我们以经典的用户管理的相关数据作为测试用例，执行SQL如下：

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

-- 插入公司数据
INSERT INTO company (name, parent_id) VALUES ('总公司', NULL);
INSERT INTO company (name, parent_id) VALUES ('分公司A', 1);
INSERT INTO company (name, parent_id) VALUES ('分公司B', 1);

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



### 安装插件

在使用Easy Query前，推荐安装框架插件，它可以提高Easy Query的使用开发效率，如下：

![img](/plugin-search.png)



### 实体类准备

准备相应的实体类，后面讲解使用插件生成，如下：

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


package com.easy.query.sample.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.LogicDelete;
import com.easy.query.core.annotation.Navigate;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.basic.extension.logicdel.LogicDeleteStrategyEnum;
import com.easy.query.core.enums.RelationTypeEnum;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.easy.query.sample.entity.proxy.UserProxy;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * @author Hoysing
 * @date 2023-02-25 15:13
 * @since 1.0.0
 */
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
    private Boolean deleted;

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

像类似`CompanyProxy`的都是相应的实体类对应的查询辅助代理类，这些代理类可以帮助我们更好设置条件查询和设值，它们可以在构建项目时由eq框架的APT生成或者直接由eq插件生成，如下：

![img](/startup1.png)



如果存在如下情况无法解析代理类的情况，那么就将目录标记为生成目录，如下：

![img](/startup2.png)



如果依然还是不行，可以尝试点击idea右侧的maven刷新按钮进行刷新即可

![img](/startup4.png)



### 实例化查询对象

#### 简单环境

为了方便直观查看使用案例，使用junit5进行案例讲解，首先初始化`EasyEntityQuery`对象，如下：

```java
public class EasyQueryTest {

    private static EasyEntityQuery easyEntityQuery;

    @BeforeAll
    public static void setUp() {
        DataSource dataSource = Config.geMysqlDataSource();
//        initSql(dataSource);
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



分组查询默认使用`Draft1`，`Draft2`类型接收接收结果

```java
    @Test
    public void testGroup() {
        //查询每个公司的用户数
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

        //查询每个公司的用户数，自定义类型
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

因为用户表里面已经声明了关联关系，可以直接使用关联的表条件进行查询，如下：

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

前面章节中，我们是在查询时，查询选择的自动或者条件使用到有关联关系的字段都是在类中声明好的，Easy Query除了支持在类级别中声明查询的关联关系，我们也可以在方法级别中进行显式关联其它表进行条件查询。

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



### 查询结果类型转换

在[](#分组查询)章节中有用到此功能，它在关联查询时也比较常用，一般情况，我们不会在实体类中声明有关联关系的字段，而是在VO中声明。

```java
@EntityFileProxy
@Data
public class UserVo {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    private String name;

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

```java

    @Test
    public void testQueryReturnType() {
        List<UserDetailVo> userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(UserDetailVo.class, s -> Select.of(
                        s.FETCHER.allFields(),//将用户表所有匹配名称的字段赋值到UserDetailVo对象中
                        s.userDetail().signature().as(UserDetailVo::getSignature)//额外将用户签名赋值到UserDetailVo对象中
                )).toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
            Assertions.assertNotNull(userDetailVo.getName());
            Assertions.assertNotNull(userDetailVo.getSignature());
        }

        //如果想要为每个字段设值，可以使用Proxy，注意不需要指定UserDetailVo.class
        userDetailVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s -> {
                    UserDetailVoProxy userDetailVoProxy = new UserDetailVoProxy();
                    // userDetailVoProxy.selectAll(s); //如果字段一样可以这么写直接映射
                    userDetailVoProxy.id().set(s.id());
                    userDetailVoProxy.name().set(s.name());
                    userDetailVoProxy.signature().set(s.userDetail().signature());

                    return userDetailVoProxy;
                })
                .toList();
        for (UserDetailVo userDetailVo : userDetailVos) {
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
private Boolean deleted;
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

//待测

#### 自定义逻辑删除策略

//待测



### 更新或插入

Easy Query提供了`conflictThen`方法，它用于插入或更新操作

`conflictThen`方法的第一个参数指定需要更新的列，第二个参数指定需要判断的列，支持多列(mysql不支持指定所以设置了也无效)，如果这些列对应的值已存在，那么执行更新操作，否则执行插入操作，插入的是全部列。

下面将测试已存在匹配项，Easy Query进行更新的情况。

//待测

```java
    @Test
    public void testOnConflictThenUpdate() {
        //根据id字段判断是否存在匹配项，如果存在则更新指定的列
        User user = new User();
        user.setId(1);
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        long rows = easyEntityQuery.insertable(user)
                //如果存在则更新指定的列,否则插入
                .onConflictThen(o -> o.FETCHER.name().enabled())
                .executeRows();
        Assertions.assertEquals(rows, 0);

        //根据id字段判断是否存在匹配项，如果存在则更新全部的列，除了主键和指定约束键
        user = new User();
        user.setId(1);
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        rows = easyEntityQuery.insertable(user)
                //如果存在则更新指定的列,否则插入
                .onConflictThen(o -> o.FETCHER.allFields())
                .executeRows();
        Assertions.assertEquals(rows, 0);
    }
```



下面将测试不存在匹配项，Easy Query进行插入的情况。

```java
    @Test
    public void testOnConflictThenInsert() {
        //根据id字段判断是否存在匹配项，如果存在则更新指定的列
        User user = new User();
        user.setId(1);
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        long rows = easyEntityQuery.insertable(user)
                //如果存在则更新指定的列,否则插入
                .onConflictThen(o -> o.FETCHER.name().enabled())
                .executeRows();
        Assertions.assertEquals(rows, 0);

        //根据id字段判断是否存在匹配项，如果存在则更新全部的列，除了主键和指定约束键
        user = new User();
        user.setId(1);
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        rows = easyEntityQuery.insertable(user)
                //如果存在则更新指定的列,否则插入
                .onConflictThen(o -> o.FETCHER.allFields())
                .executeRows();
        Assertions.assertEquals(rows, 0);


        //根据id字段判断是否存在匹配项，并且在无匹配时插入完整的name,version,enable字段
        user = new User();
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        rows = easyEntityQuery.insertable(user)
                //传null如果存在则不更新,否则插入
                .onConflictThen(null)
                .executeRows();
        Assertions.assertEquals(rows, 0);

        //根据id字段和version字段判断是否存在匹配项，并且在无匹配时插入完整的name,enable字段
        user = new User();
        user.setName("新用户");
        user.setVersion(1);
        user.setEnabled(true);
        rows = easyEntityQuery.insertable(user)
                //传null如果存在则不更新,否则插入
                .onConflictThen(null, o -> o.FETCHER.name().enabled())
                .executeRows();
        Assertions.assertEquals(rows, 0);
    }
```





### 事务

`easy-query`默认提供手动开启事务的功能,并且在springboot下可以跨非代理方法生效,唯一限制就是当前线程内的

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

