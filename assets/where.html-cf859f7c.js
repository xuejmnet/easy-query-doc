import{_ as t,W as d,X as e,a2 as r}from"./framework-6199cc12.js";const l={},o=r('<h1 id="条件比较" tabindex="-1"><a class="header-anchor" href="#条件比较" aria-hidden="true">#</a> 条件比较</h1><p><code>easy-query</code>的查询、修改、删除核心过滤方法就是<code>WherePredicate</code>和<code>SqlPredicate</code>两种是同一种东西,条件比较永远是<code>column</code> <code>compare</code> <code>value</code>,column永远在左侧</p><h2 id="api" tabindex="-1"><a class="header-anchor" href="#api" aria-hidden="true">#</a> API</h2><table><thead><tr><th>方法</th><th>sql</th><th>描述</th></tr></thead><tbody><tr><td>gt</td><td>&gt;</td><td>列 大于 值</td></tr><tr><td>ge</td><td>&gt;=</td><td>列 大于等于 值</td></tr><tr><td>eq</td><td>=</td><td>列 等于 值</td></tr><tr><td>ne</td><td>!=</td><td>列 不等于 值</td></tr><tr><td>le</td><td>&lt;=</td><td>列 小于等于 值</td></tr><tr><td>lt</td><td>&lt;</td><td>列 小于 值</td></tr><tr><td>likeMatchLeft</td><td>like word%</td><td>列左匹配</td></tr><tr><td>likeMatchRight</td><td>like %word</td><td>列右匹配</td></tr><tr><td>like</td><td>like %word%</td><td>列包含值</td></tr><tr><td>notLikeMatchLeft</td><td>not like word%</td><td>列 不匹配左侧</td></tr><tr><td>notLikeMatchRight</td><td>not like %word</td><td>列 不匹配右侧</td></tr><tr><td>notLike</td><td>not like %word%</td><td>列不包含值</td></tr><tr><td>isNull</td><td>is null</td><td>列 为null</td></tr><tr><td>isNotNull</td><td>is not null</td><td>列 不为null</td></tr><tr><td>in</td><td>in</td><td>列 在集合内部,集合为空返回False</td></tr><tr><td>notIngt</td><td>not in</td><td>列 不在集合内部,集合为空返回True</td></tr><tr><td>rangeOpenClosed</td><td>&lt; x &lt;=</td><td>区间 (left..right] = {x | left &lt; x &lt;= right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeOpen</td><td>&lt; x &lt;</td><td>区间 (left..right) = {x | left &lt; x &lt; right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeClosedOpen</td><td>&lt;= x &lt;</td><td>[left..right) = {x | left &lt;= x &lt; right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>rangeClosed</td><td>&lt;= x &lt;=</td><td>[left..right] = {x | left &lt;= x &lt;= right} 一般用于范围比如时间,小的时间在前大的时间在后</td></tr><tr><td>columnFunc</td><td>自定义</td><td>自定义函数包裹column</td></tr></tbody></table>',4),i=[o];function n(a,c){return d(),e("div",null,i)}const s=t(l,[["render",n],["__file","where.html.vue"]]);export{s as default};
