// test 可视化实现
class testVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.steps = [];
        this.currentStep = 0;
        this.animationSpeed = 500;
        this.isPlaying = false;
        this.animationId = null;
        this.componentOffsets = {
            bar_chart_bar_chart_1774205006668_1yudw9kdh: 20,
            stack_stack_1774205008577_64b1en3cw: 555
        };
        this.componentHeights = {
            bar_chart_bar_chart_1774205006668_1yudw9kdh: 515,
            stack_stack_1774205008577_64b1en3cw: 120
        };
        this.bar_chart_bar_chart_1774205006668_1yudw9kdh = [5, 3, 8, 4, 2, 7, 1, 6];
        this.stack_stack_1774205008577_64b1en3cw = [1, 2, 3, 4, 5];
        
        this.initCanvas();
    }

    initCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 735;
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

        // 渲染 bar-chart_bar-chart_1774205006668_1yudw9kdh
        this.renderBar_chart_bar_chart_1774205006668_1yudw9kdh(step);

        // 渲染 stack_stack_1774205008577_64b1en3cw
        this.renderStack_stack_1774205008577_64b1en3cw(step);
        
        this.drawDescription(step);
    }

    drawDescription(step) {
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '14px Inter';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(step.description, 10, this.canvas.height - 10);
    }


    renderBar_chart_bar_chart_1774205006668_1yudw9kdh(step) {
        const data = step.data.bar_chart_bar_chart_1774205006668_1yudw9kdh || this.bar_chart_bar_chart_1774205006668_1yudw9kdh;
        if (!data || data.length === 0) return;

        const offsetY = this.componentOffsets.bar_chart_bar_chart_1774205006668_1yudw9kdh || 0;
        const barWidth = Math.max(25, Math.min(60, (this.canvas.width - 40 - (data.length - 1) * 5) / data.length));
        const maxValue = Math.max(...data, 1);
        const highlights = step.data.highlights?.bar_chart_bar_chart_1774205006668_1yudw9kdh || {};
        const areaHeight = this.componentHeights.bar_chart_bar_chart_1774205006668_1yudw9kdh || 515;

        // 绘制柱状图
        data.forEach((value, index) => {
            const barHeight = (value / maxValue) * (areaHeight - 20);
            const x = 20 + index * (barWidth + 5);
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


    renderStack_stack_1774205008577_64b1en3cw(step) {
        const data = step.data.stack_stack_1774205008577_64b1en3cw || this.stack_stack_1774205008577_64b1en3cw;
        const offsetY = this.componentOffsets.stack_stack_1774205008577_64b1en3cw || 0;
        const highlights = step.data.highlights?.stack_stack_1774205008577_64b1en3cw || {};
        const maxVisible = 8;
        const itemWidth = 60;
        const itemHeight = 80;
        const itemGap = 5;

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


    // ========== bar-chart_bar-chart_1774205006668_1yudw9kdh 柱状图操作 API ==========
    
    // 高亮元素
    highlightBar_chart_bar_chart_1774205006668_1yudw9kdh(indices, color = '#f5576c') {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights) {
            this.steps[this.currentStep].data.highlights = {};
        }
        if (!this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh) {
            this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh = {};
        }
        
        if (typeof indices === 'number') {
            this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh[indices] = color;
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh[i] = color;
            });
        }
        this.draw();
    }

    // 取消高亮
    unhighlightBar_chart_bar_chart_1774205006668_1yudw9kdh(indices) {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights?.bar_chart_bar_chart_1774205006668_1yudw9kdh) return;
        
        if (indices === undefined) {
            this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh = {};
        } else if (typeof indices === 'number') {
            delete this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh[indices];
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                delete this.steps[this.currentStep].data.highlights.bar_chart_bar_chart_1774205006668_1yudw9kdh[i];
            });
        }
        this.draw();
    }

    // 交换元素
    async swapBar_chart_bar_chart_1774205006668_1yudw9kdh(i, j) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh || this.bar_chart_bar_chart_1774205006668_1yudw9kdh;
        if (i < 0 || j < 0 || i >= data.length || j >= data.length) return;
        
        [data[i], data[j]] = [data[j], data[i]];
        this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh = [...data];
        this.draw();
    }

    // 插入元素
    async insertBar_chart_bar_chart_1774205006668_1yudw9kdh(index, value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh || [...this.bar_chart_bar_chart_1774205006668_1yudw9kdh];
        data.splice(index, 0, value);
        this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh = data;
        this.draw();
    }

    // 删除元素
    async deleteBar_chart_bar_chart_1774205006668_1yudw9kdh(index) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh || [...this.bar_chart_bar_chart_1774205006668_1yudw9kdh];
        data.splice(index, 1);
        this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh = data;
        this.draw();
    }

    // 设置元素值
    setBar_chart_bar_chart_1774205006668_1yudw9kdhValue(index, value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh || [...this.bar_chart_bar_chart_1774205006668_1yudw9kdh];
        data[index] = value;
        this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh = data;
        this.draw();
    }

    // 获取数据
    getBar_chart_bar_chart_1774205006668_1yudw9kdhData() {
        if (!this.steps[this.currentStep]) return this.bar_chart_bar_chart_1774205006668_1yudw9kdh;
        return this.steps[this.currentStep].data.bar_chart_bar_chart_1774205006668_1yudw9kdh || this.bar_chart_bar_chart_1774205006668_1yudw9kdh;
    }


    // ========== stack_stack_1774205008577_64b1en3cw 栈操作 API ==========
    
    // 入栈
    async pushStack_stack_1774205008577_64b1en3cw(value) {
        if (!this.steps[this.currentStep]) return;
        const data = this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || [...this.stack_stack_1774205008577_64b1en3cw];
        data.push(value);
        this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw = data;
        this.draw();
    }

    // 出栈
    async popStack_stack_1774205008577_64b1en3cw() {
        if (!this.steps[this.currentStep]) return null;
        const data = this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || [...this.stack_stack_1774205008577_64b1en3cw];
        if (data.length === 0) return null;
        const value = data.pop();
        this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw = data;
        this.draw();
        return value;
    }

    // 查看栈顶
    peekStack_stack_1774205008577_64b1en3cw() {
        if (!this.steps[this.currentStep]) return null;
        const data = this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || this.stack_stack_1774205008577_64b1en3cw;
        return data.length > 0 ? data[data.length - 1] : null;
    }

    // 栈是否为空
    isStack_stack_1774205008577_64b1en3cwEmpty() {
        if (!this.steps[this.currentStep]) return true;
        const data = this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || this.stack_stack_1774205008577_64b1en3cw;
        return data.length === 0;
    }

    // 栈大小
    getStack_stack_1774205008577_64b1en3cwSize() {
        if (!this.steps[this.currentStep]) return 0;
        const data = this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || this.stack_stack_1774205008577_64b1en3cw;
        return data.length;
    }

    // 高亮元素
    highlightStack_stack_1774205008577_64b1en3cw(indices, color = '#f5576c') {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights) {
            this.steps[this.currentStep].data.highlights = {};
        }
        if (!this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw) {
            this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw = {};
        }
        
        if (typeof indices === 'number') {
            this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw[indices] = color;
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw[i] = color;
            });
        }
        this.draw();
    }

    // 取消高亮
    unhighlightStack_stack_1774205008577_64b1en3cw(indices) {
        if (!this.steps[this.currentStep]) return;
        if (!this.steps[this.currentStep].data.highlights?.stack_stack_1774205008577_64b1en3cw) return;
        
        if (indices === undefined) {
            this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw = {};
        } else if (typeof indices === 'number') {
            delete this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw[indices];
        } else if (Array.isArray(indices)) {
            indices.forEach(i => {
                delete this.steps[this.currentStep].data.highlights.stack_stack_1774205008577_64b1en3cw[i];
            });
        }
        this.draw();
    }

    // 清空栈
    clearStack_stack_1774205008577_64b1en3cw() {
        if (!this.steps[this.currentStep]) return;
        this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw = [];
        this.draw();
    }

    // 获取数据
    getStack_stack_1774205008577_64b1en3cwData() {
        if (!this.steps[this.currentStep]) return this.stack_stack_1774205008577_64b1en3cw;
        return this.steps[this.currentStep].data.stack_stack_1774205008577_64b1en3cw || this.stack_stack_1774205008577_64b1en3cw;
    }

}

export default testVisualizer;