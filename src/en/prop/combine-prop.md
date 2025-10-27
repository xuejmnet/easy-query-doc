---
title: Composite Computed Properties
order: 8
category:
  - sql
---

## Composite Computed Properties
Usually we would use a field to store a user's age, but most of the time this age property should be dynamically calculated rather than computed in real-time. If we store firstName and lastName, then the user's name field can also be implemented through this method for calculation.
In summary, composite computed properties are dynamic properties that do not exist in the database, formed by one or more data from the current object through certain functions, and this property supports filtering, sorting, filtering, and grouping operations.


::: code-tabs
@tab Object Mode

```java

@Data
@Table("t_user_extra")
@EntityProxy
public class UserExtra implements ProxyEntityAvailable<UserExtra , UserExtraProxy> {
    @Column(primaryKey = true)
    private String id;
    private String firstName;
    private String lastName;
    private LocalDateTime birthday;
    @InsertIgnore
    @UpdateIgnore
    @Column(sqlConversion = FullNameColumnValueSQLConverter.class)
    private String fullName;

    @InsertIgnore
    @UpdateIgnore
    @Column(sqlConversion = UserAgeColumnValueSQLConverter.class)//If you don't want to query this field by default, you can set autoSelect=false, and specify manually when needed or it will also be automatically mapped in VO
    private Integer age;

}
```

@tab SQL Script
```sql

create table t_user_extra
(
    id varchar(32) not null comment 'Primary Key ID'primary key,
    first_name varchar(32)  null comment 'First Name',
    last_name varchar(32)  null comment 'Last Name',
    birthday datetime  null comment 'Birthday'
)comment 'User Extra Information Table';
```

::: 

###
```java

public class FullNameColumnValueSQLConverter implements ColumnValueSQLConverter {
    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction concat = fx.concat("firstName", "lastName");
        String sqlSegment = concat.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            concat.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());
        });

        //In principle, the above and below are the same in mysql, but if you encounter a database change, the user needs to adapt. If you use the functions provided by the system, they can be used across different databases
//        sqlPropertyConverter.sqlNativeSegment("CONCAT({0},{1})",c->{
//            c.expression("firstName").expression("lastName");
//            c.setAlias(columnMetadata.getName());
//        });
    }

    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction concat = fx.concat("firstName", "lastName");
        String sqlSegment = concat.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            concat.consume(context.getSQLNativeChainExpressionContext());
        });
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}

public class UserAgeColumnValueSQLConverter implements ColumnValueSQLConverter {
    @Override
    public boolean isRealColumn() {
        return false;
    }
    @Override
    public boolean isMergeSubQuery() {
        return false;
    }
    /**
     * How to handle when this value is used as a select
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     * @param runtimeContext
     */
    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction durationDay = fx.duration(x->x.sqlFunc(fx.now()).column(table,"birthday"), DateTimeDurationEnum.Days);
        SQLFunction sqlFunction = fx.numberCalc(x -> x.sqlFunc(durationDay).value(365), NumberCalcEnum.NUMBER_DEVIDE);
        SQLFunction ageSQLFunction = fx.math(x -> x.sqlFunc(sqlFunction), MathMethodEnum.Ceiling);
        String sqlSegment = ageSQLFunction.sqlSegment(table);

        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            ageSQLFunction.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());
        });
    }

    /**
     * How to handle when this value is used as a non-query value and does not appear in select
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     * @param runtimeContext
     */
    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction durationDay = fx.duration(x->x.sqlFunc(fx.now()).column(table,"birthday"), DateTimeDurationEnum.Days);
        SQLFunction sqlFunction = fx.numberCalc(x -> x.sqlFunc(durationDay).value(365), NumberCalcEnum.NUMBER_DEVIDE);
        SQLFunction ageSQLFunction = fx.math(x -> x.sqlFunc(sqlFunction), MathMethodEnum.Ceiling);
        String sqlSegment = ageSQLFunction.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            ageSQLFunction.consume(context.getSQLNativeChainExpressionContext());
        });
    }

    /**
     * When the current value is used as a comparison value, such as where age=18, how should this 18 be handled
     * When this value is used as a storage value, such as insert table (age) values(18), how to handle this value
     * @param table
     * @param columnMetadata
     * @param sqlParameter
     * @param sqlPropertyConverter
     * @param runtimeContext
     * @param isCompareValue Whether the current value is used for comparison or storage
     */
    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


```

