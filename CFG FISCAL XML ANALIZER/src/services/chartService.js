export class ChartManager {
    static instances = new Map();
    
    static render(id, config) {
        if (this.instances.has(id)) this.instances.get(id).destroy();
        const canvas = document.getElementById(id);
        if (!canvas) return;
        this.instances.set(id, new Chart(canvas.getContext('2d'), config));
    }
    
    static destroyAll() {
        this.instances.forEach(chart => chart.destroy());
        this.instances.clear();
    }
}