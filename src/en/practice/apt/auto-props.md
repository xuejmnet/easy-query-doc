---
title: DTO Property Sync
order: 20
---

# DTO Property Sync
Sometimes we want DTOs to synchronize with entity object properties, that is, when an entity adds a field, the DTO can also add the corresponding field. So we need a synchronization mechanism for DTO properties so that new fields added to entities can be synchronized to DTOs

[Demo for this chapter](https://github.com/xuejmnet/eq-apt)


::: warning Note!!!
> The code in this chapter is only responsible for Java 8. If you need a higher version, you can PR the example or use AI to convert it
:::


## Using APT Technology
Through APT compilation technology, we can synchronize fields to DTOs at compile time. Next, I will implement this mode through a demo. First, we will create a multi-module project because the best practice for APT technology is to use multi-modules

## APT Annotation
The first step is to add annotations for automatic property copying, because APT needs to be based on annotations
```java

@Documented
@Retention(RetentionPolicy.SOURCE)
@Target(ElementType.TYPE)
public @interface AutoProperty {
    //Copy from which entity
    Class<?> value();
    //Include fields
    String[] includes() default {};
    //Exclude fields
    String[] excludes() default {};
}

//Entity field annotation to not allow copying (such as password)
@Documented
@Retention(RetentionPolicy.SOURCE)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface CopyIgnore {
}
```


### AutoProperty
The `includes` and `excludes` of `AutoProperty` support a single property name or multiple property names separated by commas
For example, if I have a `BaseEntity`
```java

@Data
@FieldNameConstants
public abstract class BaseEntity implements Serializable, Cloneable {

    private static final long serialVersionUID = -1L;
    /**
     * Record identifier;Record identifier
     */
    @Column(primaryKey = true)
    private String id;
    /**
     * Create time;Create time
     */
    @UpdateIgnore
    private LocalDateTime createTime;
    /**
     * Update time;Update time
     */
    private LocalDateTime updateTime;
    /**
     * Creator;Creator
     */
    @UpdateIgnore
    private String createBy;
    /**
     * Updater;Updater
     */
    private String updateBy;
    /**
     * Is deleted;Is deleted
     * Where [strategyName = "DELETE_WITH_USER_TIME"] means the logical delete strategy uses a strategy named [DELETE_WITH_USER_TIME]
     * So you must register a logical delete named [DELETE_WITH_USER_TIME] when customizing
     */
    @LogicDelete(strategy = LogicDeleteStrategyEnum.CUSTOM,strategyName = "DELETE_WITH_USER_TIME")
    @UpdateIgnore
    private Boolean deleted;

    /**
     * Deleter
     */
    @UpdateIgnore
    private String deleteBy;

    /**
     * Delete time
     */
    @UpdateIgnore
    private LocalDateTime deleteTime;

    public static final String AUTO_PROPERTIES_IGNORE = Fields.deleteBy
            + "," + Fields.deleted
            + "," + Fields.deleteTime
            + "," + Fields.updateBy
            + "," + Fields.updateTime;
}


```

How to use
```java
@AutoProperty(value=SysUser.class,excludes=BaseEntity.AUTO_PROPERTIES_IGNORE)
```
excludes supports both `{"id","name"}` and `{"id,name","age"}` modes, and `includes` is the same

## Dependencies
The pom.xml file content of the `pops-process` module
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

## Write APT Processor

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
 * File description
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
// Generate parameters, for example: private String age;
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
     * Parse the fields that already exist in the current class, then if they exist, don't copy them
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


//See the example source code for the remaining code
```

## Write META-INF
Add file `javax.annotation.processing.Processor`

In `resources -> META-INF -> services -> javax.annotation.processing.Processor`, the file content is as follows
```
com.eq.autopops.MyAptProcessor
```

## Add Entity
Add entity in the api module
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

Add DTO
```java

@AutoProperty(SysUser.class)
public class SysUserResponse {
}

```
Build the project and check the `SysUserResponse` class under target

If the following compiled class appears, it means success

<img :src="$withBase('/images/auto-props.jpg')">


