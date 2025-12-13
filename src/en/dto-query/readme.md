---
title: DTO Query Overview
---

# DTO Query
DTO Query is a method that uses DTO as a medium to directly filter, sort, and return result sets from the database. It mainly includes the following three parts:
- whereObject
- orderByObject
- selectAutoInclude

## whereObject
[whereObject](/easy-query-doc/en/dto-query/filter)
Filter data directly based on request data objects (or by constructing a structured object)

## orderByObject
[orderByObject](/easy-query-doc/en/dto-query/sort)
Sort data directly based on request data objects (or by constructing an object)

## selectAutoInclude
[selectAutoInclude](/easy-query-doc/en/dto-query/map1)
Use DTO to describe and construct a return data object shape, directly query database data and automatically assemble it in the most efficient way, implementing structural mapping of entity objects on DTO objects. For example, a one-to-many relationship between users and bank cards:
```json
{
  "id": "U1001",
  "name": "John",
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

