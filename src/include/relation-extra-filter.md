---
title: 联级额外筛选Extra Filter
order: 15
---
`easy-query`不单支持联级的筛选还支持联级额外条件的筛选

用户有`books`这个集合但是可能在某些情况下用户还需要将`books`分为历史的或者科幻的和其他类目的，所以我们新建一个`historyBooks`关联属性然后对其添加`BookNavigateExtraFilterStrategy`一般我们将以一个属性一个自己的`ExtraFilterStrategy`
这边我们采用复用的模式来实现

## 对象关系

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
     * 时间2022年以前的
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
    //学生书籍和老师数据
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
用户里面有两个书本导航属性,分别是用户有多本书和用户所拥有的历史书籍,其中因为书本分为学生版和老师版本所以在书本里面和当前用户关联的书籍只有`type=1`的才是，`type=2`的书籍是老师的书籍

`BookNavigateExtraFilterStrategy`用来添加导航属性额外条件,如果我们不复用`NavigateExtraFilterStrategy`策略那么不需要再内部进行过多的判断

```java
//@Component
public class BookNavigateExtraFilterStrategy implements NavigateExtraFilterStrategy {
    @Override
    public SQLActionExpression1<WherePredicate<?>> getPredicateFilterExpression(NavigateBuilder builder) {
        //parentType
        EntityMetadata entityMetadata = builder.getNavigateOption().getEntityMetadata();
        //导航属性类型
        Class<?> navigatePropertyType = builder.getNavigateOption().getNavigatePropertyType();
        //导航属性名称
        String propertyName = builder.getNavigateOption().getPropertyName();
        //因为这个策略是他通用的所以可以在这边判断当然你也可以选择定义多个策略不通用
        if(Objects.equals(RelationUser.class,entityMetadata.getEntityClass())){
            //如果是历史书籍那么应该是2022年以前的书籍
            if(Objects.equals("historyBooks",propertyName)){
                LocalDateTime histroy = LocalDateTime.of(2022, 1, 1, 0, 0);
                return o->o.le("createTime",histroy);
            }
            //否则就是用户的
            return o->o.eq("bookType",1);
        } else  if(Objects.equals(RelationTeacher.class,entityMetadata.getEntityClass())){
            //老师的责应该是type=2的
            return o->o.eq("bookType",2);
        }
        throw new RuntimeTimeException();
    }
    /**
     * 过滤中间表常用于多对多
     */
    @Override
    public SQLActionExpression1<WherePredicate<?>> getPredicateMappingClassFilterExpression(NavigateBuilder builder) {
        return null;
    }
}

```

::: 

## 联级查询
筛选所有班级里面存在学生名称包含小明的班级
```java
 List<SchoolClass> hasXiaoMingClass = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    //班级和学生是一对多,所以就是筛选学生里面存在名称叫做小明的
                    //如果要查询学生里面没有小明的就用`none`方法
                    s.schoolStudents().any(x -> x.name().like("小明"));
                    //下面的写法也可以也可以用多个where来支持
                    // s.schoolStudents().where(x -> {
                    //     x.name().like("小明");
                    //     x.classId().like("123");
                    // }).any();
                })
                .toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 WHERE t1.`class_id` = t.`id` AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %小明%(String)
```

筛选学生表,条件为学生所在班级的班级名称包含`一班`字样的比如`一班`、`十一班`
```java

            List<SchoolStudent> hasXiaoMingClass = easyEntityQuery.queryable(SchoolStudent.class)
//                    .include(x->x.schoolClass()) //如果您需要把学生所在的班级信息也带出来
                    .where(s -> s.schoolClass().name().like("一班"))
                    .toList();

==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t LEFT JOIN `school_class` t1 ON t.`class_id` = t1.`id` WHERE t1.`name` LIKE ?
==> Parameters: %一班%(String)
```

筛选班级里面学生家在`xx路`的班级
```java
List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().any(
                        x -> x.schoolStudentAddress().address().like("xx路")
                )).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 LEFT JOIN `school_student_address` t2 ON t1.`id` = t2.`student_id` WHERE t1.`class_id` = t.`id` AND t2.`address` LIKE ? LIMIT 1)
==> Parameters: %xx路%(String)

```

筛选班级里面学生家在`xx路`,学生名称叫`小明`的班级
```java
   List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().any(
                        x -> {
                            x.schoolStudentAddress().address().like("xx路");
                            x.name().like("小明");
                        }
                )).toList();
//下面的写法也可以


    List<SchoolClass> studentAddressInXXRoadClasses = easyEntityQuery.queryable(SchoolClass.class)
            .where(s -> s.schoolStudents()
                    .where(x->x.schoolStudentAddress().address().like("xx路"))
                    .where(x->x.name().like("小明")).any()
            ).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_student` t1 LEFT JOIN `school_student_address` t2 ON t1.`id` = t2.`student_id` WHERE t1.`class_id` = t.`id` AND t2.`address` LIKE ? AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %xx路%(String),%小明%(String)

```
筛选多对多联级查询

一个班级有多个老师,一个老师也可以交多个班级,老师和班级多对多通过`SchoolClassTeacher`表进行关联
```java
       List<SchoolClass> x1 = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolTeachers()
                        .any(x -> x.name().like("x"))).toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE EXISTS (SELECT 1 FROM `school_teacher` t1 WHERE t1.`id` = t.`id` AND EXISTS (SELECT 1 FROM `school_class_teacher` t2 WHERE t2.`teacher_id` = t1.`id` AND t2.`class_id` = t.`id` LIMIT 1) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: %x%(String)                  
```

筛选班级里面学生姓`张`的有5人的班级
```java
 List<SchoolClass> nameStartZhang = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> s.schoolStudents().where(x -> x.name().likeMatchLeft("张")).count().eq(5L))
                .toList();

==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE (SELECT COUNT(*) FROM `school_student` t1 WHERE t1.`class_id` = t.`id` AND t1.`name` LIKE ?) = ?
==> Parameters: 张%(String),5(Long)
```