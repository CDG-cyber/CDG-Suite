export const State = {
    db: null, empresa: { rfc: '', nombre: '' }, xmlList: [],
    views: [
        { id: 'config', icon: 'fa-building', label: 'Mi Empresa', subtitle: 'Configuración Fiscal del Contribuyente' },
        { id: 'upload', icon: 'fa-cloud-upload-alt', label: 'Carga de XML', subtitle: 'Procesamiento Masivo y Validación XSD' },
        { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard Financiero', subtitle: 'Reporte Ejecutivo y Proyección IA' },
        { id: 'audit', icon: 'fa-shield-halved', label: 'Auditoría CFDI', subtitle: 'Detección de Riesgos y Anexo 20' },
        { id: 'recon', icon: 'fa-link', label: 'Conciliación PPD/REP', subtitle: 'Control Integral de Cuentas (REPs y Notas de Crédito)' },
        { id: 'global', icon: 'fa-table', label: 'Tabla Global (DIOT)', subtitle: 'Análisis Multidimensional' },
        { id: 'concepts', icon: 'fa-list-ul', label: 'Detalle Conceptos', subtitle: 'Minería de Datos por Clave SAT' }
    ],
    currentView: 'config',
    tables: {
        global: {
            page: 1, limit: 50, sortCol: 'fecha', sortAsc: false,
            columns: [
                { id: 'clase', label: 'Clase', visible: true, align: 'center' }, { id: 'periodo', label: 'Periodo', visible: true, align: 'center' },
                { id: 'fecha', label: 'Fecha Emisión', visible: true, align: 'center' }, { id: 'serie', label: 'Serie', visible: true, align: 'center' },
                { id: 'folio', label: 'Folio', visible: true, align: 'left' }, { id: 'uuid', label: 'UUID', visible: true, align: 'left' },
                { id: 'emisor.rfc', label: 'RFC Emisor', visible: true, align: 'left' }, { id: 'receptor.rfc', label: 'RFC Receptor', visible: true, align: 'left' },
                { id: 'tercero', label: 'Tercero (Cliente/Prov)', visible: true, align: 'left' }, { id: 'tipo', label: 'Tipo', visible: true, align: 'center' },
                { id: 'metodoPago', label: 'Método', visible: true, align: 'center' }, { id: 'formaPago', label: 'Forma Pago', visible: true, align: 'center' },
                { id: 'moneda', label: 'Moneda', visible: true, align: 'center' }, { id: 'tc', label: 'TC', visible: true, isCurrency: true },
                { id: 'subtotal', label: 'Subtotal', visible: true, isCurrency: true }, { id: 'descuento', label: 'Descuento', visible: true, isCurrency: true },
                { id: 'impuestos.base16', label: 'Base IVA 16%', visible: true, isCurrency: true }, { id: 'impuestos.iva16', label: 'IVA 16%', visible: true, isCurrency: true },
                { id: 'impuestos.base8', label: 'Base IVA 8%', visible: true, isCurrency: true }, { id: 'impuestos.iva8', label: 'IVA 8%', visible: true, isCurrency: true },
                { id: 'impuestos.base0', label: 'Base 0%', visible: true, isCurrency: true }, { id: 'impuestos.exento', label: 'Exento', visible: true, isCurrency: true },
                { id: 'impuestos.ieps', label: 'IEPS', visible: true, isCurrency: true }, { id: 'impuestos.isr10', label: 'ISR 10% (Prof)', visible: true, isCurrency: true },
                { id: 'impuestos.isrResico', label: 'ISR 1.25% (RES)', visible: true, isCurrency: true }, { id: 'isrTotal', label: 'ISR Ret (Total)', visible: true, isCurrency: true },
                { id: 'impuestos.ivaRet', label: 'IVA Retenido', visible: true, isCurrency: true }, { id: 'total', label: 'Total', visible: true, isCurrency: true }
            ]
        },
        concepts: {
            page: 1, limit: 50, sortCol: 'cFecha', sortAsc: false,
            columns: [
                { id: 'cClase', label: 'Clase', visible: true, align: 'center' }, { id: 'cFecha', label: 'Fecha CFDI', visible: true, align: 'center' },
                { id: 'cSerie', label: 'Serie', visible: true, align: 'center' }, { id: 'cFolio', label: 'Folio CFDI', visible: true, align: 'left' },
                { id: 'cTercero', label: 'Tercero', visible: true, align: 'left' }, { id: 'cTipo', label: 'Tipo', visible: true, align: 'center' },
                { id: 'cMetodo', label: 'Método', visible: true, align: 'center' }, { id: 'claveProd', label: 'ClaveProdServ', visible: true, align: 'center' },
                { id: 'cant', label: 'Cant', visible: true, align: 'center' }, { id: 'unidad', label: 'Unidad', visible: true, align: 'center' },
                { id: 'desc', label: 'Descripción', visible: true, align: 'left' }, { id: 'objetoImp', label: 'Obj. Imp', visible: true, align: 'center' },
                { id: 'vUnitario', label: 'V. Unitario', visible: true, isCurrency: true }, { id: 'descuento', label: 'Descuento', visible: true, isCurrency: true },
                { id: 'importe', label: 'Importe', visible: true, isCurrency: true }, { id: 'base16', label: 'Base 16%', visible: true, isCurrency: true },
                { id: 'iva16', label: 'IVA 16%', visible: true, isCurrency: true }, { id: 'base8', label: 'Base 8%', visible: true, isCurrency: true },
                { id: 'iva8', label: 'IVA 8%', visible: true, isCurrency: true }, { id: 'base0', label: 'Base 0%', visible: true, isCurrency: true },
                { id: 'exento', label: 'Exento', visible: true, isCurrency: true }, { id: 'ieps', label: 'IEPS', visible: true, isCurrency: true },
                { id: 'isr10', label: 'ISR 10% (Prof)', visible: true, isCurrency: true }, { id: 'isrResico', label: 'ISR 1.25% (RES)', visible: true, isCurrency: true },
                { id: 'isrRet', label: 'ISR Ret (Total)', visible: true, isCurrency: true }, { id: 'ivaRet', label: 'IVA Ret', visible: true, isCurrency: true }
            ]
        }
    },
    
    init: () => new Promise(res => {
        const req = indexedDB.open('CDG_DB_2026', 1);
        req.onupgradeneeded = e => { 
            const db = e.target.result; 
            db.createObjectStore('config', { keyPath: 'id' }); 
            db.createObjectStore('xmlData', { keyPath: 'uuid' }); 
        };
        req.onsuccess = async e => { State.db = e.target.result; await State.load(); res(); };
    }),
    
    load: () => new Promise(res => {
        const tx = State.db.transaction(['config', 'xmlData'], 'readonly');
        tx.objectStore('config').get('empresa').onsuccess = e => { if(e.target.result) State.empresa = e.target.result; };
        tx.objectStore('xmlData').getAll().onsuccess = e => { State.xmlList = e.target.result || []; resolveData(); res(); };
        
        function resolveData() {
            const rfc = State.empresa.rfc;
            State.xmlList.forEach(x => {
                x.periodo = x.fecha ? x.fecha.substring(0,7) : 'S/F';
                x.isrTotal = x.impuestos.isr10 + x.impuestos.isrResico + x.impuestos.isrOtro;
                
                // Clasificación estricta ahora que sabemos que el RFC coincide
                if (x.tipo === 'N') { 
                    x.clase = 'Nómina'; 
                    x.tercero = x.receptor.nombre || x.receptor.rfc; 
                }
                else if (rfc === x.emisor.rfc) { 
                    x.clase = 'Ingreso'; 
                    x.tercero = x.receptor.nombre || x.receptor.rfc; 
                }
                else if (rfc === x.receptor.rfc) { 
                    x.clase = 'Egreso'; 
                    x.tercero = x.emisor.nombre || x.emisor.rfc; 
                } else {
                    // Fail-safe por si algún XML se corrompió
                    x.clase = 'Desconocido';
                    x.tercero = x.emisor.rfc;
                }
                
                x.searchStr = `${x.uuid} ${x.serie} ${x.folio} ${x.tercero} ${x.emisor.rfc} ${x.receptor.rfc}`.toLowerCase();
            });
        }
    }),

    saveConfig: async (rfc, nombre) => {
        State.empresa = { id:'empresa', rfc: rfc.toUpperCase(), nombre: nombre.toUpperCase() };
        return new Promise((resolve) => {
            const tx = State.db.transaction('config', 'readwrite');
            tx.objectStore('config').put(State.empresa);
            tx.oncomplete = async () => { await State.load(); resolve(); };
        });
    },

    saveXML: async (newItems) => {
        return new Promise((resolve) => {
            const tx = State.db.transaction('xmlData', 'readwrite');
            newItems.forEach(i => tx.objectStore('xmlData').put(i));
            tx.oncomplete = async () => { 
                State.xmlList = [...State.xmlList, ...newItems]; 
                await State.load(); 
                resolve(); 
            };
        });
    },

    clearAll: async () => {
        return new Promise((resolve) => {
            const tx = State.db.transaction('xmlData', 'readwrite');
            tx.objectStore('xmlData').clear();
            tx.oncomplete = () => { State.xmlList = []; resolve(); }
        });
    }
};