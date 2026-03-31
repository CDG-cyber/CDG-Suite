import { State } from '../state/store.js';
import { Controllers } from './controllers.js';

export const Views = {
    config: () => `
        <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-10 fade-in mt-8 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-40 h-40 bg-corporate-50 rounded-bl-full -z-10 opacity-70"></div>
            <div class="text-center mb-10">
                <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-600 shadow-inner border border-blue-100"><i class="fas fa-id-card text-4xl"></i></div>
                <h3 class="text-3xl font-black text-gray-900 tracking-tight">Perfil del Contribuyente</h3>
                <p class="text-gray-500 text-sm mt-3 font-medium px-4">Requisito indispensable para configurar el algoritmo que distingue de forma inteligente entre facturas emitidas (Ventas) y recibidas (Gastos).</p>
            </div>
            <form onsubmit="AppCore.saveConfig(event)" class="space-y-7">
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">RFC Oficial del SAT *</label>
                    <input type="text" id="cfg-rfc" value="${State.empresa.rfc}" required pattern="^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$" placeholder="Ej. XAXX010101000" oninput="this.value = this.value.toUpperCase()" class="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-corporate-600 outline-none uppercase font-mono text-lg shadow-sm transition-all bg-gray-50 focus:bg-white">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase mb-2 tracking-wider">Nombre o Razón Social (Opcional)</label>
                    <input type="text" id="cfg-nombre" value="${State.empresa.nombre}" placeholder="Ej. CDG FISCAL Y CONTABLE" oninput="this.value = this.value.toUpperCase()" class="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:ring-0 focus:border-corporate-600 outline-none uppercase shadow-sm transition-all bg-gray-50 focus:bg-white">
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-corporate-800 to-corporate-900 text-white font-black py-4.5 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center h-14"><i class="fas fa-check-circle mr-2 text-gold-500"></i> Guardar Configuración</button>
            </form>
        </div>`,
    upload: () => `
        <div class="max-w-4xl mx-auto mt-6 fade-in h-full flex flex-col justify-center min-w-0">
            ${!State.empresa.rfc ? `<div class="bg-amber-50 border-l-4 border-amber-500 p-5 mb-8 text-sm text-amber-900 rounded-lg shadow-sm font-bold flex items-center"><i class="fas fa-exclamation-triangle text-xl mr-3 text-amber-500"></i> Configura tu RFC en "Mi Empresa" antes de proceder con la carga de archivos.</div>` : ''}
            <div id="dropzone" class="bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-300 hover:border-corporate-500 p-24 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden" onclick="document.getElementById('file-input').click()">
                <div class="absolute inset-0 bg-corporate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div class="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-white transition-colors shadow-inner group-hover:shadow-md border border-gray-100">
                    <i class="fas fa-cloud-upload-alt text-6xl text-corporate-400 group-hover:text-corporate-600 transition-colors transform group-hover:scale-110 duration-300"></i>
                </div>
                <h3 class="text-3xl font-black text-corporate-900 mb-4 tracking-tight">Haz clic o arrastra XMLs aquí</h3>
                <p class="text-gray-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">Soporta comprobantes de Ingresos, Egresos, Nómina y REP 2.0. El motor validará la estructura XSD y extraerá los impuestos de forma segura y 100% local en tu navegador.</p>
                <input type="file" id="file-input" multiple accept=".xml" class="hidden" onchange="AppCore.handleFiles(this.files)">
                <div class="mt-10 inline-block bg-corporate-800 text-white font-bold py-3.5 px-10 rounded-xl shadow-md group-hover:bg-corporate-900 group-hover:shadow-lg transition-all tracking-wide">Examinar mi PC</div>
            </div>
        </div>`,
    dashboard: () => `
        <div class="flex flex-col gap-6 fade-in pb-10 min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 relative overflow-hidden group"><p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Total Ingresos (Ventas)</p><h3 class="text-4xl font-black text-gray-900 tracking-tight" id="dash-ing">$0.00</h3><i class="fas fa-arrow-trend-up absolute -right-2 -bottom-2 text-7xl text-blue-50 group-hover:scale-110 transition-transform duration-300"></i></div>
                <div class="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 relative overflow-hidden group"><p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Total Egresos (Gastos)</p><h3 class="text-4xl font-black text-gray-900 tracking-tight" id="dash-egr">$0.00</h3><i class="fas fa-receipt absolute -right-2 -bottom-2 text-7xl text-red-50 group-hover:scale-110 transition-transform duration-300"></i></div>
                <div class="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 relative overflow-hidden group"><p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Flujo / Utilidad Bruta</p><h3 class="text-4xl font-black text-gray-900 tracking-tight" id="dash-flujo">$0.00</h3><i class="fas fa-scale-balanced absolute -right-2 -bottom-2 text-7xl text-green-50 group-hover:scale-110 transition-transform duration-300"></i></div>
            </div>
            
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-3"><i class="fas fa-arrow-trend-up text-blue-500 mr-2"></i> Desglose de Impuestos (Ventas)</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center"><p class="text-[10px] text-blue-700 font-bold uppercase tracking-wider">IVA 16%</p><p class="text-base font-black text-blue-900 mt-1" id="dash-iva-t16">$0.00</p></div>
                        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center"><p class="text-[10px] text-blue-700 font-bold uppercase tracking-wider">IVA 8%</p><p class="text-base font-black text-blue-900 mt-1" id="dash-iva-t8">$0.00</p></div>
                        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center"><p class="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Base 0%</p><p class="text-base font-bold text-gray-800 mt-1" id="dash-iva-t0">$0.00</p></div>
                        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center"><p class="text-[10px] text-gray-600 font-bold uppercase tracking-wider">Base Exento</p><p class="text-base font-bold text-gray-800 mt-1" id="dash-exento-t">$0.00</p></div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-3"><i class="fas fa-receipt text-red-500 mr-2"></i> Desglose de Impuestos y Retenciones (Gastos)</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="bg-red-50/50 p-4 rounded-xl border border-red-100 text-center"><p class="text-[10px] text-red-700 font-bold uppercase tracking-wider">IVA 16%</p><p class="text-base font-black text-red-900 mt-1" id="dash-iva-a16">$0.00</p></div>
                        <div class="bg-red-50/50 p-4 rounded-xl border border-red-100 text-center"><p class="text-[10px] text-red-700 font-bold uppercase tracking-wider">IVA 8%</p><p class="text-base font-black text-red-900 mt-1" id="dash-iva-a8">$0.00</p></div>
                        <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center"><p class="text-[10px] text-amber-800 font-bold uppercase tracking-wider">ISR Ret 10%</p><p class="text-base font-black text-amber-900 mt-1" id="dash-isr-10">$0.00</p></div>
                        <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center"><p class="text-[10px] text-amber-800 font-bold uppercase tracking-wider">ISR Ret 1.25%</p><p class="text-base font-black text-amber-900 mt-1" id="dash-isr-res">$0.00</p></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-7 rounded-3xl shadow-sm border border-gray-100"><h4 class="text-sm font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3 flex items-center"><i class="fas fa-chart-line text-corporate-500 mr-2"></i> Tendencia Mensual Histórica</h4><div class="h-72 relative w-full"><canvas id="canvas-trend"></canvas></div></div>
                <div class="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden"><div class="absolute top-0 right-0 bg-gradient-to-l from-purple-700 to-purple-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl shadow-sm"><i class="fas fa-brain mr-1.5"></i> IA Predictiva</div><h4 class="text-sm font-bold text-gray-800 mb-5 border-b border-gray-100 pb-3 flex items-center"><i class="fas fa-project-diagram text-purple-600 mr-2"></i> Proyección Lineal a 90 Días</h4><div class="h-72 relative w-full"><canvas id="canvas-forecast"></canvas></div></div>
            </div>
        </div>`,
    audit: () => `
        <div class="flex flex-col h-full gap-5 fade-in pb-6 min-w-0">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between no-print flex-shrink-0 gap-4">
                <div><h3 class="text-xl font-black text-corporate-900 flex items-center tracking-tight"><i class="fas fa-shield-halved text-gold-500 mr-3 text-2xl"></i> Semáforo de Riesgo Fiscal</h3><p class="text-xs text-gray-500 mt-1.5 font-medium">Evaluación automatizada de requisitos de deducibilidad, matriz de régimen y reglas del Anexo 20.</p></div>
                <div class="flex flex-wrap gap-4 w-full md:w-auto"><div class="text-center px-5 py-3 bg-green-50 rounded-xl border border-green-100 flex-1 shadow-sm"><div class="text-3xl font-black text-green-600" id="audit-ok">0</div><div class="text-[10px] uppercase font-bold text-green-800 tracking-wider mt-1">CFDI Válidos</div></div><div class="text-center px-5 py-3 bg-red-50 rounded-xl border border-red-100 flex-1 shadow-sm"><div class="text-3xl font-black text-red-600" id="audit-fail">0</div><div class="text-[10px] uppercase font-bold text-red-800 tracking-wider mt-1">Con Riesgo / Rechazo</div></div></div>
            </div>
            <div class="datagrid-container min-w-0 w-full shadow-sm rounded-2xl">
                <div class="overflow-auto flex-1 w-full">
                    <table class="datagrid">
                        <thead><tr><th class="w-16 text-center">Estatus</th><th>CFDI (Serie/Folio - UUID)</th><th>Tercero Involucrado</th><th class="text-right">Monto Total</th><th>Reporte de Auditoría CFDI</th></tr></thead>
                        <tbody id="audit-body"></tbody>
                    </table>
                </div>
            </div>
        </div>`,
    recon: () => `
        <div class="flex flex-col h-full gap-5 fade-in pb-6 min-w-0">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row flex-wrap items-start lg:items-center justify-between no-print flex-shrink-0 gap-4">
                <div>
                    <h3 class="text-xl font-black text-corporate-900 flex items-center tracking-tight"><i class="fas fa-link text-green-500 mr-3 text-2xl"></i> Conciliación de Cartera (PPD vs REP)</h3>
                    <p class="text-xs text-gray-500 mt-1.5 font-medium">Cruce avanzado de facturas PPD, incluyendo Recepción de Pagos (REP) y Notas de Crédito (Egresos).</p>
                </div>
                <div class="flex flex-wrap gap-3 w-full lg:w-auto items-center justify-end">
                    <select id="recon-filter" class="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 font-bold text-gray-700 w-full sm:w-auto flex-1 sm:flex-none transition-shadow">
                        <option value="">Todos los Estatus</option>
                        <option value="Saldado">🟢 Saldados Totalmente</option>
                        <option value="Parcial">🟡 Saldos Parciales</option>
                        <option value="Pendiente">🔴 Pendientes de Cobro/Pago</option>
                    </select>
                    <button onclick="Controllers.exportExcelRecon()" class="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 transition-all w-full sm:w-auto flex justify-center items-center"><i class="fas fa-file-excel mr-2"></i> Excel</button>
                </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 flex-shrink-0">
                <div class="bg-white p-5 rounded-2xl border border-gray-200 text-center shadow-sm"><p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Facturado PPD</p><p class="text-2xl font-black text-gray-800 mt-1" id="r-tot-ppd">$0.00</p></div>
                <div class="bg-green-50 p-5 rounded-2xl border border-green-200 text-center shadow-sm"><p class="text-[10px] text-green-700 font-bold uppercase tracking-widest">Cobrado/Pagado (REPs)</p><p class="text-2xl font-black text-green-700 mt-1" id="r-tot-pag">$0.00</p></div>
                <div class="bg-blue-50 p-5 rounded-2xl border border-blue-200 text-center shadow-sm"><p class="text-[10px] text-blue-700 font-bold uppercase tracking-widest">Abonado (Notas Créd.)</p><p class="text-2xl font-black text-blue-700 mt-1" id="r-tot-nc">$0.00</p></div>
                <div class="bg-red-50 p-5 rounded-2xl border border-red-200 text-center shadow-sm"><p class="text-[10px] text-red-700 font-bold uppercase tracking-widest">Saldo Pendiente Global</p><p class="text-2xl font-black text-red-700 mt-1" id="r-tot-sal">$0.00</p></div>
            </div>
            <div class="datagrid-container min-w-0 w-full shadow-sm rounded-2xl">
                <div class="overflow-auto flex-1 w-full">
                    <table class="datagrid">
                        <thead><tr><th class="w-16 text-center">Estatus</th><th>Clase</th><th>Fecha PPD</th><th>Folio PPD</th><th>Tercero</th><th class="text-right">Total PPD</th><th class="text-right bg-green-50/50">Pagado (REP)</th><th class="text-right bg-blue-50/50">Aplicado (NC)</th><th class="text-right bg-red-50/50">Saldo Restante</th><th>Documentos Vinculados</th></tr></thead>
                        <tbody id="recon-body"></tbody>
                    </table>
                </div>
            </div>
        </div>`,
    global: () => `
        <div class="flex flex-col h-full gap-5 fade-in pb-5 min-w-0">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center no-print flex-shrink-0 w-full">
                <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
                    <div class="relative flex-grow sm:flex-grow-0 w-full sm:w-auto min-w-[220px]">
                        <i class="fas fa-search absolute left-4 top-3 text-gray-400 text-sm"></i>
                        <input type="text" id="g-search" placeholder="Buscar RFC, Folio, Tercero..." class="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-corporate-500 bg-gray-50 transition-shadow" oninput="Controllers.handleFilter('global')">
                    </div>
                    <select id="g-periodo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('global')">${Controllers.getPeriodOptions()}</select>
                    <select id="g-clase" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('global')"><option value="">Toda la Empresa</option><option value="Ingreso">Solo Ventas</option><option value="Egreso">Solo Gastos</option></select>
                    <select id="g-tipo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('global')"><option value="">Tipo (I/E/P/N)</option><option value="I">Ingreso (I)</option><option value="E">Egreso (E)</option><option value="P">Pago (P)</option><option value="N">Nómina (N)</option></select>
                    <select id="g-metodo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('global')"><option value="">Método Pago</option><option value="PUE">PUE</option><option value="PPD">PPD</option></select>
                </div>
                <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
                    <div class="relative w-full sm:w-auto">
                        <button class="btn-cols w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center" onclick="document.getElementById('g-col-drop').classList.toggle('hidden')"><i class="fas fa-columns mr-2 text-corporate-500"></i> Columnas</button>
                        <div id="g-col-drop" class="col-dropdown hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 max-h-80 overflow-y-auto"></div>
                    </div>
                    <button onclick="Controllers.exportDIOT()" class="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-all flex items-center justify-center" title="Exporta Layout A-29 del SAT"><i class="fas fa-file-invoice mr-2"></i> TXT DIOT</button>
                    <button onclick="Controllers.exportExcel('global')" class="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-all flex items-center justify-center"><i class="fas fa-file-excel mr-2"></i> Excel Global</button>
                </div>
            </div>
            <div class="datagrid-container min-w-0 w-full shadow-sm rounded-2xl">
                <div class="overflow-x-auto flex-1 w-full"><table class="datagrid"><thead id="g-head"></thead><tbody id="g-body"></tbody><tfoot id="g-foot"></tfoot></table></div>
                <div class="bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-600 font-medium flex justify-between items-center flex-wrap gap-2 rounded-b-2xl">
                    <div class="flex items-center gap-4"><span id="g-count" class="font-bold text-gray-700">0 registros</span><select id="g-limit" class="border border-gray-300 rounded-lg outline-none py-1.5 px-3 font-medium bg-white" onchange="Controllers.changeLimit('global', this.value)"><option value="50">50/pág</option><option value="100">100/pág</option><option value="500">500/pág</option></select></div>
                    <div class="flex gap-2"><button onclick="Controllers.changePage('global', -1)" class="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-200 bg-white shadow-sm font-bold transition-colors">Anterior</button><button onclick="Controllers.changePage('global', 1)" class="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-200 bg-white shadow-sm font-bold transition-colors">Siguiente</button></div>
                </div>
            </div>
        </div>`,
    concepts: () => `
        <div class="flex flex-col h-full gap-5 fade-in pb-5 min-w-0">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center no-print flex-shrink-0 w-full">
                <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto flex-1">
                    <div class="relative flex-grow sm:flex-grow-0 w-full sm:w-auto min-w-[220px]">
                        <i class="fas fa-search absolute left-4 top-3 text-gray-400 text-sm"></i>
                        <input type="text" id="c-search" placeholder="Buscar ClaveProd, Desc, Tercero..." class="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm w-full outline-none focus:ring-2 focus:ring-corporate-500 bg-gray-50 transition-shadow" oninput="Controllers.handleFilter('concepts')">
                    </div>
                    <select id="c-periodo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('concepts')">${Controllers.getPeriodOptions()}</select>
                    <select id="c-clase" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('concepts')"><option value="">Toda la Empresa</option><option value="Ingreso">Solo Ventas</option><option value="Egreso">Solo Gastos</option></select>
                    <select id="c-tipo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('concepts')"><option value="">Tipo (I/E/P/N)</option><option value="I">Ingreso (I)</option><option value="E">Egreso (E)</option><option value="P">Pago (P)</option><option value="N">Nómina (N)</option></select>
                    <select id="c-metodo" class="border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none bg-white w-full sm:w-auto flex-1 sm:flex-none font-medium text-gray-700 transition-shadow focus:ring-2 focus:ring-corporate-500" onchange="Controllers.handleFilter('concepts')"><option value="">Método Pago</option><option value="PUE">PUE</option><option value="PPD">PPD</option></select>
                </div>
                <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
                    <div class="relative w-full sm:w-auto">
                        <button class="btn-cols w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center" onclick="document.getElementById('c-col-drop').classList.toggle('hidden')"><i class="fas fa-columns mr-2 text-corporate-500"></i> Columnas</button>
                        <div id="c-col-drop" class="col-dropdown hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 max-h-80 overflow-y-auto"></div>
                    </div>
                    <button onclick="Controllers.exportExcel('concepts')" class="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-all flex items-center justify-center"><i class="fas fa-file-excel mr-2"></i> Exportar Conceptos</button>
                </div>
            </div>
            <div class="datagrid-container min-w-0 w-full shadow-sm rounded-2xl">
                <div class="overflow-auto flex-1 w-full"><table class="datagrid"><thead id="c-head"></thead><tbody id="c-body"></tbody><tfoot id="c-foot"></tfoot></table></div>
                <div class="bg-gray-50 border-t border-gray-200 p-3 text-xs text-gray-600 font-medium flex justify-between items-center flex-wrap gap-2 rounded-b-2xl">
                    <div class="flex items-center gap-4"><span id="c-count" class="font-bold text-gray-700">0 registros</span><select id="c-limit" class="border border-gray-300 rounded-lg outline-none py-1.5 px-3 font-medium bg-white" onchange="Controllers.changeLimit('concepts', this.value)"><option value="50">50/pág</option><option value="100">100/pág</option><option value="500">500/pág</option></select></div>
                    <div class="flex gap-2"><button onclick="Controllers.changePage('concepts', -1)" class="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-200 bg-white shadow-sm font-bold transition-colors">Anterior</button><button onclick="Controllers.changePage('concepts', 1)" class="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-200 bg-white shadow-sm font-bold transition-colors">Siguiente</button></div>
                </div>
            </div>
        </div>`
};
