---
title: 状态计算属性
---

比如您有一张证书表,证书表存在证书过期时间,那么证书有个动态的隐藏属性叫做状态,证书是否过期可以通过这个状态来实现

临期、过期、未过期

```java


@Table("t_certificate")
@Data
@EntityProxy
public class Certificate implements ProxyEntityAvailable<Certificate , CertificateProxy> {
    @Column(primaryKey = true)
    private String id;
    /**
     * 证书名称
     */
    private String name;
    /**
     * 创建时间
     */
    private LocalDateTime createTime;
    /**
     * 过期时间
     */
    private String invalidTime;

    @Column(sqlConversion = CertStatusColumnValueSQLConverter.class)
    //因为不是真实列所以不需要插入
    @InsertIgnore
    //因为不是真实列所以不需要修改
    @UpdateIgnore
    private CertStatusEnum status;

    @Override
    public Class<CertificateProxy> proxyTableClass() {
        return CertificateProxy.class;
    }
}



@Getter
public enum CertStatusEnum implements IEnum<CertStatusEnum> {
    NORMAL(1,"正常"),

    WILL_INVALID(2,"临期"),

    INVALID(3,"过期");
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





//证书状态值
@Component//非springboot自行注册比如solon
public class CertStatusColumnValueSQLConverter  implements ColumnValueSQLConverter {
    @Override
    public boolean isRealColumn() {
        //他不是一个真实存在的列所以返回false
        return false;
    }

    @Override
    public boolean isMergeSubQuery() {
        //期间没有用到别的数据库所以是false
        return false;
    }

    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        //计算出两者天数差值 前面是小的时间后面是大的时间
        SQLFunction durationDay = fx.duration(x->x.column(table,"invalidTime").sqlFunc(fx.now()), DateTimeDurationEnum.Days);
        //计算出来的时间如果大于30天表示是正常的,大于等于0表示临期的小于0表示过期的
        SQLFunction sqlFunction = fx.anySQLFunction("(CASE WHEN {0}>30 THEN 1 WHEN {0}>=0 THEN 2 ELSE 3 END)", c -> {
            c.sqlFunc(durationDay);
        });
        String sqlSegment = sqlFunction.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            sqlFunction.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());//因为是返回所以需要设置别名
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
            //当做属性用所以不需要别名
        });
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext, boolean isCompareValue) {
        //因为不做插入和修改所以这个status属性被用作条件比较的时候条件值还是原先的值
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


//注册计算属性

QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyColumnValueSQLConverter(new CertStatusColumnValueSQLConverter());
```

## 查询
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
## 筛选
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

## 排序

```java

List<Certificate> list = easyEntityQuery.queryable(Certificate.class)
        .where(c -> c.status().eq(CertStatusEnum.NORMAL))
        .orderBy(c -> c.status().asc())
        .toList();


-- 第1条sql数据
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