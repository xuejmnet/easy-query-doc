---
title: Object Relational Query Case 1 ✨
order: 6
category:
  - Guide
tag:
  - multi-table
---

Why do we need object relational queries? Why are object relational queries called `nodsl`? A good ORM should not only focus on DSL statements, because `DSL` statements are just strongly typed SQL concatenation. Object relationships are the essence of `ORM`. However, if an `ORM` only has object relational queries, then it's not a good `ORM`. A good `ORM` should have both `DSL + nodsl`.

By default, navigation properties are not automatically queried without using `include`. If `select` returns navigation properties, `include` will be automatically performed. If it's a VO object mapping, then `include` needs to be called manually.

The following cases do not require calling `include` or `includes`:

- Returning `to-one navigation properties` rather than `to-many`, including related columns, where `to-one` includes `many-to-one` and `one-to-one`
- Returning the navigation property itself `.select(o->o.parent())`
- Returning columns of navigation properties like `.select(o->o.parent().id())`
- Returning to-many navigation properties like `.select(o->o.roles().toList())`

::: danger Note!!!

> If your object relationships involve many-to-many, please use version `1.10.29+`. In earlier versions, there was an oversight that caused relationships to appear prematurely in `where`, resulting in incorrect results. Thanks again to user `←X→↑Y↓` for testing and pointing out the issue.
> 
:::

## Relational Objects

Next, I will demonstrate school relationship information:

`Class`, `Teacher`, `Student`, `Student Home Address`

A class has multiple students, a class has multiple teachers, a teacher can also teach multiple classes, each student has their own home address, and each student has multiple courses of their own choice.

::: code-tabs
@tab Class

```java

@Table("school_class")
@Data
@ToString
@EntityProxy
public class SchoolClass implements ProxyEntityAvailable<SchoolClass , SchoolClassProxy> {
    @Column(primaryKey = true)//Primary key
    private String id;
    private String name;

    //One-to-many: One class has multiple students
    @Navigate(value = RelationTypeEnum.OneToMany, targetProperty = "classId")
    private List<SchoolStudent> schoolStudents;

    //Many-to-many
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfMappingProperty = "classId"
            , targetMappingProperty = "teacherId")

    private List<SchoolTeacher> schoolTeachers;

}

//Mapping table for class and teacher
@Table("school_class_teacher")
@Data
@ToString
@EntityProxy
public class SchoolClassTeacher implements ProxyEntityAvailable<SchoolClassTeacher , SchoolClassTeacherProxy> {
    @Column(primaryKey = true)
    private String classId;
    @Column(primaryKey = true)
    private String teacherId;

}
```

@tab Teacher

```java

@Table("school_teacher")
@Data
@ToString
@EntityProxy
public class SchoolTeacher implements ProxyEntityAvailable<SchoolTeacher , SchoolTeacherProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;

    //Navigation property - you can omit this if you don't need to process classes from the teacher side
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfProperty = "id"
            , selfMappingProperty = "teacherId"
            , targetProperty = "id"
            , targetMappingProperty = "classId")
    private List<SchoolClass> schoolClasses;

}
```

@tab Student

```java

@Table("school_student")
@Data
@ToString
@EntityProxy
public class SchoolStudent implements ProxyEntityAvailable<SchoolStudent, SchoolStudentProxy> {
    @Column(primaryKey = true)
    private String id;
    private String classId;
    private String name;
    private String age;

    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = "classId")
    private SchoolClass schoolClass;

    @Navigate(value = RelationTypeEnum.OneToOne, targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;

    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "studentId")
    private List<SchoolCourse> schoolCourses;

}
```

@tab Student Courses

```java


@Table("school_course")
@Data
@ToString
@EntityProxy
public class SchoolCourse implements ProxyEntityAvailable<SchoolCourse , SchoolCourseProxy> {
    @Column(primaryKey = true)//Primary key
    private String id;
    private String studentId;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "studentId")
    private SchoolStudent schoolStudent;

}
```

:::

## Case 1

Query classes that have students with surname "Jin"

```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().any(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();
//The following syntax is equivalent
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).any();
                }).toList();

//Cascading penetration: After flatElement, only single condition judgment is supported. Multiple conditions will generate multiple Exists functions
//So if there are multiple conditions, it's still recommended to use where or any. flatElement supports multi-level penetration
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    //Flatten schoolStudents collection and penetrate down to directly judge the name
                    s.schoolStudents().flatElement().name().likeMatchLeft("金");
                }).toList();


//Both ways above can query the class table, filtering classes associated with students where there exists a student with surname Jin
```

Query classes that do not have students with surname "Jin"

```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().none(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();

//Both ways can query the class table, filtering classes associated with students where there does not exist a student with surname Jin
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).none();
                }).toList();
```

## Case 2

