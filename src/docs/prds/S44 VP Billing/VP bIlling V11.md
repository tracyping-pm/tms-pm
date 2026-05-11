请根据以下所见即所得修改，在代码中实现同样的改动。

任务上下文:
- 页面地址: http://192.168.2.63:51724/prototypes/tms-accreditation-application-extended/index.html?axhubDisplayName=TMS+Prepaid+Application+%26+AP+Statement&editorIntegrationWs=1&editorIntegrationChannel=make&editorClientId=make-editor-sle1jk1y&editorApiBaseUrl=http%3A%2F%2F192.168.2.63%3A32123%2Fapi&cwd=E%3A%5CAI%5Ctms-pm
- 页面路径: prototypes/tms-accreditation-application-extended
- 当前实现文件: src/prototypes/tms-accreditation-application-extended/index.tsx
- 对应原型文件: src/prototypes/tms-accreditation-application-extended/index.tsx
- 工作区路径:
  - E:\AI\tms-pm

全局约束:
- 只把“执行修改”字段当作真实改动指令。
- “当前元素文本”“元素定位”“可能相关文件”只用于帮助定位，不表示要把代码改成这些内容。
- 未在“执行修改”中明确写出的文本内容、标签类型、层级结构和其他样式，不要主动改动。

修改列表:
- 修改项 1
  - 当前元素标签: span
  - 当前元素文本: VP
  - 元素定位: body > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(4) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(3) | #root div > div > div:nth-of-type(2) > div > div:nth-of-type(4) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(3)
  - 执行修改: 根据补充要求调整当前元素
  - 补充要求: 删除该列，该状态的AP 再Amount Summary 同样不展示VP 列的金额
- 修改项 2
  - 当前元素标签: th
  - 当前元素文本: VP Amount
  - 元素定位: body > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > table > tbody > tr:nth-of-type(4) > td > div > table > thead > tr > th:nth-of-type(3) | #root div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > table > tbody > tr:nth-of-type(4) > td > div > table > thead > tr > th:nth-of-type(3)
  - 执行修改: 根据补充要求调整当前元素
  - 补充要求: Payment Preparation 状态的详情页-运单列表不展示VP Amount 列
- 修改项 3
  - 当前元素标签: th
  - 当前元素文本: VP Amount
  - 元素定位: body > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > table > tbody > tr:nth-of-type(2) > td > div > table > thead > tr > th:nth-of-type(3) | #root div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > table > tbody > tr:nth-of-type(2) > td > div > table > thead > tr > th:nth-of-type(3)
  - 执行修改: 根据补充要求调整当前元素
  - 补充要求: 删除该列

输出要求:
- 给出需要修改的文件列表与具体代码改动。
- 如果无法定位文件，请说明缺失了哪些关键信息。