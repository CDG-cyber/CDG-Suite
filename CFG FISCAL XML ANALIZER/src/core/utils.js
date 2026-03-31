export const Utils = {
    formatCurrency: (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0),
    
    escapeHTML: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag]));
    },
    
    // Notificación Push Inferior (Toast)
    showToast: (msg, type = 'info') => {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toast-icon');
        document.getElementById('toast-msg').innerText = msg;
        icon.className = type === 'error' ? 'fas fa-exclamation-triangle mr-3 text-red-400 text-xl' : 
                         type === 'success' ? 'fas fa-check-circle mr-3 text-green-400 text-xl' : 
                         'fas fa-info-circle mr-3 text-gold-500 text-xl';
        toast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3500);
    },

    // NUEVO: Modal de Confirmación Asíncrono
    showConfirm: (title, message) => {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-confirm');
            const box = document.getElementById('custom-confirm-box');
            
            document.getElementById('confirm-title').innerText = title;
            document.getElementById('confirm-msg').innerText = message;

            // Mostrar Modal
            modal.classList.remove('opacity-0', 'pointer-events-none');
            box.classList.remove('scale-95');

            const btnOk = document.getElementById('confirm-btn-ok');
            const btnCancel = document.getElementById('confirm-btn-cancel');

            // Función para cerrar y limpiar eventos
            const cleanup = () => {
                modal.classList.add('opacity-0', 'pointer-events-none');
                box.classList.add('scale-95');
                btnOk.onclick = null;
                btnCancel.onclick = null;
            };

            btnOk.onclick = () => { cleanup(); resolve(true); };
            btnCancel.onclick = () => { cleanup(); resolve(false); };
        });
    },

    linearRegression: (yArr) => {
        const n = yArr.length; if(n < 2) return null;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) { sumX += i; sumY += yArr[i]; sumXY += (i * yArr[i]); sumXX += (i * i); }
        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;
        return { m, b };
    },
    
    resolveNested: (obj, path) => path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj)
};
