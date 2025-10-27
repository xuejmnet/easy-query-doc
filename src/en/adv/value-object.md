---
title: Value Type Object
order: 90
---
`easy-query` supports `value-object` value type objects in `1.7.3^` version, used to describe aggregated columns of database objects, for example
```java

@Table("my_company")
@Data
public class Company {
    @Column(primaryKey = true)
    private String id;
    /**
     * Company name
     */
    private String name;
    /**
     * Company province
     */
    private String province;
    /**
     * Company city
     */
    private String city;
    /**
     * Company area
     */
    private String area;
    /**
     * Company business license number
     */
    private String licenseNo;
    /**
     * Company business license expiration time
     */
    private LocalDateTime licenseDeadline;
    /**
     * Company business license image
     */
    private String licenseImage;
    /**
     * Company business license business content
     */
    private String licenseContent;
}
```
After using value types, it can be rewritten as
```java
@Table("my_company")
@Data
@ToString
public class ValueCompany {
    @Column(primaryKey = true)
    private String id;
    /**
     * Company name
     */
    private String name;
    /**
     * Company address information
     */
    @ValueObject
    private ValueCompanyAddress address;
    /**
     * Company business license information
     */
    @ValueObject
    private ValueCompanyLicense license;
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyAddress {
    /**
     * Company province
     */
    private String province;
    /**
     * Company city
     */
    private String city;
    /**
     * Company area
     */
    private String area;
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyLicense {

    /**
     * Company business license number
     */
    private String licenseNo;
    /**
     * Company business license expiration time
     */
    private LocalDateTime licenseDeadline;
    @ValueObject
    private ValueCompanyLicenseExtra extra;//Supports ValueObject nesting
}


@Data
@EqualsAndHashCode
@ToString
public class ValueCompanyLicenseExtra {
    /**
     * Company business license image
     */
    private String licenseImage;
    /**
     * Company business license business content
     */
    private String licenseContent;
}


```

For large object property aggregation, there is better property representation instead of blindly expanding and flattening object design

```sql
-- Database table
create table my_company
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    name varchar(32)  null comment 'Name',
    province varchar(32)  null comment 'Province',
    city varchar(32)  null comment 'City',
    area varchar(32)  null comment 'Area',
    license_no varchar(32)  null comment 'Company business license number',
    license_deadline datetime  null comment 'Company business license expiration time',
    license_image varchar(128)  null comment 'Company business license image',
    license_content varchar(256)  null comment 'Company business license business content'
)comment 'Company table';
```

::: warning Notes and Instructions!!!
> Property mode is natively supported through property.property to access and use. Proxy has been adapted, Java's lambda version needs to be implemented by yourself, and Kotlin also needs to be implemented by yourself
:::

