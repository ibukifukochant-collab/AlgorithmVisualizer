import algorithm from './algorithm.js';
import testVisualizer from './visualization.js';

let visualizer = null;

document.addEventListener('DOMContentLoaded', async () => {
    visualizer = new testVisualizer('visualizationCanvas');
    
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
});