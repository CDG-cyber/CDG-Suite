import { State } from '../state/store.js';
import { Utils } from '../core/utils.js';
import { ChartManager } from '../services/chartService.js';
import { ExcelService } from '../services/excelService.js';

export const Controllers = {
    gridData: { global: [], concepts: [] },
    
    getPeriodOptions: () => {
        if (!State.xmlList || State.xmlList.length === 0) return '<option value="">Todos los Periodos</option>';
        const periods = [...new Set(State.xmlList.map(x => x.periodo))].sort().reverse();
        return '<option value="">Todos los Periodos</option>' + periods.map(p => `<option value="${p}">${p}</option>`).join('');
    },
    
    run_dashboard: () => {
        if(!State.xmlList.length) return;
        let s = { ing:0, egr:0, ivaT16:0, ivaT8:0, ivaT0:0, exentoT:0, ivaA16:0, ivaA8:0, isr10:0, isrRes:0 }; 
        let mData = {};
        
        State.xmlList.forEach(x => {
            const m = x.periodo; if(!mData[m]) mData[m] = { ing:0, egr:0 };
            
            if (x.clase === 'Ingreso' && x.tipo === 'I') { 
                s.ing += x.total; 
                s.ivaT16 += x.impuestos.iva16; 
                s.ivaT8 += x.impuestos.iva8;
                s.ivaT0 += x.impuestos.base0;
                s.exentoT += x.impuestos.exento;
                mData[m].ing += x.total; 
            }
            if (x.clase === 'Egreso' && x.tipo === 'I') { 
                s.egr += x.total; 
                s.ivaA16 += x.impuestos.iva16;
                s.ivaA8 += x.impuestos.iva8;
                mData[m].egr += x.total; 
            }
            
            s.isr10 += x.impuestos.isr10; 
            s.isrRes += x.impuestos.isrResico;
        });

        document.getElementById('dash-ing').innerText = Utils.formatCurrency(s.ing); 
        document.getElementById('dash-egr').innerText = Utils.formatCurrency(s.egr);
        document.getElementById('dash-flujo').innerText = Utils.formatCurrency(s.ing - s.egr); 
        
        document.getElementById('dash-iva-t16').innerText = Utils.formatCurrency(s.ivaT16);
        document.getElementById('dash-iva-t8').innerText = Utils.formatCurrency(s.ivaT8);
        document.getElementById('dash-iva-t0').innerText = Utils.formatCurrency(s.ivaT0);
        document.getElementById('dash-exento-t').innerText = Utils.formatCurrency(s.exentoT);
        
        document.getElementById('dash-iva-a16').innerText = Utils.formatCurrency(s.ivaA16);
        document.getElementById('dash-iva-a8').innerText = Utils.formatCurrency(s.ivaA8);
        document.getElementById('dash-isr-10').innerText = Utils.formatCurrency(s.isr10);
        document.getElementById('dash-isr-res').innerText = Utils.formatCurrency(s.isrRes);

        const labels = Object.keys(mData).sort();
        ChartManager.render('canvas-trend', { type: 'bar', data: { labels, datasets: [{ label: 'Ingresos', data: labels.map(l => mData[l].ing), backgroundColor: '#334e68', borderRadius: 4 }, { label: 'Egresos', data: labels.map(l => mData[l].egr), backgroundColor: '#d4af37', borderRadius: 4 }]}, options: { responsive: true, maintainAspectRatio: false } });

        let pL = [...labels], pI = labels.map(l=>mData[l].ing), pE = labels.map(l=>mData[l].egr);
        let aI = new Array(pI.length-1).fill(null); aI.push(pI[pI.length-1]); let aE = new Array(pE.length-1).fill(null); aE.push(pE[pE.length-1]);
        if(labels.length >= 2) {
            const rI = Utils.linearRegression(pI), rE = Utils.linearRegression(pE);
            for(let i=1; i<=3; i++) { pL.push(`M+${i}`); aI.push(Math.max(0, rI.m*(labels.length-1+i)+rI.b)); aE.push(Math.max(0, rE.m*(labels.length-1+i)+rE.b)); }
        }
        ChartManager.render('canvas-forecast', { type: 'line', data: { labels: pL, datasets: [{ label: 'Ing', data: pI, borderColor: '#334e68', tension:0.3 }, { label: 'Ing(Proy)', data: aI, borderColor: '#334e68', borderDash:[5,5], tension:0.3 }, { label: 'Egr', data: pE, borderColor: '#d4af37', tension:0.3 }, { label: 'Egr(Proy)', data: aE, borderColor: '#d4af37', borderDash:[5,5], tension:0.3 }]}, options: { responsive: true, maintainAspectRatio: false } });
    },

    run_audit: () => {
        let html = ''; let ok=0, fail=0;
        State.xmlList.forEach(x => {
            if (x.tipo === 'P') return; 
            const bad = x.alertasFiscales && x.alertasFiscales.length > 0;
            if(bad) fail++; else ok++;
            html += `<tr class="${bad ? 'bg-red-50/50' : ''}">
                <td class="text-center">${bad ? '<span class="badge badge-danger">Riesgo</span>' : '<span class="badge badge-success"><i class="fas fa-check mr-1"></i> OK</span>'}</td>
                <td><div class="font-bold text-gray-800">${x.serie||''}${x.folio||'S/F'}</div><div class="text-[10px] text-gray-400 font-mono">${x.uuid}</div></td>
                <td class="truncate max-w-[200px]" title="${Utils.escapeHTML(x.tercero)}">${Utils.escapeHTML(x.tercero)}</td>
                <td class="text-right font-black ${bad?'text-red-700':'text-gray-800'}">${Utils.formatCurrency(x.total)}</td>
                <td class="text-xs whitespace-normal min-w-[300px]">
                    ${bad ? `<ul class="list-disc pl-4 text-red-700 font-medium">${x.alertasFiscales.map(a => `<li>${a}</li>`).join('')}</ul>` : '<span class="text-green-600 font-medium">Cumple estructura CFDI 4.0</span>'}
                </td>
            </tr>`;
        });
        document.getElementById('audit-body').innerHTML = html || `<tr><td colspan="5" class="text-center p-8 text-gray-400">Sin datos</td></tr>`;
        document.getElementById('audit-ok').innerText = ok; document.getElementById('audit-fail').innerText = fail;
    },

    run_recon: () => {
        const render = () => {
            const statusF = document.getElementById('recon-filter').value;
            const ppds = State.xmlList.filter(x => x.metodoPago === 'PPD' && x.tipo !== 'P');
            const reps = State.xmlList.filter(x => x.tipo === 'P');
            const notasCredito = State.xmlList.filter(x => x.tipo === 'E');
            
            let pMap = {};
            ppds.forEach(p => { pMap[p.uuid] = { pagado: 0, abonadoNC: 0, reps: [], ncs: [] }; });
            
            reps.forEach(r => r.pagos.forEach(p => { 
                if(pMap[p.uuidDR]) {
                    pMap[p.uuidDR].pagado += p.impPagado; 
                    pMap[p.uuidDR].reps.push(`${r.serie||''}${r.folio||r.uuid.substring(0,8)}`);
                }
            }));

            notasCredito.forEach(nc => {
                if (nc.cfdiRelacionados) {
                    const uuidsRelacionados = nc.cfdiRelacionados.split(',').map(u => u.trim());
                    const uuidsValidos = uuidsRelacionados.filter(u => pMap[u]);
                    if (uuidsValidos.length > 0) {
                        const montoAAplicar = nc.total / uuidsValidos.length;
                        uuidsValidos.forEach(u => {
                            pMap[u].abonadoNC += montoAAplicar;
                            pMap[u].ncs.push(`${nc.serie||''}${nc.folio||nc.uuid.substring(0,8)}`);
                        });
                    }
                }
            });

            let html = ''; let tPpd=0, tPag=0, tNc=0, tSal=0;
            
            const dataObj = ppds.map(x => {
                let objMap = pMap[x.uuid];
                let pagado = objMap.pagado;
                let abonadoNC = objMap.abonadoNC;
                let saldo = Math.max(0, x.total - pagado - abonadoNC);
                let stat = saldo <= 0.1 ? 'Saldado' : ((pagado + abonadoNC) > 0 ? 'Parcial' : 'Pendiente');
                return { ...x, pagado, abonadoNC, saldo, stat, repsAsociados: objMap.reps.join(', '), ncsAsociadas: objMap.ncs.join(', ') };
            }).filter(x => statusF === '' || x.stat === statusF);

            dataObj.forEach(x => {
                tPpd += x.total; tPag += x.pagado; tNc += x.abonadoNC; tSal += x.saldo;
                let bCls = x.stat==='Saldado' ? 'badge-success' : (x.stat==='Parcial' ? 'badge-warning' : 'badge-danger');
                let tCls = x.clase==='Ingreso' ? 'text-blue-600' : 'text-orange-600';
                html += `<tr>
                    <td class="text-center"><span class="badge ${bCls}">${x.stat}</span></td>
                    <td class="font-bold ${tCls}">${x.clase}</td><td>${x.fecha.split('T')[0]}</td><td class="font-bold">${x.serie||''}${x.folio||'S/F'}</td>
                    <td class="truncate max-w-[150px]">${Utils.escapeHTML(x.tercero)}</td>
                    <td class="text-right font-bold text-gray-800">${Utils.formatCurrency(x.total)}</td>
                    <td class="text-right font-bold text-green-700 bg-green-50/50">${Utils.formatCurrency(x.pagado)}</td>
                    <td class="text-right font-bold text-blue-700 bg-blue-50/50">${Utils.formatCurrency(x.abonadoNC)}</td>
                    <td class="text-right font-bold text-red-600 bg-red-50/50">${Utils.formatCurrency(x.saldo)}</td>
                    <td class="text-[10px] text-gray-500 whitespace-normal min-w-[120px]">
                        ${x.repsAsociados ? `<b>REP:</b> ${x.repsAsociados}<br>` : ''}
                        ${x.ncsAsociadas ? `<b>NC:</b> ${x.ncsAsociadas}` : ''}
                        ${!x.repsAsociados && !x.ncsAsociadas ? '-' : ''}
                    </td>
                </tr>`;
            });
            document.getElementById('recon-body').innerHTML = html || `<tr><td colspan="10" class="text-center p-8 text-gray-400">Sin facturas PPD</td></tr>`;
            document.getElementById('r-tot-ppd').innerText = Utils.formatCurrency(tPpd); 
            document.getElementById('r-tot-pag').innerText = Utils.formatCurrency(tPag); 
            document.getElementById('r-tot-nc').innerText = Utils.formatCurrency(tNc); 
            document.getElementById('r-tot-sal').innerText = Utils.formatCurrency(tSal);
        };
        document.getElementById('recon-filter').addEventListener('change', render); render();
    },

    run_global: () => { Controllers.renderColMenu('global', 'g-col-drop'); Controllers.handleFilter('global'); },
    run_concepts: () => { Controllers.renderColMenu('concepts', 'c-col-drop'); Controllers.handleFilter('concepts'); },

    renderColMenu: (type, elId) => {
        const drop = document.getElementById(elId);
        drop.innerHTML = State.tables[type].columns.map((c, idx) => `
            <div class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-50 last:border-0" onclick="Controllers.toggleCol('${type}', ${idx}, event)">
                <input type="checkbox" class="mr-3 rounded text-corporate-600 w-4 h-4" ${c.visible ? 'checked' : ''}>
                <label class="text-xs text-gray-700 font-medium cursor-pointer pointer-events-none">${c.label}</label>
            </div>
        `).join('');
    },

    toggleCol: (type, idx, event) => {
        event.stopPropagation();
        State.tables[type].columns[idx].visible = !State.tables[type].columns[idx].visible;
        Controllers.renderColMenu(type, type === 'global' ? 'g-col-drop' : 'c-col-drop');
        Controllers.renderGrid(type);
    },

    handleFilter: (type) => {
        const isG = type === 'global'; const pfx = isG ? 'g' : 'c';
        const s = document.getElementById(`${pfx}-search`).value.toLowerCase();
        const c = document.getElementById(`${pfx}-clase`).value;
        const t = document.getElementById(`${pfx}-tipo`).value;
        const m = document.getElementById(`${pfx}-metodo`).value;
        const p = document.getElementById(`${pfx}-periodo`).value;

        let baseData = [];
        if (isG) {
            baseData = State.xmlList;
        } else {
            State.xmlList.forEach(cfdi => cfdi.conceptos.forEach(con => {
                baseData.push({
                    ...con, cClase: cfdi.clase, cFecha: cfdi.fecha, cPeriodo: cfdi.periodo, 
                    cFolio: cfdi.folio, cSerie: cfdi.serie, cTercero: cfdi.tercero, cTipo: cfdi.tipo, 
                    cMetodo: cfdi.metodoPago, cSearchStr: `${cfdi.searchStr} ${con.claveProd} ${con.desc}`.toLowerCase()
                });
            }));
        }

        Controllers.gridData[type] = baseData.filter(x => {
            if (c && (isG ? x.clase : x.cClase) !== c) return false;
            if (t && (isG ? x.tipo : x.cTipo) !== t) return false;
            if (m && (isG ? x.metodoPago : x.cMetodo) !== m) return false;
            if (p && (isG ? x.periodo : x.cPeriodo) !== p) return false;
            if (s && !(isG ? x.searchStr : x.cSearchStr).includes(s)) return false;
            return true;
        });

        State.tables[type].page = 1; Controllers.sortData(type);
    },

    sortData: (type) => {
        const st = State.tables[type];
        Controllers.gridData[type].sort((a, b) => {
            let vA = Utils.resolveNested(a, st.sortCol); let vB = Utils.resolveNested(b, st.sortCol);
            if(typeof vA === 'string') vA = vA.toLowerCase(); if(typeof vB === 'string') vB = vB.toLowerCase();
            if (vA < vB) return st.sortAsc ? -1 : 1; if (vA > vB) return st.sortAsc ? 1 : -1;
            return 0;
        });
        Controllers.renderGrid(type);
    },

    setSort: (type, colId) => {
        const st = State.tables[type];
        if (st.sortCol === colId) st.sortAsc = !st.sortAsc; else { st.sortCol = colId; st.sortAsc = true; }
        Controllers.sortData(type);
    },

    changePage: (type, dir) => {
        const st = State.tables[type]; const max = Math.ceil(Controllers.gridData[type].length / st.limit);
        st.page += dir; if (st.page < 1) st.page = 1; if (st.page > max) st.page = max || 1;
        Controllers.renderGrid(type);
    },

    changeLimit: (type, limit) => { State.tables[type].limit = parseInt(limit); State.tables[type].page = 1; Controllers.renderGrid(type); },

    renderGrid: (type) => {
        const isG = type === 'global'; const pfx = isG ? 'g' : 'c';
        const st = State.tables[type]; const data = Controllers.gridData[type];
        const visibleCols = st.columns.filter(c => c.visible);
        
        document.getElementById(`${pfx}-head`).innerHTML = `<tr>` + visibleCols.map(c => `
            <th class="text-${c.align}" onclick="Controllers.setSort('${type}', '${c.id}')">
                ${c.label} <i class="fas fa-sort${st.sortCol===c.id ? (st.sortAsc?'-up':'-down') : ''} ml-1 ${st.sortCol===c.id ? 'text-corporate-500' : 'text-gray-300'}"></i>
            </th>
        `).join('') + `</tr>`;

        const start = (st.page - 1) * st.limit; const paginated = data.slice(start, start + st.limit);
        
        document.getElementById(`${pfx}-body`).innerHTML = paginated.map(row => `<tr>` + visibleCols.map(c => {
                let val = Utils.resolveNested(row, c.id);
                if(c.isCurrency) val = Utils.formatCurrency(val);
                else if(c.id.toLowerCase().includes('fecha')) val = val ? val.split('T')[0] : '';
                else if(c.id === 'clase' || c.id === 'cClase') val = `<span class="badge ${val==='Ingreso'?'badge-info':(val==='Egreso'?'badge-warning':'badge-purple')}">${val}</span>`;
                else if(c.id === 'tipo' || c.id === 'cTipo') val = `<span class="font-bold text-gray-700">${val}</span>`;
                else if(c.id === 'metodoPago' || c.id === 'cMetodo') val = `<span class="badge ${val==='PUE'?'badge-gray':'badge-warning'}">${val||'-'}</span>`;
                else if(typeof val === 'string' && val.length > 30 && !c.id.includes('uuid')) val = `<div class="truncate max-w-[200px]" title="${Utils.escapeHTML(val)}">${Utils.escapeHTML(val)}</div>`;
                else val = Utils.escapeHTML(val);
                return `<td class="text-${c.align} ${c.isCurrency?'font-medium text-gray-800':''}">${val || '-'}</td>`;
            }).join('') + `</tr>`).join('') || `<tr><td colspan="${visibleCols.length}" class="text-center p-12 text-gray-500 font-medium text-base"><i class="fas fa-search mb-3 block text-3xl text-gray-300"></i> No hay datos que coincidan con los filtros de búsqueda</td></tr>`;

        document.getElementById(`${pfx}-foot`).innerHTML = `<tr>` + visibleCols.map((c, i) => {
            if(i === 0) return `<td>TOTALES GLOBALES:</td>`;
            if(c.isCurrency && !['tc', 'vUnitario'].includes(c.id)) {
                const sum = data.reduce((acc, row) => acc + (parseFloat(Utils.resolveNested(row, c.id)) || 0), 0);
                return `<td class="text-${c.align}">${Utils.formatCurrency(sum)}</td>`;
            }
            return `<td></td>`;
        }).join('') + `</tr>`;

        document.getElementById(`${pfx}-count`).innerText = `${data.length > 0 ? start + 1 : 0} - ${Math.min(start + st.limit, data.length)} de ${data.length} registros`;
    },

    exportDIOT: () => {
        const gastos = State.xmlList.filter(c => c.clase === 'Egreso' && c.tipo === 'I' && c.esDeducible);
        if(!gastos.length) return Utils.showToast("No hay gastos deducibles para DIOT.", "error");
        
        let provs = {};
        gastos.forEach(x => {
            const r = x.emisor.rfc; if(!provs[r]) provs[r] = { rfc: r, base16:0, iva16:0, iva8:0, base8:0, exento:0, ivaRet:0 };
            provs[r].base16 += x.impuestos.base16; provs[r].iva16 += x.impuestos.iva16;
            provs[r].base8 += x.impuestos.base8; provs[r].iva8 += x.impuestos.iva8;
            provs[r].exento += x.impuestos.exento; provs[r].ivaRet += x.impuestos.ivaRet;
        });

        let rows = [];
        for(let r in provs) {
            let p = provs[r]; let row = new Array(54).fill('');
            row[0] = (p.rfc==='XEXX010101000')?'05':(p.rfc==='XAXX010101000'?'15':'04');
            row[1] = '85'; row[2] = p.rfc;
            if(p.base8>0) { row[7] = Math.round(p.base8); row[17] = Math.round(p.iva8); }
            if(p.base16>0) { row[11] = Math.round(p.base16); row[21] = Math.round(p.iva16); }
            if(p.exento>0) { row[16] = Math.round(p.exento); }
            if(p.ivaRet>0) row[47] = Math.round(p.ivaRet);
            row[53] = '01'; rows.push(row.join('|'));
        }
        saveAs(new Blob([rows.join('\r\n')], { type: "text/plain;charset=utf-8" }), `DIOT_2026_${State.empresa.rfc}.txt`);
        Utils.showToast("TXT DIOT Generado.", "success");
    },

    exportExcel: (type) => ExcelService.exportToExcel(Controllers.gridData[type], State.tables[type].columns, type === 'global' ? 'Análisis Global CFDI' : 'Minería de Conceptos', `${type === 'global' ? 'Global' : 'Conceptos'}_${State.empresa.rfc}`, State.empresa),
    
    exportExcelRecon: () => {
        const statusF = document.getElementById('recon-filter') ? document.getElementById('recon-filter').value : '';
        const ppds = State.xmlList.filter(x => x.metodoPago === 'PPD' && x.tipo !== 'P');
        const reps = State.xmlList.filter(x => x.tipo === 'P');
        const notasCredito = State.xmlList.filter(x => x.tipo === 'E');
        
        let pMap = {};
        ppds.forEach(p => { pMap[p.uuid] = { pagado: 0, abonadoNC: 0, reps: [], ncs: [] }; });
        
        reps.forEach(r => r.pagos.forEach(p => { 
            if(pMap[p.uuidDR]) {
                pMap[p.uuidDR].pagado += p.impPagado; 
                pMap[p.uuidDR].reps.push(`${r.serie||''}${r.folio||r.uuid.substring(0,8)}`);
            }
        }));

        notasCredito.forEach(nc => {
            if (nc.cfdiRelacionados) {
                const uuidsRelacionados = nc.cfdiRelacionados.split(',').map(u => u.trim());
                const uuidsValidos = uuidsRelacionados.filter(u => pMap[u]);
                if (uuidsValidos.length > 0) {
                    const montoAAplicar = nc.total / uuidsValidos.length;
                    uuidsValidos.forEach(u => {
                        pMap[u].abonadoNC += montoAAplicar;
                        pMap[u].ncs.push(`${nc.serie||''}${nc.folio||nc.uuid.substring(0,8)}`);
                    });
                }
            }
        });
        
        let data = ppds.map(x => {
            let objMap = pMap[x.uuid];
            let pagado = objMap.pagado;
            let abonadoNC = objMap.abonadoNC;
            let saldo = Math.max(0, x.total - pagado - abonadoNC);
            let stat = saldo <= 0.1 ? 'Saldado' : ((pagado + abonadoNC) > 0 ? 'Parcial' : 'Pendiente');
            
            let documentos = [];
            if(objMap.reps.length) documentos.push(`REP: ${objMap.reps.join(', ')}`);
            if(objMap.ncs.length) documentos.push(`NC: ${objMap.ncs.join(', ')}`);

            return { ...x, pagado, abonadoNC, saldo, stat, vinculados: documentos.join(' | ') };
        });

        if (statusF) data = data.filter(x => x.stat === statusF);
        
        const cols = [
            { id: 'stat', label: 'Estatus', visible: true, align: 'center' }, { id: 'clase', label: 'Clasificación', visible: true, align: 'center' }, 
            { id: 'fecha', label: 'Fecha PPD', visible: true, align: 'center' }, { id: 'folio', label: 'Folio', visible: true, align: 'left' }, 
            { id: 'tercero', label: 'Tercero', visible: true, align: 'left' }, { id: 'total', label: 'Total PPD', isCurrency: true, visible: true }, 
            { id: 'pagado', label: 'Pagado (REP)', isCurrency: true, visible: true }, { id: 'abonadoNC', label: 'Aplicado (NC)', isCurrency: true, visible: true }, 
            { id: 'saldo', label: 'Saldo Pendiente', isCurrency: true, visible: true }, { id: 'vinculados', label: 'Documentos Vinculados', visible: true, align: 'left' }, 
            { id: 'uuid', label: 'UUID PPD', visible: true, align: 'left' }
        ];
        ExcelService.exportToExcel(data, cols, 'Conciliación Integral PPD (REPs y NC)', `Cartera_${State.empresa.rfc}`, State.empresa);
    }
};