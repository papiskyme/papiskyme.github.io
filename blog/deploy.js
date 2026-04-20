const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// 部署目录
const distDir = path.join(__dirname, 'dist');

// 检查dist目录是否存在
if (!fs.existsSync(distDir)) {
  console.error(chalk.red('错误：dist目录不存在，请先运行 npm run build'));
  process.exit(1);
}

// 检查Git是否初始化
if (!fs.existsSync(path.join(__dirname, '.git'))) {
  console.error(chalk.red('错误：当前目录未初始化Git仓库'));
  console.log(chalk.yellow('请先运行: git init'));
  process.exit(1);
}

// 检查远程仓库
function checkRemote() {
  try {
    const remote = execSync('git remote -v', { encoding: 'utf8' });
    if (!remote.includes('origin')) {
      console.error(chalk.red('错误：未设置远程仓库'));
      console.log(chalk.yellow('请运行: git remote add origin https://github.com/yourusername/yourusername.github.io.git'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('检查远程仓库时出错:', error.message));
    process.exit(1);
  }
}

// 部署函数
function deploy() {
  console.log(chalk.green('开始部署到GitHub Pages...'));
  
  try {
    // 检查远程仓库
    checkRemote();
    
    // 切换到dist目录
    process.chdir(distDir);
    
    // 初始化Git（如果需要）
    if (!fs.existsSync('.git')) {
      execSync('git init', { stdio: 'inherit' });
      execSync('git remote add origin https://github.com/yourusername/yourusername.github.io.git', { stdio: 'inherit' });
    }
    
    // 添加所有文件
    execSync('git add .', { stdio: 'inherit' });
    
    // 提交更改
    const commitMessage = `Deploy ${new Date().toISOString()}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // 推送到GitHub
    execSync('git push -f origin main', { stdio: 'inherit' });
    
    console.log(chalk.green('部署成功！'));
    console.log(chalk.blue('博客地址: https://yourusername.github.io'));
    
  } catch (error) {
    console.error(chalk.red('部署失败:', error.message));
    process.exit(1);
  } finally {
    // 切换回原目录
    process.chdir(__dirname);
  }
}

// 执行部署
deploy();