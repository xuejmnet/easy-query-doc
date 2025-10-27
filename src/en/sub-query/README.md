---
title: Subquery Chapters
---
`eq` provides rich subquery functionality, including implicit subqueries and manual subqueries, and subqueries also support unlimited nesting to implement any SQL functionality

- Implicit subqueries (must read) 🔥 Can quickly write subqueries based on object relationships, compared to manual subquery writing, development efficiency has a qualitative leap
- Manual subqueries Can quickly mock based on SQL expressions to achieve the same functionality

Implicit subqueries use `LEFT JOIN` by default to ensure data accuracy. If you think the sub-item must exist, you can use `@Navigate(required=true)` so that the framework will use `INNER JOIN` instead of `LEFT JOIN` when the sub-item must exist


::: danger Note!!!
> There are two ways to create manual subqueries: one is to create a queryable with `eq instance`, the other is through `expression().subQueryable()` inside the expression. When using them, we should try to use the context to create subquery expressions. The difference is that expressions created by `eq instance` must have the subquery as the left table rather than the outer table as the left table, while `expression().subQueryable()` created subqueries do not need to consider this problem
:::




## Implicit subquery assertion api
Subquery  | api type  
---   | --- 
select subquery   | Type fragment
where subquery   | Execution fragment
join subquery   | Expression fragment
from subquery   | Expression fragment


## Implicit subquery assertion api
api  | Description  
---   | --- 
any(expression)   | Indicates at least one that meets the condition, simply understood as `exists`
none(expression)   | Indicates none that meet the condition, simply understood as `no exists`
all(expression)   | It means that all elements in the preceding collection must satisfy the conditions inside all. If the preceding collection is empty, the result defaults to true.
where(expression)   | Add conditions to the subquery
orderBy(expression)   | Sort the subquery, commonly used with elements
firstElement()   | Get the first element of the subquery
element(index)   | Get the nth element of the subquery, the first index value is 0
elements(start,end)   | Get a part of the subquery, the first index value is 0
flatElement()   | Expand the subquery, adding conditions after it is equivalent to a shorthand for `any`
configure(expression)   | Used to configure subquery related parameters such as whether to enable logical delete etc.
distinct()   | Deduplicate results, such as `bankCards().distinct().count(x->x.type())`
anyValue()   | Return true/false whether it exists
noneValue()   | Return true/false whether it exists
count()   | Count the number of results
sum(expression)   | Sum the results, parameter is the column expression to count `bankCards().sum(card->card.amount())` sum the balance of each bank card
avg(expression)   | Average the results
max(expression)   | Get the maximum value of the results
min(expression)   | Get the minimum value of the results
joining(expression)   | Combine results into one column

## Implicit subquery related api

api  | Description  
---  | --- 
`user->user.bankCards().any()`   | User has at least one bank card
`user->user.bankCards().none()`  | User has no bank cards at all
`user->user.bankCards().all(bc->bc.type().eq("savings card"))`  | All of the user’s bank cards are savings card. If the user has no bank cards, the user will still be included in the query.
`user->user.bankCards().where(card->card.type().eq("savings card")).any()` | User has at least one savings card among their bank cards
`user->user.bankCards().any(card->card.type().eq("savings card"))`| User has at least one savings card among their bank cards, `where+any` can be abbreviated as `any`
`user->user.bankCards().where(card->card.type().eq("savings card")).none()`  | User has no savings cards among their bank cards
`user->user.bankCards().none(card->card.type().eq("savings card"))` | User has no savings cards among their bank cards, `where+none` can be abbreviated as `none`
`user->user.bankCards().where(card->card.type().eq("savings card")).count()` | Number of savings cards the user has, supports assertions
`user->user.bankCards().where(card->card.type().eq("savings card")).count().eq(1L)` | User has exactly 1 savings card
`user->user.bankCards().where(card->card.type().eq("savings card")).elements(0,1).none(card->card.bank().name().eq("建设银行"))` | User's first two bank cards are not from China Construction Bank