Query which classes have students whose home address is in Shaoxing City

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().any(stu -> {
                stu.schoolStudentAddress().address().like("绍兴市");
            });
        }).toList();
```

## Case 3

Query classes that have exactly 5 students with surname "Jin"

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().where(stu -> {
                stu.name().likeMatchLeft("金");
            }).count().eq(5L);
        }).toList();
```

## Case 4

Query classes where the average age of students is less than or equal to 12 years old (can be used to filter classes with average Chinese score below 60, same principle)

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().avg(stu->stu.age()).le(BigDecimal.valueOf(12));
        }).toList();
```

Query classes where the average age of male students is less than or equal to 12 years old

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().where(o->o.sex().eq(SexEnum.Male)).avg(stu->stu.age()).le(BigDecimal.valueOf(12));
        }).toList();
```

## Case 5

Assuming there is no direct relationship between class and student

Query classes that have teachers with surname "Jin" and get both class and teacher

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
//include get to-one and to-many relationships respectively. The second parameter of include(s) can filter the returned data results. If not added, it returns all related teachers under the current class
        .include(s -> s.schoolTeachers(),s->{
            //Get teacher information for to-many, but only return those with surname Jin
            s.where(t->t.name().likeMatchLeft("金"));
        })
        .where(s -> {
            //Determine if the class has teachers with surname Jin
            s.schoolTeachers().where(teacher->{
                teacher.name().likeMatchLeft("金");
            }).any();
        }).toList();
```

## Case 6

Query a student named "Xiaoming" and get Xiaoming's class and home address

```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
                .include(s -> s.schoolStudentAddress())
                .include(s -> s.schoolClass())
                .where(s -> {
                    s.name().eq("小明");
                }).toList();
```

## Case 7

Query the class named `Class One` along with the students in the class and return the students' home addresses including the teachers in the class

```java
     List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .include(s -> s.schoolTeachers())
                .include(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress());
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```
## Case 8

Query the class named `Class One` along with the top three oldest students in the class and return the students' home addresses including the teachers in the class

```java
     List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .include(s -> s.schoolTeachers())
                .include(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress())
                    .orderBy(y->y.age().desc())
                    .limit(3);
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```

## Case 9
Query courses that belong to Class One. Since courses currently have no direct relationship with classes, this can only be achieved through students.
```java
//Implementation 1: Directly query courses and filter for those associated with Class One - one SQL query
List<SchoolCourse> courses = easyEntityQuery.queryable(SchoolCourse.class)
        .where(s -> {
            s.schoolStudent().schoolClass().name().like("一班");
        }).toList();

//easy-query version 2.0.3+

//Implementation 2: Directly query Class One and fetch the required courses under students when pulling - multiple SQL queries
List<SchoolCourse> courses = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.name().like("一班");
        })
        //Note: If the returned result is a to-many collection, you need to call flatElement to flatten the result. If it's a single object, you don't need to
        //The meaning of the returned result: query students, flatten, query courses below, then flatten
        .toList(x -> x.schoolStudents().flatElement().schoolCourses().flatElement());
//Method 2 is suitable for many-to-many situations, such as querying the menus owned by Xiaoming. Since Xiaoming and roles are many-to-many, and roles and menus are also many-to-many, you can use Method 2. Of course, Method 1 can also be used
```
## Case 10

Return VO objects with automatic include for hierarchical object return

::: code-tabs
@tab Class VO

```java

@Data
@EntityProxy
public class SchoolClassVO {
    private String id;
    private String name;
    @Navigate(RelationTypeEnum.OneToMany)
    private List<SchoolStudentVO> schoolStudents;
    @Navigate(RelationTypeEnum.ManyToMany)
    private List<SchoolTeacherVO> schoolTeachers;
}
```

@tab Student VO

```java

@Data
@EntityProxy
public class SchoolStudentVO {
    private String id;
    private String classId;
    private String name;

    @Navigate(RelationTypeEnum.OneToOne)
    private SchoolStudentAddressVO schoolStudentAddress;

}
```

@tab Student Address VO

```java

@Data
@ToString
@EntityProxy
public class SchoolStudentAddressVO {
    private String id;
    private String studentId;
    private String address;
    private String name;
}

```

@tab Teacher VO

```java

@Data
@ToString
@EntityProxy
public class SchoolTeacherVO {
    private String id;
    private String name;

}

```

:::

Automatically filter and return structured data. The corresponding navigation properties must have the same name to work. For example, if the database entity's associated student property is called `schoolStudents`, then the VO must also have this name.

```java
//Query the class named Class One and return the corresponding VO. It will automatically fetch the corresponding data according to the VO
List<SchoolClassVO> listx= easyEntityQuery.queryable(SchoolClass.class)
                        .where(s -> s.name().like("一班"))
                        .selectAutoInclude(SchoolClassVO.class)
                        .toList();
