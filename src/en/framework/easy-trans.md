---
title: easy-trans Extension
order: 80
---

`easy-query` provides many rich features, but some functions can be implemented through other frameworks. This chapter provides a solution to automatically obtain data dictionaries through `easy-query`+`easy-trans`


[`demo address`](https://gitee.com/xuejm/easy-trans-easy-query-demo)

:::warning 
easy-trans.is-enable-global=true, by default `toPageResult` is a `final` result. If you need support, you can implement `EasyPageResultProvider` or `Pager<TEntity,TPageResult>` interface yourself. Other return results also need to note that the returned object cannot be final
:::

::: warning Notes and Explanation!!!
> If integration doesn't work, please check whether global translation is enabled in the configuration file `easy-trans.is-enable-global=true`
:::


## Create a new springboot project
Add `easy-trans` dependencies
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
All dependencies:
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
    <!--druid dependency-->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.15</version>
    </dependency>
    <!-- mysql driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.31</version>
    </dependency>
    <dependency>
        <groupId>com.easy-query</groupId>
        <artifactId>sql-springboot-starter</artifactId>
        <version>${easy-query.version}</version>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.40</version>
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

## Configure bean
Due to limitations of `easy-trans` (static methods), we need to add a special annotation to identify the primary key
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.FIELD})
public @interface Id4Trans {
}
```

Add driver
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
            log.error(targetClass + " no data found by id:" + id);
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
            log.error(targetClass + " no data found by id:" + id);
        }
        return vo;
    }
}

```

Add configuration file
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

Now we have completed the adaptation

## Database Script
```sql
CREATE DATABASE IF NOT EXISTS easy_trans_demo CHARACTER SET 'utf8mb4';
USE easy_trans_demo;
create table help_code
(
    code varchar(32) not null comment 'code'primary key,
    type int not null comment 'type',
    name varchar(50) not null comment 'Chinese value'
)comment 'dictionary table';

insert into help_code values('1',1,'Male');
insert into help_code values('2',1,'Female');
insert into help_code values('3',2,'Administrator');
insert into help_code values('4',2,'Normal User');


create table sys_user
(
    id varchar(32) not null comment 'id'primary key,
    name varchar(50) not null comment 'name',
    sex varchar(50) not null comment 'gender',
    type varchar(50) not null comment 'user type'
)comment 'user table';
insert into sys_user values('1','XiaoMing','2','3');
insert into sys_user values('2','XiaoGang','1','4');
```

## Create Objects
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
    @Trans(type = TransType.DICTIONARY,key = "1",ref = "sexName")//1 is help_code type=1
    private String sex;
    @ColumnIgnore
    private String sexName;
    @Trans(type = TransType.DICTIONARY,key = "2",ref = "typeName")//2 is help_code type=2
    private String type;
    @ColumnIgnore
    private String typeName;
}


```

## Add Translation Cache Service
```java
@Component
public class EasyTransRunner implements ApplicationRunner {
    @Autowired  //Inject dictionary translation service
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

## Test Add Controller
```java

@RestController
@RequestMapping("/my")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyController {

    private final EasyEntityQuery easyEntityQuery;

    @GetMapping("/query")
    public Object query() {
        List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
                .toList();
        return list;
    }
}
```

Output
```json
[{"id":"1","name":"XiaoMing","sex":"2","sexName":"Female","type":"3","typeName":"Administrator"},{"id":"2","name":"XiaoGang","sex":"1","sexName":"Male","type":"4","typeName":"Normal User"}]
```

