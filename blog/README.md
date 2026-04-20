# 本地博客管理系统

一个支持动态编辑和静态部署的本地博客管理系统，类似WordPress的后台管理界面，可生成纯静态网站用于部署到GitHub Pages等静态托管服务。

## 功能特性

- 📝 本地动态管理后台，支持富文本编辑
- 📷 图片上传功能
- 📹 支持嵌入优酷等外部视频
- 🔄 一键生成静态网站
- 🚀 自动部署到GitHub Pages

## 技术栈

- **后端**：Node.js + Express.js
- **前端**：HTML + CSS + JavaScript
- **模板引擎**：EJS
- **静态生成**：自定义构建脚本
- **数据存储**：本地Markdown文件

## 快速开始

### 1. 初始化项目

```bash
# 进入项目目录
cd blog

# 安装依赖
npm install
```

### 2. 启动本地服务器

```bash
# 启动开发服务器
npm start
```

服务器将在 http://localhost:3000 启动，管理后台地址为 http://localhost:3000/admin

### 3. 管理博客

1. 访问管理后台：http://localhost:3000/admin
2. 点击"新建文章"按钮创建新博客
3. 使用编辑器编写内容，支持Markdown语法
4. 可以插入图片和嵌入视频（支持优酷等）
5. 保存文章后可以预览效果

### 4. 生成静态网站

```bash
# 生成静态网站文件
npm run build
```

静态文件将生成到 `dist` 目录。

### 5. 部署到GitHub Pages

```bash
# 部署到GitHub Pages
npm run deploy
```

## 目录结构

```
blog/
├── data/            # 博客数据（Markdown文件）
│   └── posts/       # 文章存储目录
├── public/          # 静态资源文件
│   └── style.css    # 网站样式
├── uploads/         # 上传的图片
├── views/           # 视图文件
│   ├── admin.ejs    # 管理后台
│   ├── edit.ejs     # 文章编辑页面
│   ├── index.ejs    # 首页
│   └── preview.ejs  # 文章预览页面
├── build.js         # 静态网站生成脚本
├── deploy.js        # 部署脚本
├── package.json     # 项目配置
├── server.js        # 本地服务器
└── README.md        # 项目说明
```

## 使用说明

### 文章编辑

- **标题**：文章的标题
- **日期**：文章的发布日期，默认为当前日期
- **内容**：支持Markdown语法，可使用工具栏按钮快速插入格式

### 视频嵌入

1. 点击编辑器工具栏中的"视频"按钮
2. 输入视频链接（支持优酷等）
3. 点击"插入视频"按钮，系统会自动生成嵌入代码

### 图片上传

1. 点击编辑器工具栏中的"上传图片"按钮
2. 选择本地图片文件
3. 图片会自动上传并插入到文章中

## 部署配置

### GitHub Pages 配置

1. 在GitHub上创建一个名为 `yourusername.github.io` 的仓库
2. 修改 `deploy.js` 文件中的远程仓库地址：

```javascript
// 将以下地址替换为你的GitHub仓库地址
execSync('git remote add origin https://github.com/yourusername/yourusername.github.io.git', { stdio: 'inherit' });
```

3. 修改 `build.js` 文件中的网站地址：

```javascript
// 将以下地址替换为你的GitHub Pages地址
<link>https://yourusername.github.io/posts/${post.id}.html</link>
```

## 注意事项

- 本地服务器仅用于开发和管理，生成的静态文件才是最终部署的内容
- 定期备份 `data` 目录中的文章数据
- 首次部署时需要在GitHub仓库中设置GitHub Pages源为 `main` 分支

## 扩展功能

- 可添加主题切换功能
- 可集成评论系统（如Disqus）
- 可添加访问统计功能
- 可扩展更多Markdown语法支持

## 许可证

MIT License