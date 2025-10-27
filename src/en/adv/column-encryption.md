---
title: Database Column Encryption
order: 60
---

# Database Column Encryption
`easy-query` provides suggested database column encryption functionality, which can implement complex database column encryption and support fuzzy queries. For the implementation method, please refer to [Alibaba Encrypted Field Retrieval Solution](https://jaq-doc.alibaba.com/docs/doc.htm?treeId=1&articleId=106213&docType=1). Here, `easy-query` provides a default implementation that supports all databases.

## EncryptionStrategy

Method  | Parameters | Description  
--- | --- | --- 
encrypt | Object, Property, Value | Encrypt value, will be called when inserting, modifying, querying
decrypt | Object, Property, Value | Decrypt value, will be decrypted when querying

## Encryption

Property  | Default Value | Description  
--- | --- | --- 
strategy | None | Encryption strategy implementation class, which specific encryption strategy to use to implement encryption for the current column
supportQueryLike | false | Whether to support fuzzy query, default not supported, default supports equal matching. The difference is that when using like or like-related queries, the input parameters will be encrypted in the same way and then matched. The encryption algorithm needs to support fuzzy queries

## Demo Data

::: code-tabs
@tab SysUserEncryption
```java
@Data
@Table("t_sys_user_encryption")
public class SysUserEncryption {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String phoneNotSupportLike;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String addressNotSupportLike;
    private String phoneSupportLike;
    private String addressSupportLike;
}
```
@tab Base64EncryptionStrategy
```java

/**
 * create time 2023/4/4 11:38
 * If it's a spring project, you can use @Component, otherwise add it to EasyQueryConfiguration.applyEncryptionStrategy
 *
 * @author xuejiaming
 */
public class Base64EncryptionStrategy implements EncryptionStrategy {
    @Override
    public Object encrypt(Class<?> entityClass, String propertyName, Object plaintext) {
        if(plaintext==null){
            return null;
        }
        return new String(Base64Util.encode(plaintext.toString().getBytes(StandardCharsets.UTF_8)),StandardCharsets.UTF_8);
    }

    @Override
    public Object decrypt(Class<?> entityClass, String propertyName, Object ciphertext) {
        if(ciphertext==null){
            return null;
        }

        return new String(Base64Util.decode(ciphertext.toString().getBytes(StandardCharsets.UTF_8)),StandardCharsets.UTF_8);
    }
}

```
@tab SQL
```sql
-- Database table structure statement
create table t_sys_user_encryption
(
    id varchar(32) not null comment 'Primary Key ID' primary key,
    name varchar(32) not null comment 'Name',
    phone_not_support_like varchar(100) null comment 'Phone number that does not support like',
    phone_support_like varchar(200) null comment 'Phone number that supports like',
    address_not_support_like varchar(1024)  null comment 'Address that supports like',
    address_support_like varchar(1024)  null comment 'Address that does not support like'
)comment 'User field encryption table';
```
:::


## Insert Data Test
```java
SysUserEncryption sysUserEncryption = new SysUserEncryption();
sysUserEncryption.setId("1");
sysUserEncryption.setName("name1");
sysUserEncryption.setPhoneNotSupportLike("12345678901");
sysUserEncryption.setAddressNotSupportLike("浙江省绍兴市越城区城市广场旁边2-102");
long l1 = easyQuery.insertable(sysUserEncryption).executeRows();
Assert.assertEquals(1,l1);
SysUserEncryption sysUserEncryption1 = easyQuery.queryable(SysUserEncryption.class).whereById("1").firstOrNull();
Assert.assertNotNull(sysUserEncryption1);
Assert.assertEquals(sysUserEncryption.getId(),sysUserEncryption1.getId());
Assert.assertEquals(sysUserEncryption.getPhoneNotSupportLike(),sysUserEncryption1.getPhoneNotSupportLike());
Assert.assertEquals(sysUserEncryption.getAddressNotSupportLike(),sysUserEncryption1.getAddressNotSupportLike());
SysUserEncryption sysUserEncryption2 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.eq(SysUserEncryption::getPhoneNotSupportLike, "12345678901")).firstOrNull();
Assert.assertNotNull(sysUserEncryption2);
Assert.assertEquals(sysUserEncryption1.getId(),sysUserEncryption2.getId());
SysUserEncryption sysUserEncryption3 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getPhoneNotSupportLike, "12345678901")).firstOrNull();
Assert.assertNull(sysUserEncryption3);


==> Preparing: INSERT INTO t_sys_user_encryption (`id`,`name`,`phone_not_support_like`,`address_not_support_like`,`phone_support_like`,`address_support_like`) VALUES (?,?,?,?,?,?) 
==> Parameters: 1(String),name1(String),MTIzNDU2Nzg5MDE=(String),5rWZ5rGf55yB57uN5YW05biC6LaK5Z+O5Yy65Z+O5biC5bm/5Zy65peB6L65Mi0xMDI=(String),null(null),null(null)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_not_support_like` = ? LIMIT 1
==> Parameters: MTIzNDU2Nzg5MDE=(String)
<== Total: 1
==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_not_support_like` LIKE ? LIMIT 1
==> Parameters: %12345678901%(String)
<== Total: 0
```

## Encryption Implementation Class Supports Fuzzy Search with High Performance

[Alibaba Encrypted Field Retrieval Solution](https://jaq-doc.alibaba.com/docs/doc.htm?treeId=1&articleId=106213&docType=1)

This uses Alibaba's encrypted field retrieval solution to implement this function, achieving encrypted storage of phone addresses and high-performance fuzzy search

### Encryption Method
AES/CBC/PKCS5Padding encryption length, `non-Chinese single character occupies one length`, `Chinese character occupies two lengths`, `default non-Chinese 4 lengths as a group`, `Chinese two as a group`, if search is needed, by default at least 4 non-Chinese characters or 2 Chinese characters are required as follows



Algorithm/Mode/Padding  | 16-byte encrypted data length | Less than 16-byte encrypted length |Currently Used
--- | --- | --- | ---
AES/CBC/NoPadding         | 16 |  Not supported        | ❌
**AES/CBC/PKCS5Padding**  | 32 |  16     | ✅
AES/CBC/ISO10126Padding   | 32 |  16     | ❌
AES/CFB/NoPadding         | 16 |  Original data length     | ❌
AES/CFB/PKCS5Padding      | 32 |  16     | ❌
AES/CFB/ISO10126Padding   | 32 |  16     | ❌
AES/ECB/NoPadding         | 16 |  Not supported     | ❌
AES/ECB/PKCS5Padding      | 32 |  16     | ❌
AES/ECB/ISO10126Padding   | 32 |  16     | ❌
AES/OFB/NoPadding         | 16 |  Original data length     | ❌
AES/OFB/PKCS5Padding      | 32 |  16     | ❌
AES/OFB/ISO10126Padding   | 32 |  16     | ❌
AES/PCBC/NoPadding        | 16 |  Not supported     | ❌
AES/PCBC/PKCS5Padding     | 32 |  16     | ❌
AES/PCBC/ISO10126Padding  | 32 |  16    | ❌

### Implement Encryption Strategy
`easy-query` is very thoughtful to provide you with default encryption strategy abstractions. You only need to fill in the secret key and offset `AbstractUnSupportEmojiAesBase64EncryptionStrategy` or `AbstractSupportEmojiAesBase64EncryptionStrategy`.
<font color='red'>The secret key and offset provided here must all be 16-character length strings</font>




::: warning Notice!!!
> The `AbstractUnSupportEmojiAesBase64EncryptionStrategy` abstract class only supports non-emoji columns by default, such as Chinese, numbers, English, special symbols, etc. `AbstractSupportEmojiAesBase64EncryptionStrategy` supports emoji processing. The difference between the two is that the strategy that does not support `Emoji` will have slightly higher performance
:::

### AbstractUnSupportEmojiAesBase64EncryptionStrategy
Does not support emoji

### AbstractSupportEmojiAesBase64EncryptionStrategy

Method  |  Default Value   |  Description  
--- | ---  | --- 
getIv| None |  16-byte vector
getKey| None | 16-byte secret key
encryptWordMinLength| 4 | Minimum encryption length
chineseCharOccupancyLength| 2| One Chinese character occupancy length
throwIfDecryptFail| true | Whether to throw error when decryption fails


::: warning Notice!!!
> By default, `AbstractUnSupportEmojiAesBase64EncryptionStrategy` and `AbstractSupportEmojiAesBase64EncryptionStrategy` will also encrypt empty strings passed to the database, so functions like `isBlank` and `isNotBlank` will become invalid. It is recommended that users implement whether to encrypt when passing empty or keep empty
:::

```java
public class MyEncryptionStrategy extends AbstractSupportEmojiAesBase64EncryptionStrategy {
    @Override
    public String getIv() {
        return "A-16-Byte-String";
    }

    @Override
    public String getKey() {
        return "1234567890abcdef";
    }

}

```

Modify the original object
```java
@Data
@Table("t_sys_user_encryption")
public class SysUserEncryption {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String phoneNotSupportLike;
    @Encryption(strategy = Base64EncryptionStrategy.class)
    private String addressNotSupportLike;
    @Encryption(strategy = MyEncryptionStrategy.class,supportQueryLike = true)
    private String phoneSupportLike;
    @Encryption(strategy = MyEncryptionStrategy.class,supportQueryLike = true)
    private String addressSupportLike;
}
```


### Test
```java
SysUserEncryption sysUserEncryption = new SysUserEncryption();
sysUserEncryption.setId("2");
sysUserEncryption.setName("name2");
sysUserEncryption.setPhoneSupportLike("12345678901");
sysUserEncryption.setAddressSupportLike("浙江省绍兴市越城区城市广场旁边2-102");
long l1 = easyQuery.insertable(sysUserEncryption).executeRows();
Assert.assertEquals(1,l1);

==> Preparing: INSERT INTO t_sys_user_encryption (`id`,`name`,`phone_not_support_like`,`address_not_support_like`,`phone_support_like`,`address_support_like`) VALUES (?,?,?,?,?,?) 
==> Parameters: 2(String),name2(String),null(null),null(null),PBNjuyKlEazZoRRnMUupJA==IgrQqipSFtsBJal4l1uviA==act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==XORntDPVNDrdId+JLsMH4w==S+w1G858r9lawlqhSbHw9A==VRhLsnycy28X4io+sRAScA==XNGeRBsmiV4Jd+iMjzyd6w==(String),5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==kGziT8zvaq0Mr4mgC0o8ew==o/KgX28zI/vzwYP6H+yBPQ==bIV0eBlAxjvAu53mCRCJKQ==3T589p9NTva5G7yy6Tw1zA==CbmPqpgcbPXq9ZnKJ6eFOg==7TBMWW5dxwjhmnuxffO2BQ==87EZCkWnYFik+lABuLm/0g==SiaBG+vnzNx/p2/7VNtYmw==R+BfXClbpMfdtvtgNpb2Kg==2bm0wNpPthXLTTf3ePF8Ow==/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String)
<== Total: 1

```
```java

SysUserEncryption sysUserEncryption1 = easyQuery.queryable(SysUserEncryption.class).whereById("2").firstOrNull();
Assert.assertNotNull(sysUserEncryption1);
Assert.assertEquals(sysUserEncryption.getId(),sysUserEncryption1.getId());
Assert.assertEquals(sysUserEncryption.getPhoneSupportLike(),sysUserEncryption1.getPhoneSupportLike());
Assert.assertEquals(sysUserEncryption.getAddressSupportLike(),sysUserEncryption1.getAddressSupportLike());



==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`id` = ? LIMIT 1
==> Parameters: 2(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption2 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.eq(SysUserEncryption::getPhoneSupportLike, "12345678901")).firstOrNull();
Assert.assertNotNull(sysUserEncryption2);
Assert.assertEquals(sysUserEncryption1.getId(),sysUserEncryption2.getId());



==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_support_like` = ? LIMIT 1
==> Parameters: PBNjuyKlEazZoRRnMUupJA==IgrQqipSFtsBJal4l1uviA==act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==XORntDPVNDrdId+JLsMH4w==S+w1G858r9lawlqhSbHw9A==VRhLsnycy28X4io+sRAScA==XNGeRBsmiV4Jd+iMjzyd6w==(String)
<== Total: 1



```
```java

SysUserEncryption sysUserEncryption3 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getPhoneSupportLike, "34567")).firstOrNull();
Assert.assertNotNull(sysUserEncryption3);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`phone_support_like` LIKE ? LIMIT 1
==> Parameters: %act0SMpmvTNWd/+aBXnybA==avtYLQlFEztwFOYNB0x+Cw==%(String)
<== Total: 1



