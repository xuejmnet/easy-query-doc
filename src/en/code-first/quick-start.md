---
title: Quick Start
order: 0
---

# Quick Start
Create entity objects


The source code for this chapter is on git. If you need it, please get it yourself [Click me to get](https://github.com/xuejmnet/easy-query-samples)


::: tabs

@tab Company
```java
@Data
@Table("t_company")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * Company id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * Company name
     */
    private String name;

    /**
     * Company creation time
     */
    private LocalDateTime createTime;

    /**
     * Registered capital
     */
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
@Table("t_user")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * User id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * User name
     */
    private String name;
    /**
     * User birth date
     */
    private LocalDateTime birthday;

    /**
     * User's company id
     */
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


## Generate Database Tables
```java
package com.easy.query.console;

import com.easy.query.api.proxy.client.DefaultEasyEntityQuery;
import com.easy.query.api.proxy.client.EasyEntityQuery;
import com.easy.query.console.entity.Company;
import com.easy.query.console.entity.SysUser;
import com.easy.query.console.vo.CompanyNameAndUserNameVO;
import com.easy.query.console.vo.proxy.CompanyNameAndUserNameVOProxy;
import com.easy.query.core.api.client.EasyQueryClient;
import com.easy.query.core.api.pagination.EasyPageResult;
import com.easy.query.core.basic.api.database.CodeFirstCommand;
import com.easy.query.core.basic.api.database.DatabaseCodeFirst;
import com.easy.query.core.bootstrapper.EasyQueryBootstrapper;
import com.easy.query.core.logging.LogFactory;
import com.easy.query.core.proxy.core.draft.Draft2;
import com.easy.query.core.proxy.sql.Select;
import com.easy.query.mysql.config.MySQLDatabaseConfiguration;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.List;

public class Main {
    private static EasyEntityQuery entityQuery;

    public static void main(String[] args) {
        LogFactory.useStdOutLogging();
        DataSource dataSource = getDataSource();
        EasyQueryClient client = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    //Perform a series of optional configurations
                    //op.setPrintSql(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        entityQuery = new DefaultEasyEntityQuery(client);

        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //Create database if it doesn't exist
        databaseCodeFirst.createDatabaseIfNotExists();
        //Auto sync database tables
        CodeFirstCommand command = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //Execute command
        command.executeWithTransaction(arg -> {
            System.out.println(arg.sql);
            arg.commit();
        });
    }

    /**
     * Initialize data source
     *
     * @return
     */
    private static DataSource getDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/eq_db?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true");
        dataSource.setUsername("root");
        dataSource.setPassword("root");
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setMaximumPoolSize(20);

        return dataSource;
    }

}
```
After running the code, output SQL
```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
create db sql:CREATE DATABASE IF NOT EXISTS `eq_db` default charset utf8mb4 COLLATE utf8mb4_general_ci;

==> Preparing: 
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` VARCHAR(255) NOT NULL ,
`name` VARCHAR(255) NULL ,
`create_time` DATETIME(3) NULL ,
`register_money` DECIMAL(16,2) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
CREATE TABLE IF NOT EXISTS `t_user` ( 
`id` VARCHAR(255) NOT NULL ,
`name` VARCHAR(255) NULL ,
`birthday` DATETIME(3) NULL ,
`company_id` VARCHAR(255) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
<== Total: 0
```
Automatically create database and tables

