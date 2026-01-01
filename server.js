const express = require('express');
const path = require('path');
const pluginLoader = require('./utils/pluginLoader');
const container = require('./ioc/container');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 配置插件目录访问
app.use('/plugins', express.static(path.join(__dirname, 'plugins')));

// API路由 - 获取插件列表
app.get('/api/plugins', (req, res) => {
  const plugins = pluginLoader.getPluginInfoList();
  res.json(plugins);
});

// API路由 - 获取单个插件信息
app.get('/api/plugins/:name', (req, res) => {
  const pluginName = req.params.name;
  const plugin = container.getPlugin(pluginName);
  
  if (plugin) {
    res.json({
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      author: plugin.author,
      category: plugin.category,
      thumbnail: plugin.thumbnail
    });
  } else {
    res.status(404).json({ error: 'Plugin not found' });
  }
});

// 首页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 插件页面路由
app.get('/plugin/:name', (req, res) => {
  const pluginName = decodeURIComponent(req.params.name);
  const plugin = container.getPlugin(pluginName);
  
  if (plugin) {
    // 重定向到实际的插件文件路径，这样相对路径就能正确解析
    res.redirect(`/plugins/${plugin.dirName}/${plugin.entry}`);
  } else {
    res.status(404).send('Plugin not found');
  }
});

// 启动服务器
async function startServer() {
  // 扫描并加载插件
  pluginLoader.scanPlugins();
  
  // 初始化插件
  await container.initPlugins();
  
  // 启动插件
  await container.startPlugins();
  
  // 启动HTTP服务器
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Total plugins loaded: ${pluginLoader.getAllPlugins().length}`);
  });
}

// 优雅关闭
process.on('SIGTERM', async () => {
  await container.stopPlugins();
  await container.destroyPlugins();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await container.stopPlugins();
  await container.destroyPlugins();
  process.exit(0);
});

// 启动服务器
startServer();