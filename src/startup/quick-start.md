---
title: 快速开始🔥🔥🔥
---

## 简介
在使用前您需要知晓目前1.8.0+版本的`easy-query`提供了4中api机制分别是`lambda`、`property`、`proxy`、`entity`其中每个api都有自己的特点,其中`easyEntityQuery`是最新开发的api,使用起来非常顺畅流畅,非常推荐,4种模式可以在一个应用里面共存

## EntityQuery
`EasyEntityQuery`接口为`EntityQuery`暴露给用户的`crud`api接口,我们的主要操作处理都是通过该接口实现的,要实现这个功能有以下两种方式

- @EntityProxy (推荐🔥🔥🔥) 配合`sql-processor`包使用apt，支持`clear`重新`build`生成
- @EntityFileProxy 配合插件将原本apt生成到src目录然后操作,适合电脑相对较差的用户因为不需要一直build来保证apt的正确生成(不是很推荐因为依赖插件) 


这边建议推荐使用`@EntityProxy`+`sql-processor`包因为这样可以保证在其他`IDE`下也能使用并且不依赖插件

具体的easy-query包版本可以在文档首页进行查看当前是  
<a target="_blank" href="https://central.sonatype.com/search?q=easy-query">
        <img src="https://img.shields.io/maven-central/v/com.easy-query/easy-query-all?label=Maven%20Central" alt="Maven" />
    </a>



# EntityProxy 推荐🔥🔥🔥
新建一个`java8`以上的任意项目我们创建maven的空项目即可然后引入对应的包
## 依赖注入
```xml
    <dependencies>
        <!-- mysql方言 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-mysql</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- entity-query的api包 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-api-proxy</artifactId>
            <version>${easy-query.version}</version>
        </dependency>
        <!-- entity-query的apt包 如果你是多模块只需要在生成apt的对象模块处需要引入 -->
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-processor</artifactId>
            <version>${easy-query.version}</version>
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
@EntityProxy
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

## 生成apt文件

<img src="/startup1.png">

如果存在如下情况无法获取到`TopicProxy`对象那么就将目录标记为生成目录

<img src="/startup2.png">

::: warning 说明!!!
> 如果您还是不行那么建议您点击idea右侧的maven刷新按钮进行刷新即可
:::

<img src="/startup4.png">

## 添加数据库对象接口
实现接口即可
<img src="/startup3.png">


::: warning 说明!!!
> 如果您的项目是多模块那么只需要在需要使用@EntityProxy注解的模块下使用`sql-processor`即可
:::


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
        //property的api
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setPrintSql(true);
                    op.setKeepNativeStyle(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
                
        EasyEntityQuery easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);

        //根据id查询第一条
        Topic topic1 = easyEntityQuery.queryable(Topic.class)
                .whereById("1").firstOrNull();

        //根据id查询并且断言仅一条
        Topic topic2 = easyEntityQuery.queryable(Topic.class)
                .whereById("1").singleOrNull();
        //根据id查询自定义条件返回第一条
        Topic topic3 = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.id().eq("1");
                })
                .firstOrNull();

        //根据条件返回符合的集合默认ArrayList实现
        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.id().eq("1");
                })
                .toList();
        //判断小明是否存在
       boolean exists= easyEntityQuery.queryable(Topic.class).where(o->o.name().like("小明")).any();
       //断言小明是否存在
       easyEntityQuery.queryable(Topic.class).where(o->o.name().like("小明")).required("未找到小明");

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
Topic topic1 = easyEntityQuery.queryable(Topic.class)
        .whereById("1").firstOrNull();
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 10(ms)
<== Total: 1


//根据id查询并且断言仅一条
Topic topic2 = easyEntityQuery.queryable(Topic.class)
        .whereById("1").singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 6(ms)
<== Total: 1


//根据id查询自定义条件返回第一条
Topic topic3 = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            o.id().eq("1");
        })
        .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
<== Time Elapsed: 7(ms)
<== Total: 1


//根据id查询
Topic topic2 = easyEntityQuery.queryable(Topic.class)
        .findOrNull("1");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 6(ms)
<== Total: 1
```

### 返回列表
```java
List<Topic> list = easyEntityQuery.queryable(Topic.class)
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

long count = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("11");
            o.createTime().le(LocalDateTime.now());
        }).count();

int intCount = easyEntityQuery.queryable(Topic.class)
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

@Data
@EntityProxy
public class TopicVO{
    private String id;
    private String title;
}

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o->{
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o->new TopicVOProxy().adapter(r->{
            r.id().set(o.id()); //手动指定赋值
            r.title().set(o.title())
        }))
        .toList();



==> Preparing: SELECT t.`id` as `id`,t.`title` as `title` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 4(ms)
<== Total: 98


List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(o->{
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o->new TopicProxy().adapter(r->{
            r.selectAll(o);//查询所有
            r.selectIgnores(o.id());//忽略id
        }))
        .toList();

==> Preparing: SELECT t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 98
```

