---
title: 复杂查询🔥🔥🔥
---
## 前言
前面在[快速开始](./quick-start.md)章节中，我们知道了Easy Query的简单查询，下面我们将讲解复杂查询

在讲解复杂查询前，先说明一下`DSL`和`NODSL`的概念。
DSL (Domain Specific Language): 特定领域语言，这里指 ORM 中用来构建查询的一种语法或 API。例如，Hibernate 提供了一种 HQL (Hibernate Query Language) 和 Criteria API。
NODSL (No Domain Specific Language): 指的是没有特定领域语言的 ORM 设计理念，即通过纯面向对象的方式来操作数据库，而不需要学习额外的查询语言。
一款优秀的ORM框架需要具备`NODSL`风格和`DSL`风格，即支持使用面向对象的方法来处理简单查询，也可以使用 DSL 来构建复杂查询。
Easy Query则是具备这两种风格，Easy Query处理提供了强大的查询能力，允许开发者构建复杂的查询条件外，
也支持使用`@Table`表示实体类与表的关系，对于表之间的关联关系则是使用`@Navigate`注解声明，
Easy Query提供`include`或者`includes`方法来额外自动查询出当前主表所关联的的表数据，
默认情况下，查询主表的数据时，不使用`include`或者`includes`方法是不会自动查询关联表的数据的

以下情况不需要调用`include`或者`includes`

- 返回`对一导航属性`而不是`对多`包括相关列,其中`对一`包括`多对一`,`一对一`
- 返回导航属性本身`.select(o->o.parent())`
- 返回导航属性的列比如`.select(o->o.parent().id())`
- 返回对多的导航属性比如`.select(o->o.roles().toList())`

::: danger 说明!!!

> 如果您的对象关系涉及到多对多请使用 `1.10.29+`的版本,在之前版本会有一个失误导致关系会提前在`where`中体现导致结果不正确.再次感谢用户`←X→↑Y↓`大佬的测试指出问题所在
> 
:::