```


## Case 9 Advanced
Manually creating VOs is a complex task. In `easy-query:1.10.60^` + `plugin 0.0.48^`, you can quickly generate nested structured object models.

<img :src="$withBase('/images/EQDTO1.jpg')">
<img :src="$withBase('/images/EQDTO2.jpg')">
<img :src="$withBase('/images/EQDTO3.jpg')">
<img :src="$withBase('/images/EQDTO4.jpg')">
<img :src="$withBase('/images/EQDTO5.jpg')">
<img :src="$withBase('/images/EQDTO6.jpg')">


## Advanced Extensions

Support for additional filter conditions, for example:

Relationship between users and books

```java
@Table("relation_user")
@EntityProxy
@Data
public class RelationUser implements ProxyEntityAvailable<RelationUser , com.easy.query.test.entity.relation.proxy.RelationUserProxy> {
    @Column(primaryKey = true)
    private String id;

    private String name;

    /**
     * book type=1
     */
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty ="userId", extraFilter = BookNavigateExtraFilterStrategy.class)
    private List<RelationBook> books;
    /**
     * Books from before 2022
     */
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty ="userId", extraFilter = BookNavigateExtraFilterStrategy.class)
    private List<RelationBook> historyBooks;

}

@Table("relation_teacher")
@EntityProxy
@Data
public class RelationTeacher implements ProxyEntityAvailable<RelationTeacher , RelationTeacherProxy> {
    @Column(primaryKey = true)
    private String id;

    private String name;

    /**
     * book type=2
     */
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty ="userId", extraFilter = BookNavigateExtraFilterStrategy.class)
    private List<RelationBook> books;

}

```

Users have two book navigation properties: books owned by the user and historical books owned by the user. Since books are divided into student edition and teacher edition, only books with `type=1` are associated with the current user in the book, and books with `type=2` are teacher's books.

`BookNavigateExtraFilterStrategy` is used to add additional conditions for navigation properties

```java
//@Component
public class BookNavigateExtraFilterStrategy implements NavigateExtraFilterStrategy {
    @Override
    public SQLActionExpression1<WherePredicate<?>> getPredicateFilterExpression(NavigateBuilder builder) {
        //parentType
        EntityMetadata entityMetadata = builder.getNavigateOption().getEntityMetadata();
        //Navigation property type
        Class<?> navigatePropertyType = builder.getNavigateOption().getNavigatePropertyType();
        //Navigation property name
        String propertyName = builder.getNavigateOption().getPropertyName();
        //Since this strategy is universal, you can judge here. Of course, you can also choose to define multiple non-universal strategies
        if(Objects.equals(RelationUser.class,entityMetadata.getEntityClass())){
            //If it's history books, it should be books from before 2022
            if(Objects.equals("historyBooks",propertyName)){
                LocalDateTime histroy = LocalDateTime.of(2022, 1, 1, 0, 0);
                return o->o.le("createTime",histroy);
            }
            //Otherwise it's the user's
            return o->o.eq("bookType",1);
        } else  if(Objects.equals(RelationTeacher.class,entityMetadata.getEntityClass())){
            //Teacher's should be type=2
            return o->o.eq("bookType",2);
        }
        throw new RuntimeTimeException();
    }
    /**
     * Filter the mapping class, commonly used for many-to-many
     */
    @Override
    public SQLActionExpression1<WherePredicate<?>> getPredicateMappingClassFilterExpression(NavigateBuilder builder) {
        return null;
    }
}

```
Query whether the user's books contain "elementary school"
```java

List<RelationUser> users = easyEntityQuery.queryable(RelationUser.class)
                    .where(r -> r.books().any(book -> {
                        book.name().like("小学");
                    }))
                    .toList();


==> Preparing: SELECT t.`id`,t.`name` FROM `relation_user` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`book_type` = ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 1(Integer),%小学%(String)
```

Query whether the teacher's books contain the word "teacher"
```java

List<RelationTeacher> teacher = easyEntityQuery.queryable(RelationTeacher.class)
        .where(r -> r.books().any(book -> {
            book.name().like("老师");
        }))
        .toList();


==> Preparing: SELECT t.`id`,t.`name` FROM `relation_teacher` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`book_type` = ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 2(Integer),%老师%(String)
```

Query history books

```java
//Query whether the user's history books have a book with a name containing "elementary school"
List<RelationUser> users = easyEntityQuery.queryable(RelationUser.class)
                    .where(r -> r.historyBooks().any(book -> {
                        book.name().like("小学");
                    }))
                    .toList();

//It will automatically add the condition for before 2022 because you're querying history books
==> Preparing: SELECT t.`id`,t.`name` FROM `relation_user` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`create_time` <= ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 2022-01-01T00:00(LocalDateTime),%小学%(String)
```

