---
title: 快速开始🔥🔥🔥
---

## 简介
在使用前您需要知晓目前1.8.0+版本的`easy-query`提供了4中api机制分别是`lambda`、`property`、`proxy`、`entity`其中每个api都有自己的特点,其中`entityQuery`是最新开发的api,使用起来非常顺畅流畅,非常推荐,4种模式可以在一个应用里面共存

## EntityQuery
本次我们采用`entityQuery`来实现优雅的crud

## idea 插件安装
插件的安装可以帮助我们针对自动生成的文件进行快速管理无感.
<img src="/plugin-search.png">

## 依赖注入
```xml
    <dependencies>
        <!-- 核心包 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-core</artifactId>
            <version>${easy-query.version}</version>
            <scope>compile</scope>
        </dependency>
        <!-- mysql方言 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${easy-query.version}</version>
            <scope>compile</scope>
        </dependency>
        <!-- entity-query的api包 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${easy-query.version}</version>
            <scope>compile</scope>
        </dependency>
        <!-- mysql驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.17</version>
        </dependency>
        <!-- 数据源 -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>3.3.1</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.24</version>
        </dependency>
    </dependencies>
```

## 数据库表对象

::: code-tabs
@tab 数据库对象
```java
@Data
@Table("t_topic")
public class Topic{

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```
@tab 数据库脚本
```sql
create table t_topic
(
    id varchar(32) not null comment '主键ID'primary key,
    stars int not null comment '点赞数',
    title varchar(50) null comment '标题',
    create_time datetime not null comment '创建时间'
)comment '主题表';
```
:::

## 自动生成
- `@EntityFileProxy`这个注解会在当前类同级包下创建一个proxy包并且生成对应的代理对象用来操作 生成到源码文件里面
- `@EntityProxy`这个注解会在当前类同级包下创建一个proxy包并且生成对应的代理对象用来操作 生成到`target`目录下需要build


这两个注解仅生成文件路径不一样,file的需要插件支持,没有file的需要引入`sql-processor`包
<img src="/topic-entity.png">

<img src="/topic-plugin-use1.png">

添加注解后呼出`Generate`不知道快捷键就右键生成`get set`的那个菜单

<img src="/topic-plugin-use2.png">

<img src="/topic-plugin-use3.png">

## 运行
```java

public class Main {
    public static void main(String[] args) {

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setMaximumPoolSize(20);
        //采用控制台输出打印sql
        LogFactory.useStdOutLogging();
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setPrintSql(true);
                    op.setKeepNativeStyle(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        DefaultEntityQuery entityQuery = new DefaultEntityQuery(easyQueryClient);

        Topic topic = entityQuery.queryable(Topic.class)
                .whereById("1").firstOrNull();


        System.out.println("Hello world!");
    }
}

//打印的sql
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 14(ms)
<== Total: 1
```


### 单个查询
```java

//根据id查询第一条
Topic topic1 = entityQuery.queryable(Topic.class)
        .whereById("1").firstOrNull();
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 10(ms)
<== Total: 1


//根据id查询并且断言仅一条
Topic topic2 = entityQuery.queryable(Topic.class)
        .whereById("1").singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 6(ms)
<== Total: 1


//根据id查询自定义条件返回第一条
Topic topic3 = entityQuery.queryable(Topic.class)
        .where(o -> {
            o.id().eq("1");
        })
        .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 7(ms)
<== Total: 1
```

### 返回列表
```java
List<Topic> list = entityQuery.queryable(Topic.class)
        .where(o -> {
            o.id().eq("1");
        })
        .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 10(ms)
<== Total: 1
```

### count查询
```java

long count = entityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("11");
            o.createTime().le(LocalDateTime.now());
        }).count();

long intCount = entityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("11");
            o.createTime().le(LocalDateTime.now());
        }).intCount();

==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `title` LIKE ? AND `create_time` <= ?
==> Parameters: %11%(String),2023-12-16T14:17:04.065(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 1
```