### 分组
```java
 List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o->{
                    o.title().like("123");
                    o.createTime().ge(LocalDateTime.of(2022,2,1,3,4));
                })
                //会生成{key1:x,key2:x.... group:{t1:xx,t2:xx}}其中key1...keyn表示key默认支持10个 t1...tn表示前面的表
                //无论join了多少张表group后全部只有一个入参参数其余参数在group属性里面
                .groupBy(o-> GroupKeys.TABLE1.of(o.id()))
                .select(o->new TopicProxy().adapter(r->{
                    r.id().set(o.key1());//key1就是id
                    r.stars().set(o.intCount());//COUNT(*)返回int 默认返回long类型
                }))
                .toList();

==> Preparing: SELECT t.`id` AS `id`,COUNT(*) AS `stars` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? GROUP BY t.`id`
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)


//草稿模式无需定义返回结果,返回草稿支持1-10 Draft1-Draft10
List<Draft3<String, Integer, Integer>> list = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022, 2, 1, 3, 4));
        })
        .groupBy(o -> GroupKeys.TABLE1.of(o.id()))
        .select(o -> new TopicProxy().adapter(r->{
            r.id().set(o.key1());//key1就是id
            r.stars().set(o.intCount());//COUNT(*)返回int 默认返回long类型
        }))
        .select(o -> Select.DRAFT.of(
                o.id().nullOrDefault("123"),//如果为空就赋值123
                o.stars(),
                o.stars().abs()//取绝对值
        ))
        .toList();


==> Preparing: SELECT IFNULL(t1.`id`,?) AS `value1`,t1.`stars` AS `value2`,ABS(t1.`stars`) AS `value3` FROM (SELECT t.`id` AS `id`,COUNT(*) AS `stars` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? GROUP BY t.`id`) t1
==> Parameters: 123(String),%123%(String),2022-02-01T03:04(LocalDateTime)
```

### 分页
```java

EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .where(o -> {
            o.title().like("123");
            o.createTime().ge(LocalDateTime.of(2022, 2, 1, 3, 4));
        })
        .orderBy(o -> {
            o.id().asc();
            o.createTime().desc();
        })
        .select(o -> new TopicProxy().adapter(r->{
            r.selectExpression(o.id(),o.title());//表达式仅查询id和title
            //下面的和上面的一致 下面的是手动指定返回结果
            //如果查询列名和VO结果一致那么可以不需要手动指定
            //r.id().set(o.id());
            //r.title().set(o.title());
        }))
        //.select(o->new TopicProxy())//全属性映射等于selectAll(o)
        .toPageResult(1, 20);


==> Preparing: SELECT COUNT(*) FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ?
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`title` LIKE ? AND t.`create_time` >= ? ORDER BY t.`id` ASC,t.`create_time` DESC LIMIT 20
==> Parameters: %123%(String),2022-02-01T03:04(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 20
```

### join多表查询

```java

@Data
@EntityProxy
public class TopicVO{
    private String id;
    private String title;
    private Integer stars;
}

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {//第一个参数t表示第一个表,第二个参数t1表示第二个表
            t.id().eq(t1.id());// ON t.`id` = t1.`id`
        })
        .where((t, t1) -> {
            t.title().like("11");
            t1.createTime().le(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1) -> new TopicVOProxy().adapter(r->{
            r.id().set(t.id());
            r.stars().set(t.stars());
            r.title().set(t1.id());
        })).toList();


==> Preparing: SELECT t.`id` AS `id`,t.`stars` AS `stars`,t1.`id` AS `title` FROM `t_topic` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`title` LIKE ? AND t1.`create_time` <= ?
==> Parameters: %11%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 12(ms)
<== Total: 0
```

### 排序

```java

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .leftJoin(Topic.class, (t, t1) -> {
            t.id().eq(t1.id());
        })
        .orderBy((t, t1) -> {
            t.id().asc();
            t1.createTime().desc();
        })
        //查询t表的所有除了id和title,并且返回t1的title取别名为content
        .select((t,t1)->new TopicProxy().adapter(r->{
            r.selectAll(t);
            r.selectIgnores(t.id(),t.title());
            r.id().set(t1.title());
        }))
        .toList();

==> Preparing: SELECT t.`stars`,t.`create_time`,t1.`title` AS `id` FROM `t_topic` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` ORDER BY t.`id` ASC,t1.`create_time` DESC
<== Time Elapsed: 14(ms)
<== Total: 101

//使用草稿无需定义返回结果
List<Draft3<Integer, LocalDateTime, String>> list = easyEntityQuery.queryable(Topic.class)
                .leftJoin(Topic.class, (t, t1) -> {
                    t.id().eq(t1.id());
                })
                .orderBy((t, t1) -> {
                    t.id().asc();
                    t1.createTime().desc();
                })
                .select((t, t1) -> Select.DRAFT.of(
                        t.stars(),
                        t.createTime(),
                        t1.title()
                ))
                .toList();

==> Preparing: SELECT t.`stars` AS `value1`,t.`create_time` AS `value2`,t1.`title` AS `value3` FROM `t_topic` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` ORDER BY t.`id` ASC,t1.`create_time` DESC
```