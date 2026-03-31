import { Utils } from '../core/utils.js';

export const ExcelService = {
    exportToExcel: async (data, columns, title, fileName, empresaInfo) => {
        Utils.showToast("Generando reporte Excel Enterprise...");
        const workbook = new ExcelJS.Workbook();
        
        const worksheet = workbook.addWorksheet(title, { 
            views: [{ state: 'frozen', ySplit: 4, showGridLines: false }] 
        });

        const titleCell = worksheet.getCell('A1');
        titleCell.value = `CDG FISCAL Y CONTABLE ENTERPRISE - ${title.toUpperCase()}`;
        titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0f2032' } }; 
        titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

        const subTitleCell = worksheet.getCell('A2');
        subTitleCell.value = `Empresa: ${empresaInfo.nombre || ''} (${empresaInfo.rfc}) | Fecha de Emisión: ${new Date().toLocaleDateString()}`;
        subTitleCell.font = { name: 'Arial', size: 10, color: { argb: 'FF475569' }, italic: true };
        subTitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        const visibleCols = columns.filter(c => c.visible);
        
        worksheet.getRow(4).values = visibleCols.map(c => c.label);
        const headerRow = worksheet.getRow(4);
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334e68' } }; 
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = { top: { style: 'medium', color: { argb: 'FFd4af37' } }, bottom: { style: 'medium', color: { argb: 'FFd4af37' } } };
        });

        data.forEach((row, i) => {
            const rowData = visibleCols.map(c => {
                let val = Utils.resolveNested(row, c.id);
                return c.isCurrency ? (parseFloat(val) || 0) : val;
            });
            const excelRow = worksheet.addRow(rowData);
            
            visibleCols.forEach((col, idx) => { 
                const cell = excelRow.getCell(idx+1);
                if(col.isCurrency) cell.numFmt = '"$"#,##0.00'; 
                cell.font = { name: 'Arial', size: 9.5, color: { argb: 'FF334155' } };
                cell.alignment = { vertical: 'middle', horizontal: col.isCurrency ? 'right' : (col.align || 'left') };
                cell.border = { bottom: { style: 'hair', color: { argb: 'FFe2e8f0' } } };
                if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFf8fafc' } };
            });
        });

        visibleCols.forEach((c, i) => {
            let calculatedWidth = Math.max(c.label.length * 1.3, 14);
            worksheet.getColumn(i+1).width = Math.min(calculatedWidth, 45); 
        });
        
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${fileName}.xlsx`);
        Utils.showToast("Reporte Excel descargado con éxito.", "success");
    }
};