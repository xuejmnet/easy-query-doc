---
title: 快速体验
---

## 前言
在此使用Easy Query之前，需要具备以下条件：
- 拥有基本的Java开发环境
- 熟悉Maven或Gradle工具
- 熟悉[Spring Boot](https://github.com/spring-projects/spring-boot) 或 [Solon](https://gitee.com/opensolon/solon) 框架

`eq`核心api客户端有两个为`EasyEntityQuery(强类型)`和`EasyQueryClient(动态类型)`它提供了常用的增删改查方法，


目前Easy Query的最新版本如下：
<a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
    <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
</a>

如果法看到Easy Query的最新版本版本，可以在[github](https://github.com/dromara/easy-query)或者[gitee](https://gitee.com/dromara/easy-query)的标签处查看最新版本

## 环境准备

如果想要快速搭建环境，请克隆[github](https://github.com/Hoysing/easy-query-sample)或者[gitee](https://gitee.com/Hoysing/easy-query-sample)的案例项目

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

#### SpringBoot环境
Easy Query提供了`sql-springboot-starter`依赖以便快速整合到Spring Boot环境中，它包含了`sql-api-proxy`和各个数据库支持的依赖。
`sql-processor`是需要额外引入的，因为如果是在多模块项目中使用Easy Query时，必须在每个需要生成代理类的模块处的`pom.xm`引入`sql-processor`依赖或者在项目`maven`插件处进行配置，代理类的作用请参考[生成代理类](#生成代理类)章节。
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
  #entity映射到dto/vo使用属性匹配模式
  mapping-strategy: property_first
  #sqlNativeSegment输入和格式化无需处理单引号会自动处理为双单引号
  keep-native-style: true
  #配置为默认追踪,但是如果不添加@EasyQueryTrack注解还是不会启用所以建议开启这个如果需要只需要额外添加注解即可
  default-track: true

```

### 数据准备

创建一个用户表，SQL如下：
```sql
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
```

### 实体类准备

创建用户表对应的实体类，如下：

```java
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

    Boolean deleted;

    Integer companyId;
}
```

### 生成代理类

现在实体类`User`关联的代理类`UserProxy`是不存在的，Idea是无法识别代理类，也无法进行编译，但是我们依然可以通过构建项目来触发Easy Query的APT工具来生成代理类。Easy Query的APT会为所有使用了`@EntityProxy`的实体类创建对应的代理类，代理类用于提供此对表别名，列名，列类型等等都提供了友好提示和类型判断，这些代理类可以帮助辅助我们更好设置条件查询和设值。

真正开发时可以使用插件助手快速生成接口，请参考[快速生成接口](/easy-query-doc/config/plugin.html#快速生成接口)章节。

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

<img src="/startup3.png">

可以通过插件快速添加该接口


<img src="/startup5.png">

::: warning 说明!!!
> 如果EasyQueryImplement没有效果请检查类是否添加了`@EntityProxy`或者`@EntityFileProxy`
:::

<img src="/startup6.png">

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
在控制台输出输出的SQL可以使用插件助手格式化SQL，请参考[格式化SQL](../guide/config/plugin.md#格式化SQL)章节。

#### SpringBoot环境

在SpringBoot环境中，启动Spring容器后，Easy Query已经实例化了对象，直接注入即可，如下：

```java
@Autowired
private EasyEntityQuery easyEntityQuery;
```

## 单表查询

下面开始真正的使用，如果有问题可以参考[常见问题](/easy-query-doc/question)或者加入EasyQuery官方QQ群:170029046 进行提问

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
                //2.0.66^版本查询当前表指定列可以不添加`fetchProxy`
                .select(u -> u.FETCHER.id().name()).toList();

        //2.0.66以前版本需要添加`fetchProxy`
        List<User> users = easyEntityQuery.queryable(User.class)
                .select(u -> u.FETCHER.id().name().fetchProxy()).toList();
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
            Assertions.assertNotNull(user.getName());
            Assertions.assertNull(user.getCreateTime());
            Assertions.assertNull(user.getUpdateTime());
        }

        //先获取所有的列然后排除掉不需要的
        users = easyEntityQuery.queryable(User.class)
                .select(User.class, u -> Select.of(u.FETCHER.allFieldsExclude(u.createTime(), u.updateTime()))).toList();
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
            Assertions.assertNotNull(user.getName());
            Assertions.assertNull(user.getCreateTime());
            Assertions.assertNull(user.getUpdateTime());
        }
        //现获取所有的列然后排除掉不需要的
        //和上面表达式的区别就是上面表达式select后不支持继续where了，但是下面这个表达式返回的是Proxy所以可以继续where orderBy等操作相当于
        //是吧select当做是一张匿名表select t1.id,t1.name from ( select id,name from user t) t1
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

**总结：** `and(...)`内部全是`AND`链接,`or(....)`内部全是`OR`链接,默认`AND`链接

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

所有的不允许为空`NotNull`可以抛出自定义错误,通过替换框架的`AssertExceptionFactory`接口来实现也可以自行全局拦截错误

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

        //条件查询：根据id只查询一条记录，不允许为空，如果结果有多条记录，则抛出EasyQuerySingleMoreElementException
        idUser = easyEntityQuery.queryable(User.class)
                .whereById(id)
                .singleNotNull();
        Assertions.assertNotNull(idUser);
    }


```
查询时一般使用使用表别名作为参数名，我们可以使用插件助手快速提示，请参考[参数变量名提示](../guide/config/plugin.md#参数名提示)章节。
`eq`是`=`运算符，调用`eq`方法可能不够直观地编写方法，我们可以使用插件助手快速提示，请参考[关系运算符提示](../guide/config/plugin.md#关系运算符提示)章节。

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
        List<UserGroup> userGroups = easyEntityQuery.queryable(User.class)
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.groupTable().createTime().max().le(new Date()))
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
    @Test
    public void testGroup() {
        //查询每个公司的用户数，用自定义的查询结果类型
        List<UserGroup> userGroups = easyEntityQuery.queryable(User.class)
                //创建group by 2.3.4之前使用GroupKeys.TABLE1_10.of
                .groupBy(u -> GroupKeys.of(u.companyId()))
                .having(group -> group.groupTable().createTime().max().le(new Date()))
                .select(group -> new UserGroupProxy()
                        .companyId().set(group.key1())//将groupBy的key给companyId您也可以使用group.groupTable().companyId()
                        .count().set(group.count())
                ).toList();
        for (UserGroup userGroup : userGroups) {
            Integer count = userGroup.getCount();
            Assertions.assertEquals(count, 1);
        }
    }
```