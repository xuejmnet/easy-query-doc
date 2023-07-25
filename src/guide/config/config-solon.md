---
title: 国产框架Solon配置
---

## 国产框架Solon配置

`easy-query`在`^1.2.6`正式支持`Solon`适配国产框架的orm部分。

## 什么是Solon
[`Solon`](https://solon.noear.org/) **Java 新的生态型应用开发框架：更快、更小、更简单。**

启动快 5 ～ 10 倍；qps 高 2～ 3 倍；运行时内存节省 1/3 ~ 1/2；打包可以缩到 1/2 ~ 1/10；同时支持 jdk8, jdk11, jdk17, jdk20, graalvm native image。

## 快速开始
## 新建java maven项目

<img src="/easy-qeury-solon-web-install.png">

### 添加项目依赖
```xml
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-solon-plugin</artifactId>
    <version>1.2.6</version>
    <scope>compile</scope>
</dependency>
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>3.3.1</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.31</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.18</version>
</dependency>
<dependency>
    <groupId>org.noear</groupId>
    <artifactId>solon-web</artifactId>
    <version>2.4.0</version>
</dependency>
```

### 新建DataSource注入
```java
@Configuration
public class WebConfiguration {
    @Bean(value = "db1")
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
}

```

### 新增控制器
```java

@Controller
@Mapping("/test")
public class TestController {
    @Mapping(value = "/hello",method = MethodType.GET)
    public String hello(){
        return "Hello World";
    }
}
```

### Solon启动
```yml
# 添加配置文件
db1:
  jdbcUrl: jdbc:mysql://127.0.0.1:3306/easy-query-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
  username: root
  password: root
  driver-class-name: com.mysql.cj.jdbc.Driver

# 记录器级别的配置示例
solon.logging.logger:
  "root": #默认记录器配置
    level: TRACE
  "com.zaxxer.hikari":
    level: WARN
```

```java
public class Main {
    public static void main(String[] args) {
        Solon.start(Main.class,args,(app)->{
            app.cfg().loadAdd("application.yml");
        });
    }
}

//输入url http://localhost:8080/test/hello

//返回Hello World
```

### easy-query查询
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


@Controller
@Mapping("/test")
public class TestController {

    /**
     * 注意必须是配置多数据源的其中一个
     */
    @Db("db1")
    private EasyQuery easyQuery;
    @Mapping(value = "/hello",method = MethodType.GET)
    public String hello(){
        return "Hello World";
    }
    @Mapping(value = "/queryTopic",method = MethodType.GET)
    public Object queryTopic(){
        return easyQuery.queryable(Topic.class)
                .where(o->o.ge(Topic::getStars,2))
                .toList();
    }
}


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `stars` >= ?
==> Parameters: 2(Integer)
<== Time Elapsed: 17(ms)
<== Total: 101

```

<img src="/easy-query-solon-web-query-topic.png" />