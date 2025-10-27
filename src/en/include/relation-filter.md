---
title: Cascade Filter Include Filter
order: 14
---
`easy-query` supports cascade filtering after version `1.10.3^`, and not only supports result queries, such as
- One-to-One: Class and teacher support querying and filtering class table where the teacher's name is Teacher Wang's class collection
- One-to-Many: Class and students support querying and filtering class table where there exists a student named XiaoMing's class collection

## Cascade Query
Filter all classes that have students whose names contain "XiaoMing"
```java
 List<SchoolClass> hasXiaoMingClass = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    //Class and students are one-to-many, so it filters students whose names are called XiaoMing
                    //If you want to query students without XiaoMing, use the `none` method
                    s.schoolStudents().any(x -> x.name().like("XiaoMing"));
                    //The following writing is also acceptable, you can also use multiple where to support
                    // s.schoolStudents().where(x -> {
                    //     x.name().like("XiaoMing");
                    //     x.classId().like("123");
                    // }).any();
                })
                .toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 WHERE t1.`class_id` = t.`id` AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %XiaoMing%(String)
```

Filter student table, condition is students whose class name contains `Class One` characters, such as `Class One`, `Class Eleven`
```java

            List<SchoolStudent> hasXiaoMingClass = easyEntityQuery.queryable(SchoolStudent.class)
//                    .include(x->x.schoolClass()) //If you need to bring out the class information where the student is located
                    .where(s -> s.schoolClass().name().like("Class One"))
                    .toList();

==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t LEFT JOIN `school_class` t1 ON t.`class_id` = t1.`id` WHERE t1.`name` LIKE ?
==> Parameters: %Class One%(String)
```

Filter classes where students live on `XX Road`
```java
List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().any(
                        x -> x.schoolStudentAddress().address().like("XX Road")
                )).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 LEFT JOIN `school_student_address` t2 ON t1.`id` = t2.`student_id` WHERE t1.`class_id` = t.`id` AND t2.`address` LIKE ? LIMIT 1)
==> Parameters: %XX Road%(String)

```

Filter classes where students live on `XX Road` and the student's name is `XiaoMing`
```java
   List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().any(
                        x -> {
                            x.schoolStudentAddress().address().like("XX Road");
                            x.name().like("XiaoMing");
                        }
                )).toList();
//The following writing is also acceptable


    List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
            .where(s -> s.schoolStudents()
                    .where(x->x.schoolStudentAddress().address().like("XX Road"))
                    .where(x->x.name().like("XiaoMing")).any()
            ).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 LEFT JOIN `school_student_address` t2 ON t1.`id` = t2.`student_id` WHERE t1.`class_id` = t.`id` AND t2.`address` LIKE ? AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %XX Road%(String),%XiaoMing%(String)

```
Filter many-to-many cascade query

A class has multiple teachers, and a teacher can also teach multiple classes. Teachers and classes are many-to-many associated through the `SchoolClassTeacher` table
```java
       List<SchoolClass> x1 = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolTeachers()
                        .any(x -> x.name().like("x"))).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_teacher` t1 WHERE t1.`id` = t.`id` AND EXISTS (SELECT 1 FROM `school_class_teacher` t2 WHERE t2.`teacher_id` = t1.`id` AND t2.`class_id` = t.`id` LIMIT 1) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %x%(String)                  
```

Filter classes where students with surnames starting with `Zhang` have 5 people
```java
 List<SchoolClass> nameStartZhang = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().where(x -> x.name().likeMatchLeft("Zhang")).count().eq(5L))
                .toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE (SELECT COUNT(*) FROM `school_student` t1 WHERE t1.`class_id` = t.`id` AND t1.`name` LIKE ?) = ?
==> Parameters: Zhang%(String),5(Long)
```

