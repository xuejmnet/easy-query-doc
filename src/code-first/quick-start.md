---
title: 快速开始
---

# 快速进入
创建实体对象


本章源代码在git上如果需要请自行获取[点我获取](https://github.com/xuejmnet/easy-query-samples)


::: tabs

@tab Company
```java
@Data
@Table("t_company")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * 企业id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 企业名称
     */
    private String name;

    /**
     * 企业创建时间
     */
    private LocalDateTime createTime;

    /**
     * 注册资金
     */
    private BigDecimal registerMoney;

    /**
     * 企业拥有的用户
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
     * 用户id
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 用户姓名
     */
    private String name;
    /**
     * 用户出生日期
     */
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    private String companyId;

    /**
     * 用户所属企业
     */
    @Navigate(value = RelationTypeEnum.ManyToOne,
            selfProperty = {SysUser.Fields.companyId},
            targetProperty = {Company.Fields.id})
    private Company company;
}

```

:::


## 生成数据库表
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
                    //进行一系列可以选择的配置
                    //op.setPrintSql(true);
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
        entityQuery = new DefaultEasyEntityQuery(client);

        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        //如果不存在数据库则创建
        databaseCodeFirst.createDatabaseIfNotExists();
        //自动同步数据库表
        CodeFirstCommand codeFirstExecutable = databaseCodeFirst.syncTableCommand(Arrays.asList(Company.class, SysUser.class));
        //执行命令
        codeFirstExecutable.executeWithTransaction(arg -> {
            System.out.println(arg.sql);
            arg.commit();
        });
    }

    /**
     * 初始化数据源
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
运行代码后输出sql
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
自动创建数据库和表