### Query
```java

List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.fullName().like("123");
            u.fullName().in(Arrays.asList("1", "2"));
            u.age().gt(12);
        })
        .toList();


SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`,`last_name`) AS `full_name`, -- Full name is first+last
    CEILING((timestampdiff(DAY,`birthday`,NOW()) / 365)) AS `age` -- Calculate the number of days from birth date to now divided by 365 is the age, rounded up is the nominal age
FROM
    `t_user_extra` 
WHERE
    CONCAT(`first_name`,`last_name`) LIKE '%123%' 
    AND CONCAT(`first_name`,`last_name`) IN (
        '1','2'
    ) 
    AND CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) > 12


List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.id().eq("test2");
            u.fullName().like("悟");
        }).orderBy(x -> x.fullName().asc())
        .toList();

SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`,`last_name`) AS `full_name`,
    CEILING((timestampdiff(DAY,`birthday`, NOW()) / 365)) AS `age` 
FROM
    `t_user_extra` 
WHERE
    `id` = 'test2' 
    AND CONCAT(`first_name`,`last_name`) LIKE '%悟%' 
ORDER BY
    CONCAT(`first_name`,`last_name`) ASC




List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.id().eq("test3");
            u.fullName().like("悟");
        }).orderBy(x -> {
            x.fullName().asc();
            x.age().asc();
            x.fullName().asc(OrderByModeEnum.NULLS_LAST);
        })
        .toList();


SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`, `last_name`) AS `full_name`,
    CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) AS `age` 
FROM
    `t_user_extra` 
WHERE
    `id` = 'test3' 
    AND CONCAT(`first_name`,`last_name`) LIKE '%悟%' 
ORDER BY
    CONCAT(`first_name`, `last_name`) ASC,
    CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) ASC,
    CASE 
        WHEN CONCAT(`first_name`,  `last_name`) IS NULL THEN 1 
        ELSE 0 
    END ASC,
    CONCAT(`first_name`, `last_name`) ASC



List<Draft3<Integer, String, String>> list = easyEntityQuery.queryable(UserExtra.class)
            .where(u -> {
                u.id().eq("test3");
                u.fullName().like("悟");
            })//Create group by, before 2.3.4 use GroupKeys.TABLE1_10.of
            .groupBy(u -> GroupKeys.of(u.age(), u.fullName()))
            .select(group -> Select.DRAFT.of(
                    group.key1(),
                    group.key2(),
                    group.groupTable().fullName().max()
            )).toList();



SELECT
    CEILING((timestampdiff(DAY, t.`birthday`, NOW()) / 365)) AS `value1`,
    CONCAT(t.`first_name`, t.`last_name`) AS `value2`,
    MAX(CONCAT(t.`first_name`, t.`last_name`)) AS `value3` 
FROM
    `t_user_extra` t 
WHERE
    t.`id` = 'test3' 
    AND CONCAT(t.`first_name`,t.`last_name`) LIKE '%悟%' 
GROUP BY
    CEILING((timestampdiff(DAY, t.`birthday`, NOW()) / 365)),
    CONCAT(t.`first_name`, t.`last_name`)
```

### Insert
```java
UserExtra userExtra = new UserExtra();
userExtra.setId("test2");
userExtra.setFirstName("孙");
userExtra.setLastName("悟空");
userExtra.setBirthday(LocalDateTime.of(2020, 1, 1, 0, 0));
easyEntityQuery.insertable(userExtra).executeRows();

INSERT 
INTO
    `t_user_extra`
    (
        `id`,`first_name`,`last_name`,`birthday`
    ) 
VALUES
    ('test2','孙','悟空','2020-01-01 00:00')
```

