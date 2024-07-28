import{_ as n}from"./plugin-vue_export-helper-c27b6911.js";import{o as s,c as a,e as t}from"./app-f7873849.js";const p={},o=t('<p><code>easy-query</code>在<code>1.10.3^</code>版本后支持了联级删选,并不仅仅支持结果查询,譬如</p><ul><li>一对一：班级和老师支持查询筛选班级表条件是老师名称叫王老师的班级集合</li><li>一对多:班级和学生支持查询筛选班级表条件是存在某个学生叫小明的班级集合</li></ul><h2 id="联级查询" tabindex="-1"><a class="header-anchor" href="#联级查询" aria-hidden="true">#</a> 联级查询</h2><p>筛选所有班级里面存在学生名称包含小明的班级</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> hasXiaoMingClass <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                    <span class="token comment">//班级和学生是一对多,所以就是筛选学生里面存在名称叫做小明的</span>\n                    <span class="token comment">//如果要查询学生里面没有小明的就用`none`方法</span>\n                    s<span class="token punctuation">.</span><span class="token function">schoolStudents</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;小明&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                    <span class="token comment">//下面的写法也可以也可以用多个where来支持</span>\n                    <span class="token comment">// s.schoolStudents().where(x -&gt; {</span>\n                    <span class="token comment">//     x.name().like(&quot;小明&quot;);</span>\n                    <span class="token comment">//     x.classId().like(&quot;123&quot;);</span>\n                    <span class="token comment">// }).any();</span>\n                <span class="token punctuation">}</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_class` t <span class="token class-name">WHERE</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `school_student` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`name` <span class="token constant">LIKE</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token operator">%</span>小明<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>筛选学生表,条件为学生所在班级的班级名称包含<code>一班</code>字样的比如<code>一班</code>、<code>十一班</code></p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>\n            <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolStudent</span><span class="token punctuation">&gt;</span></span> hasXiaoMingClass <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolStudent</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n<span class="token comment">//                    .include(x-&gt;x.schoolClass()) //如果您需要把学生所在的班级信息也带出来</span>\n                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolClass</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;一班&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`class_id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_student` t <span class="token constant">LEFT</span> <span class="token constant">JOIN</span> `school_class` t1 <span class="token constant">ON</span> t<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`name` <span class="token constant">LIKE</span> <span class="token operator">?</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token operator">%</span>一班<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>筛选班级里面学生家在<code>xx路</code>的班级</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> studentAddressInXXRoadClasses <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolStudents</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span>\n                        x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">schoolStudentAddress</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">address</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;xx路&quot;</span><span class="token punctuation">)</span>\n                <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_class` t <span class="token class-name">WHERE</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `school_student` t1 <span class="token constant">LEFT</span> <span class="token constant">JOIN</span> `school_student_address` t2 <span class="token constant">ON</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t2<span class="token punctuation">.</span>`student_id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AND</span> t2<span class="token punctuation">.</span>`address` <span class="token constant">LIKE</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token operator">%</span>xx路<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>筛选班级里面学生家在<code>xx路</code>,学生名称叫<code>小明</code>的班级</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>   <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> studentAddressInXXRoadClasses <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolStudents</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span>\n                        x <span class="token operator">-&gt;</span> <span class="token punctuation">{</span>\n                            x<span class="token punctuation">.</span><span class="token function">schoolStudentAddress</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">address</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;xx路&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                            x<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;小明&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n                        <span class="token punctuation">}</span>\n                <span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n<span class="token comment">//下面的写法也可以</span>\n\n\n    <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> studentAddressInXXRoadClasses <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n            <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolStudents</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>x<span class="token operator">-&gt;</span>x<span class="token punctuation">.</span><span class="token function">schoolStudentAddress</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">address</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;xx路&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                    <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>x<span class="token operator">-&gt;</span>x<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;小明&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n            <span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_class` t <span class="token class-name">WHERE</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `school_student` t1 <span class="token constant">LEFT</span> <span class="token constant">JOIN</span> `school_student_address` t2 <span class="token constant">ON</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t2<span class="token punctuation">.</span>`student_id` <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AND</span> t2<span class="token punctuation">.</span>`address` <span class="token constant">LIKE</span> <span class="token operator">?</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`name` <span class="token constant">LIKE</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token operator">%</span>xx路<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token operator">%</span>小明<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>\n\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>筛选多对多联级查询</p><p>一个班级有多个老师,一个老师也可以交多个班级,老师和班级多对多通过<code>SchoolClassTeacher</code>表进行关联</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code>       <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> x1 <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolTeachers</span><span class="token punctuation">(</span><span class="token punctuation">)</span>\n                        <span class="token punctuation">.</span><span class="token function">any</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">like</span><span class="token punctuation">(</span><span class="token string">&quot;x&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_class` t <span class="token class-name">WHERE</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `school_teacher` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token class-name">AND</span> <span class="token constant">EXISTS</span> <span class="token punctuation">(</span><span class="token constant">SELECT</span> <span class="token number">1</span> <span class="token constant">FROM</span> `school_class_teacher` t2 <span class="token constant">WHERE</span> t2<span class="token punctuation">.</span>`teacher_id` <span class="token operator">=</span> t1<span class="token punctuation">.</span>`id` <span class="token constant">AND</span> t2<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token class-name">LIMIT</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`name` <span class="token constant">LIKE</span> <span class="token operator">?</span> <span class="token class-name">LIMIT</span> <span class="token number">1</span><span class="token punctuation">)</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> <span class="token operator">%</span>x<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span>                  \n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>筛选班级里面学生姓<code>张</code>的有5人的班级</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code> <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">SchoolClass</span><span class="token punctuation">&gt;</span></span> nameStartZhang <span class="token operator">=</span> easyEntityQuery<span class="token punctuation">.</span><span class="token function">queryable</span><span class="token punctuation">(</span><span class="token class-name">SchoolClass</span><span class="token punctuation">.</span><span class="token keyword">class</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>s <span class="token operator">-&gt;</span> s<span class="token punctuation">.</span><span class="token function">schoolStudents</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">where</span><span class="token punctuation">(</span>x <span class="token operator">-&gt;</span> x<span class="token punctuation">.</span><span class="token function">name</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">likeMatchLeft</span><span class="token punctuation">(</span><span class="token string">&quot;张&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">count</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">eq</span><span class="token punctuation">(</span><span class="token number">5L</span><span class="token punctuation">)</span><span class="token punctuation">)</span>\n                <span class="token punctuation">.</span><span class="token function">toList</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>\n\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Preparing</span><span class="token operator">:</span> <span class="token constant">SELECT</span> t<span class="token punctuation">.</span>`id`<span class="token punctuation">,</span>t<span class="token punctuation">.</span>`name` <span class="token constant">FROM</span> `school_class` t <span class="token constant">WHERE</span> <span class="token punctuation">(</span><span class="token class-name">SELECT</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token constant">FROM</span> `school_student` t1 <span class="token constant">WHERE</span> t1<span class="token punctuation">.</span>`class_id` <span class="token operator">=</span> t<span class="token punctuation">.</span>`id` <span class="token constant">AND</span> t1<span class="token punctuation">.</span>`name` <span class="token constant">LIKE</span> <span class="token operator">?</span><span class="token punctuation">)</span> <span class="token operator">=</span> <span class="token operator">?</span>\n<span class="token operator">==</span><span class="token operator">&gt;</span> <span class="token class-name">Parameters</span><span class="token operator">:</span> 张<span class="token operator">%</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token function">5</span><span class="token punctuation">(</span><span class="token class-name">Long</span><span class="token punctuation">)</span>\n</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>',16),c=[o];function e(l,u){return s(),a("div",null,c)}const r=n(p,[["render",e],["__file","relation-filter.html.vue"]]);export{r as default};