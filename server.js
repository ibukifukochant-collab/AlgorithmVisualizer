const express = require('express');
const path = require('path');
const fs = require('fs');
const pluginLoader = require('./utils/pluginLoader');
const container = require('./ioc/container');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置 JSON 解析
app.use(express.json());

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

// 编辑器页面路由
app.get('/editor', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editor.html'));
});

// API路由 - 生成插件
app.post('/api/plugins/generate', (req, res) => {
  try {
    const { pluginName, pluginDirName, files } = req.body;
    
    if (!pluginName || !pluginDirName || !files) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pluginDir = path.join(__dirname, 'plugins', pluginDirName);
    
    // 检查插件是否已存在
    if (fs.existsSync(pluginDir)) {
      return res.status(409).json({ error: 'Plugin already exists' });
    }

    // 创建插件目录
    fs.mkdirSync(pluginDir, { recursive: true });

    // 写入所有文件
    Object.entries(files).forEach(([fileName, content]) => {
      const filePath = path.join(pluginDir, fileName);
      fs.writeFileSync(filePath, content, 'utf8');
    });

    // 重新扫描插件
    pluginLoader.scanPlugins();

    res.json({
      success: true,
      message: `Plugin "${pluginName}" generated successfully`,
      path: `/plugins/${pluginDirName}/`
    });
  } catch (error) {
    console.error('Failed to generate plugin:', error);
    res.status(500).json({ error: 'Failed to generate plugin: ' + error.message });
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