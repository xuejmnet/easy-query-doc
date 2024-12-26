import{_ as t}from"./plugin-vue_export-helper-c27b6911.js";import{o as e,c as d,e as a}from"./app-c5af8781.js";const r={},s=a('<h1 id="navigate" tabindex="-1"><a class="header-anchor" href="#navigate" aria-hidden="true">#</a> Navigate</h1><p>用来指定属性关系和当前对象的对应关系,支持entity和vo指定对象关系(vo只需要指定value)</p><table><thead><tr><th>属性</th><th>默认值</th><th>描述</th></tr></thead><tbody><tr><td>value</td><td>-</td><td>用于指定一对一、一对多、多对一、多对多</td></tr><tr><td>selfProperty</td><td>{}</td><td>当前对象的哪个属性关联目标对象,空表示使用当前对象的主键</td></tr><tr><td>targetProperty</td><td>{}</td><td>当前对象的<code>selfProperty</code>}`属性关联目标的哪个属性,空表示使用目标对象的主键</td></tr><tr><td>mappingClass</td><td>Object.class</td><td>中间表对应的entity.class</td></tr><tr><td>mappingClass</td><td>Object.class</td><td>中间表对应的entity.class</td></tr><tr><td>mappingClass</td><td>Object.class</td><td>中间表对应的entity.class</td></tr></tbody></table><div class="hint-container warning"><p class="hint-container-title">说明!!!</p><blockquote><p>当使用多属性时必须两者一致比如<code>selfProperty</code>是长度为2的数组那么<code>targetProperty</code>也必须要长度为2</p></blockquote></div>',4),c=[s];function o(n,i){return e(),d("div",null,c)}const h=t(r,[["render",o],["__file","navigate.html.vue"]]);export{h as default};