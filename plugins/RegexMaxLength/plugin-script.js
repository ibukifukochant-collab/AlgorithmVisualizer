import algorithm from './algorithm.js';
import RegexVisualizer from './visualization.js';

let visualizer = null;

document.addEventListener('DOMContentLoaded', async () => {
    visualizer = new RegexVisualizer('visualizationCanvas');
    
    if (window.pluginPage) {
        window.pluginPage.setVisualizer(visualizer);
    }

    const regexInput = document.getElementById('pluginInput');
    const calculateBtn = document.getElementById('actionBtn');

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            const regex = regexInput.value.trim();
            if (regex) {
                try {
                    const steps = algorithm.calculateMaxLength(regex);
                    visualizer.loadSteps(steps);
                } catch (error) {
                    alert('计算出错：' + error.message);
                }
            }
        });

        calculateBtn.click();
    }
});