```
```java

SysUserEncryption sysUserEncryption4 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "2-102")).firstOrNull();
Assert.assertNotNull(sysUserEncryption4);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==%(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption5 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.likeMatchRight(SysUserEncryption::getAddressSupportLike, "2-102")).firstOrNull();
Assert.assertNotNull(sysUserEncryption5);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String)
<== Total: 1

```
```java

SysUserEncryption sysUserEncryption6 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.likeMatchLeft(SysUserEncryption::getAddressSupportLike, "浙江省绍兴市")).firstOrNull();
Assert.assertNotNull(sysUserEncryption6);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: 5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==%(String)
<== Total: 1


```
```java

SysUserEncryption sysUserEncryption7 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "绍兴")).firstOrNull();
Assert.assertNotNull(sysUserEncryption7);


==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %taspTHZ7faxKgLu8WiR4xg==%(String)
<== Total: 1

```
```java

//Single Chinese character does not support query so it's empty
SysUserEncryption sysUserEncryption8 = easyQuery.queryable(SysUserEncryption.class).where(o -> o.like(SysUserEncryption::getAddressSupportLike, "绍")).firstOrNull();
Assert.assertNull(sysUserEncryption8);

==> Preparing: SELECT t.`id`,t.`name`,t.`phone_not_support_like`,t.`address_not_support_like`,t.`phone_support_like`,t.`address_support_like` FROM t_sys_user_encryption t WHERE t.`address_support_like` LIKE ? LIMIT 1
==> Parameters: %UXUfduoPhC3qV7yzGkaYHg==%(String)
<== Total: 0
```

```java
sysUserEncryption7.setPhoneSupportLike("13232323321");
long l2 = easyQuery.updatable(sysUserEncryption7).executeRows();
Assert.assertEquals(1,l2);

