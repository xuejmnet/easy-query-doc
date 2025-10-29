---
title: Structured Objects
order: 10
---

`easy-query` 1.2.1+ supports association queries, supports multi-level association queries, and only supports first and tolist return methods. Supports VO object returns, supports `include` to append tracking, disable, logical delete, where filtering, order, limit and other processing. However, the return result must be a database object instance (inside the include method). If you need additional field returns, you can use `columnInclude`/`columnIncludeMany` for custom returns.

::: warning Note!!!
> `OneToOne` and `ManyToOne` have natural distinctions. For example, each record has a creator id. If you add a creator relationship object to the record object, it should be set as `ManyToOne`, indicating that multiple records will have this creator, rather than `OneToOne`. If you set `OneToOne`, then if 2 records have the same creator, only one creator will be associated. This can be deduced in reverse, for example, how many records does one person have, obviously it's `OneToMany`, so in reverse it's `ManyToOne`
:::

Type  | Description | Scenario 
--- | --- | --- 
OneToOne | One-to-One  | Student and student family information
OneToMany | One-to-Many | Class and students
ManyToOne | Many-to-One  | Student and class
ManyToMany | Many-to-Many  | Class and teachers


::: danger note!!!
> `include` can only be used with the eq source table for hierarchical (tree-structured) object fetching.
:::


```java

List<SchoolClass> classes = easyEntityQuery.queryable(SchoolClass.class)
                        //Query classes and also query the first 5 students enrolled earliest in each class
                        .include(o -> o.schoolStudents(),x->x.orderBy(u->u.createTime().asc()).limit(5))
                        .toList();

```