### 返回自定义列
```java

List<Topic> list = entityQuery.queryable(Topic.class)
        .where(o->{
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o->o.FETCHER.id().title())//仅返回id和title
        .toList();



==> Preparing: SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 4(ms)
<== Total: 98


List<Topic> list = entityQuery.queryable(Topic.class)
        .where(o->{
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o->o.FETCHER.allFieldsExclude(o.id()))//返回所有字段除了id
        .toList();

==> Preparing: SELECT t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 98
```

### 分组
```java
List<Topic> list = entityQuery.queryable(Topic.class)
        .where(o->{
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
        })
        .groupBy(o-> GroupBy.of(
                o.id()
        ))
        .select(Topic.class,(o,tr)->Select.of(
                o.id(),
                o.id().count().as(tr.stars())//count(id) as stars
        ))
        .toList();
        

==> Preparing: SELECT t.`id`,COUNT(t.`id`) AS `stars` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? GROUP BY t.`id`
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 98
```

### 分页
```java

EasyPageResult<Topic> pageResult = entityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022, 2, 1, 3, 4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o -> o.FETCHER.id().title())
        .toPageResult(1, 20);



==> Preparing: SELECT COUNT(*) FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ?
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC LIMIT 20
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 20
```

### join多表查询

```java
List<Topic> list = entityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {//第一个参数t表示第一个表,第二个参数t1表示第二个表
            t.id().eq(t1.id());// ON t.`id` = t1.`id`
        })
        .where((t, t1) -> {
            t.title().like("11");
            t1.createTime().le(LocalDateTime.of(2021, 1, 1, 1, 1));
        }).select(Topic.class, (t, t1, tr) -> {//t表示sql的第一个表,t1表示第二个表,tr表示返回的结果匿名表
            TopicProxy.TopicProxyFetcher idAndStars = t.FETCHER.id().stars();
            TopicProxy.TopicProxyFetcher idAsTitle = t1.FETCHER.id().as(tr.title());
            return Select.of(idAndStars, idAsTitle);
        }).toList();


==> Preparing: SELECT t.`id`,t.`stars`,t1.`id` AS `title` FROM `t_topic` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`title` LIKE ? AND t1.`create_time` <= ?
==> Parameters: %11%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 0
```
可能第一眼觉得select过于复杂
```java
List<Topic> list = entityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {
            t.id().eq(t1.id());
        })
        .where((t, t1) -> {
            t.title().like("11");
            t1.createTime().le(LocalDateTime.of(2021, 1, 1, 1, 1));
        }).select(Topic.class, (t, t1, tr) -> Select.of(
                    t.FETCHER.id().stars(),//这两者写法是一样的`FETCHER`是为了链式你也可以不用fetcher
                    t1.FETCHER.id().as(tr.title())
            )).toList();



List<Topic> list = entityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {
            t.id().eq(t1.id());
        })
        .where((t, t1) -> {
            t.title().like("11");
            t1.createTime().le(LocalDateTime.of(2021, 1, 1, 1, 1));
        }).select(Topic.class, (t, t1, tr) -> Select.of(
                    t.id(),//不使用`FETCHER`直接返回也是可以的
                    t1.stars(),
                    t1.id().as(tr.title())
            )).toList();
```

### 排序

```java

List<Topic> list = entityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {
            t.id().eq(t1.id());
        })
        .orderBy((t, t1) -> {
            t.id().asc();
            t1.createTime().desc();
        })
        //查询t表的所有除了id和title,并且返回t1的title取别名为id
        .select(Topic.class,(t,t1,tr)->t.allFieldsExclude(t.id(),t.title())._concat(t1.title().as(tr.id())))
        .toList();

==> Preparing: SELECT t.`stars`,t.`create_time`,t1.`title` AS `id` FROM `t_topic` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` ORDER BY t.`id` ASC,t1.`create_time` DESC
<== Time Elapsed: 6(ms)
<== Total: 101
```