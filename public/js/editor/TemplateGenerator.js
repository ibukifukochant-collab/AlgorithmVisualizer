export default class TemplateGenerator {
    constructor() {
        this.templates = {
            manifest: this.generateManifest.bind(this),
            index: this.generateIndex.bind(this),
            algorithm: this.generateAlgorithm.bind(this),
            visualization: this.generateVisualization.bind(this),
            style: this.generateStyle.bind(this),
            config: this.generateConfig.bind(this),
            pluginScript: this.generatePluginScript.bind(this)
        };
    }

    generate(components, options) {
        const pluginName = options.name || 'MyAlgorithm';
        const pluginDirName = this.toDirName(pluginName);

        const files = {
            'manifest.json': this.templates.manifest(pluginName, options),
            'index.html': this.templates.index(pluginName),
            'algorithm.js': this.templates.algorithm(components, pluginName),
            'visualization.js': this.templates.visualization(components, pluginName),
            'style.css': this.templates.style(),
            'config.json': this.templates.config(pluginName, options),
            'plugin-script.js': this.templates.pluginScript(components, pluginName)
        };

        return {
            pluginName,
            pluginDirName,
            files
        };
    }

    toDirName(name) {
        return name.replace(/[^a-zA-Z0-9]/g, '');
    }

    toValidVarName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^([0-9])/, '_$1');
    }

    generateManifest(name, options) {
        const manifest = {
            name: name,
            description: options.description || `${name} 算法可视化`,
            version: '1.0.0',
            author: options.author || 'Algorithm Visualizer',
            category: options.category || 'Algorithm',
            thumbnail: `${this.toDirName(name).toLowerCase()}.png`,
            main: 'algorithm.js',
            visualization: 'visualization.js',
            style: 'style.css',
            entry: 'index.html'
        };
        return JSON.stringify(manifest, null, 2);
    }

    generateIndex(pluginName) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="pageTitle">${pluginName}</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
    <link rel="stylesheet" href="/css/transition.css">
    <link rel="stylesheet" href="/css/plugin.css">
    <link rel="stylesheet" href="./style.css">
</head>
<body>
    <div class="container plugin-page">
        <a href="/" class="back-btn">← 返回首页</a>

        <header class="header">
            <h1 id="pluginTitle"></h1>
            <p id="pluginDescription"></p>
        </header>

        <main class="main">
            <section class="input-section" id="inputSection">
            </section>

            <section class="canvas-section">
                <canvas id="visualizationCanvas"></canvas>
            </section>

            <section class="controls-section">
                <div class="controls-group">
                    <button id="prevBtn" class="control-btn">上一步</button>
                    <button id="playPauseBtn" class="control-btn primary">播放</button>
                    <button id="nextBtn" class="control-btn">下一步</button>
                    <button id="resetBtn" class="control-btn">重置</button>
                </div>
                <div class="speed-control">
                    <label for="speedSlider">动画速度：</label>
                    <input type="range" id="speedSlider" min="100" max="2000" value="500" step="100">
                    <span id="speedValue">500ms</span>
                </div>
            </section>

            <section class="info-section">
                <div class="info-group">
                    <h3>算法说明</h3>
                    <div class="algorithm-info">
                        <div class="complexity">
                            <span class="label">时间复杂度：</span>
                            <span class="value" id="timeComplexity"></span>
                        </div>
                        <div class="complexity">
                            <span class="label">空间复杂度：</span>
                            <span class="value" id="spaceComplexity"></span>
                        </div>
                    </div>
                    <div class="algorithm-steps" id="algorithmSteps">
                    </div>
                </div>
            </section>
        </main>
    </div>

    <footer class="footer plugin-page">
        <div class="container">
            <p>&copy; 2024 Algorithm Visualizer. All rights reserved.</p>
        </div>
    </footer>

    <script src="/js/transition.js"></script>
    <script src="/js/plugin.js"></script>
    <script type="module" src="./plugin-script.js"></script>
</body>
</html>`;
    }

    generateAlgorithm(components, pluginName) {
        const componentInits = components.map(c => {
            const varName = this.toValidVarName(c.name);
            return `        this.${varName} = [${c.data.join(', ')}];`;
        }).join('\n');

        const componentMethods = components.map(c => {
            const varName = this.toValidVarName(c.name);
            return `
    // 获取 ${c.name} 数据
    get${this.capitalize(varName)}() {
        return this.${varName};
    }

    // 设置 ${c.name} 数据
    set${this.capitalize(varName)}(data) {
        this.${varName} = [...data];
    }
