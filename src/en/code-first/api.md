---
title: API
order: 1
---

# API
In the quick start chapter, we have learned how to quickly implement. Next, we will analyze it and introduce the API.


The source code for this chapter is on git. If you need it, please get it yourself [Click me to get](https://github.com/xuejmnet/easy-query-samples)



## DatabaseCodeFirst

Interface  | Function  
---  | --- 
createDatabaseIfNotExists  | Create database if it doesn't exist (oracle, dameng not supported)
tableExists | Pass in an object class, return true if it exists, false if it doesn't
createTableCommand | Generate create table command
dropTableCommand | Generate drop table command
dropTableIfExistsCommand | Generate drop table command if the table exists
syncTableCommand | Auto sync table structure. If database doesn't exist, create database (oracle not supported). If table doesn't exist, create table. If table exists and class has more properties than database columns, automatically generate add column. If column or table has `oldName`, automatically generate rename command


::: tip Notice!!!
> `syncTableCommand` will only ever add tables, add columns, add indexes, add foreign keys, modify column names (if oldName exists). To delete tables, you need to manually execute `dropTableCommand`. Currently, deletion is not provided for columns and indexes.
:::


If there's no database, create one. If already created, ignore it.

- `createDatabaseIfNotExists` will automatically create database if it doesn't exist (oracle, dameng not supported).

Principle: Parse the corresponding `jdbc url`, `username` and `password` from the `DataSource` data source. When the program cannot correctly parse the corresponding data, you can manually return to inform the program.
```java

    DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
    //Manually handle unknown datasource
    databaseCodeFirst.createDatabaseIfNotExists(ds->new Credentials(
            "jdbc:mysql://127.0.0.1:3316/easy-query-test",
            "root",
            "root"
    ));
   
```



## CodeFirstCommand

Interface  | Function  
---  | --- 
executeWithEnvTransaction  | If you are using frameworks like `spring` or `solon`, call this method to use the framework's own transaction
executeWithTransaction  | Start `eq`'s transaction, you need to manually call the `commit()` function


It is generally recommended to use `executeWithTransaction` to first print the `sql` in the method and calculate its hash such as `md5`, then let the user input the same hash value after seeing it to confirm that the user really wants to execute that `sql`.

Specific code is as follows:
```java

CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(MyMigrationBlog0.class));
codeFirstCommand.executeWithTransaction(arg -> {
    System.out.println(arg.sql);
    String md5 = MD5Util.getMD5Hash(arg.sql);
    System.out.println("sql-hash:" + md5);
    if("2a927e4ae0dbf7d6f6d687a50888df93".equals(md5)){
        arg.commit();
    }
});
```


::: danger Notice!!!
> When there are more than two classes in `syncTableCommand`, the `MySQL` connection string needs to add the `&allowMultiQueries=true` parameter. Without this parameter by default, multiple merged SQL statements cannot be executed
> For example: `jdbc:mysql://127.0.0.1:3316/easy-query-db?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true`
:::


## Column Description Table Description
How do we add column descriptions and table descriptions in the generated code?

::: tabs

@tab Company
```java
@Data
@Table(value = "t_company",comment = "Company Table")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * Company id
     */
    @Column(primaryKey = true,comment = "Company id")
    private String id;
    /**
     * Company name
     */
    @Column(comment = "Company name")
    private String name;

    /**
     * Company creation time
     */
    @Column(comment = "Company creation time")
    private LocalDateTime createTime;

    /**
     * Registered capital
     */
    @Column(comment = "Registered capital")
    private BigDecimal registerMoney;

    /**
     * Users owned by the company
     */
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {Company.Fields.id},
            targetProperty = {SysUser.Fields.companyId})
    private List<SysUser> users;
}

```
@tab SysUser
```java

@Data
@Table(value = "t_user",comment = "User Table")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * User id
     */
    @Column(primaryKey = true,comment = "User id")
    private String id;
    /**
     * User name
     */
    @Column(comment = "User name")
    private String name;
    /**
     * User birth date
     */
    @Column(comment = "User birth date")
    private LocalDateTime birthday;

    /**
     * User's company id
     */
    @Column(comment = "User's company id")
    private String companyId;

    /**
     * User's affiliated company
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}

```

:::

After re-execution, we find that the SQL has added description and comment information
```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
create db sql:CREATE DATABASE IF NOT EXISTS `eq_db` default charset utf8mb4 COLLATE utf8mb4_general_ci;

==> Preparing: 
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` VARCHAR(255) NOT NULL  COMMENT 'Company id',
`name` VARCHAR(255) NULL  COMMENT 'Company name',
`create_time` DATETIME(3) NULL  COMMENT 'Company creation time',
`register_money` DECIMAL(16,2) NULL  COMMENT 'Registered capital', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='Company Table';
CREATE TABLE IF NOT EXISTS `t_user` ( 
`id` VARCHAR(255) NOT NULL  COMMENT 'User id',
`name` VARCHAR(255) NULL  COMMENT 'User name',
`birthday` DATETIME(3) NULL  COMMENT 'User birth date',
`company_id` VARCHAR(255) NULL  COMMENT 'User\'s company id', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='User Table';
<== Total: 0
```

## Database Type
Using `varchar(255)` for id is too wasteful in most cases. Sometimes we need to reset it. How should we implement this?
```java

    /**
     * Company id
     */
    @Column(primaryKey = true,comment = "Company id",dbType = "varchar(32)")
    private String id;
```
We define the database type ourselves on the property. The generated SQL will use the corresponding type.
```sql

CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT 'Company id',
`name` VARCHAR(255) NULL  COMMENT 'Company name',
`create_time` DATETIME(3) NULL  COMMENT 'Company creation time',
`register_money` DECIMAL(16,2) NULL  COMMENT 'Registered capital', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='Company Table';
```

## Nullable
By adding `nullable = false` to indicate that the corresponding column in the database is a non-null column
```java
    /**
     * Company name
     */
    @Column(comment = "Company name",nullable = false)
    private String name;
```

```sql
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT 'Company id',
`name` VARCHAR(255) NOT NULL  COMMENT 'Company name',
`create_time` DATETIME(3) NULL  COMMENT 'Company creation time',
`register_money` DECIMAL(16,2) NULL  COMMENT 'Registered capital', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='Company Table';
```


## Database Default Value
By adding `dbDefault = CURRENT_TIMESTAMP(3)` to indicate the default value of the corresponding column in the database, where nullable is a non-null column
```java
  
    @Column(nullable = false,dbDefault = "CURRENT_TIMESTAMP(3)")
    private LocalDateTime createTime;
```

```sql
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT 'Company id',
`name` VARCHAR(255) NOT NULL  COMMENT 'Company name',
`create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'Company creation time',
`register_money` DECIMAL(16,2) NULL  COMMENT 'Registered capital', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='Company Table';
```
## Add Column
We add a column in the existing class and then execute the code `execute syncTableCommand`
```java
    //Add a new column
    @Column(comment = "Test column",dbType = "varchar(500)")
    private String column;
```

```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
ALTER TABLE `t_company` ADD `column` varchar(500) NULL COMMENT 'Test column';
<== Total: 0
```

## Modify Column Name
We modify the `column` column to `column1`
```java

    @Column(comment = "Test column",dbType = "varchar(500)",oldName = "column")
    private String column1;
```
Execute `syncTableCommand`
```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
ALTER TABLE `t_company` CHANGE `column` `column1` varchar(500) NULL COMMENT 'Test column';
<== Total: 0
```


## Database Index
Use `@TableIndex` to add indexes. If there are multiple indexes, you can use the `@TableIndexes` annotation.

`fields` indicates which columns are used as indexes, `unique` indicates whether it is a unique constraint index, `name` index name defaults to `current_table_target_table_column_(u)idx` where `idx` is a normal index and `uidx` is a unique constraint index. The function of name is that jdbc will query whether the database table already has this index name. If not, it will be added. It can be left unset by default. `descendingFields` are columns that need to be sorted using `desc`.
```java
@Data
@Table
@EntityProxy
@TableIndexes({
        @TableIndex(fields = {"column1","column2"}),
        @TableIndex(fields = {"column2"},unique = true)
})
public class M8TestIndex implements ProxyEntityAvailable<M8TestIndex , M8TestIndexProxy> {
    @Column(primaryKey = true)
    private String column1;
    private String column2;
    private String column3;
    @Column(dbDefault = "''")
    private String column4;

    @Column(nullable = false,dbDefault = "CURRENT_TIMESTAMP(3)")
    private LocalDateTime createTime;
}

CREATE TABLE IF NOT EXISTS `m8_test_index` ( 
`column1` VARCHAR(255) NOT NULL ,
`column2` VARCHAR(255) NULL ,
`column3` VARCHAR(255) NULL ,
`column4` VARCHAR(255) NULL  DEFAULT '',
`create_time` DATETIME(3) NOT NULL  DEFAULT CURRENT_TIMESTAMP(3), 
 PRIMARY KEY (`column1`)
) Engine=InnoDB;
CREATE INDEX m8_test_index_id_column1_column2_idx ON `m8_test_index` (`column1` ASC,`column2` ASC);
CREATE UNIQUE INDEX m8_test_index_id_column2_uidx ON `m8_test_index` (`column2` ASC);
```

## Database Foreign Key
Use `@ForeignKey` to add foreign key relationship between bank_card and bank, and support adding `action` such as `ON DELETE CASCADE`
```java

@Table("t_bank_card")
@EntityProxy
@Data
@FieldNameConstants
@EasyAlias("bank_card")
public class SysBankCard implements ProxyEntityAvailable<SysBankCard, SysBankCardProxy>, Serializable {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    /**
     * Bank card number
     */
    private String code;
    /**
     * Bank card type: debit card, savings card
     */
    private String type;
    /**
     * Affiliated bank
     */
    private String bankId;
    /**
     * User account opening time
     */
    private LocalDateTime openTime;

    /**
     * Affiliated bank
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required = true)
    @ForeignKey
    private SysBank bank;

    /**
     * Affiliated user
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}
```

Generated SQL
```sql
CREATE TABLE IF NOT EXISTS `t_bank` ( 
`id` VARCHAR(255) NOT NULL ,
`name` VARCHAR(255) NULL ,
`create_time` DATETIME(3) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
CREATE TABLE IF NOT EXISTS `t_bank_card` ( 
`id` VARCHAR(255) NOT NULL ,
`uid` VARCHAR(255) NULL ,
`code` VARCHAR(255) NULL ,
`type` VARCHAR(255) NULL ,
`bank_id` VARCHAR(255) NULL ,
`open_time` DATETIME(3) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
ALTER TABLE `t_bank_card` ADD CONSTRAINT t_bank_card_t_bank_id_fk FOREIGN KEY (`bank_id`) REFERENCES `t_bank` (`id`);
```

