---
title: Object to DTO Mapping Rules
order: 70
---

# Object Mapping Rules
`eq 2.4.1+` version provides `mapping-strategy` with three options. The default (previous versions) is `COLUMN_ONLY`. The new version provides two additional options: `PROPERTY_FIRST` and `PROPERTY_ONLY` and `COLUMN_AND_PROPERTY`

If you don't understand, please choose `PROPERTY_FIRST` when starting a `new project`❗️

If you don't understand, please choose `PROPERTY_FIRST` when starting a `new project`❗️

If you don't understand, please choose `PROPERTY_FIRST` when starting a `new project`❗️



The `convert` function represents the mapped column name, with the value being `propertyName`+`nameConversion`. If the property has `@Column(value="xx")`, the result is `xx`

| Method                                                    | Description                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| PROPERTY_FIRST(recommended)                   | `A.property == AVO.property` If no match is found and AVO is a function, match again through `convert(A.property)==convert(AVO.property)` |
| COLUMN_ONLY                                           | `convert(A.property)==convert(AVO.property)` |
| PROPERTY_ONLY                   | `A.property==AVO.property`                                                     |
| COLUMN_AND_PROPERTY              | `findNull(convert(A.property),A.property)==findNull(convert(AVO.property),AVO.property)`  |

## Entity and Result


::: tabs

@tab entity
```java
public class A{
    @Column(value="c")
    private String a;
    private String b;
}
```
@tab vo

```java
public class AVO{
    private String a;
    private String b;
    @Column(value="c")
    private String d;
}
```
:::


## COLUMN_ONLY(default)
Indicates that the entity's corresponding column name and the mapping object's column name must be the same to map

A.a->AVO.d

A.b->AVO.b

N/A->AVO.a

## PROPERTY_FIRST
Indicates that the entity's corresponding property name and the mapping object's property name must be the same to map. The difference from `PROPERTY_ONLY` is that if it's a functional fragment without property, match through alias

A.a->AVO.a

A.b->AVO.b

N/A->AVO.d


## PROPERTY_ONLY
Indicates that the entity's corresponding property name and the mapping object's property name must be the same to map

A.a->AVO.a

A.b->AVO.b

N/A->AVO.d



## COLUMN_AND_PROPERTY
Indicates first using the entity's corresponding column name for matching, and if unable to map, use property name for matching


A.a->AVO.d

A.b->AVO.b

N/A->AVO.a



# How to Globally Modify in Solon
```java
public static void main(String[] args) {

    Solon.start(Main.class, args, app -> {

        app.onEvent(EasyQueryBuilderConfiguration.class, configuration -> {

            // COLUMN_ONLY: Default strategy, indicates entity's corresponding column name and mapping object's column name must be the same to map
            configuration.replaceService(EntityMappingRule.class, ColumnEntityMappingRule.class);
            // PROPERTY_ONLY: Indicates entity's corresponding property name and mapping object's property name must be the same to map
            configuration.replaceService(EntityMappingRule.class, PropertyEntityMappingRule.class);
            // COLUMN_AND_PROPERTY: Indicates first using entity's corresponding column name for matching, if unable to map, use property name for matching
            configuration.replaceService(EntityMappingRule.class, TryColumnAndPropertyEntityMappingRule.class);
            // PROPERTY_FIRST: Recommended strategy, indicates entity's corresponding property name and mapping object's property name must be the same to map. The difference from PROPERTY_ONLY is that if it's a functional fragment without property, match through alias
            configuration.replaceService(EntityMappingRule.class, PropertyFirstEntityMappingRule.class);
        });

    });

}
```

