---
title: Structured DTO Hints
order: 40
category:
  - plugin
---


# Structured DTO Hints
Sometimes our DTOs are not created quickly through structured DTOs, but may be built manually. Can we quickly hint the corresponding DTO information?

## Step 1: Create DTO
```java
/**
 * create time 2025/10/26 10:56
 * File description
 *
 * @author xuejiaming
 */
public class UserTestDTO {
}

```

## Step 2: Add Link
Add `{@link com.eq.samples.domain.SysUser}` at the top of the DTO comment.
```java

/**
 * create time 2025/10/26 10:56
 * File description
 * {@link com.eq.samples.domain.SysUser}
 *
 * @author xuejiaming
 */
public class UserTestDTO {
}

```

## Smart Hint Input eq

<img :src="$withBase('/images/dto-plugin-tip.jpg')">


## Feature Explanation
We can see from the smart hints above that eq hints mainly have three types:
- 1. eq field - Just copy the field and field-related comments to the current DTO
- 2. eq field InternalClass - Copy navigation properties to generate inner classes in the current DTO
- 3. eq_extra_auto_include_configure - Perform additional operations on the current node level of the current DTO, such as filtering or selecting extra fields

