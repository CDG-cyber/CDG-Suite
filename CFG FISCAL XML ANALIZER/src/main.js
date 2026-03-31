import { State } from './state/store.js';
import { Router } from './ui/router.js';
import { XMLParser } from './core/xmlParser.js';
import { Utils } from './core/utils.js';
import { Controllers } from './ui/controllers.js';

window.AppCore = null;
window.Utils = Utils;
window.Controllers = Controllers;
window.Router = Router;

export const AppCore = {
    init: async () => {
        await State.init(); 
        Router.init();
        
        document.addEventListener('dragover', e => e.preventDefault()); 
        document.addEventListener('drop', e => e.preventDefault());
        const cont = document.getElementById('main-container');
        cont.addEventListener('dragenter', e => { if(State.currentView==='upload') document.getElementById('dropzone').classList.add('drag-active'); });
        cont.addEventListener('dragleave', e => { if(State.currentView==='upload') document.getElementById('dropzone').classList.remove('drag-active'); });
        cont.addEventListener('drop', e => {
            if(State.currentView==='upload') {
                document.getElementById('dropzone').classList.remove('drag-active');
                if(e.dataTransfer.files.length) AppCore.handleFiles(e.dataTransfer.files);
            }
        });
    },
    saveConfig: async (e) => {
        e.preventDefault();
        await State.saveConfig(document.getElementById('cfg-rfc').value, document.getElementById('cfg-nombre').value);
        Utils.showToast("Perfil de empresa guardado con éxito.", "success");
        Router.navigate('upload');
    },
    handleFiles: async (files) => {
        const xmlFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.xml'));
        if(!xmlFiles.length) return Utils.showToast("Selecciona únicamente archivos .xml", "error");

        document.getElementById('loader').classList.remove('hidden');
        const prog = document.getElementById('loader-progress');

        let parsedList = [];
        let ajenosCount = 0; 
        const miRfc = State.empresa.rfc.toUpperCase();

        for(let i=0; i<xmlFiles.length; i++) {
            const text = await new Promise(res => { const r=new FileReader(); r.onload=e=>res(e.target.result); r.readAsText(xmlFiles[i]); });
            const cfdi = XMLParser.parse(text, xmlFiles[i].name);
            
            if(cfdi && !cfdi.error) {
                const rfcE = cfdi.emisor?.rfc?.toUpperCase();
                const rfcR = cfdi.receptor?.rfc?.toUpperCase();

                if (rfcE === miRfc || rfcR === miRfc) {
                    parsedList.push(cfdi);
                } else {
                    ajenosCount++;
                }
            }
            if(i%5===0) prog.style.width = `${((i/xmlFiles.length)*100)}%`;
        }

        const existingUuids = new Set(State.xmlList.map(x => x.uuid));
        const nuevos = [];

        parsedList.forEach(x => {
            if (!existingUuids.has(x.uuid)) {
                nuevos.push(x);
                existingUuids.add(x.uuid); 
            }
        });

        prog.style.width = '100%';
        setTimeout(async () => {
            document.getElementById('loader').classList.add('hidden');
            
            if(nuevos.length > 0) {
                await State.saveXML(nuevos);
                let msg = `Se agregaron ${nuevos.length} CFDI nuevos.`;
                if (ajenosCount > 0) msg += ` Se ignoraron ${ajenosCount} doc(s) ajenos.`;
                Utils.showToast(msg, "success");
                Router.navigate('dashboard'); 
            } else { 
                let msgErr = "Los archivos ya existían o están corruptos.";
                if (ajenosCount > 0) msgErr = `Rechazado: ${ajenosCount} archivo(s) no coinciden con el RFC ${miRfc}.`;
                Utils.showToast(msgErr, "warning"); 
            }
        }, 600);
    },
    
    // NUEVO: Implementación del Modal de Confirmación Custom en lugar de alert/confirm
    clearSession: async () => {
        const userConfirmed = await Utils.showConfirm(
            "Finalizar Área de Trabajo", 
            "¿Estás seguro de finalizar la sesión y purgar todos los datos locales? Esta acción es irreversible y los XML analizados se eliminarán de este equipo."
        );
        
        if (userConfirmed) {
            await State.clearAll(); 
            Utils.showToast("Base de datos purgada exitosamente.", "success");
            Router.navigate('upload'); 
        }
    }
};

window.AppCore = AppCore;
window.onload = () => AppCore.init();
