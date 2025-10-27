---
title: Object Ownership Change
order: 110
---

# Object Ownership Change
In ORM (Object-Relational Mapping), object ownership change generally refers to the change in the "controlling side" of the relationship between entities, or in other words, the transfer of an object from belonging to one parent object to another parent object.
In other words, it involves the change of who maintains the foreign key / relationship field.

## Example

```java

    @PostMapping("/create2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create2() {
        ArrayList<SaveUser> users = new ArrayList<>();
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("XiaoMing1's id");
            saveUser.setName("XiaoMing1");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("XiaoMing1's home id");
            saveUserAddress.setProvince("Zhejiang Province");
            saveUserAddress.setCity("Shaoxing City");
            saveUserAddress.setArea("Yuecheng District");
            saveUserAddress.setAddress("XiaoMing1's home");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        {

            SaveUser saveUser = new SaveUser();
            users.add(saveUser);
            saveUser.setId("XiaoMing2's id");
            saveUser.setName("XiaoMing2");
            saveUser.setAge(19);
            saveUser.setCreateTime(LocalDateTime.now());

            SaveUserExt saveUserExt = new SaveUserExt();
            saveUserExt.setMoney(BigDecimal.ZERO);
            saveUserExt.setHealthy(true);
            saveUser.setSaveUserExt(saveUserExt);

            SaveUserAddress saveUserAddress = new SaveUserAddress();
            saveUserAddress.setId("XiaoMing2's home id");
            saveUserAddress.setProvince("Zhejiang Province");
            saveUserAddress.setCity("Shaoxing City");
            saveUserAddress.setArea("Yuecheng District");
            saveUserAddress.setAddress("XiaoMing2's home");
            saveUser.setSaveUserAddress(saveUserAddress);
        }
        easyEntityQuery.savable(users).executeCommand();
        return "ok";
    }


    @PostMapping("/change2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object change2() {

        List<SaveUser> list = easyEntityQuery.queryable(SaveUser.class)
                .include(save_user -> save_user.saveUserAddress())
                .toList();
        SaveUser xm1 = list.get(0);
        SaveUserAddress xm1address = xm1.getSaveUserAddress();
        SaveUser xm2 = list.get(1);
        SaveUserAddress xm2address = xm2.getSaveUserAddress();
        xm1.setSaveUserAddress(xm2address);
        xm2.setSaveUserAddress(xm1address);

        easyEntityQuery.savable(list).executeCommand();
        return "ok";
    }
```
Create two objects XiaoMing1 and XiaoMing2, and swap the addresses of the two users
```java
com.easy.query.core.exception.EasyQueryInvalidOperationException: relation value not equals,entity:[SaveUserAddress],property:[uid],value:[b8aefc1c7ef040379839d26af91765d3],should:[8f5a841478164e97b09db58107ace085]. Current OwnershipPolicy does not allow reassignment.
```
An error is reported indicating that object ownership cannot be changed. To ensure data integrity and prevent misoperation, the framework does not allow users to change object ownership by default, meaning value objects cannot easily change their aggregate root. We can configure the framework to support ownership changes through configuration.
```java
easyEntityQuery.savable(list)
                .configure(s->s.getSaveBehavior().add(SaveBehaviorEnum.ALLOW_OWNERSHIP_CHANGE))
                .executeCommand();
```
By adding `ownershipPolicy(OwnershipPolicyEnum.AllowOwnershipChange)`, the framework supports value object ownership changes
```sql

UPDATE `t_save_user_addr`
SET `uid` = 'XiaoMing1's id'
WHERE `id` = 'XiaoMing2's home id'

UPDATE `t_save_user_addr`
SET `uid` = 'XiaoMing2's id'
WHERE `id` = 'XiaoMing1's home id'

```

