---
title: selectAutoInclude不使用实体
order: 60
---

如果 EQ 的 include / selectAutoInclude 实现是 二次查询 + IN（而不是 JOIN），那文档里的解释确实需要调整，否则会误导使用者。核心问题就不再是 JOIN 爆炸，而是 额外 SQL 数量和查询范围不可控。

我帮你重新整理一版更准确、更适合写进文档的说明。



为什么 selectAutoInclude 不建议使用实体作为入参

在 Easy Query（EQ）框架中，selectAutoInclude 的设计目标是：

根据返回对象的结构自动推导需要加载的导航属性。

因此，该能力更适用于 DTO 投影，而不建议直接使用 实体类 作为入参。

原因在于：实体结构是动态演进的，而 DTO 是稳定的查询契约。



### 1. 实体结构会随着业务发展不断扩展

实体类属于领域模型，在业务演进过程中通常会不断新增导航属性。

例如最初的 User 实体：

```java
class User {
    private String id;
    @Navigate
    private School school;
}
```

某个接口使用：

```java
query.selectAutoInclude(User.class)
```

框架只会自动加载：

```text
User -> School
```

但随着业务发展，实体新增导航属性：

```java
class User {
    private String id;
    @Navigate
    private School school;
    @Navigate
    private ClassRoom classRoom;
    @Navigate
    private List<Paper> papers;
}
```

此时 原来的代码完全没有修改，但查询行为会自动变成：

```text
User
 ├─ School
 ├─ ClassRoom
 └─ Papers
```




### 2. 自动 Include 会产生额外 SQL 查询

EQ 的 include / selectAutoInclude 不是通过 JOIN 实现，而是通过 二次查询 + IN 条件 来加载导航属性。

例如查询用户：
```sql
SELECT * FROM user
```

加载 School：
```sql
SELECT * FROM school WHERE id IN (...)
```

加载 Papers（一对多）：
```sql
SELECT * FROM paper WHERE user_id IN (...)
```

如果实体新增导航属性：

```text
User
 ├─ School
 ├─ ClassRoom
 ├─ Papers
 └─ Roles
```

SQL 可能变成：

```sql
SELECT * FROM user;
SELECT * FROM school WHERE id IN (...);
SELECT * FROM class_room WHERE id IN (...);
SELECT * FROM paper WHERE user_id IN (...);
SELECT * FROM role_user WHERE user_id IN (...);
```

结果是：
	•	SQL 数量增加
	•	查询范围扩大
	•	数据加载量增加

而调用代码本身 没有任何变化。



### 3. 自动 Include 的深度和广度不可控

如果 selectAutoInclude(Entity.class)，框架会：
	1.	扫描实体上的 @Navigate
	2.	自动生成 include
	3.	递归解析导航关系

这会导致两个问题：

1）广度不可控

```text
User
 ├─ School
 ├─ ClassRoom
 ├─ Papers
 ├─ Roles
 └─ Permissions
```

新增导航属性后：
	•	自动 include 数量增加
	•	SQL 数量增加



2）深度不可控

例如：

```text
User
 └─ School
      └─ Address
           └─ City
```

框架可能会继续自动 include：

```text
User
 └─ School
      └─ Address
           └─ City
```

查询层级会不断扩大。



### 4. API 行为会变得不稳定

如果接口返回 实体对象：

```java
public User getUser(...)
```

并使用：

selectAutoInclude(User.class)

那么当实体新增导航属性时：

可能发生：
	•	SQL 查询数量增加
	•	加载数据变多
	•	接口响应时间变慢
	•	返回 JSON 结构变复杂

这意味着：

接口行为会随着实体结构变化而变化。

即使调用代码完全没有修改。



### 5. DTO 是稳定的查询契约

DTO 通常是接口定义的一部分，是稳定的。

例如：

```java
class UserDTO {
    private String id;
    private String schoolName;
}
```

查询：

```java
query.selectAutoInclude(UserDTO.class)
```

框架只会加载 DTO 需要的导航数据：

```text
User
 └─ School
      └─ schoolName
```

即使实体新增：

```text
User
 ├─ Papers
 ├─ Roles
 └─ Address
```

也不会影响查询行为。



### 6. 返回实体时推荐使用 include

如果接口需要返回 实体对象，推荐显式指定 include：

```java
query
    .include(user -> user.school())
    .include(user -> user.classRoom())
    .toList();
```

这样可以：
	•	明确加载哪些导航属性
	•	避免隐式扩展
	•	保持查询行为稳定



最佳实践

场景	推荐方式
返回 DTO	selectAutoInclude
返回实体	include
返回实体 + selectAutoInclude	❌ 不推荐




总结

selectAutoInclude 的核心能力是：

根据返回对象自动推导需要加载的导航属性。

但如果用于实体：
	•	实体结构会不断扩展
	•	自动 include 数量会增加
	•	额外 SQL 查询会增加
	•	查询范围不可控

因此：

selectAutoInclude 只推荐用于 DTO 投影，而不建议用于实体查询。




