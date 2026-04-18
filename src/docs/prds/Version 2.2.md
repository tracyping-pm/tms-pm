本模板由 Atlassian 的项目和事务跟踪器 Jira 为您提供。您可以利用团队在每次冲刺中使用的信息和资源来自定义此模板，以节省准备时间。
---
32pipe
---

## 1.本次优化功能
1. 配合CP端，User Mgmt增加客户账号管理
2. 各Transfer功能增加搜索框
3. 更新list 选中模式
4. 更新customer detail
5. 导出waybill增加字段
6. route lib增加模糊搜索

## 2.详述

### 2.1 User Mgmt增加Customer Account
- 同一个客户允许添加1个账号（同Vendor)，创建账号参考vendor account, 填写Email及customer name(均为必填），customer name允许模糊搜索
- customer Account list_搜索:允许通过customer name , customer tag , Email，status进行筛选；其中customer name , customer tag, Email 允许模糊搜索;
- 列表字段参考Vendor Account list, 展示customer name , customer tag , Email，status及creation time ; 其中状态值为：inactive，activated及suspended；
- 其中重置密码，删除，及停用操作均与Vendor Account保持一致

### 2.2 Transfer功能增加搜索框
- 涉及：Driver，Vendor,Customer 的transfer 弹窗

均增加相应搜索条件，like搜索，在列表中搜索项

### 2.3 新增list 选中项目展示
- 页头展示被选中项目数量及被选中项目的position time
- 若position time 为同一天，则文案为： 1 waybill is selected, position time 2024-01-01

### 2.4 更新customer detail
1. 基础信息
1. create customer及edit customer弹窗，及customer detail页均增加以下字段(均为非必填）
- 增加customer logo展示（尺寸参考UI设计，格式支持png,jpg,jpeg，svg），detail页面若未上传logo，则展示为空（需UI设计LOGO缺省样式）
- 增加contact Type 字段（选项：Lock In、On Call - Stable volume、On Call — On demand volume）
- 增加Current Market Share：填写0-100的整数，允许只填写一个数字
- detail页面增加 service duration字段（计算该客户所有项目合同的最早开始时间截止当日天数（每日凌晨刷新），project service duration 则取该客户所有项目合同最早开始时间与最晚结束时间的天数，当有添加/删除合同则需重新计算）,已取消project中的合同不参与时长计算；当有项目被取消，则合同时间需重新计算
- 【历史数据处理】：当前计算客户服务时长/合同服务时长仅计算有填写合同起止时间的时长，若需计算历史合同的时长，需业务方补齐历史合同的起止时间

1. detail 切页增加contract 切页

该切页展示该客户所有project下所有上传的contract，按添加合同时间排序，越晚添加越靠前；展示合同名称及文件，合同名称允许在本页面进行修改；文件允许预览及下载（若为无法支持预览的格式则不展示预览按钮）,展示合同来源project name.
1. Projects--detail--Business Documents切页中 contract 内容更新
- 配合customer detail 的contract变化，project增加 contract 切页
- 添加合同时，增加添加合同起止时间及合同名称，其中Contract Start and End Time为必填，通过时间段选择器进行选择；合同文件必填；
- Contract Name为非必填，仅支持字母/空格，不支持特殊字符，最大500字符；与customer 中合同名称若更改则一起变化
- 该切页权限：与该project保持一致

1. 原perception切页更新为【summary】

a. 名称改为Summary

b.添加时，summary为富文本形式编辑框；支持使用不同的字体，字号，文本颜色，及背景色，删除线下划线等；允许插入超链接，插入/编辑表格项目符号等，暂无需支持音视频；编辑内容无字数等限制

c. 附件与系统当前附件上传支持内容一直，附件数量不做限制，大小暂定5M

d. 时间取添加/编辑时间，允许编辑/删除（同原perception）

1. 更新follow up records 切页展示形式

a. 默认不展示系统所添加内容，点击【View All】展示所有记录

b. 展示所有内容时，点击【Don’t view system records】,则收起系统记录

c. 增加记录添加人头像，name 展示，删除【Description】标题，直接展示所添加内容

### 2.5 导出waybill 列表增加字段

增加Dispatch Type：standard dispatch，temporary dispatch； 放在当前waybill link列后

### 2.6 Project Mgmt--Route Lib-- lib detail 中waypoint允许使用like搜索形式