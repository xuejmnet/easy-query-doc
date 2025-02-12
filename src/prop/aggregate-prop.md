---
title: 跨表计算属性
---

## 跨表计算属性
列如用户和证书属于一对多,当查询用户时需要返回用户的证书数那么可以通过跨表计算属性来实现,班级和班级所在的学生人数
总之跨表计算属性是由当前对的一个或者多个以上的数据或者跨表数据通过一定的函数进行组合来实现一个动态不存在数据库中的属性,并且改属性支持筛选排序筛选和分组等操作


```java

@Table("school_class")
@Data
@ToString
@EntityProxy
public class SchoolClassAggregateProp implements ProxyEntityAvailable<SchoolClassAggregateProp, SchoolClassAggregatePropProxy> {
    @Column(primaryKey = true)//主键
    private String id;
    private String name;
    //一对多 一个班级多个学生
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
//学生数量复杂计算属性
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

### 查询
```java
//因为添加了autoSelect=false所以默认不查询聚合列
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).toList();

SELECT t.`id`,t.`name` FROM `school_class` t

//查询allFields任然不会查询必须要手动指定查询
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).select(s -> s.FETCHER.allFields().fetchProxy()).toList();


SELECT t.`id`,t.`name` FROM `school_class` t

//手动指定查询那么将会查询出来
List<SchoolClassAggregateProp> list = easyEntityQuery.queryable(SchoolClassAggregateProp.class).select(s -> s.FETCHER.allFields().studentSize().fetchProxy()).toList();

SELECT t.`id`,t.`name`,(SELECT COUNT(t2.`id`) AS `id` FROM `school_student` t2 WHERE t2.`class_id` = t.`id`) AS `student_size` FROM `school_class` t


//新建VO
@Data
@ToString
public class SchoolClassAggregatePropVO {
    @Column(primaryKey = true)//主键
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



-- 第1条sql数据
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