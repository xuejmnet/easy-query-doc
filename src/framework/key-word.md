---
title: 数据库关键字处理
---

# 数据库关键字处理
我们常常遇到java的属性命名规范问题,比如boolean `is`开头或者`private String aType`这种命名,在`eq`里面设置`propertyMode`为`same_as_entity`那么即可，还有一种情况是我们的属性名和数据库关键字冲突,比如`private String order`其中`order`是数据库关键字那么我们应该怎么处理呢。

`eq`默认不需要用户关心数据库关键字,因为`eq`默认已经对sql语句进行了关键字处理(只要你选择正确的数据库)


数据库  | 关键字处理
--- | --- 
MySQL | \`order\`  
PGSQL | "order"
MsSQL | [order]


## 选择数据库



::: tabs

@tab console
```java

EasyQueryClient client = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            //进行一系列可以选择的配置
            //op.setPrintSql(true);
        })
        //设置真确的数据库
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```

@tab springboot
```yml

easy-query:
  #支持的数据库
  database: mysql
```

@tab solon
```yml


easy-query: 
  # 配置自定义日志
  # log-class: ...
  db1:
    # 支持mysql pgsql h2 mssql dameng mssql_row_number kingbase_es等其余数据库在适配中
    database: mysql
```

:::

## 案例
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
            //进行一系列可以选择的配置
            //op.setPrintSql(true);
        })
        //设置真确的数据库
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
EasyEntityQuery easyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);

DatabaseCodeFirst databaseCodeFirst = easyEntityQuery.getDatabaseCodeFirst();
databaseCodeFirst.createDatabaseIfNotExists();
CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(EntityColumnKey.class));
codeFirstCommand.executeWithTransaction(arg->arg.commit());
EntityColumnKey entityColumnKey = new EntityColumnKey();
entityColumnKey.setId("1");
entityColumnKey.setKey("2");
easyEntityQuery.insertable(entityColumnKey).executeRows();
List<EntityColumnKey> list = easyEntityQuery.queryable(EntityColumnKey.class).toList();
System.out.println(list);




check db sql:select 1 from information_schema.schemata where schema_name='easy-query-test'
==> Preparing: 
CREATE TABLE IF NOT EXISTS `test_table` ( 
`id` VARCHAR(255) NOT NULL ,
`key` VARCHAR(255) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
<== Total: 0
==> Preparing: INSERT INTO `test_table` (`id`,`key`) VALUES (?,?)
==> Parameters: 1(String),2(String)
<== Total: 1
==> Preparing: SELECT `id`,`key` FROM `test_table`
<== Time Elapsed: 2(ms)
<== Total: 1
[EntityColumnKey(id=1, key=2)]
```


::: warning 说明!!!
> 上述实体的key为关键字我们对其设置mysql后将会对列名添加关键字处理
:::