## Java Version Implementation
Because Java does not support multi-level access of lambda expressions by default, ASM bytecode technology needs to be implemented by yourself
### Replace System Default Lambda Expression Parsing
Need to add ASM dependency
```xml

<!--Choose your own appropriate version-->
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm</artifactId>
    <version>9.6</version>
</dependency>
```
```java
//Lambda class visitor
public class ExpressionClassVisitor extends ClassVisitor {
    private final StringBuilder _methodBody;
    private final String _method;
    private final String _methodDesc;

    public ExpressionClassVisitor(StringBuilder methodBody,SerializedDescriptor serializedDescriptor) {
        super(Opcodes.ASM9);
        this._methodBody = methodBody;
        this._method = serializedDescriptor.getImplMethodName();
        this._methodDesc = serializedDescriptor.getImplMethodSignature();
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {

        if (!_method.equals(name) || !_methodDesc.equals(desc))
            return null;

        return new ExpressionMethodVisitor(_methodBody);
    }


    @Override
    public String toString() {
        return _methodBody.toString();
    }
}

//Lambda method visitor
public class ExpressionMethodVisitor extends MethodVisitor {
    private final StringBuilder _methodBody;

    public ExpressionMethodVisitor(StringBuilder methodBody) {
        super(Opcodes.ASM9);
        this._methodBody=methodBody;
    }

    @Override
    public void visitMethodInsn(int opcode, String owner, String name, String desc, boolean itf) {
        if(opcode==Opcodes.INVOKEVIRTUAL){
            String attr = null;
            if (name.startsWith("get")) {
                attr = name.substring(3);
            } else {
                attr = name.substring(2);
            }
            _methodBody.append(".").append(EasyStringUtil.toLowerCaseFirstOne(attr));
        }
    }

    @Override
    public void visitEnd() {
        _methodBody.deleteCharAt(0);
    }
}
//Custom lambda parser
public class MyLambdaParser implements LambdaParser {
    private static final Cache<SerializedDescriptor, String> lambdaCache = new DefaultMemoryCache<>();
    @Override
    public <T> String getPropertyName(Property<T, ?> property) {
        if (property == null) {
            return null;
        }
        try {
            Method declaredMethod = property.getClass().getDeclaredMethod("writeReplace");
            declaredMethod.setAccessible(Boolean.TRUE);
            SerializedLambda serializedLambda = (SerializedLambda) declaredMethod.invoke(property);


            //Class.method.method....
            if (serializedLambda.getImplMethodKind() == MethodHandleInfo.REF_invokeStatic) {
                return getPropertyNameByInvokeStatic(property.getClass().getClassLoader(), serializedLambda);
            }
            //Class::method
            return getPropertyNameByInvokeVirtual(serializedLambda);

        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
        private static String getPropertyNameByInvokeStatic(ClassLoader classLoader, SerializedLambda serializedLambda) {
            SerializedDescriptor serializedDescriptor = new SerializedDescriptor(serializedLambda);

        String propertyName = lambdaCache.get(serializedDescriptor);
        if (propertyName != null) {
            return propertyName;
        }

        String className = serializedLambda.getImplClass();
        String classFilePath = classFilePath(className);
        StringBuilder methodBody = new StringBuilder();
        ExpressionClassVisitor expressionClassVisitor = new ExpressionClassVisitor(methodBody, serializedDescriptor);
        try (InputStream classStream = getResourceAsStream(classLoader, classFilePath)) {
            ClassReader reader = new ClassReader(classStream);
            reader.accept(expressionClassVisitor, ClassReader.SKIP_DEBUG | ClassReader.SKIP_FRAMES);
            String fullPropertyName = methodBody.toString();
            return lambdaCache.computeIfAbsent(serializedDescriptor, key -> {
                return fullPropertyName;
            });
        } catch (IOException e) {
            throw new RuntimeException("error parsing class file " + classFilePath, e);
        }
    }
        private static InputStream getResourceAsStream(ClassLoader classLoader,
                                                       String path)
                throws FileNotFoundException {
            InputStream stream = classLoader.getResourceAsStream(path);
            if (stream == null)
                throw new FileNotFoundException(path);
            return stream;
        }

    private static String classFilePath(String className) {
        return className.replace('.', '/') + ".class";
    }
    private static String getPropertyNameByInvokeVirtual(SerializedLambda serializedLambda){
        String method = serializedLambda.getImplMethodName();

        String attr = null;
        if (method.startsWith("get")) {
            attr = method.substring(3);
        } else {
            attr = method.substring(2);
        }
        return EasyStringUtil.toLowerCaseFirstOne(attr);
    }
}

//Replace the default parser before use
EasyLambdaUtil.replaceParser(new MyLambdaParser());
```

