// 主页面JavaScript
class AlgorithmVisualizer {
    constructor() {
        this.plugins = [];
        this.filteredPlugins = [];
        this.currentCategory = 'all';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        // 加载插件列表
        await this.loadPlugins();
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 渲染插件
        this.renderPlugins();
    }

    // 加载插件列表
    async loadPlugins() {
        const pluginsGrid = document.getElementById('pluginsGrid');
        pluginsGrid.innerHTML = '<div class="loading">正在加载算法...</div>';
        
        try {
            const response = await fetch('/api/plugins');
            this.plugins = await response.json();
            this.filteredPlugins = [...this.plugins];
        } catch (error) {
            console.error('Failed to load plugins:', error);
            pluginsGrid.innerHTML = '<div class="empty-state"><h3>加载失败</h3><p>无法加载算法列表，请稍后重试</p></div>';
            return;
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchBtn.addEventListener('click', () => {
            this.currentSearch = searchInput.value.trim();
            this.filterPlugins();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.currentSearch = searchInput.value.trim();
                this.filterPlugins();
            }
        });
        
        // 分类筛选
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.filterPlugins();
        });
        
        // 动态生成分类选项
        this.generateCategoryOptions();
    }

    // 生成分类选项
    generateCategoryOptions() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(this.plugins.map(plugin => plugin.category))];
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 筛选插件
    filterPlugins() {
        this.filteredPlugins = this.plugins.filter(plugin => {
            // 分类筛选
            const categoryMatch = this.currentCategory === 'all' || plugin.category === this.currentCategory;
            
            // 搜索筛选
            const searchMatch = !this.currentSearch || 
                plugin.name.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                plugin.description.toLowerCase().includes(this.currentSearch.toLowerCase());
            
            return categoryMatch && searchMatch;
        });
        
        this.renderPlugins();
    }

    // 渲染插件列表
    renderPlugins() {
        const pluginsGrid = document.getElementById('pluginsGrid');
        
        if (this.filteredPlugins.length === 0) {
            pluginsGrid.innerHTML = '<div class="empty-state"><h3>未找到算法</h3><p>请尝试调整搜索条件或分类</p></div>';
            return;
        }
        
        pluginsGrid.innerHTML = this.filteredPlugins.map(plugin => `
            <div class="plugin-card" onclick="visualizer.openPlugin('${plugin.name}')">
                <div class="plugin-thumbnail">
                    ${plugin.thumbnail !== 'default.png' ? `<img src="/plugins/${plugin.dirName}/${plugin.thumbnail}" alt="${plugin.name}">` : '<span>🔍</span>'}
                </div>
                <h3>${plugin.name}</h3>
                <p>${plugin.description}</p>
                <div class="plugin-meta">
                    <span class="plugin-author">${plugin.author}</span>
                    <span class="plugin-category">${plugin.category}</span>
                </div>
                <button class="plugin-btn" onclick="event.stopPropagation(); visualizer.openPlugin('${plugin.name}')">
                    开始可视化
                </button>
            </div>
        `).join('');
    }

    // 打开插件
    openPlugin(pluginName) {
        window.location.href = `/plugin/${encodeURIComponent(pluginName)}`;
    }
}

// 初始化应用
const visualizer = new AlgorithmVisualizer();