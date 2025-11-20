---
title: dto属性同步
order: 20
---

# dto属性同步
有时候我们希望dto可以和实体对象属性同步，也就是实体添加了一个字段后dto也可以增加相应的字段,所以我们需要对dto属性进行一种同步机制让实体增加新字段可以同步到dto上

[本章节demo][https://github.com/xuejmnet/eq-apt]


::: warning 说明!!!
> 本章节代码只对java8负责，如果需要高版本可以pr案例或者用ai转换一下
:::


## 使用apt技术
通过apt编译技术我们可以将字段在编译时同步到dto上面，加下来我将通过一个demo来实现这种模式,首先我们新建一个多模块，因为apt技术最佳实践就是使用多模块

## APT注解
第一步添加注解，用于属性自动拷贝并且因为apt需要以注解作为基础
```java

@Documented
@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface AutoProperty {
    //从哪个实体拷贝过来
    Class<?> value();
    //包含字段
    String[] includes() default {};
    //不包含的字段
    String[] excludes() default {};
}

//实体字段标注不允许拷贝(比如password)
@Documented
@Retention(RetentionPolicy.SOURCE)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface CopyIgnore {
}
```


### AutoProperty
`AutoProperty`的includes和excludes支持单个属性名或者多属性名逗号分割
比如我有一个`BaseEntity`
```java

@Data
@FieldNameConstants
public abstract class BaseEntity implements Serializable, Cloneable {

    private static final long serialVersionUID = -1L;
    /**
     * 记录标识;记录标识
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * 创建时间;创建时间
     */
    @UpdateIgnore
    private LocalDateTime createTime;
    /**
     * 修改时间;修改时间
     */
    private LocalDateTime updateTime;
    /**
     * 创建人;创建人
     */
    @UpdateIgnore
    private String createBy;
    /**
     * 修改人;修改人
     */
    private String updateBy;
    /**
     * 是否删除;是否删除
     * 其中[strategyName = "DELETE_WITH_USER_TIME"]表示逻辑删除策略使用名称叫做[DELETE_WITH_USER_TIME]的
     * 所以你自定义的时候必须注册一个名称[DELETE_WITH_USER_TIME]的逻辑删除
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "DELETE_WITH_USER_TIME")
    @UpdateIgnore
    private Boolean deleted;

    /**
     * 删除人
     */
    @UpdateIgnore
    private String deleteBy;

    /**
     * 删除时间
     */
    @UpdateIgnore
    private LocalDateTime deleteTime;

    public static final String AUTO_PROPERTIES_IGNORE = Fields.deleteBy
            + "," + Fields.deleted
            + "," + Fields.deleteTime
            + "," + Fields.updateBy
            + "," + Fields.updateTime;
}


//使用
@AutoProperty(value=SysUser.class,excludes=BaseEntity.AUTO_PROPERTIES_IGNORE)
```


## 依赖
`pops-process`模块的pom.xml文件内容
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.eq</groupId>
        <artifactId>autopops</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>pops-process</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>com.easy-query</groupId>
            <artifactId>sql-core</artifactId>
            <version>3.1.58</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.sun</groupId>
            <artifactId>tools</artifactId>
            <version>1.8</version>
            <scope>system</scope>
            <systemPath>${java.home}/../lib/tools.jar</systemPath>
            <optional>true</optional>
        </dependency>
    </dependencies>

    <build>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <includes>
                    <include>**/*</include>
                </includes>
                <excludes>
                    <exclude>
                        *.properties
                    </exclude>
                </excludes>
            </resource>
            <resource>
                <directory>target/generated-sources</directory>
            </resource>
        </resources>

        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <proc>none</proc>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 编写apt处理器

```java

package com.eq.autopops;

import com.eq.autopops.process.AutoProperty;
import com.sun.source.util.Trees;
import com.sun.tools.javac.api.JavacTrees;
import com.sun.tools.javac.processing.JavacProcessingEnvironment;
import com.sun.tools.javac.tree.TreeMaker;
import com.sun.tools.javac.util.Context;
import com.sun.tools.javac.util.Names;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.Modifier;
import javax.lang.model.element.TypeElement;
import javax.lang.model.util.Elements;
import javax.lang.model.util.Types;
import javax.tools.Diagnostic;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.util.HashSet;
import java.util.Set;

/**
 * create time 2025/11/20 21:42
 * 文件说明
 *
 * @author xuejiaming
 */
@SupportedAnnotationTypes({"com.eq.autopops.process.AutoProperty"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MyAptProcessor extends AbstractProcessor {

    private JavacTrees javacTrees;
    private TreeMaker treeMaker;
    private Names names;
    private Elements elementUtils;
    private Types typeUtils;
    private Trees trees;
    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);
        JavacProcessingEnvironment javacProcessingEnvironment = getJavacProcessingEnvironment(processingEnv);
        Context context = javacProcessingEnvironment.getContext();
        this.javacTrees = JavacTrees.instance(context);
        this.treeMaker = TreeMaker.instance(context);
        this.names = Names.instance(context);
        this.elementUtils = processingEnv.getElementUtils();
        this.typeUtils = processingEnv.getTypeUtils();
        this.trees = Trees.instance(javacProcessingEnvironment);
    }

    /**
     * This class casts the given processing environment to a JavacProcessingEnvironment. In case of
     * gradle incremental compilation, the delegate ProcessingEnvironment of the gradle wrapper is returned.
     */
    public JavacProcessingEnvironment getJavacProcessingEnvironment(Object procEnv) {
        if (procEnv instanceof JavacProcessingEnvironment) return (JavacProcessingEnvironment) procEnv;

        // try to find a "delegate" field in the object, and use this to try to obtain a JavacProcessingEnvironment
        for (Class<?> procEnvClass = procEnv.getClass(); procEnvClass != null; procEnvClass = procEnvClass.getSuperclass()) {
            Object delegate = tryGetDelegateField(procEnvClass, procEnv);
            if (delegate == null) delegate = tryGetProxyDelegateToField(procEnvClass, procEnv);
            if (delegate == null) delegate = tryGetProcessingEnvField(procEnvClass, procEnv);

            if (delegate != null) return getJavacProcessingEnvironment(delegate);
            // delegate field was not found, try on superclass
        }

        processingEnv.getMessager().printMessage(Diagnostic.Kind.WARNING,
                "Can't get the delegate of the gradle IncrementalProcessingEnvironment. Lombok won't work.");
        return null;
    }

    /**
     * Gradle incremental processing
     */
    private Object tryGetDelegateField(Class<?> delegateClass, Object instance) {
        try {
            return Permit.getField(delegateClass, "delegate").get(instance);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Kotlin incremental processing
     */
    private Object tryGetProcessingEnvField(Class<?> delegateClass, Object instance) {
        try {
            return Permit.getField(delegateClass, "processingEnv").get(instance);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * IntelliJ IDEA >= 2020.3
     */
    private Object tryGetProxyDelegateToField(Class<?> delegateClass, Object instance) {
        try {
            InvocationHandler handler = Proxy.getInvocationHandler(instance);
            return Permit.getField(handler.getClass(), "val$delegateTo").get(handler);
        } catch (Exception e) {
            return null;
        }
    }
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {

        Set<? extends Element> sets = roundEnv.getElementsAnnotatedWith(AutoProperty.class);
        EntityMetadataContext entityMetadataContext = new EntityMetadataContext(treeMaker, names, javacTrees, elementUtils, typeUtils);
//        AutoPropGroupContext autoPropGroupContext = new AutoPropGroupContext(elementUtils);
        CopyPropertiesProcessor copyPropertiesProcessor = new CopyPropertiesProcessor(javacTrees, treeMaker, names, elementUtils, trees);
        for (Element element : sets) {
// 生成参数 例如：private String age;
//            treeMaker.VarDef(treeMaker.Modifiers(Flags.PRIVATE), names.fromString("age"), treeMaker.Ident(names.fromString("String")), null);
            String classFromAnnotation = MyUtil.getClassFromAnnotation(element, "value");
            EntityTypeMetadata entityTypeMetadata = entityMetadataContext.accept(classFromAnnotation);
            TypeElement classElement = (TypeElement) element;
            Set<String> classProps = getClassProps(classElement);
            copyPropertiesProcessor.process(entityTypeMetadata, element, classProps);

        }
        return true;
    }

    /**
     * 解析当前class已经存在的字段,那么如果存在就不要拷贝了
     * @param classElement
     * @return
     */
    private Set<String> getClassProps(TypeElement classElement) {
        Set<String> classProps = new HashSet<>();
        java.util.List<? extends Element> enclosedElements = classElement.getEnclosedElements();
        for (Element fieldElement : enclosedElements) {

            //all fields
            if (ElementKind.FIELD == fieldElement.getKind()) {


                Set<Modifier> modifiers = fieldElement.getModifiers();
                if (modifiers.contains(Modifier.STATIC)) {
                    //ignore static fields
                    continue;
                }

                String propertyName = fieldElement.toString();
                classProps.add(propertyName);
            }
        }
        return classProps;
    }
}


//剩余代码查看案例源码
```

## 编写META-INF
添加文件`javax.annotation.processing.Processor`

在`resources -> META-INF -> services -> javax.annotation.processing.Processor`，文件内容如下
```
com.eq.autopops.MyAptProcessor
```

## 添加实体
在api模块添加实体
```java

@Table("t_user")
@EntityProxy
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    private String id;
    private String name;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

添加dto
```java

@AutoProperty(SysUser.class)
public class SysUserResponse {
}

```
build项目，查看target下的`SysUserResponse`类

如果出现如下编译后的类那么就说明成功了

<img :src="$withBase('/images/auto-props.jpg')">