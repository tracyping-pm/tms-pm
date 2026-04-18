16falsenonelisttrue
# 一，时间节点

| 第一轮测试完毕

7.5 | 发布UAT | 发布上线 |

# 二，变更日志

| 时间 | 说明 | 变更内容 | 内容链接 | 需关注人 |
| 6.20 | 新增需求 | 增加需求：Vendor-detail 增加summary 切页 | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/625803271/Version+3.2+Official+website#2.7-Vendor-detail---%E5%A2%9E%E5%8A%A0summary-%E5%88%87%E9%A1%B5](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/625803271/Version+3.2+Official+website#2.7-Vendor-detail---%E5%A2%9E%E5%8A%A0summary-%E5%88%87%E9%A1%B5) |  |
| 6.20 |  | 删除已操作运单的判定（更新为： 若运单为已有四种type的shipping record , 认定为已处理过运单，不再进行处理） | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#1.-%E8%BF%90%E5%8D%95%E8%87%AA%E5%8A%A8%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#1.-%E8%BF%90%E5%8D%95%E8%87%AA%E5%8A%A8%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7) |  |
| 6.21 |  | 增加上次结果展示，与增加错误说明 | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#1.-%E8%BF%90%E5%8D%95%E8%87%AA%E5%8A%A8%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#1.-%E8%BF%90%E5%8D%95%E8%87%AA%E5%8A%A8%E5%A4%84%E7%90%86%E5%B7%A5%E5%85%B7) |  |
| 6.25 |  | 增加合同文件预览选择弹出窗 | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#2.6-%E5%8F%96%E6%B6%88Vendor%E5%90%88%E5%90%8C%E6%97%B6%E9%97%B4%E9%99%90%E5%88%B6](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#2.6-%E5%8F%96%E6%B6%88Vendor%E5%90%88%E5%90%8C%E6%97%B6%E9%97%B4%E9%99%90%E5%88%B6) |  |
| 6.25 | 新增需求 | 增加允许终态waybill添加remark | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/625803271/Version+3.2+Official+website#2.8-%E5%85%81%E8%AE%B8%E7%BB%88%E6%80%81waybill%E6%B7%BB%E5%8A%A0remark](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/625803271/Version+3.2+Official+website#2.8-%E5%85%81%E8%AE%B8%E7%BB%88%E6%80%81waybill%E6%B7%BB%E5%8A%A0remark) |  |
| 6.25 | 新增需求 | 电子签签署页面增加下载 | [https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#2.5.1-%E5%A2%9E%E5%8A%A0%E7%AD%BE%E7%BD%B2%E5%AE%8C%E6%88%90%E9%A1%B5%E9%9D%A2%E5%85%81%E8%AE%B8%E4%B8%8B%E8%BD%BD](https://inteluck.atlassian.net/wiki/spaces/CPT/pages/edit-v2/625803271#2.5.1-%E5%A2%9E%E5%8A%A0%E7%AD%BE%E7%BD%B2%E5%AE%8C%E6%88%90%E9%A1%B5%E9%9D%A2%E5%85%81%E8%AE%B8%E4%B8%8B%E8%BD%BD) |  |

# 三，需求说明

## 1. 运单自动处理工具

Tools ---增加【waybill automation】菜单，用于处理Project 【**SHOPEE-Last mile**】中的运单，该项目运营模式非普通运单，为提升处理效率，提供该工具；

点击Start/cancel waybill ，跳转至对应sheet , 每行一个运单号；点击【Sync Data】,即处理所有表中对应waybill，处理过程如下：
1. 逐行验证，验证成功即进行处理，并在Result 列展示Done :
1. 其中 需取消处理的运单，将状态更新为‘canceled , 且cancel 原因为’Cancelled by Client (Without Pay Customer Reason)’
2. 需start处理的运单，需将状态更新为‘In Transit’,且自动加上shipping record,shipping record内容如下：
- Arrival at Origin   时间：position time当日 8:00   地址取空， Note 为“waybill aotomation”
- Loading Completion  时间：position time当日 8:00  地址取空， Note 为“waybill aotomation”
- Arrival at Destination  时间：position time当日 20:00  地址取空， Note 为“waybill aotomation”
- Unloading Completion 时间：position time当日 20:00  地址取空， Note 为“waybill aotomation”
3. 运单处理成功后，对应的sheet 写入也进行正常写入
4. 运单Operation log：cancel /delivery 操作人账号为操作日志中的操作人, 操作时间为时间操作时间
2. 验证失败，根据不同原因展示对应的错误原因

1. waybill 需为指定项目【**SHOPEE-Last mile**】中的运单，否则该行处理失败，提示展示于result列：“The waybill does not belong to the project [SHOPEE-Last mile]”
2. 若运单为已有四种type的shipping record , 认定为已处理过运单，不再进行处理（6.20update  ）
3. 运单应为非终态：状态“planing /pending/in transit ” 否则该行处理失败，提示“The waybill is in final state and cannot be operated.”
4. 运单号未被找到，该行处理失败，提示“Waybill not found.”  6/21update
5. 运单的信息应完整：如 carrier 信息，route 信息 ，billing信息； 任一信息缺失，该行处理失败，提示“XX  information is incomplete ”（cancel 不做该校验）
6. 应展示上次处理结果：错误：【Last processing result:         X pieces of wrong data   2024-10-10 12：00：00】全部成功：【Last processing result:         All successful   2024-10-10 12：00：00】   6/21update
7. 权限补充： 拥有该菜单权限即可进行该页面所有操作权限

## 2. 历史遗留处理

#### 2.1 添加合同更新

将当前仅允许上传一个文件，更新为允许多个（总文件大小控制不超过？M）文件(单次上传一个文件，可以多次上传，上传后自动新增上传按钮)，提示语更新为“Allow pdf, png, jpeg, jpg”

#### 2.2 运单批量导入逻辑更新

- 导入文档增加坐标列【Coordinates】，位置如图，格式参考为：【 30.588700670371164, 104.06729049613102】，   若该行有填写坐标，则优先使用坐标所定位地址进行路线匹配，无法匹配到正确路线提示语同address 匹配不到路线/找不到地址一致；
- 其中允许坐标只填写其中一个

原提示语：
- origin address/destination Address 找不到地址，提示“Unable to find the origin address on the map”
- 所填地址无对应route: ：origin/destination address/waypoint does not match route【备注：地址匹配路线时，为地图所返回区域所匹配到的第一条路线】

#### **2.3 运单时间标准逻辑更新**

Standard waybill submit start时价格版本命中以position time为准，若有Unloading Completion Time之后的记录，则以Unloading Completion Time为准
- 原逻辑：
- 运费因为各种原因发生变更时，需要根据现在所在Waybill不同的时间节点，使用不同的时间来对比有效期
- Positoin Time之前，以Positoin Time为准
- Position Time与Unloading Completion Time之间，以当前时间为主
- Unloading Completion Time之后，以Unloading Completion Time为准

#### 2.4 Plan route 增加提示

当前导入route lib时，会导致plan route失败；增加逻辑：点击plan route时，若在导入route lib, 则message 提示{ Wait please, route planning can be performed after the route library is imported}

#### 2.5 电子签权限更新
- electronic Signature List 数据权限进行分别整理；
- 数据权限：以Initiator、CC、Signer为锚点，通过数据权限来展示各User_Role的签章范围
操作权限：签章中直接关联的参与方可以进行直接的操作（如：Initiator可取消，remind, 当前signer可进行签署操作）。但是非直接参与方（即数据权限透传的可见性）仅能进行查看（View、Download）
- **Remind**,**Cancel** 权限仍仅允许创建人操作

#### 2.5.1 增加签署完成页面允许下载

当电子签状态为 completed 时，展示【Download File】按钮，允许下载已签署文件，该功能权限，只要能看到该页面即允许下载---6.25upadte

#### 2.6 取消Vendor合同时间限制
- 创建供应商价格合同时，删除原不得晚于customer价格合同的有效期末日逻辑； 则customer无价格合同则不填写默认时间即可

原逻辑：

创建Vendor 价格合同时，合同有效期默认填入该项目 Customer 创建时间最新的价格合同的有效期（rejected，expired ，under review 不计算）； 允许修改，但末日不得晚于 创建时间最新的Customer 价格合同（rejected，expired 不计算）的有效期末日

若创建Vendor 价格合同时，还无Customer 价格合同，则保存时提示 ‘A customer contract must exist before a Vendor contract can be created’
- 合同预览，在列表页的预览增加下拉弹框，允许选择需预览的合同文件；需展示原本地文件名称，历史数据无需处理文件名，展示系统所生成文件名即可-6/25update

#### 2.7 Vendor detail - 增加summary 切页

Summary 顺序为首页，在contact之前，edit 页面同Customer detail-Summary ,延用原富文本形式即可；

权限：需单独为此切页设置查看+编辑（增，删，改一起）权限

#### 2.8 允许终态waybill添加remark

允许completed , canceld, abnomal 的waybill 添加 remark，不允许编辑，删除 remark；

## 3. Mongkhon 官网内容

#### 3.1 Front-HomePage
- 导航栏固定展示，其中logo 模块允许点击，点击回到主页，其他导航菜单点击跳转至对应页面，其中Products 展示下拉按钮，展示所有产品类目（产品类目为固定数量及名称）；
- 点击对应社媒icon ,新页面跳转至对应主页（链接待提供）
- Banner 广告由后台进行控制，允许手动滑动+自动滑动（每5S一个），若该广告配置了链接，则点击banner, 从新页面打开链接，若未配置链接，则不支持点击
- 【Get Service】,点击从新页面打开Google Form链接（[https://docs.google.com/forms/d/1hQNfm31G4Lze9ZlTKTDm0NX63zoAarNdAlyv9TOCnzQ/viewform?edit_requested=true](https://docs.google.com/forms/d/1hQNfm31G4Lze9ZlTKTDm0NX63zoAarNdAlyv9TOCnzQ/viewform?edit_requested=true)）
- who we are +Top Brands We Carry+ why choose 模块为固定内容展示
- 页脚展示 Connect : 社媒图标允许点击，并从新页面进行打开，其他仅展示），Navigate:  点击跳转至对应页面，其中 privacy Policy 为弹窗展示隐私政策（内容见链接：[https://docs.google.com/document/d/1ue9-9Ar2wHlsUUZ8FddK1jXOMbxi_JK6yzjEpxU3_QY/edit?usp=sharing](https://docs.google.com/document/d/1ue9-9Ar2wHlsUUZ8FddK1jXOMbxi_JK6yzjEpxU3_QY/edit?usp=sharing) ）；CUSTOMER SERVICE：输入email ,点击提交时应对邮箱地址进行校验；若格式未通过校验，则toast 提示“Please input the correct email address”，若通过校验，则toast 提示 Submission successful, please wait for the staff to contact you, 并将email 信息与提交时间 存入到google sheet （sheet 链接开发同事自行创建）

#### 3.2 Front-Products

产品页面按产品分类展示该类产品内容（产品分类，产品文案，产品图片待提供）

#### 3.3 Front-Services

展示banner广告位，服务介绍，联系按钮，点击apply now ,新页面打开Google form链接：（[https://docs.google.com/forms/d/1hQNfm31G4Lze9ZlTKTDm0NX63zoAarNdAlyv9TOCnzQ/viewform?edit_requested=true](https://docs.google.com/forms/d/1hQNfm31G4Lze9ZlTKTDm0NX63zoAarNdAlyv9TOCnzQ/viewform?edit_requested=true)）

#### 3.4 Front-Articles

按后台设置顺序展示文章列表，每页10条内容，若内容不足10条，则不展示分页器；

内容展示题目+图片+文章开始有效日期（MM-DD HH:MM）；

搜索框允许按照文章内容，标题进行模糊匹配

#### 3.5 Front-About Us

仅作展示（待提供内容）

#### 3.6 Front-Contact Us

地图模块展示：地图形式展示仓库地址；联络信息同页脚展示内容；

留信息模块，按菲律宾电话规则校验电话号码；电话与email可任填写其一，或都进行填写后进行提交，提交时对电话与email格式进行校验，若格式有误，则toast 提示“Please input the correct email address”/ “Please input the correct email address”； 若通过校验，则toast 提示 Submission successful, please wait for the staff to contact you, Email 与电话 任一个信息通过校验，均允许提交；并将通过校验的信息与提交时间 存入到google sheet ；

#### 3.7 Back-Article Mgmt

##### 3.7.1  文章列表

- 筛选条件：Article Title：模糊匹配，默认全部
- Creation time: 默认全部，允许选择时间段(日期级别）
- Creator: 模糊匹配，默认全部
- Status： Published,Draft, All 三个选项
筛选条件：Article Title：模糊匹配，默认全部
- 列表字段：Sequence： 文章展示顺序，Article Title，Status，Creation time，Creator； 操作：允许编辑与删除操作, 草稿状态允许发布操作
- 编辑与删除操作（功能权限需单独配置）：删除需弹窗二次确认 【Do you want to delete this article?】

取消回列表页，确认删除则完成删除；Edit 则进入edit 页（参考新增页）

##### 3.7.2  新增/编辑文章
- Article Title：限制2000字符内
- Article Sequence：正整数，前端/列表排序，数字1为最前排序，允许填写相同数字，若数字相同则按照创建时间倒序；前端不展示草稿状态文章；若为填写数字，则默认为1；
- Header Image: 必填（具体推荐比例待UI提供）

该页面所有操作和本页面一个权限，其中Publish :直接发布， Preview 新页面打开详情页， Save as Draft： 保存为草稿，cancel ：不保存页面内容，退出至文章列表

##### 3.7.3 文章详情

展示文章内容

#### 3.8 Back-Banner Mgmt

##### 3.8.1  banner列表
- 筛选条件：Content Name：模糊匹配，默认全部
- End time: 展示有效期末日，允许选择时间段(日期级别）
- Creator: 模糊匹配，默认全部
- Is it effective： Yes,No, All 三个选项
- 列表字段：ID： 默认生成，YYMMDDXX，XX为顺序码；Banner Image: 展示缩略图，列表中不允许点击，Content Name，Content display time，Is it effective，Creator； 操作：允许编辑与删除操作
- 编辑与删除操作（功能权限需单独配置）：删除需弹窗二次确认 【Do you want to delete this banner?】

取消回列表页，确认删除则完成删除；Edit 则进入edit 页（参考新增页）

##### 3.8.2 新增/编辑  banner
- Content Name：限制2000字符，仅作标记用
- Content display time：内容展示时间，从开始时间开始在前端进行展示，在内容展示时间内为有效，否则为无效不展示在前端
- Banner Image: 进允许上传单张，限制100M之内（具体推荐比例待UI提供）
- Banner Link: 非必填项，该链接为前端Banner点击对应跳转链接，允许站内/站外链接
- Description：不展示在前端，仅作说明

该页面所有操作和本页面一个权限，其中Confirm :保存，cancel ：不保存页面内容，退出至Banner列表