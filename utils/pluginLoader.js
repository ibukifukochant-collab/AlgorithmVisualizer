const fs = require('fs');
const path = require('path');
const container = require('../ioc/container');

class PluginLoader {
  constructor() {
    this.pluginsDir = path.join(__dirname, '../plugins');
    this.plugins = [];
  }

  // 扫描插件目录
  scanPlugins() {
    try {
      const pluginDirs = fs.readdirSync(this.pluginsDir);
      
      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDir, dir);
        const stats = fs.statSync(pluginPath);
        
        if (stats.isDirectory()) {
          const manifestPath = path.join(pluginPath, 'manifest.json');
          
          if (fs.existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
              this.loadPlugin(pluginPath, manifest);
            } catch (error) {
              console.error(`Failed to load plugin ${dir}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to scan plugins:', error.message);
    }
  }

  // 加载单个插件
  loadPlugin(pluginPath, manifest) {
    const plugin = {
      name: manifest.name,
      description: manifest.description,
      version: manifest.version,
      author: manifest.author,
      category: manifest.category,
      thumbnail: manifest.thumbnail || 'default.png',
      path: pluginPath,
      dirName: path.basename(pluginPath), // 保存目录名
      entry: manifest.entry || 'index.html',
      manifest
    };

    // 尝试加载算法实现
    const algorithmPath = path.join(pluginPath, manifest.main || 'algorithm.js');
    if (fs.existsSync(algorithmPath)) {
      try {
        plugin.algorithm = require(algorithmPath);
      } catch (error) {
        console.error(`Failed to load algorithm for plugin ${manifest.name}:`, error.message);
      }
    }

    // 注册插件到IOC容器
    container.registerPlugin(plugin.name, plugin);
    this.plugins.push(plugin);
    console.log(`Plugin loaded: ${plugin.name} (${plugin.version})`);
  }

  // 获取所有插件
  getAllPlugins() {
    return this.plugins;
  }

  // 获取插件信息列表（用于前端展示）
  getPluginInfoList() {
    return this.plugins.map(plugin => ({
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      author: plugin.author,
      category: plugin.category,
      thumbnail: plugin.thumbnail,
      entry: plugin.entry,
      dirName: plugin.dirName
    }));
  }
}

module.exports = new PluginLoader();