---
title: cte视图java封装
order: 170
---

# cte视图java封装
使用cte定义临时变量表,通过实体对象进行封装实现视图的java层面的快速封装与实现

## EntityCteViewer
定义改接口则对视图进行配置

### viewConfigure
创建表达式映射到当前实体结果,后续使用该实体可以非常方便的实现对该结果的封装




## 分区分组快速实现
```java

@Data
@EntityProxy
@Table
@FieldNameConstants
public class M8UserTemp2 implements ProxyEntityAvailable<M8UserTemp2, M8UserTemp2Proxy>, EntityCteViewer<M8UserTemp2> {
    private String id;
    private String name;
    private Integer age;
    private Long rowNumber;


    @Override
    public Supplier<Query<M8UserTemp2>> viewConfigure(QueryRuntimeContext runtimeContext) {
        return () -> {
            SQLClientApiFactory sqlClientApiFactory = runtimeContext.getSQLClientApiFactory();
            ClientQueryable<M8User> queryable = sqlClientApiFactory.createQueryable(M8User.class, runtimeContext);
            return new EasyEntityQueryable<>(M8UserProxy.createTable(), queryable)
                    .where(m -> {
                        m.age().isNull();
                    }).select(M8UserTemp2.class, m -> Select.of(
                            m.FETCHER.allFields(),
                            m.expression().rowNumberOver().partitionBy(m.age()).orderByDescending(m.createTime()).as("rowNumber")
                    ));
        };
    }
}


```

执行表达式筛选
```java

        List<M8UserTemp2> list = easyEntityQuery.queryable(M8UserTemp2.class)
                .where(m -> {
                    m.rowNumber().eq(2L);
                }).toList();
```

执行sql
```sql

-- 第1条sql数据

    WITH `m8_user_temp2` AS (SELECT
        t.`id`, t.`name`, t.`age`, (ROW_NUMBER() OVER (PARTITION 
    BY
        t.`age` 
    ORDER BY
        t.`create_time` DESC)) AS `row_number` FROM `m8_user` t 
    WHERE
        t.`age` IS NULL)
        
    
    SELECT
        t2.`id`,
        t2.`name`,
        t2.`age`,
        t2.`row_number` 
    FROM
        `m8_user_temp2` t2 
    WHERE
        t2.`row_number` = 2
```


## 视图定义对象关系

```java

@Data
@EntityProxy
@Table
@FieldNameConstants
public class M8UserTemp implements ProxyEntityAvailable<M8UserTemp, M8UserTempProxy>, EntityCteViewer<M8UserTemp> {
    private String id;
    private String name;



    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = {M8UserTemp.Fields.id},
            selfMappingProperty = {M8UserRole.Fields.userId},
            mappingClass = M8UserRole.class,
            targetProperty = {M8Role.Fields.id},
            targetMappingProperty = {M8UserRole.Fields.roleId})
    private List<M8Role> roles;

    @Override
    public Supplier<Query<M8UserTemp>> viewConfigure(QueryRuntimeContext runtimeContext) {
        return () -> {
            SQLClientApiFactory sqlClientApiFactory = runtimeContext.getSQLClientApiFactory();
            ClientQueryable<M8User> queryable = sqlClientApiFactory.createQueryable(M8User.class, runtimeContext);
            return new EasyEntityQueryable<>(M8UserProxy.createTable(), queryable)
                    .where(m -> {
                        m.age().isNull();
                    }).select(M8UserTemp.class);
        };
    }
}

```

像数据库对象表一样定义实体关系
```java


        List<M8UserTemp> list = easyEntityQuery.queryable(M8UserTemp.class)
                .where(m -> {
                    m.name().contains("123");
                }).toList();

```
执行sql
```sql


-- 第1条sql数据

    WITH `m8_user_temp` AS (SELECT
        t.`id`, t.`name` FROM `m8_user` t 
    WHERE
        t.`age` IS NULL) 
        
    SELECT
        t2.`id`,
        t2.`name` 
    FROM
        `m8_user_temp` t2 
    WHERE
        t2.`name` LIKE CONCAT('%', '123', '%')
```

筛选对象关系属性
```java

        List<M8UserTemp> list = easyEntityQuery.queryable(M8UserTemp.class)
                .where(m -> {
                    m.roles().flatElement().name().contains("123");
                }).toList();
```

执行sql
```sql


-- 第1条sql数据

    WITH `m8_user_temp` AS (SELECT
        t.`id`, t.`name` FROM `m8_user` t 
    WHERE
        t.`age` IS NULL) 
        
    SELECT
        t2.`id`,
        t2.`name` 
    FROM
        `m8_user_temp` t2 
    WHERE
        EXISTS (SELECT
            1 FROM `m8_role` t3 
        WHERE
            EXISTS (SELECT
                1 FROM `m8_user_role` t4 
            WHERE
                t4.`role_id` = t3.`id` 
                AND t4.`user_id` = t2.`id` 
            LIMIT
                1) 
            AND t3.`name` LIKE CONCAT('%', '123', '%') 
        LIMIT
            1)
```