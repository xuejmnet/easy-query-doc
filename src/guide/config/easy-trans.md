---
title: easy-trans扩展
---

`easy-query`提供了很多丰富的功能,但是有些功能可以通过其他框架来实现,本章节就提供了一个解决方案,通过`easy-query`+`easy-trans`来实现数据字典的自动获取


[`demo地址`](https://gitee.com/xuejm/easy-trans-easy-query-demo)

:::warning 
easy-trans.is-enable-global=true
:::

::: warning 注意点及说明!!!
> 如果集成后不行请注意是否开启全局翻译 配置文件`easy-trans.is-enable-global=true`
:::


## 新建一个springboot项目
添加`easy-trans`依赖
```xml
<dependency>
     <groupId>com.fhs-opensource</groupId>
    <artifactId>easy-trans-spring-boot-starter</artifactId>
    <version>2.2.7</version>
</dependency>
<dependency>
    <groupId>com.fhs-opensource</groupId>
    <artifactId>easy-trans-service</artifactId>
    <version>2.2.7</version>
</dependency>
```
所有的依赖是
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-aop</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <!--druid依赖-->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.15</version>
    </dependency>
    <!-- mysql驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.31</version>
    </dependency>
    <dependency>
        <groupId>com.easy-query</groupId>
        <artifactId>sql-springboot-starter</artifactId>
        <version>1.4.27</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.18</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
<dependency>
     <groupId>com.fhs-opensource</groupId>
    <artifactId>easy-trans-spring-boot-starter</artifactId>
    <version>2.2.7</version>
</dependency>
    <dependency>
        <groupId>com.fhs-opensource</groupId>
        <artifactId>easy-trans-service</artifactId>
        <version>2.2.7</version>
    </dependency>
</dependencies>
```

## 配置bean
因为`easy-trans`的限制(静态方法)所以这边需要添加一个特殊的注解来标识主键
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD})
public @interface Id4Trans {
}
```

添加驱动
```java
@Slf4j
public class EasyQueryTransDiver implements SimpleTransService.SimpleTransDiver {

    private EasyQueryClient easyQueryClient;

    public EasyQueryTransDiver(EasyQueryClient easyQueryClient){
        this.easyQueryClient = easyQueryClient;
    }

    @Override
    public List<? extends VO> findByIds(List<? extends Serializable> ids, Class<? extends VO> targetClass, String uniqueField, Set<String> targetFields) {
        return easyQueryClient.queryable(targetClass)
                .whereByIds(ids)
                .select(o->{
                    Selector selector = o.getSelector();
                    for (String targetField : targetFields) {
                        selector.column(o.getTable(),targetField);
                    }
                })
                .toList();
    }

    @Override
    public VO findById(Serializable id, Class<? extends VO> targetClass, String uniqueField, Set<String> targetFields) {
        VO vo = easyQueryClient.queryable(targetClass)
                .whereById(id)
                .select(o -> {
                    Selector selector = o.getSelector();
                    for (String targetField : targetFields) {
                        selector.column(o.getTable(), targetField);
                    }
                })
                .firstOrNull();
        if(vo==null){
            log.error(targetClass + " 根据id:" + id + "没有查询到数据");
        }
        return vo;
    }

    @Override
    public List<? extends VO> findByIds(List<? extends Serializable> ids, Class<? extends VO> targetClass, String uniqueField) {
        return easyQueryClient.queryable(targetClass)
                .whereByIds(ids)
                .toList();
    }

    @Override
    public VO findById(Serializable id, Class<? extends VO> targetClass, String uniqueField) {
        VO vo = easyQueryClient.queryable(targetClass)
                .whereById(id).firstOrNull();
        if(vo==null){
            log.error(targetClass + " 根据id:" + id + "没有查询到数据");
        }
        return vo;
    }
}

```

添加配置文件
```java
@Slf4j
@Configuration
public class EasyTransEasyQueryConfig implements InitializingBean {

    @Autowired
    private EasyQueryClient easyQueryClient;

    @Bean
    public EasyQueryTransDiver easyQueryTransDiver() {
        EasyQueryTransDiver result = new EasyQueryTransDiver(easyQueryClient);
        return result;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        ReflectUtils.ID_ANNO.add(Id4Trans.class);
    }
}
```

到这边位我们已经适配好了

## 数据库脚本
```sql
CREATE DATABASE IF NOT EXISTS easy_trans_demo CHARACTER SET 'utf8mb4';
USE easy_trans_demo;
create table help_code
(
    code varchar(32) not null comment 'code'primary key,
    type int not null comment '类型',
    name varchar(50) not null comment '中文值'
)comment '字典表';

insert into help_code values('1',1,'男');
insert into help_code values('2',1,'女');
insert into help_code values('3',2,'管理员');
insert into help_code values('4',2,'普通用户');


create table sys_user
(
    id varchar(32) not null comment 'id'primary key,
    name varchar(50) not null comment '姓名',
    sex varchar(50) not null comment '性别',
    type varchar(50) not null comment '用户类型'
)comment '用户表';
insert into sys_user values('1','小明','2','3');
insert into sys_user values('2','小刚','1','4');
```

## 创建对象
```java

@Table("help_code")
@Data
public class HelpCode {
    @Id4Trans
    @Column(primaryKey = true)
    private String code;
    private Integer type;
    private String name;
}

@Table("sys_user")
@Data
public class SysUser implements TransPojo {
    @Id4Trans
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Trans(type = TransType.DICTIONARY,key = "1",ref = "sexName")//1就是help_code的type=1
    private String sex;
    @ColumnIgnore
    private String sexName;
    @Trans(type = TransType.DICTIONARY,key = "2",ref = "typeName")//2就是help_code的type=2
    private String type;
    @ColumnIgnore
    private String typeName;
}


```

## 添加翻译缓存服务
```java
@Component
public class EasyTransRunner implements ApplicationRunner {
    @Autowired  //注入字典翻译服务
    private DictionaryTransService dictionaryTransService;
    @Autowired
    private EasyQuery easyQuery;
    @Override
    public void run(ApplicationArguments args) throws Exception {
        List<HelpCode> list = easyQuery.queryable(HelpCode.class)
                .toList();
        Map<Integer, List<HelpCode>> collect = list.stream().collect(groupingBy(o -> o.getType()));
        for (Map.Entry<Integer, List<HelpCode>> integerListEntry : collect.entrySet()) {
            HashMap<String, String> transMap = new HashMap<>();
            for (HelpCode helpCode : integerListEntry.getValue()) {
                transMap.put(helpCode.getCode(),helpCode.getName());
            }

            dictionaryTransService.refreshCache(integerListEntry.getKey().toString(),transMap);
        }
    }
}

```

## 测试添加控制器
```java

@RestController
@RequestMapping("/my")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyController {

    private final EasyQuery easyQuery;

    @GetMapping("/query")
    public Object query() {
        List<SysUser> list = easyQuery.queryable(SysUser.class)
                .toList();
        return list;
    }
}
```

输出
```json
[{"id":"1","name":"小明","sex":"2","sexName":"女","type":"3","typeName":"管理员"},{"id":"2","name":"小刚","sex":"1","sexName":"男","type":"4","typeName":"普通用户"}]
```
