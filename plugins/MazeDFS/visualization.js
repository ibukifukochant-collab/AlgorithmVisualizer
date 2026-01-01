// 迷宫深度优先搜索可视化实现
class MazeDFSVisualizer {
    constructor(canvasId, stackDisplayId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.stackDisplay = document.getElementById(stackDisplayId);
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        this.maze = null;
        this.isAnimating = false;
        this.cellSize = 40;
        this.padding = 40;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        
        this.initCanvas();
    }

    // 初始化画布
    initCanvas() {
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.ctx.fillStyle = '#667eea';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.font = '12px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }

    // 设置动画速度
    setSpeed(speed) {
        this.animationSpeed = speed;
    }

    // 加载迷宫
    loadMaze(maze) {
        this.maze = maze;
        // 设置正确的起点和终点坐标（避开边界墙壁）
        this.startX = 1;
        this.startY = 1;
        this.endY = maze.length - 2;
        this.endX = maze[0].length - 2;
        this.steps = [];
        this.currentStep = 0;
        this.drawMaze();
        this.updateStackDisplay([]);
    }

    // 加载搜索步骤
    loadSteps(steps) {
        this.steps = steps;
        this.currentStep = 0;
        this.draw();
        this.updateStackDisplay(steps[0].stack);
    }

    // 绘制当前状态
    draw() {
        if (this.steps.length === 0) {
            this.drawMaze();
            return;
        }
        
        const step = this.steps[this.currentStep];
        this.drawMaze(step.visited, step.current);
        this.updateStackDisplay(step.stack, step.type);
    }

    // 绘制迷宫
    drawMaze(visited = null, current = null) {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.maze) return;
        
        const height = this.maze.length;
        const width = this.maze[0].length;
        
        // 计算单元格大小，确保迷宫适合画布
        const maxCellSizeX = (this.canvas.width - 2 * this.padding - width - 1) / width;
        const maxCellSizeY = (this.canvas.height - 2 * this.padding - height - 1) / height;
        this.cellSize = Math.min(maxCellSizeX, maxCellSizeY, 40);
        
        // 绘制网格
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellX = this.padding + x * (this.cellSize + 1);
                const cellY = this.padding + y * (this.cellSize + 1);
                
                // 绘制单元格
                if (this.maze[y][x] === 1) {
                    // 墙壁
                    this.ctx.fillStyle = '#333';
                } else {
                    // 通路
                    this.ctx.fillStyle = '#f8f9fa';
                }
                this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                
                // 绘制已访问标记
                if (visited && visited[y][x]) {
                    this.ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                }
                
                // 绘制起点S
                if (x === this.startX && y === this.startY) {
                    this.ctx.fillStyle = '#43e97b';
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 16px Inter';
                    this.ctx.fillText('S', cellX + this.cellSize / 2, cellY + this.cellSize / 2);
                    this.ctx.font = '12px Inter';
                }
                
                // 绘制终点E
                if (x === this.endX && y === this.endY) {
                    this.ctx.fillStyle = '#fa709a';
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 16px Inter';
                    this.ctx.fillText('E', cellX + this.cellSize / 2, cellY + this.cellSize / 2);
                    this.ctx.font = '12px Inter';
                }
                
                // 绘制当前位置
                if (current && x === current.x && y === current.y) {
                    this.ctx.fillStyle = '#4facfe';
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 14px Inter';
                    this.ctx.fillText('●', cellX + this.cellSize / 2, cellY + this.cellSize / 2);
                    this.ctx.font = '12px Inter';
                }
                
                // 移除单元格内的坐标显示，只保留坐标轴标签
                
                // 绘制边框
                this.ctx.strokeStyle = '#e0e0e0';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
            }
        }
        
        // 绘制坐标轴
        this.drawAxes(width, height);
    }

    // 绘制坐标轴
    drawAxes(width, height) {
        const originX = this.padding - 30;
        const originY = this.canvas.height - this.padding + 30;
        
        // 绘制X轴
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY);
        this.ctx.lineTo(this.canvas.width - this.padding + 10, originY);
        this.ctx.stroke();
        
        // X轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width - this.padding + 10, originY);
        this.ctx.lineTo(this.canvas.width - this.padding, originY - 5);
        this.ctx.lineTo(this.canvas.width - this.padding, originY + 5);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制Y轴
        this.ctx.beginPath();
        this.ctx.moveTo(originX, originY);
        this.ctx.lineTo(originX, this.padding - 10);
        this.ctx.stroke();
        
        // Y轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(originX, this.padding - 10);
        this.ctx.lineTo(originX - 5, this.padding);
        this.ctx.lineTo(originX + 5, this.padding);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 坐标轴标签
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('X轴', this.canvas.width - this.padding + 20, originY + 20);
        this.ctx.save();
        this.ctx.translate(originX - 20, this.padding - 20);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Y轴', 0, 0);
        this.ctx.restore();
        
        // 绘制X轴刻度
        for (let x = 0; x <= width; x++) {
            const xPos = this.padding + x * (this.cellSize + 1) - (this.cellSize + 1) / 2;
            this.ctx.fillStyle = '#666';
            this.ctx.font = '10px Inter';
            this.ctx.fillText(x.toString(), xPos, originY + 15);
        }
        
        // 绘制Y轴刻度
        for (let y = 0; y <= height; y++) {
            const yPos = this.padding + y * (this.cellSize + 1) - (this.cellSize + 1) / 2;
            this.ctx.fillStyle = '#666';
            this.ctx.font = '10px Inter';
            this.ctx.fillText(y.toString(), originX - 15, yPos);
        }
    }

    // 更新堆栈显示
    updateStackDisplay(stack, operation = null) {
        // 清空堆栈显示
        this.stackDisplay.innerHTML = '';
        
        // 更新堆栈信息
        const currentDepth = stack.length > 0 ? stack.length - 1 : 0;
        const stackSize = stack.length;
        
        document.getElementById('currentDepth').textContent = currentDepth;
        document.getElementById('stackSize').textContent = stackSize;
        
        // 添加滚动动画类
        if (operation === 'push') {
            this.stackDisplay.classList.remove('scroll-down');
            this.stackDisplay.classList.add('scroll-up');
        } else if (operation === 'pop') {
            this.stackDisplay.classList.remove('scroll-up');
            this.stackDisplay.classList.add('scroll-down');
        }
        
        // 移除动画类（以便下次可以重新触发）
        setTimeout(() => {
            this.stackDisplay.classList.remove('scroll-up', 'scroll-down');
        }, 300);
        
        // 反向遍历堆栈（因为堆栈是从上到下显示最新元素）
        for (let i = stack.length - 1; i >= 0; i--) {
            const item = stack[i];
            const stackItem = document.createElement('div');
            stackItem.className = 'stack-item';
            stackItem.textContent = `(${item.x},${item.y})`;
            
            // 添加深度信息
            const depthInfo = document.createElement('span');
            depthInfo.className = 'depth-info';
            depthInfo.textContent = `深度:${i}`;
            
            stackItem.appendChild(depthInfo);
            
            // 添加操作动画
            if (operation === 'push' && i === stack.length - 1) {
                stackItem.classList.add('push');
            } else if (operation === 'pop' && i === stack.length - 1) {
                stackItem.classList.add('pop');
            }
            
            this.stackDisplay.appendChild(stackItem);
        }
    }

    // 下一步
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.draw();
            return true;
        }
        return false;
    }

    // 上一步
    prevStep() {
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
                this.animationId = setTimeout(animate, this.animationSpeed);
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
        if (this.steps.length > 0) {
            this.draw();
        } else if (this.maze) {
            this.drawMaze();
            this.updateStackDisplay([]);
        }
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
        this.updateStackDisplay([]);
    }
}

// 导出可视化器
export default MazeDFSVisualizer;