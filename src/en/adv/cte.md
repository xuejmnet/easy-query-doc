---
title: CTE Common Table Expression
order: 170
---

# CTE Common Table Expression
`Common Table Expression` abbreviated as `cte`, eq supports both explicit and encapsulation methods

## Explicit CTE

`WITH CTE AS()` uses this API to implement reusing temporary tables in the current expression

`toCteAs` converts the previous expression into a `cte` temporary table
```java
EntityQueryable<TopicProxy, Topic> cteAs = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.id().eq("456");
        }).toCteAs();//Supports passing table name to implement custom table name

List<Topic> list1 = easyEntityQuery.queryable(Topic.class)
        .leftJoin(cteAs, (t_topic, t2) -> t_topic.id().eq(t2.id()))
        .leftJoin(cteAs, (t_topic, t_topic2, t3) -> t_topic.id().eq(t3.id()))
        .where((t_topic, t_topic2, t_topic3) -> {
            t_topic.id().eq("123");
            t_topic3.id().eq("t2123");
        }).toList();



-- SQL data 1
WITH `with_Topic` AS (SELECT
    t1.`id`,
    t1.`stars`,
    t1.`title`,
    t1.`create_time` 
FROM
    `t_topic` t1 
WHERE
    t1.`id` = '456')  

SELECT
    t.`id`,
    t.`stars`,
    t.`title`,
    t.`create_time` 
FROM
    `t_topic` t 
LEFT JOIN
    `with_Topic` t2 
        ON t.`id` = t2.`id` 
LEFT JOIN
    `with_Topic` t3 
        ON t.`id` = t3.`id` 
WHERE
    t.`id` = '123' 
    AND t3.`id` = 't2123'
```


## CTE View Java Encapsulation
Use cte to define temporary variable tables, encapsulate views at the Java level through entity objects for quick encapsulation and implementation

## EntityCteViewer
Define this interface to configure the view

### viewConfigure
Create expression mapping to the current entity result. Using this entity subsequently can easily implement encapsulation of this result




## Partition and Group Quick Implementation
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

Execute expression filtering
```java

        List<M8UserTemp2> list = easyEntityQuery.queryable(M8UserTemp2.class)
                .where(m -> {
                    m.rowNumber().eq(2L);
                }).toList();
```

Execute SQL
```sql

-- SQL data 1

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


## View Defines Object Relationships

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

Define entity relationships like database object tables
```java


        List<M8UserTemp> list = easyEntityQuery.queryable(M8UserTemp.class)
                .where(m -> {
                    m.name().contains("123");
                }).toList();

```
Execute SQL
```sql


-- SQL data 1

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

Filter object relationship properties
```java

        List<M8UserTemp> list = easyEntityQuery.queryable(M8UserTemp.class)
                .where(m -> {
                    m.roles().flatElement().name().contains("123");
                }).toList();
```

Execute SQL
```sql


-- SQL data 1

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

