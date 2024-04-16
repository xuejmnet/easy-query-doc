---
title: 复合计算属性
---

## 复合计算属性
通常我们会对用户的年龄使用一个字段来进行存储,但是大部分时候这个年龄属性应该是动态计算的而不是实时计算的,如果我们存储firstName和lastName那么用户的name字段也可以通过这种方式来实现计算,
总之复合计算属性是由当前对的一个或者多个以上的数据通过一定的函数进行组合来实现一个动态不存在数据库中的属性,并且改属性支持筛选排序筛选和分组等操作


::: code-tabs
@tab 对象模式

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
    @Column(sqlConversion = UserAgeColumnValueSQLConverter.class)//如果您不想默认查询这个字段可以设置autoSelect=false,需要时手动指定或者VO里面有也会自动映射
    private Integer age;

    @Override
    public Class<UserExtraProxy> proxyTableClass() {
        return UserExtraProxy.class;
    }
}
```

@tab sql脚本
```sql

create table t_user_extra
(
    id varchar(32) not null comment '主键ID'primary key,
    first_name varchar(32)  null comment '姓',
    last_name varchar(32)  null comment '名',
    birthday datetime  null comment '生日'
)comment '用户额外信息表';
```

::: 

###
```java

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
     * 当这个值被作为select的时候如何处理
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
     * 当这个值被用作非查询的值的时候如何处理不出现在select里面
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
     * 当前值作为比较值的时候比如where age=18 那么这个18应该怎么处理
     * 当前这个值作为存储值的时候比如insert table (age) values(18)那么这个值如何处理
     * @param table
     * @param columnMetadata
     * @param sqlParameter
     * @param sqlPropertyConverter
     * @param runtimeContext
     * @param isCompareValue 当前值是用于比较还是存储
     */
    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


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

```

### 查询
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
    CONCAT(`first_name`,`last_name`) AS `full_name`, -- 全名就是first+last
    CEILING((timestampdiff(DAY,`birthday`,NOW()) / 365)) AS `age` -- 计算出出生日期到现在的天数除以365就是年向上取整就是虚岁
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
            }).groupBy(u -> GroupKeys.TABLE1.of(u.age(), u.fullName()))
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

### 插入
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