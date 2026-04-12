# NutFlux 视频流媒体APP

## 📋 业务与功能

### 1.1 核心目标
> 简要说明该组件/原型的核心定位、解决的问题、用户价值

NutFlux是一个现代化的视频流媒体APP，旨在为用户提供高质量的视频点播和直播服务，通过个性化推荐和社交互动功能，提升用户观看体验和平台粘性。

### 1.2 功能清单
> 列出所有功能模块及其优先级

- **视频播放与浏览**：视频点播（VOD）播放、直播流媒体支持、自适应码率切换（360p-4K）、播放控制（播放/暂停、快进/快退、音量控制）、多语言字幕支持、历史观看记录
- **内容发现与个性化**：分类浏览（按类型、地区、语言等）、搜索功能（支持关键字、标签、创作者）、热门榜单（热门视频、趋势内容）
- **社交与互动功能**：点赞/收藏/分享、评论与回复系统、创作者关注与通知

### 1.3 交互要点
> 关键的交互触发点、反馈机制、状态变化

- 视频播放：点击视频卡片 → 进入播放页面，开始播放视频
- 播放控制：点击播放/暂停按钮 → 切换播放状态；拖动进度条 → 快进/快退；点击音量按钮 → 调节音量
- 字幕切换：点击字幕按钮 → 弹出字幕选择菜单，选择语言
- 搜索功能：点击搜索框 → 输入关键词，显示搜索结果
- 社交互动：点击点赞按钮 → 点赞状态切换；点击评论按钮 → 打开评论区；点击分享按钮 → 弹出分享选项

---

## 📊 内容规划

### 2.1 信息架构
> 模块划分、信息层级、内容组织方式

```
NutFlux
├── 首页
│   ├── 顶部导航栏
│   ├── 推荐内容区
│   ├── 热门榜单
│   └── 分类入口
├── 视频播放页
│   ├── 视频播放器
│   ├── 视频信息
│   ├── 评论区
│   └── 相关推荐
├── 搜索页
│   ├── 搜索框
│   ├── 搜索历史
│   └── 搜索结果
├── 个人中心
│   ├── 历史记录
│   ├── 收藏列表
│   ├── 关注的创作者
│   └── 设置
└── 分类页
    ├── 分类列表
    └── 分类内容
```

### 2.2 数据来源
> 数据源优先级：用户提供数据 > 项目数据表 > 生成示例数据

- **数据类型**：视频列表、用户信息、评论数据
- **数据源**：生成示例数据
- **关键字段**：
  - `video_id`: 视频唯一标识
  - `title`: 视频标题
  - `description`: 视频描述
  - `thumbnail`: 视频缩略图
  - `duration`: 视频时长
  - `views`: 观看次数
  - `likes`: 点赞数
  - `comments`: 评论数
  - `category`: 视频分类
  - `creator`: 创作者信息
  - `stream_url`: 视频流地址
  - `subtitles`: 字幕信息

### 2.3 内容示例
> （可选）重要的示例内容、文案语气、术语规范

- 视频标题：《2024最新科幻大片：星际穿越2》
- 创作者：NutFlux官方
- 描述：一场跨越星际的冒险，探索未知的宇宙奥秘
- 分类：科幻、电影
- 时长：2小时30分钟
- 观看次数：1,234,567
- 点赞数：98,765
- 评论："这部电影太精彩了！特效震撼，剧情紧凑。"

---

## 🎨 布局与结构

### 3.1 整体布局
> 布局模式（单栏/双栏/网格/自由）、模块尺寸、比例约束

- **布局模式**：移动优先的单栏布局，桌面端采用响应式网格布局
- **容器宽度**：移动端适配屏幕宽度，桌面端最大宽度1200px
- **关键尺寸**：
  - 视频卡片：移动端宽度100%，桌面端250px
  - 播放器：宽度100%，高度按16:9比例
  - 导航栏：高度60px
  - 卡片间距：16px

### 3.2 响应式适配
> （如适用）断点、适配策略

- **桌面端（≥1200px）**：网格布局，每行4-5个视频卡片
- **平板端（768-1199px）**：网格布局，每行3-4个视频卡片
- **移动端（<768px）**：单列布局，全屏视频卡片

---

## 🎨 视觉规范

### 4.1 设计规范来源
> 优先级：用户规范 > 主题（DESIGN.md）> 内置（interface-design / frontend-design）

**设计规范来源**：内置 frontend-design

**说明**：设计令牌（Design Tokens）将从上述规范中动态读取，无需在此列出具体值。

### 4.2 自定义设计要点
> （可选）仅在有特殊的自定义设计要求时填写，如特殊色彩、特殊尺寸等

**自定义色彩**（如有）：
- 主色调：#FF6B00 - 用于品牌标识、按钮和重点突出
- 辅助色：#1E90FF - 用于链接和交互元素
- 背景色：#121212 - 深色主题背景
- 文本色：#FFFFFF - 主文本颜色
- 次要文本色：#B0B0B0 - 次要信息文本

**自定义尺寸**（如有）：
- 视频卡片圆角：8px
- 按钮圆角：4px
- 播放器控制栏高度：60px