## Insert
```java
ValueCompany company = new ValueCompany();
company.setId("my1");
company.setName("myCompany1");
ValueCompanyAddress valueCompanyAddress = new ValueCompanyAddress();
valueCompanyAddress.setProvince("province1");
valueCompanyAddress.setCity("city1");
valueCompanyAddress.setArea("area1");
company.setAddress(valueCompanyAddress);
ValueCompanyLicense valueCompanyLicense = new ValueCompanyLicense();
valueCompanyLicense.setLicenseNo("license1");
valueCompanyLicense.setLicenseDeadline(LocalDateTime.of(2023,1,1,0,0));
ValueCompanyLicenseExtra valueCompanyLicenseExtra = new ValueCompanyLicenseExtra();
valueCompanyLicenseExtra.setLicenseImage("www.baidu.com");
valueCompanyLicenseExtra.setLicenseContent("it编程");
valueCompanyLicense.setExtra(valueCompanyLicenseExtra);
company.setLicense(valueCompanyLicense);
long l = easyQueryClient.insertable(company).executeRows();


==> Preparing: INSERT INTO `my_company` (`id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content`) VALUES (?,?,?,?,?,?,?,?,?)
==> Parameters: my1(String),myCompany1(String),province1(String),city1(String),area1(String),license1(String),2023-01-01T00:00(LocalDateTime),www.baidu.com(String),it编程(String)
<== Total: 1

```

## Query
```java
//Property mode
List<ValueCompany> province1 = easyQueryClient.queryable(ValueCompany.class)
        .where(o -> o.eq("address.province", "province1"))
        .toList();

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=ValueCompanyLicenseExtra(licenseImage=www.baidu.com, licenseContent=it编程)))]


==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

//Lambda mode
List<ValueCompany> province11 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline`,`license_image`,`license_content` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

//Don't query business license extra information
List<ValueCompany> province2 = easyQueryClient.queryable(ValueCompany.class)
                .where(o -> o.eq("address.province", "province1"))
                .select(o->o.columnAll().columnIgnore("license.extra"))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=null))]

 List<ValueCompany> province22 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .select(o->o.columnAll().columnIgnore(x->x.getLicense().getExtra()))
                .toList();

==> Preparing: SELECT `id`,`name`,`province`,`city`,`area`,`license_no`,`license_deadline` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=my1, name=myCompany1, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=2023-01-01T00:00, extra=null))]

//Only query address and business license number
 List<ValueCompany> province4 = easyQueryClient.queryable(ValueCompany.class)
                .where(o -> o.eq("address.province", "province1"))
                .select(o->o.column("address").column("license.licenseNo"))
                .toList();

==> Preparing: SELECT `province`,`city`,`area`,`license_no` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=null, name=null, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=null, extra=null))]


List<ValueCompany> province44 = easyQuery.queryable(ValueCompany.class)
                .where(o -> o.eq(x -> x.getAddress().getProvince(), "province1"))
                .select(o->o.column(ValueCompany::getAddress).column(x->x.getLicense().getLicenseNo()))
                .toList();

==> Preparing: SELECT `province`,`city`,`area`,`license_no` FROM `my_company` WHERE `province` = ?
==> Parameters: province1(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[ValueCompany(id=null, name=null, address=ValueCompanyAddress(province=province1, city=city1, area=area1), license=ValueCompanyLicense(licenseNo=license1, licenseDeadline=null, extra=null))]
```

## Update
```java
//Tracking update only modifies business license content
TrackManager trackManager = easyQuery.getRuntimeContext().getTrackManager();
try {
    trackManager.begin();
    easyQuery.addTracking(company);
    company.getLicense().getExtra().setLicenseContent("it++++1");
    easyQuery.updatable(company).executeRows();
}
finally {
    trackManager.release();
}

==> Preparing: UPDATE `my_company` SET `license_content` = ? WHERE `id` = ?
==> Parameters: it++++1(String),my1(String)
<== Total: 1


//Direct update
easyQuery.updatable(company).executeRows();

==> Preparing: UPDATE `my_company` SET `name` = ?,`province` = ?,`city` = ?,`area` = ?,`license_no` = ?,`license_deadline` = ?,`license_image` = ?,`license_content` = ? WHERE `id` = ?
==> Parameters: myCompany1(String),province1(String),city1(String),area1(String),license1(String),2023-01-01T00:00(LocalDateTime),www.baidu.com(String),it编程(String),my1(String)
<== Total: 1
```

## Related Search
`@Embedded` `@Embeddable` `Value Type` `Value Object`

