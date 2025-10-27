---
title: Cascade Extra Filter
order: 15
---
`easy-query` not only supports cascade filtering but also supports cascade extra condition filtering.

Users have a `books` collection, but in certain situations, users may also need to divide `books` into history, science fiction, and other categories. So we create a new `historyBooks` association property and add `BookNavigateExtraFilterStrategy` to it. Generally, we have one property with one `ExtraFilterStrategy`.
Here we use a reuse pattern to implement it.

## Object Relationships

::: tabs
@tab RelationUser
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
     * Books before 2022
     */
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty ="userId", extraFilter = BookNavigateExtraFilterStrategy.class)
    private List<RelationBook> historyBooks;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            mappingClass = RelationRoute.class
            ,selfMappingProperty = "firstId"
            ,targetMappingProperty = "secondId",
    extraFilter = BookNavigateExtraFilterStrategy.class)
    private List<RelationTeacher> teachers;

}

```
@tab RelationBook
```java

@Table("relation_book")
@EntityProxy
@Data
public class RelationBook implements ProxyEntityAvailable<RelationBook , RelationBookProxy> {
    @Column(primaryKey = true)
    private String id;
    private String userId;

    private String name;
    //Student books and teacher data
    private Integer bookType;
    private LocalDateTime createTime;

}

```
@tab RelationTeacher
```java

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

@tab BookNavigateExtraFilterStrategy
Users have two book navigation properties, namely user has multiple books and user's historical books. Since books are divided into student edition and teacher edition, among the books associated with the current user, only those with `type=1` are for students, and books with `type=2` are for teachers.

`BookNavigateExtraFilterStrategy` is used to add extra conditions for navigation properties. If we don't reuse the `NavigateExtraFilterStrategy` strategy, there's no need to make too many judgments internally.

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
        //Since this strategy is generic, you can judge here. Of course, you can also choose to define multiple strategies that are not generic
        if(Objects.equals(RelationUser.class,entityMetadata.getEntityClass())){
            //If it's history books, they should be books before 2022
            if(Objects.equals("historyBooks",propertyName)){
                LocalDateTime histroy = LocalDateTime.of(2022, 1, 1, 0, 0);
                return o->o.le("createTime",histroy);
            }
            //Otherwise, it's for users
            return o->o.eq("bookType",1);
        } else  if(Objects.equals(RelationTeacher.class,entityMetadata.getEntityClass())){
            //For teachers, it should be type=2
            return o->o.eq("bookType",2);
        }
        throw new RuntimeTimeException();
    }
    /**
     * Filter mapping table, commonly used for many-to-many
     */
    @Override
    public SQLActionExpression1<WherePredicate<?>> getPredicateMappingClassFilterExpression(NavigateBuilder builder) {
        return null;
    }
}

```

::: 

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

