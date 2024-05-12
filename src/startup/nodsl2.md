---
title: 对象关系查询案例2 ✨
---

为什么我们需要对象关系查询,为什么对象关系查询叫做`nodsl`一个好的 orm 的方向肯定是不仅仅是 dsl 语句,毕竟`dsl`语句只是强类型拼接`sql`,对象关系才是`orm`的精髓，但是如果一个`orm`只有对象关系查询那么这个`orm`也不是一个好的`orm`,一个好的`orm`应该是`dsl+nodsl`

默认不使用 include 那么是不会自动查询导航属性,如果 select 返回导航属性那么自动会进行 include,如果是 VO 对象映射那么 include 也需要手动调用.

以下情况不需要调用`include`或者`includes`

- 返回`对一导航属性`而不是`对多`包括相关列,其中`对一`包括`多对一`,`一对一`
- 返回导航属性本身`.select(o->o.parent())`
- 返回导航属性的列比如`.select(o->o.parent().id())`
- 返回对多的导航属性比如`.select(o->o.roles().toList())`

::: danger 说明!!!

> 如果您的对象关系涉及到多对多请使用 `1.10.29+`的版本,在之前版本会有一个失误导致关系会提前在`where`中体现导致结果不正确.再次感谢用户`←X→↑Y↓`大佬的测试指出问题所在
> 
:::

## 关系对象

接下来我将演示学校的关系信息,也就是

`班级`,`老师`,`学生`,`学生家庭地址`

其中一个班级有多个学生,一个班级有多个老师,一个老师也可以教多个班级,每个学生都有自己的家庭地址,每个学生都有多门自己选择的课程

::: code-tabs
@tab 班级

```java

@Table("school_class")
@Data
@ToString
@EntityProxy
public class SchoolClass implements ProxyEntityAvailable<SchoolClass , SchoolClassProxy> {
    @Column(primaryKey = true)//主键
    private String id;
    private String name;

    //一对多 一个班级多个学生
    @Navigate(value = RelationTypeEnum.OneToMany, targetProperty = "classId")
    private List<SchoolStudent> schoolStudents;

    //多对多
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfMappingProperty = "classId"
            , targetMappingProperty = "teacherId")

    private List<SchoolTeacher> schoolTeachers;

    @Override
    public Class<SchoolClassProxy> proxyTableClass() {
        return SchoolClassProxy.class;
    }
}

//班级和老师的映射表
@Table("school_class_teacher")
@Data
@ToString
@EntityProxy
public class SchoolClassTeacher implements ProxyEntityAvailable<SchoolClassTeacher , SchoolClassTeacherProxy> {
    @Column(primaryKey = true)
    private String classId;
    @Column(primaryKey = true)
    private String teacherId;

    @Override
    public Class<SchoolClassTeacherProxy> proxyTableClass() {
        return SchoolClassTeacherProxy.class;
    }
}
```

@tab 老师

```java

@Table("school_teacher")
@Data
@ToString
@EntityProxy
public class SchoolTeacher implements ProxyEntityAvailable<SchoolTeacher , SchoolTeacherProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;

    //导航属性如果您不需要根据老师来处理班级那么可以不加
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfProperty = "id"
            , selfMappingProperty = "teacherId"
            , targetProperty = "id"
            , targetMappingProperty = "classId")
    private List<SchoolClass> schoolClasses;

    @Override
    public Class<SchoolTeacherProxy> proxyTableClass() {
        return SchoolTeacherProxy.class;
    }
}
```

@tab 学生

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

    @Override
    public Class<SchoolStudentProxy> proxyTableClass() {
        return SchoolStudentProxy.class;
    }
}
```

@tab 学生课程

```java


@Table("school_course")
@Data
@ToString
@EntityFileProxy
public class SchoolCourse implements ProxyEntityAvailable<SchoolCourse , SchoolCourseProxy> {
    @Column(primaryKey = true)//主键
    private String id;
    private String studentId;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "studentId")
    private SchoolStudent schoolStudent;

    @Override
    public Class<SchoolCourseProxy> proxyTableClass() {
        return SchoolCourseProxy.class;
    }
}
```

:::

## 案例 1

查询班级下面存在学生姓金的班级

```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().any(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();
//上下写法一样
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).any();
                }).toList();

