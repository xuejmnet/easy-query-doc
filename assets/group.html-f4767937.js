const e=JSON.parse('{"key":"v-0d476366","path":"/guide/query/group.html","title":"分组","lang":"zh-CN","frontmatter":{"title":"分组","order":30,"description":"easy-query提供了方便的分组查询功能的支持 ```java List topicGroupTestDTOS = easyQuery.queryable(Topic.class) .where(o -> o.eq(Topic::getId, \\"3\\")) .groupBy(o->o.column(Topic::getId)) .select(Top...","head":[["meta",{"property":"og:url","content":"https://vuepress-theme-hope-docs-demo.netlify.app/easy-query-doc/guide/query/group.html"}],["meta",{"property":"og:site_name","content":"文档演示"}],["meta",{"property":"og:title","content":"分组"}],["meta",{"property":"og:description","content":"easy-query提供了方便的分组查询功能的支持 ```java List topicGroupTestDTOS = easyQuery.queryable(Topic.class) .where(o -> o.eq(Topic::getId, \\"3\\")) .groupBy(o->o.column(Topic::getId)) .select(Top..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-25T14:20:18.000Z"}],["meta",{"property":"article:modified_time","content":"2023-03-25T14:20:18.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"分组\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-03-25T14:20:18.000Z\\",\\"author\\":[]}"]]},"headers":[],"git":{"createdTime":1679754018000,"updatedTime":1679754018000,"contributors":[{"name":"xuejiaming","email":"326308290@qq.com","commits":1}]},"readingTime":{"minutes":0.85,"words":254},"filePathRelative":"guide/query/group.md","localizedDate":"2023年3月25日","autoDesc":true}');export{e as data};
