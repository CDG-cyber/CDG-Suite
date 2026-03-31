import { TaxValidator } from './taxValidator.js';

export class XMLParser {
    static getNode(ctx, name) {
        let n = ctx.getElementsByTagNameNS('*', name);
        if(!n.length) n = ctx.getElementsByTagName(`cfdi:${name}`);
        if(!n.length) n = ctx.getElementsByTagName(`tfd:${name}`);
        if(!n.length) n = ctx.getElementsByTagName(`pago20:${name}`);
        return n;
    }
    
    static safeAttr(node, attr, def='') { return node && node.hasAttribute(attr) ? node.getAttribute(attr) : def; }
    static safeFloat(val) { const n = parseFloat(val); return isNaN(n) ? 0 : n; }

    static parse(xmlString, filename) {
        try {
            const xmlDoc = new DOMParser().parseFromString(xmlString, "text/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length) throw new Error("XML Malformado");

            const comp = this.getNode(xmlDoc, 'Comprobante')[0];
            if (!comp) throw new Error("No es un comprobante CFDI válido");

            const emisor = this.getNode(xmlDoc, 'Emisor')[0];
            const receptor = this.getNode(xmlDoc, 'Receptor')[0];
            const timbre = this.getNode(xmlDoc, 'TimbreFiscalDigital')[0];

            const cfdi = {
                fileName: filename, uuid: this.safeAttr(timbre, 'UUID', `GEN_${Date.now()}`).toUpperCase(),
                version: this.safeAttr(comp, 'Version'), fecha: this.safeAttr(comp, 'Fecha'),
                tipo: this.safeAttr(comp, 'TipoDeComprobante').toUpperCase(),
                serie: this.safeAttr(comp, 'Serie'), folio: this.safeAttr(comp, 'Folio'),
                metodoPago: this.safeAttr(comp, 'MetodoPago'), formaPago: this.safeAttr(comp, 'FormaPago'),
                moneda: this.safeAttr(comp, 'Moneda', 'MXN'), tc: this.safeFloat(this.safeAttr(comp, 'TipoCambio')) || 1,
                subtotal: this.safeFloat(this.safeAttr(comp, 'SubTotal')), descuento: this.safeFloat(this.safeAttr(comp, 'Descuento')),
                total: this.safeFloat(this.safeAttr(comp, 'Total')),
                emisor: { rfc: this.safeAttr(emisor, 'Rfc'), nombre: this.safeAttr(emisor, 'Nombre'), regimen: this.safeAttr(emisor, 'RegimenFiscal') },
                receptor: { rfc: this.safeAttr(receptor, 'Rfc'), nombre: this.safeAttr(receptor, 'Nombre'), regimen: this.safeAttr(receptor, 'RegimenFiscalReceptor'), usoCFDI: this.safeAttr(receptor, 'UsoCFDI'), cp: this.safeAttr(receptor, 'DomicilioFiscalReceptor') },
                cfdiRelacionados: Array.from(this.getNode(xmlDoc, 'CfdiRelacionado')).map(n => this.safeAttr(n, 'UUID')).join(', '),
                conceptos: [], pagos: [],
                impuestos: { base16:0, iva16:0, base8:0, iva8:0, base0:0, exento:0, ieps:0, isr10:0, isrResico:0, isrOtro:0, ivaRet:0 }
            };

            Array.from(this.getNode(xmlDoc, 'Concepto')).forEach(c => {
                let cData = {
                    claveProd: this.safeAttr(c, 'ClaveProdServ'), cant: this.safeFloat(this.safeAttr(c, 'Cantidad')),
                    unidad: this.safeAttr(c, 'ClaveUnidad'), desc: this.safeAttr(c, 'Descripcion'),
                    vUnitario: this.safeFloat(this.safeAttr(c, 'ValorUnitario')), importe: this.safeFloat(this.safeAttr(c, 'Importe')),
                    objetoImp: this.safeAttr(c, 'ObjetoImp'), descuento: this.safeFloat(this.safeAttr(c, 'Descuento')),
                    base16:0, iva16:0, base8:0, iva8:0, base0:0, exento:0, ieps:0, isrRet:0, isr10:0, isrResico:0, isrOtro:0, ivaRet:0
                };
                
                Array.from(this.getNode(c, 'Traslado')).forEach(t => {
                    let imp = this.safeAttr(t, 'Impuesto'), tasa = this.safeFloat(this.safeAttr(t, 'TasaOCuota'));
                    let importe = this.safeFloat(this.safeAttr(t, 'Importe')), base = this.safeFloat(this.safeAttr(t, 'Base'));
                    if (imp === '002') {
                        if (this.safeAttr(t, 'TipoFactor') === 'Exento') { cfdi.impuestos.exento += base; cData.exento += base; }
                        else if (Math.abs(tasa - 0.16) < 0.01) { cfdi.impuestos.base16 += base; cfdi.impuestos.iva16 += importe; cData.base16 += base; cData.iva16 += importe;}
                        else if (Math.abs(tasa - 0.08) < 0.01) { cfdi.impuestos.base8 += base; cfdi.impuestos.iva8 += importe; cData.base8 += base; cData.iva8 += importe;}
                        else { cfdi.impuestos.base0 += base; cData.base0 += base;}
                    }
                    if (imp === '003') { cfdi.impuestos.ieps += importe; cData.ieps += importe; }
                });

                Array.from(this.getNode(c, 'Retencion')).forEach(r => {
                    let imp = this.safeAttr(r, 'Impuesto'), importe = this.safeFloat(this.safeAttr(r, 'Importe'));
                    let baseExp = this.safeFloat(this.safeAttr(r, 'Base'));
                    if (imp === '001') {
                        cData.isrRet += importe;
                        let tasaEfectiva = baseExp > 0 ? (importe / baseExp) : (importe / cData.importe);
                        if (Math.abs(tasaEfectiva - 0.10) < 0.01 || Math.abs(tasaEfectiva - 0.1066) < 0.01) {
                            cfdi.impuestos.isr10 += importe; cData.isr10 += importe;
                        }
                        else if (Math.abs(tasaEfectiva - 0.0125) < 0.001) {
                            cfdi.impuestos.isrResico += importe; cData.isrResico += importe;
                        }
                        else {
                            cfdi.impuestos.isrOtro += importe; cData.isrOtro += importe;
                        }
                    }
                    if (imp === '002') { cfdi.impuestos.ivaRet += importe; cData.ivaRet += importe; }
                });
                cfdi.conceptos.push(cData);
            });

            if (cfdi.tipo === 'P') {
                Array.from(this.getNode(xmlDoc, 'Pago')).forEach(p => {
                    let fechaP = this.safeAttr(p, 'FechaPago');
                    Array.from(this.getNode(p, 'DoctoRelacionado')).forEach(dr => {
                        cfdi.pagos.push({
                            uuidDR: this.safeAttr(dr, 'IdDocumento').toUpperCase(), impPagado: this.safeFloat(this.safeAttr(dr, 'ImpPagado')),
                            saldoAnt: this.safeFloat(this.safeAttr(dr, 'ImpSaldoAnt')), saldoInsoluto: this.safeFloat(this.safeAttr(dr, 'ImpSaldoInsoluto')),
                            monedaDR: this.safeAttr(dr, 'MonedaDR'), eqDR: this.safeFloat(this.safeAttr(dr, 'EquivalenciaDR')) || 1, fechaPago: fechaP
                        });
                    });
                });
            }

            const val = TaxValidator.validateCFDI40(cfdi);
            cfdi.alertasFiscales = val.risks; cfdi.esDeducible = val.isDeducible;
            return cfdi;
        } catch (error) { return { error: true, msg: error.message, fileName: filename }; }
    }
}