## 环境准备
### 引入依赖
请参考[引入依赖](./quick-start.md#引入依赖)章节

### 数据准备

要说明Easy Query在多表查询方面的能力，我们需要设计一个比较完整的典型的例子，
以经典的用户管理模块作为案例，先说说表之间的关系。
1. **一对一关系**:
   - 每个用户都有对应的用户详情。在 `user_detail` 表中有一个 `user_id` 字段，指向 `user` 表的主键。
   - 每个公司都有对应的公司详情。在 `company_detail` 表中有一个 `company_id` 字段，指向 `company` 表的主键。

1. **多对一关系**:
   - 每个用户属于一家公司，但一家公司可以有多个用户。在 `user` 表中有一个 `company_id` 字段，指向 `company` 表的主键。
   - 每个子公司属于它们的父公司。在 `company` 表中有一个 `parent_id` 字段，指向 `company` 表的主键。

2. **多对多关系**:
   - 一个用户可以有多个角色，一个角色也可以分配给多个用户通过 `user_role` 表来关联 `user` 和 `role`。
   - 一个角色可以有多个权限，一个权限也可以属于多个角色。通过 `role_permission` 表来关联 `roles` 和 `permission`。



::: tip 说明!!!
> `2.0.93^`版本支持多属性比如人员企业关系表(`company_user`)和工单表(`task`)如果以人员企业为视角那么可以通过`com_id`+`user_id`来关联`task`表的`com_id`+`user_id`而不仅限于单一属性
:::

现在准备数据，后面的大部分使用案例将根据这些数据进行测试，SQL如下：
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

通过`@Table`声明表对应的实体类，通过`@Navigate`声明实体类之间的关系，也就是表之间的关系。

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

### 生成代理类

请参考[生成代理类](./quick-start.md#生成代理类)章节

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
                        u.name().eq("张三");
                    }).any();
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);

        //查询存在姓张用户的公司，与上面写法效果一样，如果将any方法替换为none方法则用于查询不存在存在姓张用户的公司
        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().any(u -> {
                        u.name().eq("张三");
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

        //查询只有一个张三用户的公司
        companyList = easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().where(u -> {
                        u.name().eq("张三");
                    }).count().eq(1L);
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);

        //查询一个用户签名为静水流深的公司
        easyEntityQuery.queryable(Company.class)
                .where(c -> {
                    c.users().where(u -> {
                        u.userDetail().signature().eq("静水流深");
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
`queryable(User.class)`返回的类型是`EntityQueryable<UserProxy, User>`，
`include`方法中,`u`的类型是`UserProxy`，`cq`的类型是`EntityQueryable<CompanyProxy, Company>`，
`cq.include`方法中,`c`的类型是`CompanyProxy`。

### 一对多查询

我们可以使用`includes`来查询一对多关系的关联对象，如下：

```java
    @Test
    public void testOneToManyQuery() {
        //使用includes获取一对多关联的用户
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                .includes(c -> c.users(), uq -> {
                    uq.include(u -> u.userDetail())
                            //当前公司关联的张三用户，如果不加条件就返回当前公司关联的所有用户
                            .where(u -> u.name().eq("张三"));
                })
                .where(c -> {
                    //只查询存在张三用户的公司
                    c.users().where(u -> {
                        u.name().eq("张三");
                    });
                }).toList();
        Assertions.assertTrue(companyList.size() > 0);
        for (Company company : companyList) {
            List<User> users = company.getUsers();
            Assertions.assertNotNull(users);
            for (User user : users) {
                UserDetail userDetail = user.getUserDetail();
                Assertions.assertNotNull(userDetail);
            }
        }
    }
```
`queryable(Company.class)`返回的类型是`EntityQueryable<CompanyProxy, Company>`，
`includes`方法中,`c`的类型是`CompanyProxy`，`uq`的类型是`EntityQueryable<UserProxy, User>`，
`uq.include`方法中,`u`的类型是`UserProxy`。

#### 隐式关联查询筛选策略
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
        QueryConfiguration queryConfiguration = runtimeContext.getQueryConfiguration();
        queryConfiguration.applyNavigateExtraFilterStrategy(new UserNavigateExtraFilterStrategy());
```

如果是SpringBoot环境，将`UserNavigateExtraFilterStrategy`注册到Spring容器即可,Easy Query会自动获取所有Spring容器的`NavigateExtraFilterStrategy`进行注册。

```java
    @Test
    public void testNavigateExtraFilterStrategy() {
        //只查询存在张三用户而且用户是启用状态的公司
        List<Company> companyList = easyEntityQuery.queryable(Company.class)
                //当前公司关联的已启用的用户，因为类级别上加了的额外查询条件
                .includes(c -> c.enabledUsers(), uq -> {
                    uq.include(u -> u.userDetail())
                            //当前公司关联的张三用户，并且用户是启用的，如果不加条件就返回当前公司关联的已启用的用户
                            .where(u -> u.name().eq("张三"));
                })
                .where(c -> c.enabledUsers().any(u -> {
                    u.name().eq("张三");
                }))
                .toList();
        Assertions.assertTrue(companyList.size() > 0);
        for (Company company : companyList) {
            List<User> enabledUsers = company.getEnabledUsers();
            Assertions.assertNotNull(enabledUsers);
            for (User enabledUser : enabledUsers) {
                UserDetail userDetail = enabledUser.getUserDetail();
                Assertions.assertNotNull(userDetail);
            }
        }
    }
```
`queryable(Company.class)`返回的类型是`EntityQueryable<CompanyProxy, Company>`，
`includes`方法中,`c`的类型是`CompanyProxy`，`uq`的类型是`EntityQueryable<UserProxy, User>`，
`uq.include`方法中,`u`的类型是`UserProxy`。

### 多对多查询

我们也可以使用`includes`来查询多对多关系的关联对象，如下：

```java
    @Test
    public void testManyToManyQuery() {
        //用户为主表，查询用户的权限，扁平化查询结果
        List<Integer> permissionIds = easyEntityQuery.queryable(User.class)
                .where(u -> {
                    u.name().eq("张三");
                })
                .toList(uq -> uq.roles().flatElement().permissions().flatElement().id());
        Assertions.assertTrue(permissionIds.size() > 0);

        //用户为主表，查询用户的权限，扁平化查询结果
        List<Permission> permissions = easyEntityQuery.queryable(User.class)
                .where(u -> {
                    u.name().eq("张三");
                })
                .toList(uq -> uq.roles().flatElement().permissions().flatElement());
        Assertions.assertTrue(permissions.size() > 0);
        //用户为主表，查询用户的权限,查询指定列名
        permissions = easyEntityQuery.queryable(User.class)
                .where(u -> {
                    u.name().eq("张三");
                })
                .toList(uq -> uq.roles().flatElement().permissions().flatElement(p -> p.FETCHER.id().name()));
        Assertions.assertTrue(permissions.size() > 0);

        //权限为主表，查询用户的权限，根据所属用户进行条件查询
        permissions = easyEntityQuery.queryable(Permission.class)
                .where(u -> {
                    u.roles().any(role -> {
                        role.users().any(user -> {
                            user.name().eq("张三");
                        });
                    });
                }).toList();
        Assertions.assertTrue(permissions.size() > 0);
        //权限为主表，查询用户的权限，根据扁平化的所属用户进行条件查询
        permissions = easyEntityQuery.queryable(Permission.class)
                .where(u -> {
                    u.roles().flatElement().users().any(user -> {
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

#### 使用临时类型

查询时，如果没有声明查询结果的返回类型，可以使用临时类型，比如`Draft`类型或者`Map`类型。
调用`select`方法时，如果返回时调用`Select.DRAFT.of`方法，那么最终将返回`Draft`类型，
调用`select`方法时，如果返回`MapTypeProxy`类型，那么最终将返回`Map`类型。
在查询时，我们可以选择自定义需要转换的列，上述两种方式都支持后续链式结果。
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

在[分组查询](#分组查询)章节中有用到此功能，它在隐式关联查询时也比较常用

一般情况下，在查询时需要从关联表中获取数据，但这些数据并会设如保存在持久化的实体类中，而是使用VO来封装查询结果。
因为实体类通常用于表示数据库中的持久化对象，而VO通常用于表示业务逻辑中的临时数据结构。


调用`selectAutoInclude`方法查询VO时，需要注意的是，需要先在实体类中声明有关联关系的字段，
再在VO中选择需要查询的字段，声明的字段必须是一样的，比如`UserVo`的`roles`声明和`User`的`roles`声明是一样的。
声明的`UserVo`如下：
```java



@EntityProxy
@Data
public class UserVo {
    @Column(primaryKey = true, generatedKey = true)
    Integer id;

    String name;

    String signature;
}

@EntityProxy
@Data
public class MyUserVo {
    Integer id;

    private String name;

    private String companyName;
    private String signature;
    //因为实体已经有对应的关系所以这边只需要设置和实体一样的类型无需再设置selfProperty和targetProperty
    @Navigate(value = RelationTypeEnum.OneToOne)
    private MyUserDetailVo userDetail;

    //因为实体已经有对应的关系所以这边只需要设置和实体一样的类型无需再设置selfProperty和targetProperty
    @Navigate(value = RelationTypeEnum.ManyToMany)
    private List<MyRoleVo> roles;
}
@EntityProxy
@Data
public class MyUserDetailVo {
    Integer id;

    String signature;

    Integer userId;
}
@EntityProxy
@Data
public class MyRoleVo {
    Integer id;

    String name;
}
```

声明了VO后，我们可以使用Easy Query的`select`方法快速查询主表的数据，
也可以使用`selectAutoInclude`方法快速查询主表所关联的表数据，它会自动将类中的全部关联字段进行`include`。
`select`方法和`selectAutoInclude`都可以自定义引用类型作为查询结果的返回类型，注意，它不支持后续链式查询。
```java
    @Test
    public void testCustomQueryReturnType() {
        //使用指定的类型作为返回类型，默认为匹配的字段设值
        List<UserVo> userVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(UserVo.class).toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNotNull(userVo.getId());
            Assertions.assertNotNull(userVo.getName());
            Assertions.assertNull(userVo.getSignature());//无法映射到signature
        }

        //使用指定的类型作为返回类型，需要手动设值
        userVo = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(UserVo.class, s -> Select.of(
                        //手动为匹配的字段设值,与allFields相似的方法有allFieldsExclude方法
                        s.FETCHER.allFields(),
                        //手动为不匹配的字段设值,as支持传入字段名称
                        s.userDetail().signature().as(UserVo::getSignature)
                )).toList();
        for (UserVo userVo : userDetailVos) {
            Assertions.assertNotNull(userVo.getId());
            Assertions.assertNotNull(userVo.getName());
            Assertions.assertNotNull(userVo.getSignature());
        }


        
        //查询VO对象时自动查询关联的对象
        List<MyUserVo> userVoList = easyEntityQuery.queryable(User.class)
                .where(u -> u.name().eq("张三"))
                .selectAutoInclude(MyUserVo.class)
                .toList();
        Assertions.assertTrue(userVoList.size() > 0);

        List<MyUserVo> myUserVoList = easyEntityQuery.queryable(User.class)
                .leftJoin(UserDetail.class, (u, ud) -> u.id().eq(ud.userId()))
                .where(u -> u.name().eq("张三"))
                .selectAutoInclude(MyUserVo.class, (u, ud) -> Select.of(
                        //u.FETCHER.allFields(),请注意,调用select需要加此行,调用selectAutoInclude不需要加此行，因为selectAutoInclude会自动执行allFields
                        u.userDetail().signature().as(MyUserVo::getSignature)
                ))
                .toList();
        Assertions.assertTrue(myUserVoList.size() > 0);
    }
```

::: tip 说明!!!
> selectAutoInclude的对象可以通过插件的CreateStructDTO来实现
:::
#### 使用Proxy类型

使用`Proxy`类型作为返回结果类型，则支持后续链式结果。
```java
    @Test
    public void testCustomQueryReturnTypeWithProxy() {
        //使用指定的类型作为返回类型，需要手动为对应的Proxy设值，注意不需要指定实体类型
        List<UserVo> userVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s ->
                        // Proxy支持selectAll方法和selectIgnore方法
                        new UserVoProxy()
                                .id().set(s.id())
                                .name().set(s.name())
                                .signature().set(s.userDetail().signature())
                )
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNotNull(userVo.getId());
            Assertions.assertNotNull(userVo.getName());
            Assertions.assertNotNull(userVo.getSignature());
        }

        //效果同上
        userVos = easyEntityQuery.queryable(User.class)
                .where(s -> s.name().eq("张三"))
                .select(s -> {
                    UserVoProxy userVoProxy = new UserVoProxy();
                    userVoProxy.id().set(s.id());
                    userVoProxy.name().set(s.name());
                    userVoProxy.signature().set(s.userDetail().signature());
                    return userVoProxy;
                })
                .toList();
        for (UserVo userVo : userVos) {
            Assertions.assertNotNull(userVo.getId());
            Assertions.assertNotNull(userVo.getName());
            Assertions.assertNotNull(userVo.getSignature());
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

手动创建DTO是一件很麻烦的事情，我们可以使用插件助手简化操作，请参考[创建DTO](/easy-query-doc/config/plugin.html#创建dto)章节