==> Preparing: UPDATE t_sys_user_encryption SET `name` = ?,`phone_not_support_like` = ?,`address_not_support_like` = ?,`phone_support_like` = ?,`address_support_like` = ? WHERE `id` = ?
==> Parameters: name2(String),null(null),null(null),7OH9gTLq8hK4vflSizrRKg==rsW+JktKi+3iIq0Xm3vSSw==/RYbVYX8k/qGMprCZslddg==rsW+JktKi+3iIq0Xm3vSSw==/RYbVYX8k/qGMprCZslddg==TncRPIKuqNopeX/GJCgjGw==UH8PuTSDSuiTj+rLVsnjOA==2EppLfMm+O7BMtPJ7xH7CA==(String),5JxqmAe3vLE3As62ds8z/Q==RfK4efiC8TpWrlW8EYOE7Q==xYgFo1HQhvsZb3aqqJEr0w==taspTHZ7faxKgLu8WiR4xg==3K4XEON1qksj0l068srXLg==kGziT8zvaq0Mr4mgC0o8ew==o/KgX28zI/vzwYP6H+yBPQ==bIV0eBlAxjvAu53mCRCJKQ==3T589p9NTva5G7yy6Tw1zA==CbmPqpgcbPXq9ZnKJ6eFOg==7TBMWW5dxwjhmnuxffO2BQ==87EZCkWnYFik+lABuLm/0g==SiaBG+vnzNx/p2/7VNtYmw==R+BfXClbpMfdtvtgNpb2Kg==2bm0wNpPthXLTTf3ePF8Ow==/RAvJwP3bdCH88opBIxHNA==YtwmFV6JyKHYTLkcp3Xxvw==(String),2(String)
<== Total: 1
```

```java
long l3 = easyQuery.updatable(SysUserEncryption.class).set(SysUserEncryption::getPhoneSupportLike, "19876543210")
        .where(o -> o.eq(SysUserEncryption::getId, "2")).executeRows();
Assert.assertEquals(1,l2);

==> Preparing: UPDATE t_sys_user_encryption SET `phone_support_like` = ? WHERE `id` = ?
==> Parameters: 5mvI8ru5KU2gEoqUhUCR7A==MXfvDfZA1YdM7qws03g1ew==82zyfpam7R2nhH8QGEV2PA==IRTc1Xc89aXhLz6g2EMWtw==U+T8I0LMIZE62zLYLQPcHw==z21auLlv0TzO5sWM8E15Sg==o601InWNlOLFRSPiuivKLA==WlISXTG+AJUzRY1SF31+Eg==(String),2(String)
<== Total: 1
```
Of course, the current algorithm may not be optimal and the space may not be most effective, but a default one is provided here. We hope everyone can PR related ideas and algorithms. `easy-query` can currently achieve high-performance seamless column encryption storage processing

