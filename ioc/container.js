class Container {
  constructor() {
    this.services = new Map();
    this.instances = new Map();
    this.plugins = new Map();
  }

  // 注册服务
  register(name, factory, dependencies = []) {
    this.services.set(name, { factory, dependencies });
  }

  // 解析服务
  resolve(name) {
    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    const resolvedDependencies = service.dependencies.map(dep => this.resolve(dep));
    const instance = service.factory(...resolvedDependencies);
    this.instances.set(name, instance);
    return instance;
  }

  // 注册插件
  registerPlugin(pluginName, pluginInstance) {
    this.plugins.set(pluginName, pluginInstance);
  }

  // 获取插件
  getPlugin(pluginName) {
    return this.plugins.get(pluginName);
  }

  // 获取所有插件
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  // 初始化插件
  async initPlugins() {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.init) {
        await plugin.init();
      }
    }
  }

  // 启动插件
  async startPlugins() {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.start) {
        await plugin.start();
      }
    }
  }

  // 停止插件
  async stopPlugins() {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.stop) {
        await plugin.stop();
      }
    }
  }

  // 销毁插件
  async destroyPlugins() {
    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.destroy) {
        await plugin.destroy();
      }
    }
    this.plugins.clear();
  }
}

module.exports = new Container();