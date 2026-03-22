import BaseComponent from './BaseComponent.js';

export default class StackComponent extends BaseComponent {
    constructor(id, options = {}) {
        super(id, 'stack', options);
        this.data = options.data || [];
        this.maxVisibleItems = options.maxVisibleItems || 8;
        this.highlights = new Map();
        this.defaultColor = '#667eea';
        this.itemWidth = 60;
        this.itemHeight = 80;
        this.itemGap = 5;
        this.showLabels = options.showLabels !== false;
        this.showValues = options.showValues !== false;
        this.scrollOffset = 0;
        
        this.animationState = null;
        this.animationFrameId = null;
        this.externalRender = null;
    }

    setExternalRender(renderFn) {
        this.externalRender = renderFn;
    }

    render(ctx) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        if (this.animationState) {
            this.renderAnimation(ctx);
        } else {
            this.renderStack(ctx);
        }

        this.renderStackLabels(ctx);
    }

    renderStack(ctx) {
        if (this.data.length === 0) {
            this.renderEmpty(ctx);
            return;
        }

        const visibleStart = this.getVisibleStart();
        const visibleItems = this.getVisibleItems();
        
        for (let i = visibleStart; i < Math.min(visibleStart + visibleItems, this.data.length); i++) {
            const displayIndex = i - visibleStart;
            const x = this.x + 10 + displayIndex * (this.itemWidth + this.itemGap);
            const y = this.y + (this.height - this.itemHeight) / 2;
            
            const color = this.highlights.get(i) || this.defaultColor;
            this.drawStackItem(ctx, x, y, this.itemWidth, this.itemHeight, this.data[i], color, i);
        }

        if (this.data.length > this.maxVisibleItems) {
            this.renderScrollIndicator(ctx);
        }
    }

    drawStackItem(ctx, x, y, width, height, value, color, index) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), x + width / 2, y + height / 2);

        if (this.showLabels) {
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Inter';
            ctx.fillText('[' + index + ']', x + width / 2, y + height + 15);
        }
    }

    renderEmpty(ctx) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('空栈', this.x + this.width / 2, this.y + this.height / 2);
    }

    renderScrollIndicator(ctx) {
        const scrollBarWidth = 100;
        const scrollBarHeight = 6;
        const scrollBarX = this.x + (this.width - scrollBarWidth) / 2;
        const scrollBarY = this.y + this.height - 15;

        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.roundRect(scrollBarX, scrollBarY, scrollBarWidth, scrollBarHeight, 3);
        ctx.fill();

        const totalItems = this.data.length;
        const visibleRatio = this.maxVisibleItems / totalItems;
        const scrollRatio = this.scrollOffset / (totalItems - this.maxVisibleItems);
        
        const thumbWidth = scrollBarWidth * visibleRatio;
        const thumbX = scrollBarX + scrollRatio * (scrollBarWidth - thumbWidth);

        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.roundRect(thumbX, scrollBarY, thumbWidth, scrollBarHeight, 3);
        ctx.fill();
    }

    renderStackLabels(ctx) {
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('← 栈底', this.x + 10, this.y + 15);

        ctx.textAlign = 'right';
        ctx.fillText('栈顶 →', this.x + this.width - 10, this.y + 15);
    }

    renderAnimation(ctx) {
        const state = this.animationState;

        switch (state.type) {
            case 'push':
                this.renderPushAnimation(ctx, state);
                break;
            case 'pop':
                this.renderPopAnimation(ctx, state);
                break;
            default:
                this.renderStack(ctx);
        }
    }

    renderPushAnimation(ctx, state) {
        const { value, progress } = state;
        const easeProgress = this.easeOutCubic(progress);

        const visibleStart = this.getVisibleStart();
        const visibleItems = this.getVisibleItems();

        for (let i = visibleStart; i < Math.min(visibleStart + visibleItems, this.data.length); i++) {
            const displayIndex = i - visibleStart;
            const x = this.x + 10 + displayIndex * (this.itemWidth + this.itemGap);
            const y = this.y + (this.height - this.itemHeight) / 2;
            
            const color = this.highlights.get(i) || this.defaultColor;
            this.drawStackItem(ctx, x, y, this.itemWidth, this.itemHeight, this.data[i], color, i);
        }

        const stackEndX = this.x + 10 + (this.data.length - visibleStart) * (this.itemWidth + this.itemGap);
        const newItemX = stackEndX + (1 - easeProgress) * (this.itemWidth + 50);
        const newItemY = this.y + (this.height - this.itemHeight) / 2;
        this.drawStackItem(ctx, newItemX, newItemY, this.itemWidth, this.itemHeight, value, '#43e97b', this.data.length);

        if (this.data.length >= this.maxVisibleItems) {
            this.renderScrollIndicator(ctx);
        }
    }

    renderPopAnimation(ctx, state) {
        const { value, progress } = state;
        const easeProgress = this.easeInCubic(progress);

        const visibleStart = this.getVisibleStart();
        const visibleItems = this.getVisibleItems();

        for (let i = visibleStart; i < Math.min(visibleStart + visibleItems, this.data.length); i++) {
            const displayIndex = i - visibleStart;
            const x = this.x + 10 + displayIndex * (this.itemWidth + this.itemGap);
            const y = this.y + (this.height - this.itemHeight) / 2;
            
            const color = this.highlights.get(i) || this.defaultColor;
            this.drawStackItem(ctx, x, y, this.itemWidth, this.itemHeight, this.data[i], color, i);
        }

        const popItemX = this.x + 10 + (this.data.length - visibleStart) * (this.itemWidth + this.itemGap) + easeProgress * (this.itemWidth + 50);
        const popItemY = this.y + (this.height - this.itemHeight) / 2;
        
        ctx.globalAlpha = 1 - easeProgress;
        this.drawStackItem(ctx, popItemX, popItemY, this.itemWidth, this.itemHeight, value, '#f5576c', this.data.length);
        ctx.globalAlpha = 1;

        if (this.data.length >= this.maxVisibleItems) {
            this.renderScrollIndicator(ctx);
        }
    }

    getVisibleStart() {
        if (this.data.length <= this.maxVisibleItems) {
            return 0;
        }
        return Math.max(0, Math.min(this.scrollOffset, this.data.length - this.maxVisibleItems));
    }

    getVisibleItems() {
        return Math.min(this.maxVisibleItems, this.data.length);
    }

    async push(value) {
        return new Promise((resolve) => {
            this.animationState = {
                type: 'push',
                value: value,
                progress: 0
            };

            const startTime = performance.now();
            const duration = this.animationSpeed;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                this.animationState.progress = Math.min(elapsed / duration, 1);

                if (this.externalRender) {
                    this.externalRender();
                }

                if (elapsed < duration) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    this.data.push(value);
                    if (this.data.length > this.maxVisibleItems) {
                        this.scrollOffset = this.data.length - this.maxVisibleItems;
                    }
                    this.animationState = null;
                    this.notifyPropertyChange();
                    resolve();
                }
            };

            this.animationFrameId = requestAnimationFrame(animate);
        });
    }

    async pop() {
        if (this.data.length === 0) return null;

        return new Promise((resolve) => {
            const value = this.data[this.data.length - 1];
            
            this.animationState = {
                type: 'pop',
                value: value,
                progress: 0
            };

            const startTime = performance.now();
            const duration = this.animationSpeed;

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                this.animationState.progress = Math.min(elapsed / duration, 1);

                if (this.externalRender) {
                    this.externalRender();
                }

                if (elapsed < duration) {
                    this.animationFrameId = requestAnimationFrame(animate);
                } else {
                    this.data.pop();
                    if (this.scrollOffset > 0 && this.data.length <= this.scrollOffset + this.maxVisibleItems) {
                        this.scrollOffset = Math.max(0, this.data.length - this.maxVisibleItems);
                    }
                    this.animationState = null;
                    this.notifyPropertyChange();
                    resolve(value);
                }
            };

            this.animationFrameId = requestAnimationFrame(animate);
        });
    }

    highlight(indices, color = '#f5576c') {
        if (typeof indices === 'number') {
            this.highlights.set(indices, color);
        } else if (Array.isArray(indices)) {
            indices.forEach(i => this.highlights.set(i, color));
        }
        if (this.externalRender) {
            this.externalRender();
        }
    }

    unhighlight(indices) {
        if (indices === undefined) {
            this.highlights.clear();
        } else if (typeof indices === 'number') {
            this.highlights.delete(indices);
        } else if (Array.isArray(indices)) {
            indices.forEach(i => this.highlights.delete(indices));
        }
        if (this.externalRender) {
            this.externalRender();
        }
    }

    peek() {
        return this.data.length > 0 ? this.data[this.data.length - 1] : null;
    }

    isEmpty() {
        return this.data.length === 0;
    }

    size() {
        return this.data.length;
    }

    clear() {
        this.data = [];
        this.highlights.clear();
        this.scrollOffset = 0;
        this.notifyPropertyChange();
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
                { key: 'data', label: '初始数据', type: 'array' },
                { key: 'maxVisibleItems', label: '最大可见数', type: 'number' },
                { key: 'showLabels', label: '显示索引', type: 'boolean' }
            ]
        };
    }

    serialize() {
        return {
            ...super.serialize(),
            data: [...this.data],
            defaultColor: this.defaultColor,
            maxVisibleItems: this.maxVisibleItems,
            showLabels: this.showLabels
        };
    }

    static deserialize(data) {
        return new StackComponent(data.id, {
            name: data.name,
            x: data.x,
            y: data.y,
            width: data.width,
            height: data.height,
            data: data.data,
            animationSpeed: data.animationSpeed,
            defaultColor: data.defaultColor,
            maxVisibleItems: data.maxVisibleItems,
            showLabels: data.showLabels
        });
    }

    getAnimationAPICode() {
        return `// ${this.name} 栈操作 API 示例
// 入栈
await ${this.name}.push(10);       // 将10压入栈顶

// 出栈
const value = await ${this.name}.pop();  // 弹出栈顶元素

// 查看栈顶
const top = ${this.name}.peek();   // 查看栈顶元素（不移除）

// 高亮
${this.name}.highlight(0, '#f5576c');  // 高亮第0个元素

// 取消高亮
${this.name}.unhighlight(0);       // 取消第0个元素高亮
${this.name}.unhighlight();        // 取消所有高亮

// 其他操作
${this.name}.isEmpty();            // 判断是否为空
${this.name}.size();               // 获取栈大小
${this.name}.clear();              // 清空栈`;
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.onPropertyChange = null;
        this.externalRender = null;
    }
}
