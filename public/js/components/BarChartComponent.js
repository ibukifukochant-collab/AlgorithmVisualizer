import BaseComponent from './BaseComponent.js';

export default class BarChartComponent extends BaseComponent {
    constructor(id, options = {}) {
        super(id, 'bar-chart', options);
        this.data = options.data || [5, 3, 8, 4, 2, 7, 1, 6];
        this.highlights = new Map();
        this.defaultColor = '#667eea';
        this.barPadding = 5;
        this.labelHeight = 25;
        this.showLabels = options.showLabels !== false;
        this.showValues = options.showValues !== false;
        
        this.animationState = null;
        this.animationFrameId = null;
        this.externalRender = null;
    }

    setExternalRender(renderFn) {
        this.externalRender = renderFn;
    }

    render(ctx) {
        if (this.data.length === 0) {
            this.renderEmpty(ctx);
            return;
        }

        const barWidth = (this.width - this.barPadding * 2) / this.data.length - this.barPadding;
        const maxValue = Math.max(...this.data, 1);
        const barAreaHeight = this.height - this.labelHeight - 10;

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        if (this.animationState) {
            this.renderAnimation(ctx, barWidth, maxValue, barAreaHeight);
        } else {
            this.renderBars(ctx, barWidth, maxValue, barAreaHeight);
        }

        this.renderComponentLabel(ctx);
    }

    renderBars(ctx, barWidth, maxValue, barAreaHeight) {
        this.data.forEach((value, index) => {
            const barHeight = (value / maxValue) * barAreaHeight;
            const x = this.x + this.barPadding + index * (barWidth + this.barPadding);
            const y = this.y + this.height - this.labelHeight - barHeight;

            const color = this.highlights.get(index) || this.defaultColor;
            
            this.drawBar(ctx, x, y, barWidth, barHeight, value, color, index);
        });
    }

    renderAnimation(ctx, barWidth, maxValue, barAreaHeight) {
        const state = this.animationState;

        switch (state.type) {
            case 'swap':
                this.renderSwapAnimation(ctx, barWidth, maxValue, barAreaHeight, state);
                break;
            case 'insert':
                this.renderInsertAnimation(ctx, barWidth, maxValue, barAreaHeight, state);
                break;
            case 'delete':
                this.renderDeleteAnimation(ctx, barWidth, maxValue, barAreaHeight, state);
                break;
            default:
                this.renderBars(ctx, barWidth, maxValue, barAreaHeight);
        }
    }

    renderSwapAnimation(ctx, barWidth, maxValue, barAreaHeight, state) {
        const { i, j, progress } = state;
        const easeProgress = this.easeInOutCubic(progress);

        this.data.forEach((value, index) => {
            if (index !== i && index !== j) {
                const barHeight = (value / maxValue) * barAreaHeight;
                const x = this.x + this.barPadding + index * (barWidth + this.barPadding);
                const y = this.y + this.height - this.labelHeight - barHeight;
                const color = this.highlights.get(index) || this.defaultColor;
                this.drawBar(ctx, x, y, barWidth, barHeight, value, color, index);
            }
        });

        const valueI = this.data[i];
        const valueJ = this.data[j];
        const heightI = (valueI / maxValue) * barAreaHeight;
        const heightJ = (valueJ / maxValue) * barAreaHeight;
        
        const startX_i = this.x + this.barPadding + i * (barWidth + this.barPadding);
        const startX_j = this.x + this.barPadding + j * (barWidth + this.barPadding);
        
        const currentX_i = startX_i + (startX_j - startX_i) * easeProgress;
        const currentX_j = startX_j + (startX_i - startX_j) * easeProgress;
        
        const yI = this.y + this.height - this.labelHeight - heightI;
        const yJ = this.y + this.height - this.labelHeight - heightJ;

        this.drawBar(ctx, currentX_i, yI, barWidth, heightI, valueI, '#4facfe', i, true);
        this.drawBar(ctx, currentX_j, yJ, barWidth, heightJ, valueJ, '#4facfe', j, true);
    }