::: tip Thanks!!!
> The following relationship diagrams were provided by netizen [`糊搞`](https://gitee.com/gollyhu), many thanks
:::

### One-to-One Explanation
<img :src="$withBase('/images/include1.png')">

### Many-to-One Explanation
<img :src="$withBase('/images/include2.png')">

### One-to-Many Explanation

<img :src="$withBase('/images/include3.png')">

### Many-to-Many Explanation

<img :src="$withBase('/images/include4.png')">

### Multiple includes

<img :src="$withBase('/images/include5.png')">

### Multiple Association Queries

<img :src="$withBase('/images/include6.png')">


::: warning Note!!!
> `include` internally is an independent query. If you need differential updates and haven't configured default startup tracking queries, you need to independently perform `asTracking()`, etc. The second parameter of include's one or many indicates how many related properties are grouped for retrieval
:::

Object mode `include/includes` parameter description. If your navigation property is `ToOne`, please use `include`. If it's `ToMany`, use `includes`.

The two parameters included: the first parameter indicates the navigation property you want to return, and the second parameter indicates how to enhance the returned navigation property
```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                //Query school classes and also query the teachers of the class
                .include(s -> s.schoolTeachers())
                //Query school classes and also query the students of the class (these students are the 3 oldest in each class) and the returned students also need to return student addresses
                .include(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress())
                    .orderBy(y->y.age().desc())
                    .limit(3);
                })
                .where(s -> {
                    s.name().eq("Class One");
                }).toList();
```

::: code-tabs
@tab Object Mode
```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
        //One-to-one query enables tracking and disables logical delete for sub-query
        .include(o -> o.schoolClass(),q->q.asNoTracking().disableLogicDelete())
        .toList();


List<SchoolStudent> list2 = easyEntityQuery.queryable(SchoolStudent.class)
        //One-to-one query enables tracking and disables logical delete for sub-query
        //If there are more than 20 students queried, say 21, it will first query with 20 ids using in, then query with 1 id, and finally merge
        .include(o -> o.schoolClass(),20)
        .toList();
```

@tab Property Mode
```java
  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //One-to-one query enables tracking and disables logical delete for sub-query
                        .include(o -> o.with("schoolStudentAddress").asTracking().disableLogicDelete())
                        .toList();


  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //One-to-one query enables tracking and disables logical delete for sub-query
                        //If there are more than 20 students queried, say 21, it will first query with 20 ids using in, then query with 1 id, and finally merge
                        .include(o -> o.with("schoolStudentAddress",20))
                        .toList();
```


::: 



## include2
Starting from version `eq 3.1.47+`, the include2 feature was introduced.
In complex nested scenarios, include2 can replace the default include(s).
include2 provides IDE-friendly code hints, and compared with the original include, it changes from a single-parameter to a dual-parameter form.


Parameter  | Description  
---  | --- 
Parameter 1 | The include context used to add additional query logic
Parameter 2  | The main (root) table of the current expression, i.e., the from table

```java
                List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                        .include((c,s)->{
                            c.query(s.schoolTeachers().flatElement().schoolClasses()).where(a -> a.name().like("123"));
                            c.query(s.schoolStudents().flatElement().schoolClass()).where(x -> x.schoolStudents().flatElement().name().eq("123"));
                            c.query(s.schoolStudents()).where(x -> x.name().ne("123"));
                        })
                        .toList();
```
The `query()` method accepts a navigation property from the main table.
This property can be an object, a collection, or even a nested collection obtained through further navigation.

For example:
`c.query(s.schoolTeachers().flatElement().schoolClasses()).where(a -> a.name().like("123"))`
means that the user wants to query from the main table, then perform a secondary query that brings in both schoolTeachers and schoolClasses.
An additional filter condition name().like("123") is applied to the last table.
Filtering, ordering, and pagination operations can all be chained after query().

If the navigation property is a collection, you can directly use where, orderBy, limit, etc.
 `s.schoolStudents().flatElement().schoolClass()` means that both schoolStudents and schoolClass are included in the query result.
```sql

-- SQL 1

    SELECT
        `id`,
        `name` 
    FROM
        `school_class`
-- SQL 2

    SELECT
        `class_id`,
        `teacher_id` 
    FROM
        `school_class_teacher` 
    WHERE
        `class_id` IN ('teacher1', 'teacher2', ?)
-- SQL 3

    SELECT
        t.`id`,
        t.`name` 
    FROM
        `school_teacher` t 
    WHERE
        t.`id` IN ('teacher1', 'teacher2')
-- SQL 4

    SELECT
        `teacher_id`,
        `class_id` 
    FROM
        `school_class_teacher` 
    WHERE
        `teacher_id` IN ('%123%', 'class1')
-- SQL 5

    SELECT
        t.`id`,
        t.`name` 
    FROM
        `school_class` t 
    WHERE
        t.`name` LIKE '123' 
        AND t.`id` IN ('class1', 'class2')
-- SQL 6

    SELECT
        t.`id`,
        t.`class_id`,
        t.`name` 
    FROM
        `school_student` t 
    WHERE
        t.`name` <> '123' 
        AND t.`class_id` IN ('class1', 'class2', ?)
-- SQL 7

    SELECT
        t.`id`,
        t.`name` 
    FROM
        `school_class` t 
    WHERE
        EXISTS (SELECT
            1 FROM `school_student` t1 
        WHERE
            t1.`class_id` = t.`id` 
            AND t1.`name` = ? 
        LIMIT
            1) 
        AND t.`id` IN (?, ?)
```


## Ignore Association Query Values
By default, `eq` association queries use the value of `selfProperty` to perform a secondary association query on the target property's table. By default, if the value of `selfProperty` is `null`, the target property will not be queried again. Sometimes our database may have other values that are equivalent to null in representation, such as string `-`, `/`, or empty strings. For secondary queries, these are actually meaningless, so how should we replace them to make the framework support this?

This content is mainly in [this link](https://github.com/dromara/easy-query/issues/302)

First, we need to replace the `RelationNullValueValidator` interface

Method  | Purpose
--- | --- 
isNullValue | Returns whether this object is a null value that needs to be ignored

Let's look at its default implementation `DefaultRelationNullValueValidator`
```java
public class DefaultRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
        }
        return false;
    }
}

```
### Replacement
We need to replace the `isNullValue` method of `RelationNullValueValidator` with our own
```java

public class MyRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
            if (Objects.equals("-", value) || Objects.equals("/", value)) {
                return true;
            }
        }
        return false;
    }
}



```

### Finally Replace the Service
```java
replaceService(RelationNullValueValidator.class, MyRelationNullValueValidator.class)
```


## Navigate


Property  | Required | Default Value  | Description
--- | --- | --- | --- 
value | `true`  | - | Indicates the relationship between the current object and target object `RelationTypeEnum` enum
selfProperty | `false`  | - | Which property of the current object is associated with the target object, empty means using the primary key of the current object
targetProperty | `false`  | - | Which property of the target is associated with the current object's `selfProperty` property, empty means using the primary key of the target object
mappingClass | `false`  | Object.class | Mapping table object, must be a table object entity class
selfMappingProperty | `false` required for many-to-many  | - | Which property of the mapping table corresponds to the current object's `selfProperty` property, cannot be empty for many-to-many
targetMappingProperty | `false` required for many-to-many  | - | Which property of the mapping table corresponds to the target object's `targetProperty` property, cannot be empty for many-to-many
orderByProps | `false`  | - | Default child object sorting behavior (recommended to set for ToMany)
offset | `false` | 0 | Child object fetch offset (recommended to set for ToMany)
limit | `false`  | 0 | Child object fetch limit (recommended to set for ToMany)
extraFilter | `false`  | Def.class | Extra conditions for child objects, for example, class and students can have additional properties like male students and female students, which can be classified through this property


## More Examples
| [Click to see more examples](/easy-query-doc/examples/include-example)

