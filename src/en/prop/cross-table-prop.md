---
title: Cross-Table Computed Properties
order: 9
category:
  - sql
---

## Cross-Table Computed Properties
For example, users and certificates are one-to-many. When querying users, you need to return the number of certificates of the user. This can be achieved through cross-table computed properties. Class and the number of students in the class.
In summary, cross-table computed properties are dynamic properties that do not exist in the database, formed by one or more data from the current object or cross-table data through certain functions, and this property supports filtering, sorting, and grouping operations.


```java

@Table("school_class")
@Data
@ToString
@EntityProxy
public class SchoolClassAggregateProp implements ProxyEntityAvailable<SchoolClassAggregateProp, SchoolClassAggregatePropProxy> {
    @Column(primaryKey = true)//Primary key
    private String id;
    private String name;
    //One-to-many: one class has many students
    @Navigate(value = RelationTypeEnum.OneToMany, targetProperty = "classId")
    private List<SchoolStudent> schoolStudents;

    @Column(sqlConversion = StudentSizeColumnValueSQLConverter.class,autoSelect = false)
    @InsertIgnore
    @UpdateIgnore
    private Long studentSize;

}

```
###
```java
//Student count complex computed property
public class StudentSizeColumnValueSQLConverter implements ColumnValueSQLConverter {
    @Override
    public boolean isRealColumn() {
        return false;
    }

    @Override
    public boolean isMergeSubQuery() {
        return true;
    }

    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLClientApiFactory sqlClientApiFactory = runtimeContext.getSQLClientApiFactory();
        ClientQueryable<SchoolStudent> queryable = sqlClientApiFactory.createQueryable(SchoolStudent.class, runtimeContext);
        ClientQueryable<Long> studentSizeQuery = queryable.where(t -> t.eq(new SimpleEntitySQLTableOwner<>(table), "classId", "id"))
                .select(Long.class,s -> s.columnCount("id"));

        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.expression(studentSizeQuery);
            context.setAlias(columnMetadata.getName());
        });
    }
    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLClientApiFactory sqlClientApiFactory = runtimeContext.getSQLClientApiFactory();
        ClientQueryable<SchoolStudent> queryable = sqlClientApiFactory.createQueryable(SchoolStudent.class, runtimeContext);
        ClientQueryable<Long> studentSizeQuery = queryable.where(t -> t.eq(new SimpleEntitySQLTableOwner<>(table), "classId", "id"))
                .select(Long.class,s -> s.columnCount("id"));

        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.expression(studentSizeQuery);
        });
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext, boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


```

### Query
```java
//Because autoSelect=false is added, the aggregate column is not queried by default
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).toList();

SELECT t.`id`,t.`name` FROM `school_class` t

//Query allFields still will not query, must manually specify query
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).select(s -> s.FETCHER.allFields().fetchProxy()).toList();


SELECT t.`id`,t.`name` FROM `school_class` t

//Manually specify query then it will be queried
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).select(s -> s.FETCHER.allFields().studentSize().fetchProxy()).toList();

SELECT t.`id`,t.`name`,(SELECT COUNT(t2.`id`) AS `id` FROM `school_student` t2 WHERE t2.`class_id` = t.`id`) AS `student_size` FROM `school_class` t


//Create new VO
@Data
@ToString
public class SchoolClassAggregatePropVO {
    @Column(primaryKey = true)//Primary key
    private String id;
    private String name;

    private Long studentSize;

}

List<SchoolClassAggregatePropVO> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).
        select(SchoolClassAggregatePropVO.class).toList();
SELECT t.`id`,t.`name`,(SELECT COUNT(t2.`id`) AS `id` FROM `school_student` t2 WHERE t2.`class_id` = t.`id`) AS `student_size` FROM `school_class` t





List<SchoolClassAggregatePropVO> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class)
        .where(s -> s.studentSize().gt(100L)).
        select(SchoolClassAggregatePropVO.class).toList();



-- SQL Statement 1
SELECT
    t.`id`,
    t.`name`,
    (SELECT
        COUNT(t2.`id`) AS `id` 
    FROM
        `school_student` t2 
    WHERE
        t2.`class_id` = t.`id`) AS `student_size` 
FROM
    `school_class` t 
WHERE
    (
        SELECT
            COUNT(t4.`id`) AS `id` 
        FROM
            `school_student` t4 
        WHERE
            t4.`class_id` = t.`id`
    ) > 100
```

