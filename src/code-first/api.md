---
title: api
---

# api
在快速开始的章节我们已经了解了如何快速实现,接下来我们将对其进行分析和api介绍


本章源代码在git上如果需要请自行获取[点我获取](https://github.com/xuejmnet/easy-query-samples)



## DatabaseCodeFirst

接口  | 功能  
---  | --- 
createDatabaseIfNotExists  | 如果数据库不存在则创建数据库(oracle、dameng不支持)
tableExists | 传入一个对象class,返回true表示存在，false表示不存在
createTableCommand | 生成创建表命令
dropTableCommand | 生成删除表命令
syncTableCommand | 自动同步表结构 如果数据库不存在则创建数据库(oracle不支持) 如果表不存在则创建表 如果表存在且class内的属性比数据库列多则自动生成添加列 如果列或者表添加`renameFrom`则自动生成rename命令


## CodeFirstCommand

接口  | 功能  
---  | --- 
executeWithEnvTransaction  | 如果你是`spring`或者`solon`等框架调用此方法使用框架自身的事务
executeWithTransaction  | 开始`eq`的事务,需要你手动调用`commit()`函数


一般建议采用`executeWithTransaction`在方法内先对`sql`进行打印和对其进行hash计算比如`md5`,然后由用户看到后输入相同hash值来确定用户确实要执行该`sql`

具体代码如下
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

## 列说明表说明
我们如何添加列说明和表说明在生成的代码中

::: tabs

@tab Company
```java
@Data
@Table(value = "t_company",comment = "企业表")
@EntityProxy
@FieldNameConstants
public class Company implements ProxyEntityAvailable<Company , CompanyProxy> {
    /**
     * 企业id
     */
    @Column(primaryKey = true,comment = "企业id")
    private String id;
    /**
     * 企业名称
     */
    @Column(comment = "企业名称")
    private String name;

    /**
     * 企业创建时间
     */
    @Column(comment = "企业创建时间")
    private LocalDateTime createTime;

    /**
     * 注册资金
     */
    @Column(comment = "注册资金")
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
@Table(value = "t_user",comment = "用户表")
@EntityProxy
@FieldNameConstants
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    /**
     * 用户id
     */
    @Column(primaryKey = true,comment = "用户id")
    private String id;
    /**
     * 用户姓名
     */
    @Column(comment = "用户姓名")
    private String name;
    /**
     * 用户出生日期
     */
    @Column(comment = "用户出生日期")
    private LocalDateTime birthday;

    /**
     * 用户所属企业id
     */
    @Column(comment = "用户所属企业id")
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

重新执行后我们发现sql已经添加了说明备注信息了
```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
create db sql:CREATE DATABASE IF NOT EXISTS `eq_db` default charset utf8mb4 COLLATE utf8mb4_general_ci;

==> Preparing: 
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` VARCHAR(255) NOT NULL  COMMENT '企业id',
`name` VARCHAR(255) NULL  COMMENT '企业名称',
`create_time` DATETIME(3) NULL  COMMENT '企业创建时间',
`register_money` DECIMAL(16,2) NULL  COMMENT '注册资金', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='企业表';
CREATE TABLE IF NOT EXISTS `t_user` ( 
`id` VARCHAR(255) NOT NULL  COMMENT '用户id',
`name` VARCHAR(255) NULL  COMMENT '用户姓名',
`birthday` DATETIME(3) NULL  COMMENT '用户出生日期',
`company_id` VARCHAR(255) NULL  COMMENT '用户所属企业id', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='用户表';
<== Total: 0
```

## 数据库类型
id使用`varchar(255)`大部分情况下太过于浪费了,有时候我们需要将其重新设置一下那么应该如何实现呢
```java

    /**
     * 企业id
     */
    @Column(primaryKey = true,comment = "企业id",dbType = "varchar(32)")
    private String id;
```
我们在属性上自己定义数据库类型生成sql将会使用对应的类型了
```sql

CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT '企业id',
`name` VARCHAR(255) NULL  COMMENT '企业名称',
`create_time` DATETIME(3) NULL  COMMENT '企业创建时间',
`register_money` DECIMAL(16,2) NULL  COMMENT '注册资金', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='企业表';
```

## 是否可为空
通过添加`nullable = false`来表明数据库对应的列为非空列
```java
    /**
     * 企业名称
     */
    @Column(comment = "企业名称",nullable = false)
    private String name;
```

```sql
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT '企业id',
`name` VARCHAR(255) NOT NULL  COMMENT '企业名称',
`create_time` DATETIME(3) NULL  COMMENT '企业创建时间',
`register_money` DECIMAL(16,2) NULL  COMMENT '注册资金', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='企业表';
```

## 添加列
我们在现有类里面添加一个类然后执行代码`执行syncTableCommand`
```java
//添加一个新列
    @Column(comment = "测试列",dbType = "varchar(500)")
    private String column;
```

```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
ALTER TABLE `t_company` ADD `column` varchar(500) NULL COMMENT '测试列';
<== Total: 0
```

## 修改列名
我们将`column`列修改为`column1`
```java

    @Column(comment = "测试列",dbType = "varchar(500)",renameFrom = "column")
    private String column1;
```
执行`syncTableCommand`
```sql
check db sql:select 1 from information_schema.schemata where schema_name='eq_db'
==> Preparing: 
ALTER TABLE `t_company` CHANGE `column` `column1` varchar(500) NULL COMMENT '测试列';
<== Total: 0
```
