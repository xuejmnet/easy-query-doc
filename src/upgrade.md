---
title: 更新日志
---

# 图标说明
- 🔧修复
- 🔃调整
- ❌移除
- ⬆️升级
# 更新日志
## 0.9.30(当前版本)
- 支持kotlin
- 框架大调整提供字符串属性查询和lambda强类型查询
## 0.9.12
- `ConnectionManager` 添加当前事务是否开启,添加获取当前事务
- 拦截器修改方法名`defaultEnable`改成`enable`

## 0.9.10
- ⬆️优化多线程死锁限制,优化读写分离获取链接限制，添加getconnection的超时时间单独限制mergepoolsize
## 0.9.9
- ⬆️优化多线程死锁限制,优化读写分离获取链接限制，添加getconnection的超时时间
- ⬆️优化单个connection的获取,添加getconnection busy的提示,针对track支持复杂类型

## 0.9.7
- ⬆️升级优化分片下可能会有长时间block的deadlock问题

## 0.9.2
- 🔃调整EasyQueryNotFoundException调整为EasyQueryFirstOrNotNullException
## 0.9.1
- 🔃调整将原先聚合函数设置别名api改成xxxAs
- 🔃调整检查spring事务是否已经开启兼容防止嵌套事务,检查spring事务在链接完成后关闭检测是否重复开启事务
- 🔃调整框架默认maxShardingRouteCount:128,springboot下executorQueueSize：1024
- 🔃调整新增whereByIds接口,对delete添加 Interceptable
- 🔃调整EasyQuerySQLException调整为EasyQuerySQLCommandException EasyQuerySqlExecuteException调整为EasyQuerySQLException close资源释放接口调整为throws SQLException减少EasyQueryException的异常包裹次数
- 🔃调整优化toValue逻辑,是否为null都应该进入转换器
- 🔃调整枚举命名空间LogicDeleteStrategyEnum
## 0.9.0
- 🔃调整`columnCount`、`columnSum`、`columnMax`、`columnMin`、`columnAvg`、`columnLen`在使用别名时api改为`columnCountAs`、`columnSumAs`、`columnMaxAs`、`columnMinAs`、`columnAvgAs`、`columnLenAs`
- 🔃调整`allowDeleteCommand`接口修改为`allowDeleteStatement`

## 0.8.14
- 🔧修复insert的默认行为

## 0.8.13
- 🔧修复springboot3.x 自动装配