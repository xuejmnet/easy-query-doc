---
title: Boolean Functions
order: 40
---

## not
Negates a column value
```java
List<Draft2<Boolean, Boolean>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.deleted(),
                t_blog.deleted().not()
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft2<Boolean, Boolean> item : list) {
    Assert.assertEquals(item.getValue1(), !item.getValue2());
}
```

