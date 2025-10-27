---
title: Status Computed Properties
order: 7
category:
  - sql
---

For example, you have a certificate table, the certificate table has a certificate expiration time, then the certificate has a dynamic hidden property called status, whether the certificate has expired can be implemented through this status

Near expiration, expired, not expired

```java


@Table("t_certificate")
@Data
@EntityProxy
public class Certificate implements ProxyEntityAvailable<Certificate , CertificateProxy> {
    @Column(primaryKey = true)
    private String id;
    /**
     * Certificate name
     */
    private String name;
    /**
     * Create time
     */
    private LocalDateTime createTime;
    /**
     * Expiration time
     */
    private String invalidTime;

    @Column(sqlConversion = CertStatusColumnValueSQLConverter.class)
    //Because it is not a real column, no need to insert
    @InsertIgnore
    //Because it is not a real column, no need to update
    @UpdateIgnore
    private CertStatusEnum status;

}



@Getter
public enum CertStatusEnum implements IEnum<CertStatusEnum> {
    NORMAL(1,"Normal"),

    WILL_INVALID(2,"Near Expiration"),

    INVALID(3,"Expired");
    private final Integer code;
    private final String name;

    CertStatusEnum(Integer code,String name){

        this.code = code;
        this.name = name;
    }
    @Override
    public CertStatusEnum valueOf(Integer enumValue) {
        switch (enumValue){
            case 1:return NORMAL;
            case 2:return WILL_INVALID;
            case 3:return INVALID;
        }
        throw new UnsupportedOperationException();
    }
}





//Certificate status value
@Component//Non-springboot register yourself, such as solon
public class CertStatusColumnValueSQLConverter  implements ColumnValueSQLConverter {
    @Override
    public boolean isRealColumn() {
        //It is not a real existing column so return false
        return false;
    }

    @Override
    public boolean isMergeSubQuery() {
        //No other databases are used during this period so it is false
        return false;
    }

    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        //Calculate the difference in days between the two, the larger time in front, the smaller time in back
        SQLFunction durationDay = fx.duration(x->x.column(table,"invalidTime").sqlFunc(fx.now()), DateTimeDurationEnum.Days);
        //If the calculated time is greater than 30 days, it is normal, greater than or equal to 0 means near expiration, less than 0 means expired
        SQLFunction sqlFunction = fx.anySQLFunction("(CASE WHEN {0}>30 THEN 1 WHEN {0}>=0 THEN 2 ELSE 3 END)", c -> {
            c.sqlFunc(durationDay);
        });
        String sqlSegment = sqlFunction.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            sqlFunction.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());//Because it is returned, need to set alias
        });
    }

    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction durationDay = fx.duration(x->x.column(table,"invalidTime").sqlFunc(fx.now()), DateTimeDurationEnum.Days);
        SQLFunction sqlFunction = fx.anySQLFunction("(CASE WHEN {0}>30 THEN 1 WHEN {0}>=0 THEN 2 ELSE 3 END)", c -> {
            c.sqlFunc(durationDay);
        });
        String sqlSegment = sqlFunction.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            sqlFunction.consume(context.getSQLNativeChainExpressionContext());
            //Used as property so no need for alias
        });
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext, boolean isCompareValue) {
        //Because it is not used for insert and update, when this status property is used as a condition comparison, the condition value is still the original value
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


//Register computed property

QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyColumnValueSQLConverter(new CertStatusColumnValueSQLConverter());
```

## Query
```java
List<Certificate> list = easyEntityQuery.queryable(Certificate.class)
        .toList();

SELECT
    `id`,
    `name`,
    `create_time`,
    `invalid_time`,
    (CASE 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>30 THEN 1 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>=0 THEN 2 
        ELSE 3 
    END) AS `status` 
FROM
    `t_certificate` 
```
## Filter
```java

List<Certificate> list = easyEntityQuery.queryable(Certificate.class)
        .where(c -> c.status().eq(CertStatusEnum.NORMAL))
        .toList();


SELECT
    `id`,
    `name`,
    `create_time`,
    `invalid_time`,
    (CASE 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>30 THEN 1 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>=0 THEN 2 
        ELSE 3 
    END) AS `status` 
FROM
    `t_certificate` 
WHERE
    (
        CASE 
            WHEN timestampdiff(DAY, NOW(), `invalid_time`)>30 THEN 1 
            WHEN timestampdiff(DAY, NOW(), `invalid_time`)>=0 THEN 2 
            ELSE 3 
        END
    ) = 1
```

## Sort

```java

List<Certificate> list = easyEntityQuery.queryable(Certificate.class)
        .where(c -> c.status().eq(CertStatusEnum.NORMAL))
        .orderBy(c -> c.status().asc())
        .toList();


-- SQL Statement 1
SELECT
    `id`,
    `name`,
    `create_time`,
    `invalid_time`,
    (CASE 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>30 THEN 1 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>=0 THEN 2 
        ELSE 3 
    END) AS `status` 
FROM
    `t_certificate` 
WHERE
    (
        CASE 
            WHEN timestampdiff(DAY, NOW(), `invalid_time`)>30 THEN 1 
            WHEN timestampdiff(DAY, NOW(), `invalid_time`)>=0 THEN 2 
            ELSE 3 
        END
    ) = 1 
ORDER BY
    (CASE 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>30 THEN 1 
        WHEN timestampdiff(DAY,
        NOW(),
        `invalid_time`)>=0 THEN 2 
        ELSE 3 
    END) ASC
```

