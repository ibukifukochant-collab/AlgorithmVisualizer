// 栈操作与动态规划可视化实现（新版本：使用透明度变化和元素流动动画）
class StackVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        
        // 动画状态
        this.animationState = {
            isAnimating: false,
            type: '', // 'push' 或 'pop'
            progress: 0,
            element: null,
            fromX: 0,
            fromY: 0,
            toX: 0,
            toY: 0
        };
        
        // 保存队列数据
        this.leftQueue = [];
        this.stack = [];
        this.rightQueue = [];
        
        this.initCanvas();
    }
    
    // 初始化画布
    initCanvas() {
        this.canvas.width = 1200;
        this.canvas.height = 800;
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    // 设置动画速度
    setSpeed(speed) {
        this.animationSpeed = speed;
    }
    
    // 加载步骤
    loadSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        
        // 初始化队列数据
        this.initializeQueues();
        this.draw();
    }
    
    // 初始化队列数据
    initializeQueues() {
        if (this.steps.length === 0) return;
        
        const step = this.steps[this.currentStep];
        const n = step.n;
        
        // 左边队列：操作数序列 1,2,...,n
        this.leftQueue = Array.from({length: n}, (_, idx) => idx + 1);
        
        // 中间栈：初始为空
        this.stack = [];
        
        // 右边队列：输出序列，初始为空
        this.rightQueue = [];
    }
    
    // 绘制当前状态
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.steps.length === 0) return;
        
        const step = this.steps[this.currentStep];
        
        // 绘制动态规划二维数组
        this.drawDPArray(step);
        
        // 绘制栈操作可视化
        this.drawStackOperations(step);
        
        // 绘制状态转移方程
        this.drawEquation(step);
        
        // 绘制动画效果
        if (this.animationState.isAnimating) {
            this.drawAnimation();
        }
    }
    
    // 绘制动态规划二维数组
    drawDPArray(step) {
        const n = step.n;
        const dp = step.dp;
        const currentI = step.currentI;
        const currentJ = step.currentJ;
        
        // 绘制区域设置
        const startX = 50;
        const startY = this.canvas.height - 100;
        const cellSize = 60;
        const spacing = 5;
        
        // 绘制标题
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Inter bold';
        this.ctx.fillText('动态规划二维数组', startX + (n + 1) * (cellSize + spacing) / 2, startY - (n + 2) * (cellSize + spacing) - 20);
        
        // 绘制二维数组（左下角为0,0）
        for (let i = 0; i <= n; i++) {
            for (let j = 0; j <= i; j++) {
                // 计算单元格位置
                const x = startX + j * (cellSize + spacing);
                const y = startY - i * (cellSize + spacing);
                
                // 确定单元格颜色
                let fillColor = '#f0f0f0';
                let strokeColor = '#ddd';
                
                // 高亮当前计算的单元格
                if (i === currentI && j === currentJ) {
                    fillColor = '#667eea';
                    strokeColor = '#4a60e0';
                }
                // 高亮已计算的单元格
                else if (i < currentI || (i === currentI && j < currentJ)) {
                    fillColor = '#e8f0fe';
                    strokeColor = '#c7d2fe';
                }
                // 高亮初始状态(n,0)
                else if (step.type === 'initial' && i === n && j === 0) {
                    fillColor = '#667eea';
                    strokeColor = '#4a60e0';
                }
                
                // 绘制单元格
                this.ctx.fillStyle = fillColor;
                this.ctx.strokeStyle = strokeColor;
                this.ctx.lineWidth = 2;
                this.ctx.fillRect(x, y, cellSize, cellSize);
                this.ctx.strokeRect(x, y, cellSize, cellSize);
                
                // 绘制数值
                this.ctx.fillStyle = (i === currentI && j === currentJ) ? '#fff' : '#333';
                this.ctx.font = '14px Inter';
                this.ctx.fillText(dp[i][j], x + cellSize / 2, y + cellSize / 2);
                
                // 绘制坐标标签（仅在边缘绘制）
                this.ctx.fillStyle = '#666';
                this.ctx.font = '12px Inter';
                
                // 绘制i标签（行标签，显示在左侧）
                if (j === 0) {
                    this.ctx.textAlign = 'right';
                    this.ctx.fillText(`i=${i}`, x - 10, y + cellSize / 2);
                    this.ctx.textAlign = 'center';
                }
                
                // 绘制j标签（列标签，显示在下方）
                if (i === n) {
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(`j=${j}`, x + cellSize / 2, y + cellSize + 20);
                }
            }
        }
        
        // 绘制坐标原点
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Inter bold';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('(0,0)', startX - 10, startY + cellSize / 2);
        this.ctx.textAlign = 'center';
    }
    
    // 绘制栈操作可视化
    drawStackOperations(step) {
        const n = step.n;
        
        // 绘制区域设置
        const stackAreaX = 600;
        const stackAreaY = 100;
        const elementSize = 40;
        const spacing = 10;
        
        // 绘制标题
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Inter bold';
        this.ctx.fillText('栈操作可视化', stackAreaX + 200, stackAreaY - 30);
        
        // 绘制队列和栈的容器
        const queueWidth = 80;
        const stackWidth = 100;
        const height = 300;
        
        // 左侧队列：待处理的操作数序列（从下往上排列）
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(stackAreaX, stackAreaY, queueWidth, height);
        this.ctx.strokeRect(stackAreaX, stackAreaY, queueWidth, height);
        
        // 队列标题
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Inter';
        this.ctx.fillText('操作数序列', stackAreaX + queueWidth / 2, stackAreaY - 15);
        
        // 中间栈（由下往上堆叠）
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(stackAreaX + queueWidth + spacing, stackAreaY, stackWidth, height);
        this.ctx.strokeRect(stackAreaX + queueWidth + spacing, stackAreaY, stackWidth, height);
        
        // 栈标题
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('栈', stackAreaX + queueWidth + spacing + stackWidth / 2, stackAreaY - 15);
        
        // 右侧队列：输出序列（由下往上堆叠）
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(stackAreaX + queueWidth + spacing + stackWidth + spacing, stackAreaY, queueWidth, height);
        this.ctx.strokeRect(stackAreaX + queueWidth + spacing + stackWidth + spacing, stackAreaY, queueWidth, height);
        
        // 输出队列标题
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('输出序列', stackAreaX + queueWidth + spacing + stackWidth + spacing + queueWidth / 2, stackAreaY - 15);
        
        // 绘制箭头（从下往上）
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        // push箭头：从操作数序列底部到栈顶部
        this.ctx.beginPath();
        this.ctx.moveTo(stackAreaX + queueWidth, stackAreaY + height - 20);
        this.ctx.lineTo(stackAreaX + queueWidth + spacing, stackAreaY + height - 20);
        this.ctx.stroke();
        
        // pop箭头：从栈顶部到输出序列底部
        this.ctx.beginPath();
        this.ctx.moveTo(stackAreaX + queueWidth + spacing + stackWidth, stackAreaY + height - 20);
        this.ctx.lineTo(stackAreaX + queueWidth + spacing + stackWidth + spacing, stackAreaY + height - 20);
        this.ctx.stroke();
        
        // 绘制箭头头部
        this.drawArrowHead(stackAreaX + queueWidth + spacing, stackAreaY + height - 20, 'right');
        this.drawArrowHead(stackAreaX + queueWidth + spacing + stackWidth + spacing, stackAreaY + height - 20, 'right');
        
        // 绘制操作标签
        this.ctx.fillStyle = '#667eea';
        this.ctx.font = '12px Inter';
        this.ctx.fillText('push', stackAreaX + queueWidth + spacing / 2, stackAreaY + height - 35);
        this.ctx.fillText('pop', stackAreaX + queueWidth + spacing + stackWidth + spacing / 2, stackAreaY + height - 35);
        
        // 绘制左边队列数据（操作数序列）
        this.leftQueue.forEach((num, idx) => {
            const x = stackAreaX + queueWidth / 2;
            const y = stackAreaY + height - 20 - idx * (elementSize + spacing);
            
            // 绘制方格元素
            this.ctx.fillStyle = '#667eea';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            this.ctx.strokeRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            
            // 绘制数字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Inter bold';
            this.ctx.fillText(num, x, y);
        });
        
        // 绘制中间栈数据
        this.stack.forEach((num, idx) => {
            const x = stackAreaX + queueWidth + spacing + stackWidth / 2;
            const y = stackAreaY + height - 20 - idx * (elementSize + spacing);
            
            // 绘制方格元素
            this.ctx.fillStyle = '#f5576c';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            this.ctx.strokeRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            
            // 绘制数字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Inter bold';
            this.ctx.fillText(num, x, y);
        });
        
        // 绘制右边队列数据（输出序列）
        this.rightQueue.forEach((num, idx) => {
            const x = stackAreaX + queueWidth + spacing + stackWidth + spacing + queueWidth / 2;
            const y = stackAreaY + height - 20 - idx * (elementSize + spacing);
            
            // 绘制方格元素
            this.ctx.fillStyle = '#43e97b';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            this.ctx.strokeRect(
                x - elementSize / 2, 
                y - elementSize / 2, 
                elementSize, 
                elementSize
            );
            
            // 绘制数字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Inter bold';
            this.ctx.fillText(num, x, y);
        });
        
        // 绘制当前状态信息
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`当前状态: i=${step.currentI}, j=${step.currentJ}`, stackAreaX, stackAreaY + height + 30);
        this.ctx.fillText(`左边队列: [${this.leftQueue.join(', ')}]`, stackAreaX, stackAreaY + height + 50);
        this.ctx.fillText(`中间栈: [${this.stack.join(', ')}]`, stackAreaX, stackAreaY + height + 70);
        this.ctx.fillText(`右边队列: [${this.rightQueue.join(', ')}]`, stackAreaX, stackAreaY + height + 90);
        this.ctx.textAlign = 'center';
    }
    
    // 绘制状态转移方程
    drawEquation(step) {
        if (step.type === 'calculate' && step.equation) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Inter bold';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(step.equation, 600, 50);
        }
    }
    
    // 绘制动画效果
    drawAnimation() {
        const state = this.animationState;
        const progress = state.progress;
        
        if (state.type === 'transition') {
            // 绘制通用状态变化动画（使用透明度变化）
            this.ctx.fillStyle = `rgba(102, 126, 234, ${0.5 + 0.5 * Math.sin(progress * Math.PI)})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // 计算当前动画位置
            const currentX = state.fromX + (state.toX - state.fromX) * progress;
            const currentY = state.fromY + (state.toY - state.fromY) * progress;
            
            // 绘制移动的元素
            this.ctx.fillStyle = state.type === 'push' ? '#667eea' : '#f5576c';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.fillRect(
                currentX - 20, 
                currentY - 20, 
                40, 
                40
            );
            this.ctx.strokeRect(
                currentX - 20, 
                currentY - 20, 
                40, 
                40
            );
            
            // 绘制数字
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Inter bold';
            this.ctx.fillText(state.element, currentX, currentY);
            
            // 绘制轨迹线
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(state.fromX, state.fromY);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    // 绘制箭头头部
    drawArrowHead(x, y, direction) {
        this.ctx.fillStyle = '#667eea';
        this.ctx.beginPath();
        
        if (direction === 'right') {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 8, y - 4);
            this.ctx.lineTo(x - 8, y + 4);
        } else if (direction === 'left') {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 8, y - 4);
            this.ctx.lineTo(x + 8, y + 4);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // 开始动画
    startAnimation(type, element, fromX, fromY, toX, toY) {
        this.animationState = {
            isAnimating: true,
            type: type,
            progress: 0,
            element: element,
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY
        };
        
        this.animate();
    }
    
    // 动画循环
    animate() {
        if (!this.animationState.isAnimating) return;
        
        this.animationState.progress += 0.05;
        
        if (this.animationState.progress >= 1) {
            this.animationState.isAnimating = false;
            this.animationState.progress = 0;
            this.draw();
        } else {
            this.draw();
            setTimeout(() => this.animate(), 50);
        }
    }
    
    // 下一步
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            const prevStep = this.steps[this.currentStep];
            this.currentStep++;
            const currentStep = this.steps[this.currentStep];
            
            console.log('下一步:', {prevType: prevStep.type, currentType: currentStep.type, prevI: prevStep.currentI, prevJ: prevStep.currentJ, currentI: currentStep.currentI, currentJ: currentStep.currentJ});
            
            // 更新队列数据
            this.updateQueues(prevStep, currentStep);
            
            // 检查是否需要动画（所有步骤类型都检查）
            this.checkForAnimation(prevStep, currentStep);
            
            return true;
        }
        return false;
    }
    
    // 更新队列数据
    updateQueues(prevStep, currentStep) {
        const n = currentStep.n;
        const prevI = prevStep.currentI;
        const prevJ = prevStep.currentJ;
        const currentI = currentStep.currentI;
        const currentJ = currentStep.currentJ;
        
        // 判断操作类型
        if (currentI === prevI - 1 && currentJ === prevJ + 1) {
            // push操作：从左边队列移动到栈
            const element = this.leftQueue.shift();
            if (element) {
                this.stack.unshift(element);
            }
        } else if (currentI === prevI && currentJ === prevJ - 1) {
            // pop操作：从栈移动到右边队列
            const element = this.stack.shift();
            if (element) {
                this.rightQueue.unshift(element);
            }
        }
    }
    
    // 检查是否需要动画
    checkForAnimation(prevStep, currentStep) {
        const n = currentStep.n;
        const prevI = prevStep.currentI;
        const prevJ = prevStep.currentJ;
        const currentI = currentStep.currentI;
        const currentJ = currentStep.currentJ;
        
        // 动画区域设置
        const stackAreaX = 600;
        const stackAreaY = 100;
        const elementSize = 40;
        const spacing = 10;
        const queueWidth = 80;
        const stackWidth = 100;
        const height = 300;
        
        console.log('动画检查:', {prevI, prevJ, currentI, currentJ});
        
        // 检查是否满足push条件：i减少1，j增加1
        if (currentI === prevI - 1 && currentJ === prevJ + 1) {
            // push动画：从左边队列底部到栈顶部
            const fromX = stackAreaX + queueWidth / 2;
            const fromY = stackAreaY + height - 20;
            const toX = stackAreaX + queueWidth + spacing + stackWidth / 2;
            const toY = stackAreaY + height - 20 - (currentJ - 1) * (elementSize + spacing);
            
            const element = this.leftQueue[0]; // 即将被push的元素
            console.log('触发push动画:', element, {fromX, fromY, toX, toY});
            this.startAnimation('push', element, fromX, fromY, toX, toY);
        } 
        // 检查是否满足pop条件：i不变，j减少1
        else if (currentI === prevI && currentJ === prevJ - 1) {
            // pop动画：从栈顶部到右边队列底部
            const fromX = stackAreaX + queueWidth + spacing + stackWidth / 2;
            const fromY = stackAreaY + height - 20 - (prevJ - 1) * (elementSize + spacing);
            const toX = stackAreaX + queueWidth + spacing + stackWidth + spacing + queueWidth / 2;
            const toY = stackAreaY + height - 20;
            
            const element = this.stack[0]; // 即将被pop的元素
            console.log('触发pop动画:', element, {fromX, fromY, toX, toY});
            this.startAnimation('pop', element, fromX, fromY, toX, toY);
        }
        // 检查是否是从初始状态到边界条件
        else if (prevStep.type === 'initial' && currentStep.type === 'boundary') {
            // 触发初始状态到边界条件的过渡动画
            console.log('触发初始状态到边界条件的过渡动画');
            this.animationState = {
                isAnimating: true,
                type: 'transition',
                progress: 0,
                element: null,
                fromX: 0,
                fromY: 0,
                toX: 0,
                toY: 0
            };
            this.animate();
        }
        // 对于其他所有状态转移，显示通用动画效果
        else {
            // 显示通用状态变化动画（使用透明度变化）
            console.log('触发通用状态变化动画');
            this.animationState = {
                isAnimating: true,
                type: 'transition',
                progress: 0,
                element: null,
                fromX: 0,
                fromY: 0,
                toX: 0,
                toY: 0
            };
            this.animate();
        }
    }
    
    // 上一步
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.initializeQueues(); // 重置队列数据
            this.draw();
            return true;
        }
        return false;
    }
    
    // 播放/暂停
    playPause() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.playAnimation();
        } else {
            this.pause();
        }
    }
    
    // 播放动画
    playAnimation() {
        if (this.isPlaying && this.currentStep < this.steps.length - 1) {
            if (this.nextStep()) {
                setTimeout(() => this.playAnimation(), this.animationSpeed);
            } else {
                this.isPlaying = false;
            }
        }
    }
    
    // 暂停
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }
    
    // 重置
    reset() {
        this.pause();
        this.currentStep = 0;
        this.initializeQueues();
        this.draw();
    }
    
    // 销毁可视化实例
    destroy() {
        this.pause();
        this.steps = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 导出可视化器
export default StackVisualizer;