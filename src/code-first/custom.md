---
title: 自定义解析
---

# 自定义解析
`eq`默认框架注解提供了如何在运行时读取比如表或者列的备注信息,是否可为null或者自定义数据库类型等,但是有时候大家希望通过自己已有的注解或者在生成式进行预先干预解析元信息

## MigrationEntityParser
`eq 2.5.7^`版本暴露该接口
```java

        easyEntityQuery.setMigrationParser(xxxx);
```
通过上述方法可以让框架在解析时使用自定义的解析方法


## 使用自定义注解
很多情况下我们可能会使用valid校验，所以实体上很大概率会添加是否可为空和字符串长度等处理，那么我们应该如何适配这种情况呢

pom.xml添加依赖
```xml
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.9.Final</version>
</dependency>
```
创建对象
```java

@Table("v_user")
@Data
@EntityProxy
public class ValidUser implements ProxyEntityAvailable<ValidUser , ValidUserProxy> {
    @Column(primaryKey = true,comment = "id")
    @Length(max = 32)
    private String id;
    @Column(comment = "姓名")
    @Length(max = 128)
    @NotNull
    private String name;
    @Column(comment = "年龄")
    @NotNull
    private Integer age;
}
```
其中`@Length`和`@NotNull`是`org.hibernate.validator.constraints.Length`和`javax.validation.constraints.NotNull`

## 创建自定义解析器
```java

public class MyMyMigrationEntityParser implements MigrationEntityParser {
    @Override
    public @Nullable ColumnDbTypeResult getColumnDbType(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        if (String.class.equals(columnMetadata.getPropertyType())) {
            Field field = entityMetadata.getFieldByName(columnMetadata);
            Length lengthAnnotation = field.getAnnotation(Length.class);
            if (lengthAnnotation != null) {
                return new ColumnDbTypeResult(String.format("varchar(%s)", lengthAnnotation.max()), null);//第二个参数defValue目前还未使用生效
            }
        }
        return null;
    }

    @Override
    public String getColumnComment(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        return "";
    }

    @Override
    public Boolean isNullable(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        Field field = entityMetadata.getFieldByName(columnMetadata);
        NotNull notNullAnnotation = field.getAnnotation(NotNull.class);
        if (notNullAnnotation != null) {
            return false;
        }
        return null;
    }

    @Override
    public Boolean columnExistInDb(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        return null;
    }

    @Override
    public String getTableComment(EntityMigrationMetadata entityMetadata) {
        return "";
    }

    @Override
    public String getColumnRenameFrom(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        return "";
    }
}

```

## 使用
在syncTableCommand前调用` entityQuery.setMigrationParser(new MyMyMigrationEntityParser());`
```java
        entityQuery.setMigrationParser(new MyMyMigrationEntityParser());
        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //如果不存在数据库则创建
        databaseCodeFirst.createDatabaseIfNotExists();
        //自动同步数据库表
        CodeFirstCommand codeFirstExecutable = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class, ValidUser.class));
        //执行命令
        codeFirstExecutable.executeWithTransaction(arg -> {
//            System.out.println(arg.sql);
            arg.commit();
        });
```

```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
CREATE TABLE IF NOT EXISTS `v_user` ( 
`id` varchar(32) NOT NULL  COMMENT 'id',
`name` varchar(128) NOT NULL  COMMENT '姓名',
`age` INT(11) NOT NULL  COMMENT '年龄', 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
<== Total: 0
```

## 如何修改默认的类型映射
各个数据库都有自己对应的`DatabaseMigrationProvider`通过替换服务来实现自定义即可
```java
replaceService<DatabaseMigrationProvider.class,MyDatabaseMigrationProvider.class>()
```


## 案例
```java

public class DefaultDatabaseMigrationProvider extends AbstractDatabaseMigrationProvider {
    private static final Map<Class<?>, ColumnDbTypeResult> columnTypeMap = new HashMap<>();

    static {
        columnTypeMap.put(boolean.class, new ColumnDbTypeResult("TINYINT(1)", false));
        columnTypeMap.put(Boolean.class, new ColumnDbTypeResult("TINYINT(1)", null));
        columnTypeMap.put(float.class, new ColumnDbTypeResult("FLOAT", 0f));
        columnTypeMap.put(Float.class, new ColumnDbTypeResult("FLOAT", null));
        columnTypeMap.put(double.class, new ColumnDbTypeResult("DOUBLE", 0d));
        columnTypeMap.put(Double.class, new ColumnDbTypeResult("DOUBLE", null));
        columnTypeMap.put(short.class, new ColumnDbTypeResult("SMALLINT(6)", 0));
        columnTypeMap.put(Short.class, new ColumnDbTypeResult("SMALLINT(6)", null));
        columnTypeMap.put(int.class, new ColumnDbTypeResult("INT(11)", 0));
        columnTypeMap.put(Integer.class, new ColumnDbTypeResult("INT(11)", null));
        columnTypeMap.put(long.class, new ColumnDbTypeResult("BIGINT(20)", 0L));
        columnTypeMap.put(Long.class, new ColumnDbTypeResult("BIGINT(20)", null));
        columnTypeMap.put(byte.class, new ColumnDbTypeResult("TINYINT(3)", 0));
        columnTypeMap.put(Byte.class, new ColumnDbTypeResult("TINYINT(3)", null));
        columnTypeMap.put(BigDecimal.class, new ColumnDbTypeResult("DECIMAL(16,2)", null));
        columnTypeMap.put(LocalDateTime.class, new ColumnDbTypeResult("DATETIME(3)", null));
        columnTypeMap.put(String.class, new ColumnDbTypeResult("VARCHAR(255)", ""));
    }


    public DefaultDatabaseMigrationProvider(DataSource dataSource, SQLKeyword sqlKeyword) {
        super(dataSource, sqlKeyword);
    }

    //........
}

```