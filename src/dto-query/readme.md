---
title: DTO查询概述
---

# DTO查询
DTO查询是一种一DTO作为媒介来直接实现对数据库的数据进行筛选，排序和结果集返回。主要包含以下三大块
- whereObject
- orderByObject
- selectAutoInclude

## whereObject
[whereObject](/easy-query-doc/dto-query/filter)
按请求数据对象(或构建出一个结构化对象)直接进行对数据的筛选

## orderByObject
[orderByObject](/easy-query-doc/dto-query/sort)
按请求数据对象(或构建出一个对象)直接进行对数据的排序

## selectAutoInclude
[selectAutoInclude](/easy-query-doc/dto-query/map1)
使用DTO来描述构建一个返回数据的对象形状，直接对数据库数据进行查询并且自动以最高效的形式进行组装,实现实体对象在DTO对象上的结构映射比如用户和银行卡的一对多关系
```json
{
  "id": "U1001",
  "name": "张三",
  "age": 30,
  "createTime": "2025-11-05T10:30:00",
  "saveBankCards": [
    {
      "id": "C2001",
      "type": "DEBIT",
      "code": "6222021234567890",
      "uid": "U1001",
      "bankId": "B001"
    },
    {
      "id": "C2002",
      "type": "CREDIT",
      "code": "6228489876543210",
      "uid": "U1001",
      "bankId": "B002"
    }
  ]
}
```