`;
        }).join('\n');

        const apiExamples = components.map(c => {
            const varName = this.toValidVarName(c.name);
            return `
        // ${c.name} 组件 API
        // this.addStep('highlight', '高亮元素', { ${varName}: this.${varName}, highlights: { ${varName}: { [0]: '#f5576c' } } });
        // this.addStep('swap', '交换元素', { ${varName}: this.${varName} }, '交换描述');
`;
        }).join('\n');

        const initialData = components.map(c => {
            const varName = this.toValidVarName(c.name);
            return `            ${varName}: [...this.${varName}]`;
        }).join(',\n');

        return `// ${pluginName} 算法实现
class ${this.toDirName(pluginName)}Algorithm {
    constructor() {
        this.steps = [];
${componentInits}
    }

    // 执行算法，记录每一步
    execute() {
        this.steps = [];
        
        // TODO: 在这里实现你的算法逻辑
        // 使用以下 API 记录每一步：
        
        // 1. 记录初始状态（包含所有组件数据）
        this.addStep('initial', '初始状态', {
${initialData}
        });
${apiExamples}
        // 2. 记录最终状态
        this.addStep('final', '算法执行完成', {
${initialData}
        });
        
        return this.steps;
    }

    // 添加步骤
    addStep(type, description, data = {}) {
        this.steps.push({
            type,
            description,
            data,
            timestamp: Date.now()
        });
    }

${componentMethods}

    // 获取算法复杂度
    getComplexity() {
        return {
            time: 'O(?)',
            space: 'O(?)'
        };
    }

    // 获取算法描述
    getDescription() {
        return {
            name: '${pluginName}',
            description: '${pluginName} 算法描述',
            steps: [
                '步骤1：...',
                '步骤2：...',
                '步骤3：...'
            ]
        };
    }
}

// 导出算法实例
export default new ${this.toDirName(pluginName)}Algorithm();`;
    }

    generateVisualization(components, pluginName) {
        const fixedWidth = 800;
        const padding = 20;

        const componentRenders = components.map((c, index) => {
            const varName = this.toValidVarName(c.name);
            return `
        // 渲染 ${c.name}
        this.render${this.capitalize(varName)}(step);`;
        }).join('\n');

        const componentRenderMethods = components.map((c, index) => {
            if (c.type === 'stack') {
                return this.generateStackRenderMethod(c);
            } else {
                return this.generateBarChartRenderMethod(c);
            }
        }).join('\n');

        const componentInits = components.map(c => {
            const varName = this.toValidVarName(c.name);
            return `        this.${varName} = [${c.data.join(', ')}];`;
        }).join('\n');

        let currentOffset = 20;
        const componentOffsets = components.map((c, index) => {
            const varName = this.toValidVarName(c.name);
            const componentHeight = this.getComponentHeight(c);
            
            const offset = currentOffset;
            currentOffset += componentHeight + padding;
            return `            ${varName}: ${offset}`;
        }).join(',\n');

        const componentHeights = components.map((c, index) => {
            const varName = this.toValidVarName(c.name);
            const componentHeight = this.getComponentHeight(c);
            return `            ${varName}: ${componentHeight}`;
        }).join(',\n');

        const totalHeight = components.reduce((total, c) => {
            return total + this.getComponentHeight(c) + padding;
        }, 60);

        return `// ${pluginName} 可视化实现
class ${this.toDirName(pluginName)}Visualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        this.componentOffsets = {
${componentOffsets}
        };
        this.componentHeights = {
${componentHeights}
        };
${componentInits}
        
        this.initCanvas();
    }

    initCanvas() {
        this.canvas.width = ${fixedWidth};
        this.canvas.height = ${totalHeight};
    }

    setSpeed(speed) {
        this.animationSpeed = speed;
    }

    loadSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.steps.length === 0) return;
        
        const step = this.steps[this.currentStep];
${componentRenders}
        
        this.drawDescription(step);
    }

    drawDescription(step) {
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(step.description, 10, this.canvas.height - 10);
    }

