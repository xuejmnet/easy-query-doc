---
title: Lambda Expression Hints
order: 70
category:
  - plugin
---

# Lambda Expression Alias Hints



## Parameter Name Hints

We all know that Easy Query requires writing lambda expressions in any mode. The most tedious part of lambda expressions is writing parameter names.
It is generally recommended to use table aliases as parameter names. Now, with version `1.9.34^` combined with plugin version `0.0.25^`, you can automatically hint and auto-complete query parameter writing.

First, declare a table alias using `@EasyAlias`.

<img :src="$withBase('/images/plugin-max1.jpg')">

When querying this entity class, the plugin will automatically hint and auto-complete the query parameter writing.
If you select the `where_code_block` hint, it will additionally generate the corresponding `{}`.

<img :src="$withBase('/images/plugin-max2.jpg')">

<img :src="$withBase('/images/plugin-max3.jpg')">

Join queries

<img :src="$withBase('/images/plugin-max3_1.png')">
<img :src="$withBase('/images/plugin-max3_2.png')">


In addition to configuring `@EasyAlias`, we can also set it in `Tools` -> `QuickTipSetting` to add table aliases for entity classes that have not added `@EasyAlias`.


# QuickTipSetting Saving
First, create a file `easy-query.setting` in the current project root directory, and you can save it.

<img :src="$withBase('/images/plugin-max4.jpg')">


<img :src="$withBase('/images/plugin-max5.jpg')">



::: tip Fill-in Instructions
> `o,t1:t2,t1:t2:t3` is first split by comma, then by colon. The split results are grouped by comma. If the number of each group matches the number of lambdas, the parameters here are used. If `@EasyAlias` is configured, the corresponding one still uses `@EasyAlias`.
For example, when querying a single table without configuring `@EasyAlias`, but globally configured with `o,t1:t2,t1:t2:t3`,
If there is only one input parameter, it will generate `where(o->)`. In a join query, with two input parameters, it will generate `where((t1,t2)->)`.
> If the parameters don't match, it will get the uppercase letters of each object's object name to form an abbreviation. But if there is only one uppercase letter, it uses the lowercase class name mode. For example, `queryable(Topic.class).where(t->)`
```java

    /**
     * Convert object type to lambda input parameter short name
     * @param str Topic || SysUser
     * @param index At which parameter position
     * @param total How many parameters in total
     * @return
     */
    public static String lambdaShortName(String str,int index,int total) {
        char[] chars = str.toCharArray();
        if(chars.length==0){
            return "t";
        }
        for (int i = 0; i < chars.length; i++) {
            if (Character.isUpperCase(chars[i])) {
                String parameter = String.valueOf(chars[i]).toLowerCase();
                if(total>1){
                    return parameter+(index+1);
                }
                return parameter;
            }
        }
        return str.toLowerCase();
    }
```
:::

In smart hint options, `select`, `where`, `where_code_block`, `orderBy`, `orderBy_code_block`, `groupBy`, `having`, `having_code_block`, `on`, `on_code_block`
can all be prompted directly using `.`, because the entity class has already been filled in before them, and there is enough context to satisfy the conditions for generating hints. The `join`-related hint writing is quite special. For example, `.leftJoin(Toplic.class,)`
also needs to be filled in with the entity class before hints can be generated, except that it is filled in within the parameters.

