const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

// 源数据和目标目录
const postsDir = path.join(__dirname, 'data', 'posts');
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');

// 清空并创建目标目录
function setupDistDir() {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(path.join(distDir, 'posts'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'uploads'), { recursive: true });
}

// 复制静态文件
function copyStaticFiles() {
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      if (fs.statSync(srcPath).isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        const subFiles = fs.readdirSync(srcPath);
        subFiles.forEach(subFile => {
          fs.copyFileSync(path.join(srcPath, subFile), path.join(destPath, subFile));
        });
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
  
  // 复制上传的文件
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    files.forEach(file => {
      fs.copyFileSync(path.join(uploadsDir, file), path.join(distDir, 'uploads', file));
    });
  }
}

// 生成文章页面
function generatePosts() {
  const files = fs.readdirSync(postsDir);
  const posts = [];
  
  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(postsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const { data, content: markdown } = matter(content);
      const html = marked(markdown);
      
      const post = {
        id: path.basename(file, '.md'),
        ...data,
        content: html
      };
      
      posts.push(post);
      
      // 生成文章HTML文件
      const postHtml = generatePostHtml(post);
      fs.writeFileSync(path.join(distDir, 'posts', `${post.id}.html`), postHtml);
    }
  });
  
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// 生成文章HTML
function generatePostHtml(post) {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title}</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <h1><a href="/">我的博客</a></h1>
  </header>
  <main>
    <article>
      <h2>${post.title}</h2>
      <p class="post-meta">发布日期: ${post.date}</p>
      <div class="post-content">${post.content}</div>
    </article>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} 我的博客</p>
  </footer>
</body>
</html>
  `;
}

// 生成首页
function generateIndex(posts) {
  const postList = posts.map(post => `
    <article class="post-preview">
      <h3><a href="/posts/${post.id}.html">${post.title}</a></h3>
      <p class="post-meta">${post.date}</p>
      <p>${post.content.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
    </article>
  `).join('');
  
  const indexHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的博客</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <header>
    <h1><a href="/">我的博客</a></h1>
  </header>
  <main>
    ${postList}
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} 我的博客</p>
  </footer>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
}

// 生成RSS feed
function generateRss(posts) {
  const rssItems = posts.map(post => `
    <item>
      <title>${post.title}</title>
      <link>https://yourusername.github.io/posts/${post.id}.html</link>
      <description><![CDATA[${post.content}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://yourusername.github.io/posts/${post.id}.html</guid>
    </item>
  `).join('');
  
  const rssXml = `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>我的博客</title>
  <link>https://yourusername.github.io</link>
  <description>我的个人博客</description>
  ${rssItems}
</channel>
</rss>
  `;
  
  fs.writeFileSync(path.join(distDir, 'rss.xml'), rssXml);
}

// 生成站点地图
function generateSitemap(posts) {
  const urls = posts.map(post => `
    <url>
      <loc>https://yourusername.github.io/posts/${post.id}.html</loc>
      <lastmod>${post.date}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');
  
  const sitemapXml = `
<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourusername.github.io</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>
  `;
  
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml);
}

// 主构建函数
function build() {
  console.log('开始构建静态网站...');
  
  setupDistDir();
  copyStaticFiles();
  const posts = generatePosts();
  generateIndex(posts);
  generateRss(posts);
  generateSitemap(posts);
  
  console.log('构建完成！静态文件已生成到 dist 目录');
}

// 执行构建
build();