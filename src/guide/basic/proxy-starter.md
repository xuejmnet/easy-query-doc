---
title: 使用代理模式
---

# 代理模式
`easy-query`提供了多种api接口方便用户调用,其中代理模式的使用上面更加符合人性化,如果您是c#开发人员那么肯定这种模式相对的会更加适合您的开发理念

加群配合插件可以快速生成apt代理类无需每次都要`build`

## 🔔交流QQ群
::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:100px;">

#### EasyQuery官方QQ群: 170029046
:::

## psvm下

### 安装依赖

`easy-query.version`版本建议大于1.7.5+
```xml

<!-- easy-query mysql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!-- apt生成代理类 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!-- 代理api -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
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


::: warning 说明!!!
> 如果您的项目是多模块,请在对应模块需要生成代理对象的类处都添加`sql-processor`
:::

### 新建java类
```java
@Data
@Table("t_topic")
@EntityProxy //必须添加这个注解
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
        //第一种写法
        List<Topic> topics = easyProxyQuery.queryable(TopicProxy.createTable())
                .where(o -> o.eq(o.t().id(), "123").like(o.t().name(), "您好"))
                .orderByAsc(o -> o.columns(o.t().createTime(), o.t().id()))
                .select(o -> o.columns(o.t().no(), o.t().id(), o.t().name()))
                .toList();
        //第二种写法提取表变量
        TopicProxy table = TopicProxy.createTable();
        List<Topic> topics = easyProxyQuery.queryable(table)
                .where(o -> o.eq(table.id(), "123").like(table.name(), "您好"))//表达式内部直接用表变量
                .orderByAsc(o -> o.columns(table.createTime(), table.id()))
                .select(o -> o.columns(table.no(), o.t().id(), table.name()))
                .toList();
        //join写法 更加直观
        TopicTestProxy table = TopicTestProxy.createTable();
        TopicAutoProxy table1 = TopicAutoProxy.createTable();
        List<Topic> list = easyProxyQuery
                .queryable(table)
                .leftJoin(table1, o -> o.eq(table.id(), table1.title()))
                .where(o -> o.eq(table.id(), "123")
                        .or().eq(table1.title(), "111"))
                .orderByAsc(o -> o.column(table1.id()))
                .select(s -> s.columns(table1.id(), table1.createTime()).column(table.title()))
                .toList();
    }
}
```

```sql
==> Preparing: SELECT `no`,`id`,`name` FROM `t_topic` WHERE `id` = ? AND `name` LIKE ? ORDER BY `create_time` ASC,`id` ASC
==> Parameters: 123(String),%您好%(String)
<== Time Elapsed: 17(ms)
<== Total: 0


-- join写法
==> Preparing: SELECT t1.`id`,t1.`create_time`,t.`title` FROM `t_topic` t LEFT JOIN `t_topic_auto` t1 ON t.`id` = t1.`title` WHERE (t.`id` = ? OR t1.`title` = ?) ORDER BY t1.`id` ASC
==> Parameters: 123(String),111(String)
<== Time Elapsed: 52(ms)
<== Total: 0
```



::: tip 说明!!!
> 在代理模式下面查询相关方法入参都只有一个,比如入参为o那么对应的表就是o.t(),o.t1(),o.t2()....o.t9()分别对应上下文10张表,也可以讲`queryable`,`join`需要的表进行参数提取,作为局部变量来使用
:::