${componentRenderMethods}

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.draw();
            return true;
        }
        return false;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.draw();
            return true;
        }
        return false;
    }

    playPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = 0;
        }
        
        const animate = () => {
            if (!this.isPlaying) return;
            
            if (this.nextStep()) {
                this.animationId = setTimeout(animate, this.animationSpeed);
            } else {
                this.isPlaying = false;
            }
        };
        
        animate();
    }

    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }

    reset() {
        this.pause();
        this.currentStep = 0;
        this.draw();
    }

    getCurrentStepInfo() {
        if (this.steps.length === 0) return null;
        return this.steps[this.currentStep];
    }

    destroy() {
        this.pause();
        this.steps = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

${this.generateComponentAPIs(components)}
}

export default ${this.toDirName(pluginName)}Visualizer;`;
    }

    getComponentHeight(component) {
        if (component.type === 'stack') {
            return 120;
        }
        
        const fixedWidth = 800;
        const minBarWidth = 25;
        const maxBarWidth = 60;
        const barGap = 5;
        
        const dataLength = component.data.length;
        const idealBarWidth = (fixedWidth - 40 - (dataLength - 1) * barGap) / dataLength;
        const barWidth = Math.max(minBarWidth, Math.min(maxBarWidth, idealBarWidth));
        const totalBarsWidth = dataLength * barWidth + (dataLength - 1) * barGap;
        const scaleRatio = totalBarsWidth / fixedWidth;
        return Math.round(fixedWidth * scaleRatio);
    }

    generateBarChartRenderMethod(component) {
        const varName = this.toValidVarName(component.name);
        const minBarWidth = 25;
        const maxBarWidth = 60;
        const barGap = 5;
        const componentHeight = this.getComponentHeight(component);
        
        return `
    render${this.capitalize(varName)}(step) {
        const data = step.data.${varName} || this.${varName};
        if (!data || data.length === 0) return;

        const offsetY = this.componentOffsets.${varName} || 0;
        const barWidth = Math.max(${minBarWidth}, Math.min(${maxBarWidth}, (this.canvas.width - 40 - (data.length - 1) * ${barGap}) / data.length));
        const maxValue = Math.max(...data, 1);
        const highlights = step.data.highlights?.${varName} || {};
        const areaHeight = this.componentHeights.${varName} || ${componentHeight};

        // 绘制柱状图
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * (areaHeight - 20);
            const x = 20 + index * (barWidth + ${barGap});
            const y = offsetY + areaHeight - barHeight - 5;

            const color = highlights[index] || '#667eea';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, barHeight, 4);
            this.ctx.fill();

            // 绘制数值
            this.ctx.fillStyle = '#1e293b';
            this.ctx.font = 'bold 12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5);

            // 绘制索引
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '10px Inter';
            this.ctx.fillText('[' + index + ']', x + barWidth / 2, offsetY + areaHeight + 10);
        });
    }
`;
    }

    generateStackRenderMethod(component) {
        const varName = this.toValidVarName(component.name);
        const itemWidth = 60;
        const itemHeight = 80;
        const itemGap = 5;
        const maxVisibleItems = component.maxVisibleItems || 8;
        
        return `
    render${this.capitalize(varName)}(step) {
        const data = step.data.${varName} || this.${varName};
        const offsetY = this.componentOffsets.${varName} || 0;
        const highlights = step.data.highlights?.${varName} || {};
        const maxVisible = ${maxVisibleItems};
        const itemWidth = ${itemWidth};
        const itemHeight = ${itemHeight};
        const itemGap = ${itemGap};

        // 绘制栈标签
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 12px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('← 栈底', 10, offsetY + 15);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('栈顶 →', this.canvas.width - 10, offsetY + 15);

        if (!data || data.length === 0) {
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.font = '14px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('空栈', this.canvas.width / 2, offsetY + 60);
            return;
        }

        // 计算可见范围（显示最后maxVisible个元素）
        const visibleStart = Math.max(0, data.length - maxVisible);
        const visibleItems = Math.min(maxVisible, data.length);

        // 绘制栈元素（从左向右，栈顶在右边）
        for (let i = visibleStart; i < data.length; i++) {
            const displayIndex = i - visibleStart;
            const x = 10 + displayIndex * (itemWidth + itemGap);
            const y = offsetY + 25;
            
            const color = highlights[i] || '#667eea';
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, itemWidth, itemHeight, 8);
            this.ctx.fill();

            // 绘制数值
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(data[i].toString(), x + itemWidth / 2, y + itemHeight / 2);

            // 绘制索引
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '10px Inter';
            this.ctx.fillText('[' + i + ']', x + itemWidth / 2, y + itemHeight + 15);
        }

        // 绘制滚动指示器
        if (data.length > maxVisible) {
            const scrollBarWidth = 100;
            const scrollBarHeight = 6;
            const scrollBarX = (this.canvas.width - scrollBarWidth) / 2;
            const scrollBarY = offsetY + 105;

            this.ctx.fillStyle = '#e2e8f0';
            this.ctx.beginPath();
            this.ctx.roundRect(scrollBarX, scrollBarY, scrollBarWidth, scrollBarHeight, 3);
            this.ctx.fill();

            const visibleRatio = maxVisible / data.length;
            const thumbWidth = scrollBarWidth * visibleRatio;
            const thumbX = scrollBarX + scrollBarWidth - thumbWidth;

            this.ctx.fillStyle = '#667eea';
            this.ctx.beginPath();
            this.ctx.roundRect(thumbX, scrollBarY, thumbWidth, scrollBarHeight, 3);
            this.ctx.fill();
        }
    }
