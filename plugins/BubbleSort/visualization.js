// 冒泡排序可视化实现
class BubbleSortVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        this.array = [];
        this.isAnimating = false; // 标记是否正在执行动画
        this.animationData = null; // 存储动画数据
        
        this.initCanvas();
    }

    // 初始化画布
    initCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.ctx.fillStyle = '#667eea';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
    }

    // 设置动画速度
    setSpeed(speed) {
        this.animationSpeed = speed;
    }

    // 加载排序步骤
    loadSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.array = steps[0].array;
        this.draw();
    }

    // 绘制当前状态
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.steps.length === 0) return;
        
        const step = this.steps[this.currentStep];
        const array = step.array;
        const barWidth = this.canvas.width / array.length;
        const maxHeight = this.canvas.height - 50;
        const maxValue = Math.max(...array);
        
        // 如果正在进行交换动画
        if (this.isAnimating && this.animationData && this.animationData.type === 'swap') {
            this.drawWithSwapAnimation(step, array, barWidth, maxHeight, maxValue);
        } else {
            // 绘制数组元素
            array.forEach((value, index) => {
                const barHeight = (value / maxValue) * maxHeight;
                const x = index * barWidth;
                const y = this.canvas.height - barHeight;
                
                // 设置颜色
                let color = '#667eea';
                if (step.type === 'compare' && step.indices.includes(index)) {
                    color = '#f5576c'; // 比较状态 - 红色
                } else if (step.type === 'swap' && step.indices.includes(index)) {
                    color = '#4facfe'; // 交换状态 - 蓝色
                } else if (step.type === 'iteration' && step.indices.includes(index)) {
                    color = '#43e97b'; // 已就位 - 绿色
                } else if (step.type === 'final') {
                    color = '#43e97b'; // 最终状态 - 绿色
                }
                
                // 绘制柱子
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
                
                // 绘制边框
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(x + 2, y, barWidth - 4, barHeight);
                
                // 绘制数值
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
            });
        }
    }

    // 绘制带交换动画的状态
    drawWithSwapAnimation(step, array, barWidth, maxHeight, maxValue) {
        const { indices, startTime, duration } = this.animationData;
        const [i, j] = indices;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 获取交换元素的位置
        const startValue = array[i];
        const endValue = array[j];
        const startHeight = (startValue / maxValue) * maxHeight;
        const endHeight = (endValue / maxValue) * maxHeight;
        const startX = i * barWidth;
        const startY = this.canvas.height - startHeight;
        const endX = j * barWidth;
        const endY = this.canvas.height - endHeight;

        // 计算动画中的位置（左右平移）
        const currentX1 = startX + (endX - startX) * progress;  // 第一个元素从i位置移动到j位置
        const currentX2 = endX + (startX - endX) * progress;    // 第二个元素从j位置移动到i位置

        // 绘制其他非交换的元素
        array.forEach((value, index) => {
            if (index !== i && index !== j) {
                const barHeight = (value / maxValue) * maxHeight;
                const x = index * barWidth;
                const y = this.canvas.height - barHeight;
                
                let color = '#667eea';
                if (step.type === 'compare' && step.indices.includes(index)) {
                    color = '#f5576c'; // 比较状态 - 红色
                } else if (step.type === 'iteration' && step.indices.includes(index)) {
                    color = '#43e97b'; // 已就位 - 绿色
                } else if (step.type === 'final') {
                    color = '#43e97b'; // 最终状态 - 绿色
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
                
                this.ctx.strokeStyle = '#fff';
                this.ctx.strokeRect(x + 2, y, barWidth - 4, barHeight);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
            }
        });

        // 绘制动画中的交换元素
        // 第一个元素（从i位置移动到j位置）
        this.ctx.fillStyle = '#4facfe'; // 交换状态 - 蓝色
        this.ctx.fillRect(currentX1 + 2, startY, barWidth - 4, startHeight);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(currentX1 + 2, startY, barWidth - 4, startHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(startValue.toString(), currentX1 + barWidth / 2, startY - 5);

        // 第二个元素（从j位置移动到i位置）
        this.ctx.fillStyle = '#4facfe'; // 交换状态 - 蓝色
        this.ctx.fillRect(currentX2 + 2, endY, barWidth - 4, endHeight);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(currentX2 + 2, endY, barWidth - 4, endHeight);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(endValue.toString(), currentX2 + barWidth / 2, endY - 5);

        // 如果动画未完成，继续绘制
        if (progress < 1) {
            requestAnimationFrame(() => this.draw());
        } else {
            // 动画完成，重置状态
            this.isAnimating = false;
            this.animationData = null;
            // 绘制最终状态
            this.draw();
        }
    }

    // 下一步
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            // 检查下一步是否是交换操作
            const nextStep = this.steps[this.currentStep + 1];
            if (nextStep.type === 'swap' && !this.isAnimating) {
                // 开始交换动画
                this.startSwapAnimation(nextStep.indices);
                return true;
            } else {
                this.currentStep++;
                this.draw();
                return true;
            }
        }
        return false;
    }

    // 开始交换动画
    startSwapAnimation(indices) {
        this.isAnimating = true;
        this.animationData = {
            type: 'swap',
            indices: indices,
            startTime: Date.now(),
            duration: this.animationSpeed // 动画持续时间等于设置的速度
        };
        
        // 动画完成后自动前进到下一步
        setTimeout(() => {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
            }
            this.isAnimating = false;
            this.animationData = null;
            this.draw();
        }, this.animationSpeed);
        
        this.draw();
    }

    // 上一步
    prevStep() {
        // 如果正在播放动画，先停止动画
        if (this.isAnimating) {
            this.isAnimating = false;
            this.animationData = null;
        }
        
        if (this.currentStep > 0) {
            this.currentStep--;
            this.draw();
            return true;
        }
        return false;
    }

    // 播放/暂停
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    // 播放动画
    play() {
        if (this.currentStep >= this.steps.length - 1) {
            this.currentStep = 0;
        }
        
        const animate = () => {
            if (!this.isPlaying) return;
            
            if (this.nextStep()) {
                // 如果是交换动画，需要等待动画完成后再继续
                if (this.isAnimating) {
                    // 等待当前动画完成后再继续
                    setTimeout(() => {
                        if (this.isPlaying) {
                            this.animationId = setTimeout(animate, this.animationSpeed);
                        }
                    }, this.animationSpeed);
                } else {
                    this.animationId = setTimeout(animate, this.animationSpeed);
                }
            } else {
                this.isPlaying = false;
            }
        };
        
        animate();
    }

    // 暂停动画
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }

    // 重置动画
    reset() {
        this.pause();
        this.currentStep = 0;
        this.draw();
    }

    // 获取当前步骤信息
    getCurrentStepInfo() {
        if (this.steps.length === 0) return null;
        return this.steps[this.currentStep];
    }

    // 销毁可视化实例
    destroy() {
        this.pause();
        this.steps = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 导出可视化器
export default BubbleSortVisualizer;