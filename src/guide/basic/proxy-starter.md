---
title: 使用代理模式
---

# 代理模式
`easy-query`提供了多种api接口方便用户调用,其中代理模式的使用上面更加符合人性化,如果您是c#开发人员那么肯定这种模式相对的会更加适合您的开发理念

## psvm下

### 安装依赖
```xml

<!-- easy-query mysql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${project.version}</version>
    <scope>compile</scope>
</dependency>
<!-- apt生成代理类 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>1.1.12</version>
    <scope>compile</scope>
</dependency>
<!-- 代理api -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>1.1.12</version>
    <scope>compile</scope>
</dependency>
<!-- mysql驱动 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.17</version>
</dependency>
<!-- 连接池 -->
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>
<!-- lombok 快速get set 可选 -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.24</version>
</dependency>
```

### 新建java类
```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private Integer no;
    @UpdateIgnore
    private LocalDateTime createTime;
}
```


::: tip 说明!!!
> idea 工具栏点击build => build project进行生成

> 会在target包下的xgenerated-sources下生成`TopicProxy.java`类

> 如果idea无法智能提示那么就刷新一下maven
:::
### 初始化代码
```java

public class Main {
    public static void main(String[] args) {
        //设置日志打印为控制台
        LogFactory.useStdOutLogging();
        //初始化连接池
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/console-demo?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setMaximumPoolSize(20);

        //初始化属性模式
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(true);//设置不允许物理删除
                    op.setPrintSql(true);//设置以log.info模式打印执行sql信息
                })
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)//替换框架内部的属性和列转换模式改为大写转下划线
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//设置方言语法等为mysql的
                .build();
        //创建代理模式api查询
        EasyProxyQuery easyProxyQuery = new DefaultEasyProxyQuery(easyQueryClient);
        List<Topic> topics = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                .where((filter, o) -> filter.eq(o.id(), "123").like(o.name(), "您好"))
                .orderByAsc((order, o) -> order.columns(o.createTime(), o.id()))
                .select((selector, o) -> selector.columns(o.no(), o.id(), o.name()))
                .toList();
    }
}
```

```sql
==> Preparing: SELECT `no`,`id`,`name` FROM `t_topic` WHERE `id` = ? AND `name` LIKE ? ORDER BY `create_time` ASC,`id` ASC
==> Parameters: 123(String),%您好%(String)
<== Time Elapsed: 17(ms)
<== Total: 0
```



::: tip 说明!!!
> 在代理模式下面查询相关方法都会多一个`'选择器'`委托入参,而不是仅仅只有表入参,比如`where`,原先如果是一张表那么可以写成`where(t->...)`现在必须要写成`where((f,t)->....)`其中第一个参数用来实现条件判断
:::