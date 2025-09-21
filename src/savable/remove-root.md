---
title: 移除聚合根
order: 120
---

# 移除聚合根
正常我们的`savable`只具备新增或修改的功能我们通过添加`removeRoot`可以做到将整个聚合根删除
```java
//include 查询
            try (Transaction transaction = easyEntityQuery.beginTransaction()) {
                easyEntityQuery.savable(m8SaveRoot).removeRoot().executeCommand();
                transaction.commit();
            }
```
`removeRoot`会将对象的导航属性全部设置为null,然后本次被查询的导航都会被删除