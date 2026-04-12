# 1.账号列表

## 1）列表内容

列表需要展示账号的Name，Alias Name，Gamil，Status，Creation Time共5各字段。

按照账号创建时间由近到远进行排序，每页默认10条数据。

## 2）自定义搜索

列表需要支持自定义搜索，包括Name，Alias Name，Gamil，Status。

其中Name，Alias Name，Gamil支持输入后的Like查找。

Status通过下拉框进行枚举值展示和点击选中。

Status状态包括Inactive，Activated，Suspended共3种。

# 2.账号操作

## 1）Create Account

### ①创建

可以创建新的用户账号。

需要以此录入Name，Alias Name，Gamil共3项信息。

上述3项信息均为必填。

### ②校验

点击confirm后进行数据的必填校验，以及邮箱的重复性校验。

如有未填项，则弹窗错误提示“Please complete the information”

如果邮箱不正确（`^[\w\.-]+@[\w\.-]+\.\w+$`），则弹窗错误提示“The entered email address is incorrect”

如果邮箱已经被其他已存在账号使用，则弹窗错误提示“The entered email already exists”

### ③成功

完成之后，需要弹窗展示新账号与密码。

点击复制并关闭，将账号与密码复制到剪切板。

## 2）Reset Password

对已经存在的账号，可以进行重置密码操作。

点击后进行弹窗二次确认，内容“Confirm reset password”

确认后，随机修改改账号的密码，并弹窗展示账号与新密码。

点击复制并关闭，将账号与密码复制到剪切板。

## 3）Suspend/Reactivate

点击Suspend，可以将Activated状态的状态手动置为Suspended

点击Reactivate，可以将Suspended状态的账号手动置为Activated。

处于Inactive状态的账号，不能进行上述操作。

## 4）Delete

可以点击删除选中账号。

需要二次弹窗确认 ，“Confirm to delete the account”

# 3.批量操作

可以批量Suspend，Reactivate，Delete账号。

需要先逐一勾选或全选当前页面的账号.

点击操作时需要二次弹窗确认“Confirm Suspend these accounts”/”Confirm reactivate these accounts”/”Confirm deletion of these accounts“

批量Suspend/Reactivate选中的账号有Inactive时，则不执行操作并弹窗提示”The selected accounts exists as an Inactive account“

# 4.Import Accounts

支持表格文档的批量化导入账号。

点击Import Accounts按钮，通过文件选择弹窗进行选择。

选择按照Name，Alias Name，Gamil三项信息的顺序，逐行进行信息获取。

单个账号的规则需要遵循上述的账号校验逻辑，但不阻塞批量导入工作。

完成导入后，弹窗提示全部识别的，导入成功的，导入失败的账号数。