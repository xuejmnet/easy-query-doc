---
title: Custom Parsing
order: 3
---

# Custom Parsing
`eq` default framework annotations provide how to read information such as table or column comments at runtime, whether it can be null or custom database types, etc. But sometimes everyone hopes to use their own existing annotations or intervene in parsing metadata information in advance during generation.

## MigrationEntityParser
`eq 2.8.18^` version has modified the use of this interface. You can set the entire eq instance through set, or you can inject `MigrationEntityParser` into the entire framework through dependency injection.
```java

        easyEntityQuery.setMigrationParser(xxxx);
```
Through the above method, the framework can use custom parsing methods when parsing.


## Use Custom Annotations
In many cases, we may use validation, so there is a high probability that we will add whether it can be null and string length processing to the entity. How should we adapt to this situation?

Add dependency to pom.xml
```xml
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.9.Final</version>
</dependency>
```
Create object
```java

@Table("v_user")
@Data
@EntityProxy
public class ValidUser implements ProxyEntityAvailable<ValidUser , ValidUserProxy> {
    @Column(primaryKey = true,comment = "id")
    @Length(max = 32)
    private String id;
    @Column(comment = "Name")
    @Length(max = 128)
    @NotNull
    private String name;
    @Column(comment = "Age")
    @NotNull
    private Integer age;
}
```
Where `@Length` and `@NotNull` are `org.hibernate.validator.constraints.Length` and `javax.validation.constraints.NotNull`

## Create Custom Parser
For MySQL, inherit and override `DefaultMigrationEntityParser`, such as `MsSQLMigrationEntityParser`

For which class to inherit and override, you can [refer to the source code](https://github.com/dromara/easy-query/blob/main/sql-db-support/sql-mssql/src/main/java/com/easy/query/mssql/migration/MsSQLMigrationEntityParser.java)
```java

public class MyMigrationEntityParser extends DefaultMigrationEntityParser {

    @Override
    public @NotNull ColumnDbTypeResult getColumnDbType(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        if (String.class.equals(columnMetadata.getPropertyType())) {
            Field field = entityMetadata.getFieldByColumnMetadata(columnMetadata);
            Length lengthAnnotation = field.getAnnotation(Length.class);
            if (lengthAnnotation != null) {
                if(lengthAnnotation.max()>4000){
                    return new ColumnDbTypeResult("TEXT", null);
                }
                return new ColumnDbTypeResult(String.format("varchar(%s)", lengthAnnotation.max()), null);
            }
        }
        return super.getColumnDbType(entityMetadata, columnMetadata);
    }

    @Override
    public String getColumnComment(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        Field field = entityMetadata.getFieldByColumnMetadata(columnMetadata);
        ApiModelProperty apiModelProperty = field.getAnnotation(ApiModelProperty.class);
        if (apiModelProperty != null) {
            return apiModelProperty.value();
        }
        return null;
    }

    @Override
    public boolean isNullable(EntityMigrationMetadata entityMetadata, ColumnMetadata columnMetadata) {
        Field field = entityMetadata.getFieldByColumnMetadata(columnMetadata);
        {

            ApiModelProperty apiModelProperty = field.getAnnotation(ApiModelProperty.class);
            if (apiModelProperty != null) {
                return apiModelProperty.required();
            }
        }
        return false;
    }
}

```

## Usage
Call ` entityQuery.setMigrationParser(new MyMyMigrationEntityParser());` before syncTableCommand
```java
        entityQuery.setMigrationParser(new MyMyMigrationEntityParser());
        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //Create database if it doesn't exist
        databaseCodeFirst.createDatabaseIfNotExists();
        //Auto sync database tables
        CodeFirstCommand command = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class, ValidUser.class));
        //Execute command
        command.executeWithTransaction(arg -> {
//            System.out.println(arg.sql);
            arg.commit();
        });
```

```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
CREATE TABLE IF NOT EXISTS `v_user` ( 
`id` varchar(32) NOT NULL  COMMENT 'id',
`name` varchar(128) NOT NULL  COMMENT 'Name',
`age` INT(11) NOT NULL  COMMENT 'Age', 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
<== Total: 0
```

## How to Modify Default Type Mapping
Each database has its own corresponding `DatabaseMigrationProvider`. You can replace the service to implement customization.
```java
replaceService<DatabaseMigrationProvider.class,MyDatabaseMigrationProvider.class>()
```


## Example
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