    renderInsertAnimation(ctx, barWidth, maxValue, barAreaHeight, state) {
        const { index, value, progress } = state;
        const easeProgress = this.easeOutCubic(progress);

        for (let idx = 0; idx < this.data.length; idx++) {
            const val = this.data[idx];
            let x, barHeight;
            
            if (idx < index) {
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding);
                barHeight = (val / maxValue) * barAreaHeight;
            } else if (idx === index) {
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding);
                barHeight = (val / maxValue) * barAreaHeight * easeProgress;
            } else {
                const offset = easeProgress * (barWidth + this.barPadding);
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding);
                barHeight = (val / maxValue) * barAreaHeight;
            }
            
            const y = this.y + this.height - this.labelHeight - barHeight;
            const color = idx === index ? '#43e97b' : (this.highlights.get(idx) || this.defaultColor);
            this.drawBar(ctx, x, y, barWidth, barHeight, val, color, idx, idx === index);
        }
    }

    renderDeleteAnimation(ctx, barWidth, maxValue, barAreaHeight, state) {
        const { index, deletedValue, progress } = state;
        const easeProgress = this.easeInCubic(progress);

        for (let idx = 0; idx < this.data.length; idx++) {
            const val = this.data[idx];
            let x, barHeight, opacity = 1;
            
            if (idx < index) {
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding);
                barHeight = (val / maxValue) * barAreaHeight;
            } else if (idx === index) {
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding);
                barHeight = (deletedValue / maxValue) * barAreaHeight;
                opacity = 1 - easeProgress;
            } else {
                const offset = easeProgress * (barWidth + this.barPadding);
                x = this.x + this.barPadding + idx * (barWidth + this.barPadding) - offset;
                barHeight = (val / maxValue) * barAreaHeight;
            }
            
            const y = this.y + this.height - this.labelHeight - barHeight;
            
            if (idx === index) {
                ctx.globalAlpha = opacity;
                this.drawBar(ctx, x, y, barWidth, barHeight, deletedValue, '#ef4444', idx, true);
                ctx.globalAlpha = 1;
            } else {
                const color = this.highlights.get(idx) || this.defaultColor;
                this.drawBar(ctx, x, y, barWidth, barHeight, val, color, idx);
            }
        }
    }

    drawBar(ctx, x, y, width, height, value, color, index, isAnimating = false) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 4);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (isAnimating) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this.showValues && height > 20) {
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(value.toString(), x + width / 2, y - 5);
        }

        if (this.showLabels) {
            ctx.fillStyle = '#64748b';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`[${index}]`, x + width / 2, this.y + this.height - 8);
        }
    }

    renderEmpty(ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('柱状图组件', this.x + this.width / 2, this.y + this.height / 2 - 10);
        ctx.fillText('请在属性面板添加数据', this.x + this.width / 2, this.y + this.height / 2 + 10);
        
        this.renderComponentLabel(ctx);
    }

    renderComponentLabel(ctx) {
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`📊 ${this.name}`, this.x + 5, this.y + 15);
    }

    highlight(indices, color = '#f5576c') {
        if (!Array.isArray(indices)) {
            indices = [indices];
        }
        indices.forEach(index => {
            if (index >= 0 && index < this.data.length) {
                this.highlights.set(index, color);
            }
        });
        this.triggerRender();
    }

    unhighlight(indices) {
        if (!indices) {
            this.highlights.clear();
        } else if (!Array.isArray(indices)) {
            this.highlights.delete(indices);
        } else {
            indices.forEach(index => {
                this.highlights.delete(index);
            });
        }
        this.triggerRender();
    }

    async swap(i, j) {
        if (i < 0 || i >= this.data.length || j < 0 || j >= this.data.length || i === j) {
            return;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = this.animationSpeed;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.animationState = { type: 'swap', i, j, progress };
                this.triggerRender();

                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    [this.data[i], this.data[j]] = [this.data[j], this.data[i]];
                    this.animationState = null;
                    this.triggerRender();
                    this.notifyPropertyChange();
                    resolve();
                }
            };

            animate();
        });
    }

    async insert(index, value) {
        if (index < 0 || index > this.data.length) {
            return;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = this.animationSpeed;

            this.data.splice(index, 0, value);

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.animationState = { type: 'insert', index, value, progress };
                this.triggerRender();

                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    this.animationState = null;
                    this.triggerRender();
                    this.notifyPropertyChange();
                    resolve();
                }
            };

            animate();
        });
    }

    async delete(index) {
        if (index < 0 || index >= this.data.length) {
            return;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        return new Promise((resolve) => {
            const startTime = Date.now();
            const duration = this.animationSpeed;
            const deletedValue = this.data[index];

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.animationState = { type: 'delete', index, deletedValue, progress };
                this.triggerRender();

                if (progress < 1) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    this.data.splice(index, 1);
                    this.animationState = null;
                    this.triggerRender();
                    this.notifyPropertyChange();
                    resolve();
                }
            };

            animate();
        });
    }

    setValue(index, value) {
        if (index >= 0 && index < this.data.length) {
            this.data[index] = value;
            this.triggerRender();
            this.notifyPropertyChange();
        }
    }

    triggerRender() {
        if (this.externalRender) {
            this.externalRender();
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeInCubic(t) {
        return t * t * t;
    }

    getPropertySchema() {
        return {
            basic: [
                { key: 'name', label: '组件名称', type: 'text' }
            ],
            animation: [
                { key: 'animationSpeed', label: '动画速度(ms)', type: 'number' },
                { key: 'defaultColor', label: '默认颜色', type: 'color' }
            ],
            data: [
                { key: 'data', label: '数据', type: 'array' },
                { key: 'showLabels', label: '显示索引', type: 'boolean' },
                { key: 'showValues', label: '显示数值', type: 'boolean' }
            ]
        };
    }

    serialize() {
        return {
            ...super.serialize(),
            data: [...this.data],
            defaultColor: this.defaultColor,
            showLabels: this.showLabels,
            showValues: this.showValues
        };
    }

    static deserialize(data) {
        return new BarChartComponent(data.id, {
            name: data.name,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            data: data.data,
            animationSpeed: data.animationSpeed,
            defaultColor: data.defaultColor,
            showLabels: data.showLabels,
            showValues: data.showValues
        });
    }

    getAnimationAPICode() {
        return `// ${this.name} 动画 API 示例
// 高亮元素 (索引, 颜色)
${this.name}.highlight(0, '#f5576c');      // 高亮第0个元素为红色
${this.name}.highlight([0, 1], '#4facfe'); // 高亮第0和第1个元素为蓝色

// 取消高亮
${this.name}.unhighlight(0);      // 取消第0个元素的高亮
${this.name}.unhighlight([0, 1]); // 取消第0和第1个元素的高亮
${this.name}.unhighlight();       // 取消所有高亮

// 交换元素 (带动画)
await ${this.name}.swap(0, 1);  // 交换第0和第1个元素

// 插入元素 (带动画)
await ${this.name}.insert(0, 10);  // 在索引0处插入值10

// 删除元素 (带动画，右边向左靠近)
await ${this.name}.delete(0);  // 删除索引0处的元素

// 设置值
${this.name}.setValue(0, 15);  // 将索引0处的值设为15
`;
    }
}