const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const app = express();
const port = 3000;

// 配置静态文件
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 配置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 配置body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

// 数据存储路径
const postsDir = path.join(__dirname, 'data', 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}

// 首页路由
app.get('/', (req, res) => {
  res.render('index');
});

// 后台管理路由
app.get('/admin', (req, res) => {
  const posts = getPosts();
  res.render('admin', { posts });
});

// 获取所有文章
function getPosts() {
  const files = fs.readdirSync(postsDir);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdown } = matter(content);
      return {
        id: path.basename(file, '.md'),
        ...data,
        content: markdown
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 新建文章路由
app.get('/admin/new', (req, res) => {
  res.render('edit', { post: null });
});

// 编辑文章路由
app.get('/admin/edit/:id', (req, res) => {
  const id = req.params.id;
  const post = getPostById(id);
  if (post) {
    res.render('edit', { post });
  } else {
    res.redirect('/admin');
  }
});

// 获取单个文章
function getPostById(id) {
  const filePath = path.join(postsDir, `${id}.md`);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: markdown } = matter(content);
    return {
      id,
      ...data,
      content: markdown
    };
  }
  return null;
}

// 保存文章路由
app.post('/admin/save', (req, res) => {
  const { id, title, date, content } = req.body;
  const postData = {
    title,
    date: date || new Date().toISOString().split('T')[0]
  };
  
  const markdown = matter.stringify(content, postData);
  const postId = id || Date.now().toString();
  const filePath = path.join(postsDir, `${postId}.md`);
  
  fs.writeFileSync(filePath, markdown);
  res.redirect('/admin');
});

// 删除文章路由
app.post('/admin/delete/:id', (req, res) => {
  const id = req.params.id;
  const filePath = path.join(postsDir, `${id}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  res.redirect('/admin');
});

// 上传图片路由
app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: `/uploads/${req.file.filename}` });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// 预览文章路由
app.get('/preview/:id', (req, res) => {
  const id = req.params.id;
  const post = getPostById(id);
  if (post) {
    res.render('preview', { post });
  } else {
    res.redirect('/admin');
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Blog manager running at http://localhost:${port}`);
  console.log(`Admin panel: http://localhost:${port}/admin`);
});