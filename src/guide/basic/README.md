---
title: 基础配置Java
order: 10
---

# 安装软件

## spring-boot工程
```xml
<properties>
    <easy-query.version>last-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
```yml
#配置文件
easy-query:
  enable: true
  database: mysql
  name-conversion: underlined
  delete-throw: true
  print-sql: true
```
```java
//依赖注入
@Autowired
private EasyQueryClient easyQueryClient;//通过字符串属性方式来实现查询

//推荐
@Autowired
private EasyQuery easyQuery;//对EasyQueryClient的增强通过lambda方式实现查询(推荐)
```

## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`easy-query`获取最新安装包



## 非spring-boot初始化
```xml

<properties>
    <easy-query.version>last-version</easy-query.version>
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
```java
//非强类型api
 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
 .setDataSource(dataSource)
 .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
//强类型api
 EasyQuery easyQuery = new DefaultEasyQuery(easyQueryClient);
```

## 演示数据

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
```