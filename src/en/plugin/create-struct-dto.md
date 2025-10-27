---
title: Create Structured DTO
order: 40
category:
  - plugin
---

# CreateStructDTO
Structured DTO is a feature that implements quick return of structured relational data in a convenient and easy-to-read way using `eq` object-relational tree transfer object mapping.

- Supports fetching required properties by any property
- Supports custom settings at any level

## 1. Create DTO (Required)
Creating DTOs manually is very tedious. With `easy-query:1.10.60^` + `plugin 0.0.48^`, you can quickly generate nested structured object models.
Right-click on the package where you need to create the DTO and select `CreateStructDTO`.

<img :src="$withBase('/images/EQDTO1.jpg')">

## 2. Configure Common Ignored Properties (Optional)
Used to configure properties that don't need to be returned to the frontend, such as pwd, deleted, or deleted_time.
<img :src="$withBase('/images/EQDTO2.jpg')">
<img :src="$withBase('/images/EQDTO3.jpg')">
<img :src="$withBase('/images/EQDTO4.jpg')">

## 3. Check the Properties to Return (Required)
Check the properties that need to be returned. Even if relational properties are not checked, eq will automatically generate SQL.
<img :src="$withBase('/images/EQDTO5.jpg')">

## 4. View the DTO File
View the DTO file and import any missing property packages.
<img :src="$withBase('/images/EQDTO6.jpg')">