`;
    }

    generateComponentAPIs(components) {
        const apis = components.map(c => {
            if (c.type === 'stack') {
                return this.generateStackAPI(c);
            } else {
                return this.generateBarChartAPI(c);
            }
        }).join('\n');

        return apis;
    }

    generateBarChartAPI(component) {
        const varName = this.toValidVarName(component.name);
        const capitalizedName = this.capitalize(varName);
        
        return `
    // ========== ${component.name} 柱状图操作 API ==========
    
    // 高亮元素
    highlight${capitalizedName}(indices, color = '#f5576c') {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights) {
            this.steps[this.currentStep].data.highlights = {};
        }
        if (!this.steps[this.currentStep].data.highlights.${varName}) {
            this.steps[this.currentStep].data.highlights.${varName} = {};
        }
        
        if (typeof indices === 'number') {
            this.steps[this.currentStep].data.highlights.${varName}[indices] = color;
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                this.steps[this.currentStep].data.highlights.${varName}[i] = color;
            });
        }
        this.draw();
    }

    // 取消高亮
    unhighlight${capitalizedName}(indices) {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights?.${varName}) return;
        
        if (indices === undefined) {
            this.steps[this.currentStep].data.highlights.${varName} = {};
        } else if (typeof indices === 'number') {
            delete this.steps[this.currentStep].data.highlights.${varName}[indices];
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                delete this.steps[this.currentStep].data.highlights.${varName}[i];
            });
        }
        this.draw();
    }

    // 交换元素
    async swap${capitalizedName}(i, j) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.${varName} || this.${varName};
        if (i < 0 || j < 0 || i >= data.length || j >= data.length) return;
        
        [data[i], data[j]] = [data[j], data[i]];
        this.steps[this.currentStep].data.${varName} = [...data];
        this.draw();
    }

    // 插入元素
    async insert${capitalizedName}(index, value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.${varName} || [...this.${varName}];
        data.splice(index, 0, value);
        this.steps[this.currentStep].data.${varName} = data;
        this.draw();
    }

    // 删除元素
    async delete${capitalizedName}(index) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.${varName} || [...this.${varName}];
        data.splice(index, 1);
        this.steps[this.currentStep].data.${varName} = data;
        this.draw();
    }

    // 设置元素值
    set${capitalizedName}Value(index, value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.${varName} || [...this.${varName}];
        data[index] = value;
        this.steps[this.currentStep].data.${varName} = data;
        this.draw();
    }

    // 获取数据
    get${capitalizedName}Data() {
        if (!this.steps[this.currentStep]) return this.${varName};
        return this.steps[this.currentStep].data.${varName} || this.${varName};
    }
