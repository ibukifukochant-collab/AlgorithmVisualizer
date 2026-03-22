// 插件页面通用逻辑
class PluginPage {
    constructor() {
        this.config = null;
        this.visualizer = null;
        this.isPlaying = false;
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.renderPage();
        this.initEventListeners();
        this.loadPluginScript();
    }

    async loadConfig() {
        try {
            const response = await fetch('./config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load plugin config:', error);
        }
    }

    renderPage() {
        if (!this.config) return;

        document.title = this.config.title || '算法可视化';
        document.getElementById('pageTitle').textContent = this.config.title || '算法可视化';
        document.getElementById('pluginTitle').textContent = this.config.name || '';
        document.getElementById('pluginDescription').textContent = this.config.description || '';
        document.getElementById('timeComplexity').textContent = this.config.timeComplexity || '';
        document.getElementById('spaceComplexity').textContent = this.config.spaceComplexity || '';

        this.renderInputSection();
        this.renderAlgorithmSteps();
    }

    renderInputSection() {
        const inputSection = document.getElementById('inputSection');
        if (!this.config.inputSection) return;

        const { label, placeholder, defaultValue, buttonText } = this.config.inputSection;
        
        inputSection.innerHTML = `
            <div class="input-group">
                <label for="pluginInput">${label || '输入：'}</label>
                <input type="text" id="pluginInput" placeholder="${placeholder || ''}" value="${defaultValue || ''}">
                <button id="actionBtn">${buttonText || '执行'}</button>
            </div>
        `;
    }

    renderAlgorithmSteps() {
        const stepsContainer = document.getElementById('algorithmSteps');
        if (!this.config.algorithmSteps) return;

        const { title, items } = this.config.algorithmSteps;
        
        let html = '';
        if (title) {
            html += `<h4>${title}</h4>`;
        }
        
        if (items && items.length > 0) {
            html += '<ul>';
            items.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }
        
        stepsContainer.innerHTML = html;
    }

    initEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const nextBtn = document.getElementById('nextBtn');
        const resetBtn = document.getElementById('resetBtn');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');

        prevBtn.addEventListener('click', () => {
            if (this.visualizer) {
                this.visualizer.prevStep();
            }
        });

        playPauseBtn.addEventListener('click', () => {
            if (this.visualizer) {
                this.visualizer.playPause();
                this.isPlaying = this.visualizer.isPlaying;
                playPauseBtn.textContent = this.isPlaying ? '暂停' : '播放';
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.visualizer) {
                this.visualizer.nextStep();
            }
        });

        resetBtn.addEventListener('click', () => {
            if (this.visualizer) {
                this.visualizer.reset();
                this.isPlaying = false;
                playPauseBtn.textContent = '播放';
            }
        });

        speedSlider.addEventListener('input', () => {
            const speed = parseInt(speedSlider.value);
            if (this.visualizer) {
                this.visualizer.setSpeed(speed);
            }
            speedValue.textContent = speed + 'ms';
        });

        const actionBtn = document.getElementById('actionBtn');
        if (actionBtn) {
            actionBtn.addEventListener('click', () => {
                this.executeAction();
            });
        }
    }

    async loadPluginScript() {
        if (!this.config || !this.config.script) return;

        const script = document.getElementById('pluginScript');
        script.src = this.config.script;
    }

    executeAction() {
        if (this.config && this.config.onAction) {
            this.config.onAction();
        }
    }

    setVisualizer(visualizer) {
        this.visualizer = visualizer;
    }
}

// 初始化插件页面
const pluginPage = new PluginPage();

// 将插件页面实例暴露到全局，供插件脚本使用
window.pluginPage = pluginPage;