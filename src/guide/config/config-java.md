---
title: 基础配置Java
order: 10
---

# 安装软件

- [如果您是《Spring Boot》程序那么请直接点击跳转](/easy-query-doc/guide/config/config-spring-boot)
- [如果您是《Solon》程序那么请直接点击跳转](/easy-query-doc/guide/config/config-solon)

## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`com.easy-query`获取最新安装包

## api接口选型
目前`easy-query`支持三种api接口方式：字符串属性,lambda属性,代理属性三种api接口调用,且可以互相调用

::: code-tabs
@tab lambda属性
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了以java语法强类型,如果不引用也可以使用只是无法使用lambda表达式来表示属性只能用字符串 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api4j</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
@tab 代理属性
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了代理模式支持apt模式以非lambda形式的强类型sql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了apt自动生成代理对象 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
@tab 字符串属性
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
:::

## 使用示例

::: code-tabs
@tab lambda属性
```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
Topic topic = easyQuery.queryable(Topic.class)
        .where(t -> t.eq(Topic::getId,"3").or().like(Topic::getTitle,"你好"))
        .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR `title` LIKE ?) LIMIT 1
==> Parameters: 3(String),%你好%(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
@tab 代理属性
```java

@Data
@Table("t_topic")
@EntityProxy //添加这个属性那么Topic对象会代理生成TopicProxy (需要idea build一下当前项目)
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
Topic topic = easyProxyQuery.queryable(TopicProxy.DEFAULT)
                .where((filter, t) -> filter.eq(t.id(), "3").or().like(t.title(), "你好"))
                .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR `title` LIKE ?) LIMIT 1
==> Parameters: 3(String),%你好%(String)
<== Time Elapsed: 3(ms)
<== Total: 1
```
@tab 字符串属性
```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

Topic topic =  easyQueryClient.queryable(Topic.class)
        .where(t->t.eq("id","3").or().like("title","你好"))
        .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR `title` LIKE ?) LIMIT 1
==> Parameters: 3(String),%你好%(String)
<== Time Elapsed: 2(ms)
<== Total: 1
```
:::

语义上面来讲代理模式最好,更符合sql语法




## 非spring-boot初始化

::: tip 说明!!!
> 使用代理模式的话非springboot环境必须要安装`sql-api-proxy`和`sql-processor`,springboot环境`starter`已经包含了
:::
```xml

<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了代理模式支持apt模式以非lambda形式的强类型sql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了apt自动生成代理对象 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了以java语法强类型,如果不引用也可以使用只是无法使用lambda表达式来表示属性只能用字符串 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api4j</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
```java
//非强类型api
 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
 .setDataSource(dataSource)
 .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
//强类型api
 EasyQuery easyQuery = new DefaultEasyQuery(easyQueryClient);
//强类型api
 EasyProxyuery easyProxyQuery = new DefaultEasyProxyQuery(easyQueryClient);
```

<!-- ## 演示数据

```java
@Data
@Table("t_topic")
@ToString
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}

@Data
public class BaseEntity implements Serializable {
    private static final long serialVersionUID = -4834048418175625051L;

    @Column(primaryKey = true)
    private String id;
    /**
     * 创建时间;创建时间
     */
    private LocalDateTime createTime;
    /**
     * 修改时间;修改时间
     */
    private LocalDateTime updateTime;
    /**
     * 创建人;创建人
     */
    private String createBy;
    /**
     * 修改人;修改人
     */
    private String updateBy;
    /**
     * 是否删除;是否删除
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    private Boolean deleted;
}


@Data
@Table("t_blog")
public class BlogEntity extends BaseEntity{
    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    private String content;
    /**
     * 博客链接
     */
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}



@Data
public class TopicGroupTestDTO {
    private String id;
    
    private Integer idCount;
}


@Data
public class BlogEntityTest2 {

    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    private String content;
    /**
     * 博客链接
     */
    @Column("my_url")
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}
``` -->