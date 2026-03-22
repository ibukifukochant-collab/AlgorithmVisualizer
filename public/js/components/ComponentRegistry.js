import BarChartComponent from './BarChartComponent.js';
import StackComponent from './StackComponent.js';

class ComponentRegistry {
    constructor() {
        this.componentTypes = new Map();
        this.componentClasses = new Map();
        this.registerBuiltInComponents();
    }

    registerBuiltInComponents() {
        this.register('bar-chart', {
            name: '柱状图',
            description: '用于展示数组/列表数据',
            icon: '📊',
            class: BarChartComponent,
            defaultOptions: {
                width: 500,
                height: 300,
                data: [5, 3, 8, 4, 2, 7, 1, 6]
            }
        });

        this.register('stack', {
            name: '栈',
            description: '横向栈，从右向左入栈',
            icon: '📚',
            class: StackComponent,
            defaultOptions: {
                width: 600,
                height: 150,
                data: [1, 2, 3, 4, 5],
                maxVisibleItems: 8
            }
        });
    }

    register(type, config) {
        this.componentTypes.set(type, {
            type,
            name: config.name,
            description: config.description,
            icon: config.icon,
            defaultOptions: config.defaultOptions || {}
        });
        this.componentClasses.set(type, config.class);
    }

    unregister(type) {
        this.componentTypes.delete(type);
        this.componentClasses.delete(type);
    }

    getComponentType(type) {
        return this.componentTypes.get(type);
    }

    getComponentClass(type) {
        return this.componentClasses.get(type);
    }

    getAllComponentTypes() {
        return Array.from(this.componentTypes.values());
    }

    createComponent(type, options = {}) {
        const ComponentClass = this.componentClasses.get(type);
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }

        const typeConfig = this.componentTypes.get(type);
        const mergedOptions = {
            ...typeConfig.defaultOptions,
            ...options
        };

        const id = options.id || this.generateId(type);
        return new ComponentClass(id, mergedOptions);
    }

    generateId(type) {
        return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    deserializeComponent(data) {
        const ComponentClass = this.componentClasses.get(data.type);
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${data.type}`);
        }
        return ComponentClass.deserialize(data);
    }

    getComponentIcon(type) {
        const config = this.componentTypes.get(type);
        return config ? config.icon : '📦';
    }

    getComponentName(type) {
        const config = this.componentTypes.get(type);
        return config ? config.name : type;
    }
}

const registry = new ComponentRegistry();

export default registry;