## 为什么 ORM 不使用 JOIN 而使用二次查询 IN

开发者默认会认为 ORM 的关联加载一定是 JOIN，但实际上 很多成熟 ORM（如 Hibernate、EF Core、JPA 等）在某些场景下都会选择二次查询 + IN。
EQ 使用这种方式是有明确设计理由的，可以从 结果集稳定性、性能、ORM 映射复杂度 三个角度解释。

我给你整理了一版 可以直接写进框架文档的说明。



为什么 ORM 不使用 JOIN，而使用二次查询 + IN

在 Easy Query（EQ）框架中，include / selectAutoInclude 在加载导航属性时，默认采用 二次查询 + IN 条件 的方式，而不是直接通过 SQL JOIN 一次性查询。

例如：

```sql
SELECT * FROM user
```

随后根据用户主键集合加载导航属性：

```sql
SELECT * FROM school WHERE id IN (...);
SELECT * FROM paper WHERE user_id IN (...);
```

这种设计并不是偶然，而是为了避免 JOIN 带来的多个问题。



### 1. 避免一对多 JOIN 导致结果集膨胀

在一对多关系中，如果使用 JOIN：

```sql
SELECT *
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
```

如果数据是：

```text
User: 1, 2

Paper:
- user1 -> 3条
- user2 -> 2条

JOIN 后的结果:
- user1 paper1
- user1 paper2
- user1 paper3
- user2 paper1
- user2 paper2

结果集从 2 行变成 5 行
```

如果再继续 JOIN 多个一对多关系，例如：

```text
User
 ├─ Papers
 └─ Roles
```

结果可能变成：`user × papers × roles`，这会产生**笛卡尔级增长**。

而使用 二次查询 + IN：

```sql
SELECT * FROM user;
SELECT * FROM paper WHERE user_id IN (...);
SELECT * FROM role WHERE user_id IN (...);
```

结果集规模保持稳定：

```text
user  -> 2 rows
paper -> 5 rows
role  -> n rows
```

不会发生结果集膨胀。



### 2. 保持主查询结果稳定

使用 JOIN 时，主表记录会被重复。

例如：

```sql
SELECT u.*, p.*
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
```

ORM 在映射对象时必须：
	•	去重 User
	•	聚合 Paper

这会带来额外复杂度：
	•	对象去重
	•	HashMap 合并
	•	内存开销

而使用二次查询：

```sql
SELECT * FROM user
```

主查询始终是：`User 数量 = SQL 行数`

ORM 映射过程更简单、更稳定。



### 3. 更好的分页语义

如果使用 JOIN：

```sql
SELECT *
FROM user u
LEFT JOIN paper p ON p.user_id = u.id
LIMIT 10
```

实际含义变成：

限制 JOIN 后的结果

而不是：

限制 User 数量

例如：

```text
user1 有 10 条 paper

LIMIT 10 可能只返回：user1
```

这会导致 **分页结果错误**。

而二次查询方式：

```sql
SELECT * FROM user LIMIT 10;
SELECT * FROM paper WHERE user_id IN (...);
```

分页语义完全正确。



### 4. SQL 复杂度更低

当导航关系变多时：

```text
User
 ├─ School
 ├─ Papers
 ├─ Roles
 └─ Permissions
```

如果使用 JOIN：

```sql
SELECT ...
FROM user
LEFT JOIN school ...
LEFT JOIN paper ...
LEFT JOIN role ...
LEFT JOIN permission ...
```

SQL 会迅速变得：
	•	难以优化
	•	执行计划复杂
	•	数据重复严重

而二次查询：

```sql
-- 1. SELECT user
SELECT * FROM user;

-- 2. SELECT school WHERE id IN (...)
SELECT * FROM school WHERE id IN (...);

-- 3. SELECT paper WHERE user_id IN (...)
SELECT * FROM paper WHERE user_id IN (...);

-- 4. SELECT role WHERE user_id IN (...)
SELECT * FROM role WHERE user_id IN (...);
```

每个 SQL 都是：
	•	简单
	•	可预测
	•	易优化



### 5. 更符合 ORM 的对象加载模型

ORM 的目标是构建对象图：

```text
User
 ├─ School
 └─ Papers
```

而不是扁平结果集：

```text
user + school + paper
```

二次查询方式更接近对象模型：

```text
Step1: load users
Step2: load schools
Step3: load papers
Step4: assemble object graph
```

逻辑更加清晰。



设计总结

相比 JOIN，二次查询 + IN 具有以下优势：

对比项	JOIN	二次查询 IN
一对多结果集	膨胀	稳定
分页语义	容易错误	正确
SQL复杂度	高	低
ORM映射	复杂	简单
可维护性	较差	更好

因此在 EQ 框架中：

include / selectAutoInclude 默认采用 二次查询 + IN 的策略来加载导航属性。



如果你愿意，我还可以帮你 补一段更“杀手级”的内容，是很多 ORM 文档都会写的：

为什么“单 SQL JOIN 查询整个对象图”在复杂系统里几乎不可行。

这一段如果写进 EQ 文档，会非常有说服力。