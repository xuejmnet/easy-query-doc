---
title: api
order: 1
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
dropTableIfExistsCommand | 生成删除表命令，如果表存在的话
syncTableCommand | 自动同步表结构 如果数据库不存在则创建数据库(oracle不支持) 如果表不存在则创建表 如果表存在且class内的属性比数据库列多则自动生成添加列 如果列或者表添加`renameFrom`则自动生成rename命令


::: tip 说明!!!
> `syncTableCommand`永远只会新增表、新增列、新增索引、新增外键、修改列名(如果存在renameFrom),需要删除表那么需要手动执行`dropTableCommand`，暂时不对咧和索引提供删除
:::


没有数据库就创建数据库,如果已经创建了就忽略

- `createDatabaseIfNotExists`会自动创建数据库如果不存在(oracle、dameng不支持),

原理通过`DataSource`数据源解析对应的`jdbc url`、`username`和`password`,当程序无法正确解析出对应的数据时可以通过手动返回告知程序
```java

    DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
    //手动处理未知datasource
    databaseCodeFirst.createDatabaseIfNotExists(ds->new Credentials(
            "jdbc:mysql://127.0.0.1:3316/easy-query-test",
            "root",
            "root"
    ));
   
```



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


::: danger 说明!!!
> `syncTableCommand`里面出现两个类以上时`MySQL`连接字符串需要添加`&allowMultiQueries=true`参数,默认不加该参数则无法执行多条语句合并的sql
> 比如`jdbc:mysql://127.0.0.1:3316/easy-query-db?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true&allowPublicKeyRetrieval=true`
:::


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


## 数据库默认值
通过添加`dbDefault = CURRENT_TIMESTAMP(3)`来表明数据库对应的列默认值,其中nullable为非空列
```java
  
    @Column(nullable = false,dbDefault = "CURRENT_TIMESTAMP(3)")
    private LocalDateTime createTime;
```

```sql
CREATE TABLE IF NOT EXISTS `t_company` ( 
`id` varchar(32) NOT NULL  COMMENT '企业id',
`name` VARCHAR(255) NOT NULL  COMMENT '企业名称',
`create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '企业创建时间',
`register_money` DECIMAL(16,2) NULL  COMMENT '注册资金', 
 PRIMARY KEY (`id`)
) Engine=InnoDB COMMENT='企业表';
```
## 添加列
我们在现有类里面添加一个列然后执行代码`执行syncTableCommand`
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


## 数据库索引
使用`@TableIndex`添加索引如果存在多个索引可以使用`@TableIndexes`注解

`fields`表示有哪些列作为索引,`unique`是否是唯一约束索引,`name`索引名称默认`当前表_目标表_列_(u)idx`其中`idx`是普通索引`uidx`是唯一约束索引其中name的作用是jdbc会查询数据库表是否已经有改索引名称了如果没有则会添加默认可以不设置,`descendingFields`需要使用`desc`排序的列
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

## 数据库外键
使用`@ForeignKey`添加bank_card和bank之间的外键关系并且支持添加`action`如`ON DELETE CASCADE`
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
     * 银行卡号
     */
    private String code;
    /**
     * 银行卡类型借记卡 储蓄卡
     */
    private String type;
    /**
     * 所属银行
     */
    private String bankId;
    /**
     * 用户开户时间
     */
    private LocalDateTime openTime;

    /**
     * 所属银行
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"bankId"}, targetProperty = {"id"}, required = true)
    @ForeignKey
    private SysBank bank;

    /**
     * 所属用户
     */
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = {"uid"}, targetProperty = {"id"})
    private SysUser user;
}
```

生成的sql
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