//联级穿透 flatElement后仅支持但条件判断,多条件会生成多个Exists函数
//所以如果存在多条件还是建议使用where来处理 flatElement支持多层级穿透
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    //展开schoolStudents集合穿透到下方直接判断名称
                    s.schoolStudents().flatElement().name().likeMatchLeft("金");
                }).toList();


//上下两种都可以表示查询班级表过滤班级关联的学生并且存在学生姓金的
```

查询班级下面不存在学生姓金的班级

```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().none(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();

//上下两种都可以表示查询班级表过滤班级关联的学生并且不存在学生姓金的
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).none();
                }).toList();
```

## 案例 2

查询班级下面存在学生家地址是绍兴市的班级有哪些

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().any(stu -> {
                stu.schoolStudentAddress().address().like("绍兴市");
            });
        }).toList();
```

## 案例 3

查询班级下面存在学生姓金的有且只有 5 位的班级

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().where(stu -> {
                stu.name().likeMatchLeft("金");
            }).count().eq(5L);
        }).toList();
```

## 案例 4

查询班级下面存在学生平均年龄小于等于 12 岁的班级(可以筛选如获取班级语文平均分不足 60 的同理)

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().avg(stu->stu.age()).le(BigDecimal.valueOf(12));
        }).toList();
```

查询班级下面存在学生为男生的平均年龄小于等于 12 岁的班级

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().where(o->o.sex().eq(SexEnum.Male)).avg(stu->stu.age()).le(BigDecimal.valueOf(12));
        }).toList();
```

## 案例 5

假设班级和学生没有直接关系

查询班级下面老师的有姓金的并且获取班级和老师

```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
//include和includes分别获取对一和对多的关系 include(s)的第二个参数可以筛选返回的数据结果如果不加就返回当前班级下的所有关联的老师
        .includes(s -> s.schoolTeachers(),s->{
            //获取对多的老师的信息但是必须是姓金的才返回
            s.where(t->t.name().likeMatchLeft("金"));
        })
        .where(s -> {
            //判定班级下的老师有姓金的
            s.schoolTeachers().where(teacher->{
                teacher.name().likeMatchLeft("金");
            }).any();
        }).toList();
```

## 案例 6

查询学生叫做小明的并且获取小明的所在班级和家庭地址

```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
                .include(s -> s.schoolStudentAddress())
                .include(s -> s.schoolClass())
                .where(s -> {
                    s.name().eq("小明");
                }).toList();
```

## 案例 7

查询班级叫做`一班`的和班级下面的学生并且返回学生的家庭地址包括班级下的老师

```java
     List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .includes(s -> s.schoolTeachers())
                .includes(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress());
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```
## 案例 8

查询班级叫做`一班`的和班级下面的年龄最大的前三位学生并且返回学生的家庭地址包括班级下的老师

```java
     List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .includes(s -> s.schoolTeachers())
                .includes(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress())
                    .orderBy(y->y.age().desc())
                    .limit(3);
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```

## 案例 9
查询课程这个课程是一班的,因为课程目前没有直接和班级设置关系所以只能通过学生来实现
```java
//实现方式1 直接查询课程筛选出关联的班级是一班的 一次sql查询
List<SchoolCourse> courses = easyEntityQuery.queryable(SchoolCourse.class)
        .where(s -> {
            s.schoolStudent().schoolClass().name().like("一班");
        }).toList();

//easy-query版本2.0.3+

//实现方式2 直接查询一班然后拉取的时候额外查出所需要的学生下的课程 分多次sql查询
List<SchoolCourse> courses = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.name().like("一班");
        })
        //注意如果返回结果是对多的集合需要调用flatElement来展开结果,如果是单个对象则不需要
        //返回结果意思查询学生并且展开查询下面的课程然后展开
        .toList(x -> x.schoolStudents().flatElement().schoolCourses().flatElement());
//方式2适合多对多情况下比如查询小明所拥有的菜单,因为小明和角色是多对多,角色和菜单也是多对多可以通过方式2当前也可以通过方式1
```
## 案例 10

返回 VO 对象自动 include 返回层级对象

::: code-tabs
@tab 班级 VO

```java