`;
    }

    generateStackAPI(component) {
        const varName = this.toValidVarName(component.name);
        const capitalizedName = this.capitalize(varName);
        
        return `
    // ========== ${component.name} 栈操作 API ==========
    
    // 入栈
    async push${capitalizedName}(value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.${varName} || [...this.${varName}];
        data.push(value);
        this.steps[this.currentStep].data.${varName} = data;
        this.draw();
    }

    // 出栈
    async pop${capitalizedName}() {
        if (!this.steps[this.currentStep]) return null;
        const data = this.steps[this.currentStep].data.${varName} || [...this.${varName}];
        if (data.length === 0) return null;
        const value = data.pop();
        this.steps[this.currentStep].data.${varName} = data;
        this.draw();
        return value;
    }

    // 查看栈顶
    peek${capitalizedName}() {
        if (!this.steps[this.currentStep]) return null;
        const data = this.steps[this.currentStep].data.${varName} || this.${varName};
        return data.length > 0 ? data[data.length - 1] : null;
    }

    // 栈是否为空
    is${capitalizedName}Empty() {
        if (!this.steps[this.currentStep]) return true;
        const data = this.steps[this.currentStep].data.${varName} || this.${varName};
        return data.length === 0;
    }

    // 栈大小
    get${capitalizedName}Size() {
        if (!this.steps[this.currentStep]) return 0;
        const data = this.steps[this.currentStep].data.${varName} || this.${varName};
        return data.length;
    }

    // 高亮元素
    highlight${capitalizedName}(indices, color = '#f5576c') {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights) {
            this.steps[this.currentStep].data.highlights = {};
        }
        if (!this.steps[this.currentStep].data.highlights.${varName}) {
            this.steps[this.currentStep].data.highlights.${varName} = {};
        }
        
        if (typeof indices === 'number') {
            this.steps[this.currentStep].data.highlights.${varName}[indices] = color;
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                this.steps[this.currentStep].data.highlights.${varName}[i] = color;
            });
        }
        this.draw();
    }

    // 取消高亮
    unhighlight${capitalizedName}(indices) {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights?.${varName}) return;
        
        if (indices === undefined) {
            this.steps[this.currentStep].data.highlights.${varName} = {};
        } else if (typeof indices === 'number') {
            delete this.steps[this.currentStep].data.highlights.${varName}[indices];
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                delete this.steps[this.currentStep].data.highlights.${varName}[i];
            });
        }
        this.draw();
    }

    // 清空栈
    clear${capitalizedName}() {
        if (!this.steps[this.currentStep]) return;
        this.steps[this.currentStep].data.${varName} = [];
        this.draw();
    }

    // 获取数据
    get${capitalizedName}Data() {
        if (!this.steps[this.currentStep]) return this.${varName};
        return this.steps[this.currentStep].data.${varName} || this.${varName};
    }
`;
    }

    generateStyle() {
        return `/* ${pluginName} 插件特定样式 */

/* 这里可以添加算法特定的样式 */
`;
    }

    generateConfig(pluginName, options) {
        const config = {
            title: pluginName,
            name: pluginName,
            description: options.description || `${pluginName} 算法可视化`,
            timeComplexity: 'O(?)',
            spaceComplexity: 'O(?)',
            inputSection: {
                label: '输入数据：',
                placeholder: '请输入数据',
                defaultValue: '',
                buttonText: '执行'
            },
            algorithmSteps: {
                title: '算法步骤：',
                items: [
                    '步骤1：...',
                    '步骤2：...',
                    '步骤3：...'
                ]
            },
            script: './plugin-script.js'
        };
        return JSON.stringify(config, null, 2);
    }

    generatePluginScript(components, pluginName) {
        return `import algorithm from './algorithm.js';
import ${this.toDirName(pluginName)}Visualizer from './visualization.js';

let visualizer = null;

document.addEventListener('DOMContentLoaded', async () => {
    visualizer = new ${this.toDirName(pluginName)}Visualizer('visualizationCanvas');
    
    if (window.pluginPage) {
        window.pluginPage.setVisualizer(visualizer);
    }

    const inputElement = document.getElementById('pluginInput');
    const actionBtn = document.getElementById('actionBtn');

    if (actionBtn) {
        actionBtn.addEventListener('click', () => {
            const input = inputElement ? inputElement.value.trim() : '';
            
            try {
                // 执行算法
                const steps = algorithm.execute();
                
                // 加载步骤到可视化器
                visualizer.loadSteps(steps);
            } catch (error) {
                alert('执行出错：' + error.message);
            }
        });

        // 初始化时自动执行一次
        actionBtn.click();
    }
});`;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    async savePlugin(pluginData) {
        const response = await fetch('/api/plugins/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pluginData)
        });

        if (!response.ok) {
            throw new Error('Failed to generate plugin');
        }

        return response.json();
    }
}