**其他自定义规范**（如有）：
- 字体：使用无衬线字体，主标题18px，副标题16px，正文14px
- 阴影：使用轻微的阴影效果增强层次感
- 动画：添加平滑的过渡动画提升用户体验

### 4.3 组件状态
> 交互元素的状态定义

- **默认态（default）**：按钮、卡片等元素的初始状态
- **悬停态（hover）**：鼠标悬停时的状态，轻微放大或改变颜色
- **激活态（active）**：点击时的状态，有明显的视觉反馈
- **禁用态（disabled）**：功能不可用时的状态，灰化处理
- **加载态（loading）**：数据加载时的状态，显示加载动画

---

## ⚙️ Axure API 说明
> 如果不使用 Axure API，可删除此部分

### 5.1 事件列表（eventList）
> 组件对外暴露的事件

| 事件名称 | Payload 类型 | 触发时机 | 说明 |
|---------|-------------|---------|------|
| `video_play` | `{video_id: string}` | 视频开始播放时 | 通知父组件视频开始播放 |
| `video_pause` | `{video_id: string}` | 视频暂停时 | 通知父组件视频暂停 |
| `video_end` | `{video_id: string}` | 视频播放结束时 | 通知父组件视频播放结束 |
| `like_video` | `{video_id: string, liked: boolean}` | 视频被点赞/取消点赞时 | 通知父组件视频点赞状态变化 |
| `comment_add` | `{video_id: string, comment: string}` | 新增评论时 | 通知父组件新增评论 |

### 5.2 动作列表（actionList）
> 组件可被调用的动作

| 动作名称 | Params 类型 | 参数说明 | 功能描述 |
|---------|------------|---------|---------|
| `play_video` | `{video_id: string}` | 视频ID | 播放指定视频 |
| `pause_video` | `{video_id: string}` | 视频ID | 暂停指定视频 |
| `seek_video` | `{video_id: string, time: number}` | 视频ID和时间点 | 跳转到视频指定时间点 |
| `set_volume` | `{video_id: string, volume: number}` | 视频ID和音量值(0-100) | 设置视频音量 |
| `toggle_subtitle` | `{video_id: string, subtitle_id: string}` | 视频ID和字幕ID | 切换视频字幕 |

### 5.3 变量列表（varList）
> 组件内部状态变量

| 变量名称 | 类型 | 默认值 | 说明 |
|---------|-----|-------|------|
| `current_video` | `object` | `null` | 当前播放的视频信息 |
| `is_playing` | `boolean` | `false` | 视频是否正在播放 |
| `current_time` | `number` | `0` | 当前播放时间（秒） |
| `volume` | `number` | `80` | 当前音量（0-100） |
| `selected_subtitle` | `string` | `null` | 当前选中的字幕ID |
| `is_fullscreen` | `boolean` | `false` | 是否全屏模式 |
| `search_query` | `string` | `""` | 搜索关键词 |
| `selected_category` | `string` | `"all"` | 当前选中的分类 |

### 5.4 配置项列表（configList）
> 组件配置项

| 配置项名称 | 类型 | 默认值 | 说明 |
|----------|-----|-------|------|
| `theme` | `string` | `"dark"` | 主题模式（dark/light） |
| `auto_play` | `boolean` | `true` | 是否自动播放视频 |
| `default_quality` | `string` | `"720p"` | 默认视频质量 |
| `show_subtitles` | `boolean` | `true` | 是否显示字幕 |
| `enable_notifications` | `boolean` | `true` | 是否启用通知 |

### 5.5 数据项列表（dataList）
> 组件数据结构定义

**视频数据结构**：
```typescript
{
  video_id: string;      // 视频唯一标识
  title: string;         // 视频标题
  description: string;   // 视频描述
  thumbnail: string;     // 视频缩略图URL
  duration: number;      // 视频时长（秒）
  views: number;         // 观看次数
  likes: number;         // 点赞数
  comments: number;      // 评论数
  category: string;      // 视频分类
  creator: {
    id: string;          // 创作者ID
    name: string;        // 创作者名称
    avatar: string;      // 创作者头像
    is_followed: boolean; // 是否已关注
  };
  stream_url: string;    // 视频流地址
  qualities: string[];   // 支持的视频质量
  subtitles: {
    id: string;          // 字幕ID
    language: string;    // 字幕语言
    url: string;         // 字幕文件URL
  }[];
  is_liked: boolean;     // 当前用户是否已点赞
  is_favorited: boolean; // 当前用户是否已收藏
}
```

**用户数据结构**：
```typescript
{
  user_id: string;       // 用户ID
  name: string;          // 用户名
  avatar: string;        // 用户头像
  watch_history: string[]; // 观看历史视频ID列表
  favorites: string[];   // 收藏视频ID列表
  following: string[];   // 关注的创作者ID列表
  notifications: {
    id: string;          // 通知ID
    type: string;        // 通知类型
    content: string;     // 通知内容
    timestamp: number;   // 通知时间戳
    is_read: boolean;    // 是否已读
  }[];
}
```