const e=JSON.parse('{"key":"v-e8200854","path":"/guide/adv/atomic-update.html","title":"列值原子更新","lang":"zh-CN","frontmatter":{"title":"列值原子更新","description":"easy-query提供了原子列更新,主要是针对当前数据的库存或者金额等数据进行原子更新,需要配合track更新,无法单独使用,譬如我有一个库存冗余字段,那么在更新的时候如果是对象更新那么将会生成原子sql(可以自定义)比如update set column=column+1 where id=xxx and column>=xxx说明!!! 仅ent...","head":[["meta",{"property":"og:url","content":"https://vuepress-theme-hope-docs-demo.netlify.app/easy-query-doc/guide/adv/atomic-update.html"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"列值原子更新"}],["meta",{"property":"og:description","content":"easy-query提供了原子列更新,主要是针对当前数据的库存或者金额等数据进行原子更新,需要配合track更新,无法单独使用,譬如我有一个库存冗余字段,那么在更新的时候如果是对象更新那么将会生成原子sql(可以自定义)比如update set column=column+1 where id=xxx and column>=xxx说明!!! 仅ent..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-08-01T09:34:11.000Z"}],["meta",{"property":"article:author","content":"xuejmnet"}],["meta",{"property":"article:modified_time","content":"2023-08-01T09:34:11.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"列值原子更新\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-08-01T09:34:11.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"xuejmnet\\",\\"url\\":\\"https://github.com/xuejmnet\\"}]}"]]},"headers":[{"level":2,"title":"ValueUpdateAtomicTrack","slug":"valueupdateatomictrack","link":"#valueupdateatomictrack","children":[{"level":3,"title":"系统默认实现","slug":"系统默认实现","link":"#系统默认实现","children":[]}]},{"level":2,"title":"例子","slug":"例子","link":"#例子","children":[]}],"git":{"createdTime":1685890998000,"updatedTime":1690882451000,"contributors":[{"name":"xuejiaming","email":"326308290@qq.com","commits":2}]},"readingTime":{"minutes":1.27,"words":381},"filePathRelative":"guide/adv/atomic-update.md","localizedDate":"2023年6月4日","autoDesc":true,"excerpt":""}');export{e as data};