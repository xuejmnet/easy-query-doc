---
title: Database Keyword Handling
order: 20
---

# Database Keyword Handling
We often encounter Java property naming convention issues, such as boolean properties starting with `is` or naming like `private String aType`. In `eq`, you can set `propertyMode` to `same_as_entity` to handle this. Another situation is when our property names conflict with database keywords, such as `private String order` where `order` is a database keyword. How should we handle this?

`eq` doesn't require users to worry about database keywords by default because `eq` has already handled keywords in SQL statements (as long as you select the correct database)


Database  | Keyword Handling
--- | --- 
MySQL | \`order\`  
PGSQL | "order"
MsSQL | [order]




Java Property  | nameConversion   | Corresponding Database Column  
---  | ---  | --- 
userAge  | DEFAULT default | userAge
userAge  | UNDERLINED uppercase letters to lowercase underscore| user_age
userAge  | UPPER_UNDERLINED all uppercase, uppercase letters to lowercase underscore| USER_AGE
userAge  | LOWER_CAMEL_CASE lower camel case| userAge
userAge  | UPPER_CAMEL_CASE upper camel case| UserAge

## Selecting Database



::: tabs

@tab console
```java

EasyQueryClient client = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            //Perform a series of optional configurations
            //op.setPrintSql(true);
        })
        //Set the correct database
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```

@tab springboot
```yml

easy-query:
  #Supported databases
  database: mysql
```

@tab solon
```yml


easy-query: 
  # Configure custom log
  # log-class: ...
  db1:
    # Supports mysql pgsql h2 mssql dameng mssql_row_number kingbase_es, other databases are being adapted
    database: mysql
```

:::

## Case
```java
@Table("test_table")
@Data
@EntityProxy
@ToString
public class EntityColumnKey implements ProxyEntityAvailable<EntityColumnKey , EntityColumnKeyProxy> {
    @Column(primaryKey = true)
    private String id;
    private String key;
}



EasyQueryClient client = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            //Perform a series of optional configurations
            //op.setPrintSql(true);
        })
        //Set the correct database
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
EasyEntityQuery easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);

DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
databaseCodeFirst.createDatabaseIfNotExists();
CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(EntityColumnKey.class));
codeFirstCommand.executeWithTransaction(arg->arg.commit());
EntityColumnKey entityColumnKey = new EntityColumnKey();
entityColumnKey.setId("123");
entityColumnKey.setKey("456");
long l = easyEntityQuery.insertable(entityColumnKey).executeRows();
Assert.assertEquals(1, l);
EntityColumnKey entityColumnKey1 = easyEntityQuery.queryable(EntityColumnKey.class)
        .where(o -> o.key().eq("456")).firstOrNull();
Assert.assertNotNull(entityColumnKey1);


==> Preparing: CREATE TABLE IF NOT EXISTS `test_table` (`id` VARCHAR(32) NOT NULL,`key` VARCHAR(32) NULL,PRIMARY KEY (`id`))
<== Total: 0
==> Preparing: INSERT INTO `test_table` (`id`,`key`) VALUES (?,?) 
==> Parameters: 123(String),456(String)
<== Total: 1
==> Preparing: SELECT `id`,`key` FROM `test_table` WHERE `key` = ? LIMIT 1
==> Parameters: 456(String)
<== Time Elapsed: 3(ms)
<== Total: 1

```

