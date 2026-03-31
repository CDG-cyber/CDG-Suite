export class TaxValidator {
    static validateCFDI40(cfdiData) {
        let risks = []; let isDeducible = true;
        if (cfdiData.version === '4.0') {
            if (!cfdiData.receptor.regimen) { risks.push("🔴 RECHAZO: Falta Régimen Fiscal del Receptor."); isDeducible = false; }
            if (!cfdiData.receptor.cp) { risks.push("🔴 RECHAZO: Falta Código Postal del Receptor."); isDeducible = false; }
        }
        const regimen = cfdiData.receptor.regimen; const uso = cfdiData.receptor.usoCFDI;
        if (regimen === '605' && !['S01', 'CP01'].includes(uso)) {
            risks.push(`🟡 RIESGO: Uso CFDI '${uso}' no es deducible para Régimen 605.`); isDeducible = false;
        }
        if (cfdiData.metodoPago === 'PUE' && cfdiData.formaPago === '99') {
            risks.push("🔴 ERROR SAT: Método PUE no puede tener Forma de Pago 99."); isDeducible = false;
        }
        if (cfdiData.metodoPago === 'PPD' && cfdiData.formaPago && cfdiData.formaPago !== '99') {
            risks.push("🔴 ERROR SAT: Método PPD debe llevar Forma de Pago 99 exclusivamente."); isDeducible = false;
        }
        if (cfdiData.tipo === 'I' && cfdiData.formaPago === '01' && cfdiData.total > 2000) {
            risks.push("🔴 NO DEDUCIBLE (LISR): Pago en Efectivo (01) mayor a $2,000."); isDeducible = false;
        }
        if(cfdiData.conceptos && cfdiData.conceptos.some(c => c.objetoImp === '01')) {
            risks.push("⚠️ ADVERTENCIA: Contiene conceptos 'No objeto de impuesto (01)'.");
        }
        return { risks, isDeducible };
    }
}