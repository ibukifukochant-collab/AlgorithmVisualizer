export default class BaseComponent {
    constructor(id, type, options = {}) {
        this.id = id;
        this.type = type;
        this.name = options.name || `${type}_${id}`;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 400;
        this.height = options.height || 300;
        this.data = options.data || [];
        this.selected = false;
        this.visible = true;
        this.zIndex = 0;
        this.animationSpeed = 500;
        this.onPropertyChange = null;
    }

    render(ctx) {
        throw new Error('render() must be implemented by subclass');
    }

    renderEditor(ctx) {
        this.render(ctx);
        
        if (this.selected) {
            this.renderSelectionBox(ctx);
        }
    }

    renderSelectionBox(ctx) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        ctx.setLineDash([]);
        
        const handleSize = 8;
        const handles = this.getResizeHandles();
        
        ctx.fillStyle = '#667eea';
        handles.forEach(handle => {
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
    }

    getResizeHandles() {
        return [
            { x: this.x, y: this.y, cursor: 'nw-resize', position: 'top-left' },
            { x: this.x + this.width, y: this.y, cursor: 'ne-resize', position: 'top-right' },
            { x: this.x, y: this.y + this.height, cursor: 'sw-resize', position: 'bottom-left' },
            { x: this.x + this.width, y: this.y + this.height, cursor: 'se-resize', position: 'bottom-right' }
        ];
    }

    containsPoint(px, py) {
        return px >= this.x && px <= this.x + this.width &&
               py >= this.y && py <= this.y + this.height;
    }

    getHandleAtPoint(px, py) {
        const handleSize = 12;
        const handles = this.getResizeHandles();
        
        for (const handle of handles) {
            if (px >= handle.x - handleSize / 2 && px <= handle.x + handleSize / 2 &&
                py >= handle.y - handleSize / 2 && py <= handle.y + handleSize / 2) {
                return handle;
            }
        }
        return null;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.notifyPropertyChange();
    }

    resize(newWidth, newHeight) {
        this.width = Math.max(100, newWidth);
        this.height = Math.max(80, newHeight);
        this.notifyPropertyChange();
    }

    setData(data) {
        this.data = [...data];
        this.notifyPropertyChange();
    }

    select() {
        this.selected = true;
    }

    deselect() {
        this.selected = false;
    }

    setProperty(key, value) {
        if (key in this) {
            this[key] = value;
            this.notifyPropertyChange();
        }
    }

    getProperty(key) {
        return this[key];
    }

    notifyPropertyChange() {
        if (this.onPropertyChange) {
            this.onPropertyChange(this);
        }
    }

    serialize() {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            data: [...this.data],
            animationSpeed: this.animationSpeed
        };
    }

    static deserialize(data) {
        throw new Error('deserialize() must be implemented by subclass');
    }

    getAnimationAPI() {
        return {
            highlight: (indices, color) => this.highlight(indices, color),
            unhighlight: (indices) => this.unhighlight(indices),
            swap: (i, j) => this.swap(i, j),
            insert: (index, value) => this.insert(index, value),
            delete: (index) => this.delete(index),
            setValue: (index, value) => this.setValue(index, value)
        };
    }

    highlight(indices, color) {
        throw new Error('highlight() must be implemented by subclass');
    }

    unhighlight(indices) {
        throw new Error('unhighlight() must be implemented by subclass');
    }

    swap(i, j) {
        throw new Error('swap() must be implemented by subclass');
    }

    insert(index, value) {
        throw new Error('insert() must be implemented by subclass');
    }

    delete(index) {
        throw new Error('delete() must be implemented by subclass');
    }

    setValue(index, value) {
        throw new Error('setValue() must be implemented by subclass');
    }

    getPropertySchema() {
        return {
            basic: [
                { key: 'name', label: '组件名称', type: 'text' },
                { key: 'x', label: 'X 坐标', type: 'number' },
                { key: 'y', label: 'Y 坐标', type: 'number' },
                { key: 'width', label: '宽度', type: 'number' },
                { key: 'height', label: '高度', type: 'number' }
            ],
            animation: [
                { key: 'animationSpeed', label: '动画速度(ms)', type: 'number' }
            ],
            data: []
        };
    }

    clone() {
        const serialized = this.serialize();
        serialized.id = `${this.type}_${Date.now()}`;
        serialized.name = `${this.name}_copy`;
        serialized.x += 20;
        serialized.y += 20;
        return this.constructor.deserialize(serialized);
    }

    destroy() {
        this.onPropertyChange = null;
    }
}