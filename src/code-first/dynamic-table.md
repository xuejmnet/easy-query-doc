---
title: 动态表名列名同步
order: 20
---

# 动态表名列名同步
有时候我们需要动态创建表，通过分库分表来实现动态表名那么可以通过eq的api来实现

## syncTableCommandByMigrationData
`syncTableCommand`传递`class`信息生成同步命令,`syncTableCommandByMigrationData`这个api为`syncTableCommand`的内部api，通过传递表的迁移数据相对更加底层，如果需要实现动态表名或者其他相关信息可以使用该api

```java
DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
MigrationsSQLGenerator migrationsSQLGenerator = entityQuery.getRuntimeContext().getMigrationsSQLGenerator();
//将class解析为TableMigrationData
TableMigrationData tableMigrationData = migrationsSQLGenerator.parseEntity(SysUser.class);
//重新设置表名
tableMigrationData.setTableName(tableMigrationData.getTableName()+"_202501");//将原表+下划线和后缀
//创建命令
CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommandByMigrationData(Arrays.asList(tableMigrationData));
//执行命令
codeFirstCommand.executeWithTransaction(s->{
    s.commit();
});
```