@Data
@EntityFileProxy
public class SchoolClassVO {
    private String id;
    private String name;
    @Navigate(RelationTypeEnum.OneToMany)
    private List<SchoolStudentVO> schoolStudents;
    @Navigate(RelationTypeEnum.ManyToMany)
    private List<SchoolTeacherVO> schoolTeachers;
}
```

@tab 学生 VO

```java

@Data
@EntityFileProxy
public class SchoolStudentVO {
    private String id;
    private String classId;
    private String name;

    @Navigate(RelationTypeEnum.OneToOne)
    private SchoolStudentAddressVO schoolStudentAddress;

}
```

@tab 学生地址 VO

```java

@Data
@ToString
@EntityFileProxy
public class SchoolStudentAddressVO {
    private String id;
    private String studentId;
    private String address;
    private String name;
}

```

@tab 老师 VO

```java

@Data
@ToString
@EntityFileProxy
public class SchoolTeacherVO {
    private String id;
    private String name;

}

```

:::

自动筛选返回结构化数据,要求对应的导航属性是一样的才可以比如数据库实体关联学生属性叫做`shoolStudents`那么 VO 也必须是这个名称

```java
//查询班级叫做一班的并且返回对应的VO并且会自动根据VO会拉取相应的数据
List<SchoolClassVO> listx= easyEntityQuery.queryable(SchoolClass.class)
                        .where(s -> s.name().like("一班"))
                        .selectAutoInclude(SchoolClassVO.class)
                        .toList();
```


## 案例9进阶
手动创建VO是很复杂的一件事情,可以再`easy-query:1.10.60^`+`插件0.0.48^`快速生成嵌套结构化对象模型,

<img src="/EQDTO1.jpg">
<img src="/EQDTO2.jpg">
<img src="/EQDTO3.jpg">
<img src="/EQDTO4.jpg">
<img src="/EQDTO5.jpg">
<img src="/EQDTO6.jpg">


## 高级扩展

额外过滤条件支持比如

用户和书本的关系

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


    @Override
    public Class<com.easy.query.test.entity.relation.proxy.RelationUserProxy> proxyTableClass() {
        return com.easy.query.test.entity.relation.proxy.RelationUserProxy.class;
    }
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

    @Override
    public Class<RelationTeacherProxy> proxyTableClass() {
        return RelationTeacherProxy.class;
    }
}

```

用户里面有两个书本导航属性,分别是用户有多本书和用户所拥有的历史书籍,其中因为书本分为学生版和老师版本所以在书本里面和当前用户关联的书籍只有`type=1`的才是，`type=2`的书籍是老师的书籍

`BookNavigateExtraFilterStrategy`用来添加导航属性额外条件

```java
//@Component
public class BookNavigateExtraFilterStrategy implements NavigateExtraFilterStrategy {
    @Override
    public SQLExpression1<WherePredicate<?>> getPredicateFilterExpression(NavigateBuilder builder) {
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
}

```
查询用户的书籍是否包含小学
```java

List<RelationUser> users = easyEntityQuery.queryable(RelationUser.class)
                    .where(r -> r.books().any(book -> {
                        book.name().like("小学");
                    }))
                    .toList();


==> Preparing: SELECT t.`id`,t.`name` FROM `relation_user` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`book_type` = ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 1(Integer),%小学%(String)
```

查询老师的书籍是否包含老师字样的书籍
```java

List<RelationTeacher> teacher = easyEntityQuery.queryable(RelationTeacher.class)
        .where(r -> r.books().any(book -> {
            book.name().like("老师");
        }))
        .toList();


==> Preparing: SELECT t.`id`,t.`name` FROM `relation_teacher` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`book_type` = ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 2(Integer),%老师%(String)
```

查询历史书籍

```java
//查询用户的历史书籍里面是否有一本名称包含小学的书
List<RelationUser> users = easyEntityQuery.queryable(RelationUser.class)
                    .where(r -> r.historyBooks().any(book -> {
                        book.name().like("小学");
                    }))
                    .toList();

//默认会添加2022年以前因为你查询的是历史书籍
==> Preparing: SELECT t.`id`,t.`name` FROM `relation_user` t WHERE EXISTS (SELECT 1 FROM `relation_book` t1 WHERE (t1.`user_id` = t.`id` AND t1.`create_time` <= ?) AND t1.`name` LIKE ? LIMIT 1)
==> Parameters: 2022-01-01T00:00(LocalDateTime),%小学%(String)
```
