import { State } from '../state/store.js';
import { Views } from './views.js';
import { Controllers } from './controllers.js';
import { ChartManager } from '../services/chartService.js';

export class Router {
    static init() {
        this.renderSidebar();
        if(!State.empresa.rfc) this.navigate('config');
        else if(!State.xmlList.length) this.navigate('upload');
        else this.navigate('dashboard');

        document.addEventListener('click', (e) => {
            const drops = document.querySelectorAll('.col-dropdown');
            drops.forEach(d => { if (!d.contains(e.target) && !e.target.closest('.btn-cols')) d.classList.add('hidden'); });
        });
    }

    static renderSidebar() {
        document.getElementById('sidebar-nav').innerHTML = State.views.map(v => `
            <button onclick="Router.navigate('${v.id}')" class="w-full flex items-center p-3.5 rounded-xl text-left transition-all duration-300 ${State.currentView === v.id ? 'bg-gradient-to-r from-corporate-800 to-corporate-700 text-white shadow-lg border border-corporate-600 scale-[1.02]' : 'text-corporate-300 hover:bg-corporate-800/50 hover:text-white border border-transparent'}">
                <i class="fas ${v.icon} w-6 text-center ${v.id==='audit' && State.currentView === v.id ? 'text-gold-500 drop-shadow-md' : (v.id==='recon' && State.currentView === v.id ? 'text-green-400 drop-shadow-md' : '')}"></i> 
                <span class="ml-2 font-bold tracking-wide">${v.label}</span>
            </button>
        `).join('');
        
        const active = State.views.find(v => v.id === State.currentView);
        document.getElementById('view-title').innerText = active.label;
        document.getElementById('view-subtitle').innerText = active.subtitle;
        
        const badge = document.getElementById('company-badge');
        if(State.empresa.rfc) { 
            badge.classList.remove('hidden'); 
            const displayName = State.empresa.nombre ? State.empresa.nombre : State.empresa.rfc; 
            document.getElementById('company-rfc').innerText = displayName;
            badge.title = displayName;
        } else {
            badge.classList.add('hidden'); 
        }
        document.getElementById('xml-count').innerText = State.xmlList.length;
    }

    static navigate(viewId) {
        State.currentView = viewId;
        this.renderSidebar(); 
        ChartManager.destroyAll();
        document.getElementById('main-container').innerHTML = Views[viewId]();
        if (Controllers[`run_${viewId}`]) setTimeout(Controllers[`run_${viewId}`], 50);
    }
}