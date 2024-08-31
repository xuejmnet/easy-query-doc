import{_ as p}from"./plugin-vue_export-helper-c27b6911.js";import{r as e,o as l,c as u,a as i,w as a,b as n,d as s,e as k}from"./app-824f517e.js";const r={},d=n("h1",{id:"分组",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#分组","aria-hidden":"true"},"#"),s(" 分组")],-1),m=n("p",null,[n("code",null,"easy-query"),s("提供了方便的分组查询功能的支持")],-1),b=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token class-name"},"List"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},">")]),s(" topicGroupTestDTOS "),n("span",{class:"token operator"},"="),s(" easyEntityQuery"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"queryable"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"where"),n("span",{class:"token punctuation"},"("),s("o "),n("span",{class:"token operator"},"->"),s(" o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"id"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"eq"),n("span",{class:"token punctuation"},"("),n("span",{class:"token string"},'"3"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupBy"),n("span",{class:"token punctuation"},"("),s("o "),n("span",{class:"token operator"},"->"),s(),n("span",{class:"token class-name"},"GroupKeys"),n("span",{class:"token punctuation"},"."),n("span",{class:"token constant"},"TABLE1"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"of"),n("span",{class:"token punctuation"},"("),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"id"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token comment"},"//join一张表后那么应该用 GroupKeys.TABLE2.of()"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"select"),n("span",{class:"token punctuation"},"("),s("g"),n("span",{class:"token operator"},"->"),n("span",{class:"token punctuation"},"{"),s(`
                    `),n("span",{class:"token class-name"},"TopicGroupTestDTOProxy"),s(" result "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token keyword"},"new"),s(),n("span",{class:"token class-name"},"TopicGroupTestDTOProxy"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
                    result`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"id"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("g"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"key1"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
                    result`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"idCount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("g"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"intCount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
                    result`),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"idMin"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"set"),n("span",{class:"token punctuation"},"("),s("g"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupTable"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"id"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"min"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`
                    `),n("span",{class:"token keyword"},"return"),s(" result"),n("span",{class:"token punctuation"},";"),s(`
                `),n("span",{class:"token punctuation"},"}"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token comment"},"//.select(TopicGroupTestDTO.class,g -> Select.of("),s(`
                       `),n("span",{class:"token comment"},"//group.key1().as(TopicGroupTestDTO::getId),"),s(`
                       `),n("span",{class:"token comment"},"//group.groupTable().id().intCount().as(TopicGroupTestDTO::getIdCount),"),s(`
                       `),n("span",{class:"token comment"},"//group.groupTable().id().min().as(TopicGroupTestDTO::getIdMin)"),s(`
                `),n("span",{class:"token comment"},"//))"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"toList"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`


`),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Preparing"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"SELECT"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token constant"},"AS"),s(" `id`"),n("span",{class:"token punctuation"},","),n("span",{class:"token function"},"COUNT"),n("span",{class:"token punctuation"},"("),s("t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token constant"},"AS"),s(" `id_count`"),n("span",{class:"token punctuation"},","),n("span",{class:"token function"},"MIN"),n("span",{class:"token punctuation"},"("),s("t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token constant"},"AS"),s(" `id_min` "),n("span",{class:"token constant"},"FROM"),s(" t_topic t "),n("span",{class:"token constant"},"WHERE"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"GROUP"),s(),n("span",{class:"token constant"},"BY"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id`\n"),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Parameters"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"3"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"String"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token operator"},"<="),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Total"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),s(`

`)])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),v=n("div",{class:"language-java line-numbers-mode","data-ext":"java"},[n("pre",{class:"language-java"},[n("code",null,[n("span",{class:"token class-name"},"List"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},">")]),s(" topicGroupTestDTOS "),n("span",{class:"token operator"},"="),s(" easyQuery"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"queryable"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"where"),n("span",{class:"token punctuation"},"("),s("o "),n("span",{class:"token operator"},"->"),s(" o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"eq"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},'"3"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupBy"),n("span",{class:"token punctuation"},"("),s("o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"column"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"select"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},","),s(" o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"columnAs"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"columnCount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getIdCount"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"toList"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`


`),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Preparing"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"SELECT"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token constant"},"AS"),s(" `id`"),n("span",{class:"token punctuation"},","),n("span",{class:"token function"},"COUNT"),n("span",{class:"token punctuation"},"("),s("t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token constant"},"AS"),s(" `id_count` "),n("span",{class:"token constant"},"FROM"),s(" t_topic t "),n("span",{class:"token constant"},"WHERE"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"GROUP"),s(),n("span",{class:"token constant"},"BY"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id`\n"),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Parameters"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"3"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"String"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token operator"},"<="),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Total"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),s(`


`),n("span",{class:"token class-name"},"List"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},">")]),s(" topicGroupTestDTOS "),n("span",{class:"token operator"},"="),s(" easyQuery"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"queryable"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"where"),n("span",{class:"token punctuation"},"("),s("o "),n("span",{class:"token operator"},"->"),s(" o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"eq"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},'"3"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupBy"),n("span",{class:"token punctuation"},"("),s("o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"column"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"select"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},","),s(" o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupKeysAs"),n("span",{class:"token punctuation"},"("),n("span",{class:"token number"},"0"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"columnCount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getIdCount"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"toList"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`


`),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Preparing"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"SELECT"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token constant"},"AS"),s(" `id`"),n("span",{class:"token punctuation"},","),n("span",{class:"token function"},"COUNT"),n("span",{class:"token punctuation"},"("),s("t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token constant"},"AS"),s(" `id_count` "),n("span",{class:"token constant"},"FROM"),s(" t_topic t "),n("span",{class:"token constant"},"WHERE"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"GROUP"),s(),n("span",{class:"token constant"},"BY"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id`\n"),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Parameters"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"3"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"String"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token operator"},"<="),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Total"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),s(`


`),n("span",{class:"token class-name"},"List"),n("span",{class:"token generics"},[n("span",{class:"token punctuation"},"<"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},">")]),s(" topicGroupTestDTOS "),n("span",{class:"token operator"},"="),s(" easyQuery"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"queryable"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"where"),n("span",{class:"token punctuation"},"("),s("o "),n("span",{class:"token operator"},"->"),s(" o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"eq"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),s(),n("span",{class:"token string"},'"3"'),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"groupBy"),n("span",{class:"token punctuation"},"("),s("o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"column"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token comment"},"//将上述查询的columnAs替换为column"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"select"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token punctuation"},"."),n("span",{class:"token keyword"},"class"),n("span",{class:"token punctuation"},","),s(" o"),n("span",{class:"token operator"},"->"),s("o"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"column"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"columnCount"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"Topic"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getId"),n("span",{class:"token punctuation"},","),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getIdCount"),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},")"),s(`
                `),n("span",{class:"token punctuation"},"."),n("span",{class:"token function"},"toList"),n("span",{class:"token punctuation"},"("),n("span",{class:"token punctuation"},")"),n("span",{class:"token punctuation"},";"),s(`


`),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Preparing"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token constant"},"SELECT"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},","),n("span",{class:"token function"},"COUNT"),n("span",{class:"token punctuation"},"("),s("t"),n("span",{class:"token punctuation"},"."),s("`id`"),n("span",{class:"token punctuation"},")"),s(),n("span",{class:"token constant"},"AS"),s(" `idCount` "),n("span",{class:"token constant"},"FROM"),s(" t_topic t "),n("span",{class:"token constant"},"WHERE"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id` "),n("span",{class:"token operator"},"="),s(),n("span",{class:"token operator"},"?"),s(),n("span",{class:"token constant"},"GROUP"),s(),n("span",{class:"token constant"},"BY"),s(" t"),n("span",{class:"token punctuation"},"."),s("`id`\n"),n("span",{class:"token operator"},"=="),n("span",{class:"token operator"},">"),s(),n("span",{class:"token class-name"},"Parameters"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token function"},"3"),n("span",{class:"token punctuation"},"("),n("span",{class:"token class-name"},"String"),n("span",{class:"token punctuation"},")"),s(`
`),n("span",{class:"token operator"},"<="),n("span",{class:"token operator"},"="),s(),n("span",{class:"token class-name"},"Total"),n("span",{class:"token operator"},":"),s(),n("span",{class:"token number"},"1"),s("\n\n\n`select`将表示需要讲表达式进行对应结果映射到`"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),s("`对象上"),n("span",{class:"token punctuation"},","),s("`"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),s("`是一个数据接受对象不具有具体表名"),n("span",{class:"token punctuation"},","),s("\n`select`第二个参数表示需要映射的关系"),n("span",{class:"token punctuation"},","),s("`columnAs`方法和`column`如果两者对象在数据库列上映射是一样的那么可以用`column`也是一样的"),n("span",{class:"token punctuation"},","),s("`columnCount`表示需要对id列进行`count`聚合并且映射到`"),n("span",{class:"token class-name"},"TopicGroupTestDTO"),n("span",{class:"token operator"},"::"),n("span",{class:"token function"},"getIdCount"),s("`\n")])]),n("div",{class:"line-numbers","aria-hidden":"true"},[n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"}),n("div",{class:"line-number"})])],-1),T=k('<p>EntityQuery <code>group</code> 多表2张表及以上,<code>group.groupTable()</code>无法表示为对应的表,需要通过<code>group.groupTable().t1......t10</code>来表示</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">BlogGroupIdAndName</span><span class="token punctuation">&gt;</span></span> list <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">Topic</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">leftJoin</span><span class="token punctuation">(</span><span class="token class-name">BlogEntity</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">,</span> <span class="token punctuation">(</span>t<span class="token punctuation">,</span> b2<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> t<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span>b2<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t<span class="token punctuation">,</span> b2<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                    t<span class="token punctuation">.</span><span class="token function">title</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">isNotNull</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                    t<span class="token punctuation">.</span><span class="token function">createTime</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">le</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2021</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">,</span> <span class="token number">5</span><span class="token punctuation">,</span> <span class="token number">6</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">groupBy</span><span class="token punctuation">(</span><span class="token punctuation">(</span>t1<span class="token punctuation">,</span> b2<span class="token punctuation">)</span> <span class="token operator">-&gt;</span> <span class="token class-name">GroupKeys</span><span class="token punctuation">.</span><span class="token constant">TABLE2</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> b2<span class="token punctuation">.</span><span class="token function">star</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">select</span><span class="token punctuation">(</span>group <span class="token operator">-&gt;</span> <span class="token keyword">new</span> <span class="token class-name">BlogGroupIdAndNameProxy</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>group<span class="token punctuation">.</span><span class="token function">key1</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">idCount</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">set</span><span class="token punctuation">(</span>group<span class="token punctuation">.</span><span class="token function">groupTable</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>t2<span class="token punctuation">.</span><span class="token function">id</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">count</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AS</span> `id`<span class="token punctuation">,</span><span class="token function">COUNT</span><span class="token punctuation">(</span>t1<span class="token punctuation">.</span>`id`<span class="token punctuation">)</span> <span class="token constant">AS</span> `id_count` <span class="token constant">FROM</span> `t_topic` t <span class="token constant">LEFT</span> <span class="token constant">JOIN</span> `t_blog` t1 <span class="token constant">ON</span> t1<span class="token punctuation">.</span>`deleted` <span class="token operator">=</span> <span class="token operator">?</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t<span class="token punctuation">.</span>`title` <span class="token constant">IS</span> <span class="token constant">NOT</span> <span class="token constant">NULL</span> <span class="token constant">AND</span> t<span class="token punctuation">.</span>`create_time` <span class="token operator">&lt;=</span> <span class="token operator">?</span> <span class="token constant">GROUP</span> <span class="token constant">BY</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t1<span class="token punctuation">.</span>`star`\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">(</span><span class="token class-name">Boolean</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token number">2021</span><span class="token operator">-</span><span class="token number">03</span><span class="token operator">-</span><span class="token number">04</span><span class="token constant">T05</span><span class="token operator">:</span><span class="token function">06</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Time</span> <span class="token class-name">Elapsed</span><span class="token operator">:</span> <span class="token function">7</span><span class="token punctuation">(</span>ms<span class="token punctuation">)</span>\n<span class="token operator">&lt;=</span><span class="token operator">=</span> <span class="token class-name">Total</span><span class="token operator">:</span> <span class="token number">0</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',2);function f(g,y){const c=e("CodeTabs");return l(),u("div",null,[d,m,i(c,{id:"6",data:[{id:"对象模式"},{id:"lambda模式"}]},{title0:a(({value:t,isActive:o})=>[s("对象模式")]),title1:a(({value:t,isActive:o})=>[s("lambda模式")]),tab0:a(({value:t,isActive:o})=>[b]),tab1:a(({value:t,isActive:o})=>[v]),_:1}),T])}const G=p(r,[["render",f],["__file","group.html.vue"]]);export{G as default};
