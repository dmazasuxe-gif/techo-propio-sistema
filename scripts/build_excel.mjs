import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

async function createExcelBase() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Techo Propio';
    workbook.created = new Date();

    // 1. Hoja INICIO
    const sheetInicio = workbook.addWorksheet('INICIO', {
        views: [{ showGridLines: false }]
    });
    
    // Add title
    sheetInicio.mergeCells('B2:F3');
    const titleCell = sheetInicio.getCell('B2');
    titleCell.value = 'TECHO PROPIO - GESTIÓN DE BENEFICIARIOS';
    titleCell.font = { name: 'Segoe UI', size: 24, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Placeholder for buttons
    const buttons = [
        '[ REGISTRAR BENEFICIARIO ]',
        '[ BUSCAR BENEFICIARIO ]',
        '[ NUEVA UBICACIÓN ]',
        '[ LISTA DE BENEFICIARIOS ]',
        '[ EXPORTAR BASE DE DATOS ]'
    ];

    buttons.forEach((text, i) => {
        const row = 6 + (i * 2);
        sheetInicio.mergeCells(`C${row}:E${row}`);
        const cell = sheetInicio.getCell(`C${row}`);
        cell.value = text;
        cell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Blue-600
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Ajustar anchos
    sheetInicio.getColumn('C').width = 15;
    sheetInicio.getColumn('D').width = 25;
    sheetInicio.getColumn('E').width = 15;

    // 2. CONFIGURACION
    // Por ahora la hacemos visible para facilitar el desarrollo (el usuario la ocultará luego)
    const sheetConfig = workbook.addWorksheet('CONFIGURACION');
    sheetConfig.addTable({
        name: 'TblConfiguracion',
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: [
            { name: 'Parametro' },
            { name: 'Valor' }
        ],
        rows: [
            ['Ultimo_ID_Beneficiario', '1'],
            ['Ultimo_ID_Familiar', '1']
        ]
    });

    sheetConfig.addTable({
        name: 'TblUbicacionesActivas',
        ref: 'D1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2' },
        columns: [{ name: 'Ubicacion' }],
        rows: [['JEPELACIO'], ['MOYOBAMBA']]
    });

    // 3. BD_BENEFICIARIOS
    const sheetBeneficiarios = workbook.addWorksheet('BD_BENEFICIARIOS');
    const benefCols = [
        'ID_Beneficiario', 'DNI', 'Nombres', 'Apellido_Paterno', 'Apellido_Materno',
        'Fecha_Nacimiento', 'Sexo', 'Estado_Civil', 'Celular', 'Correo',
        'Departamento', 'Provincia', 'Distrito', 'Ubicacion',
        'Centro_Poblado', 'Barrio_Sector', 'Calle', 'Manzana', 'Lote', 
        'Coordenada_X', 'Coordenada_Y', 'Direccion', 'Estado_Sincronizacion', 'Fecha_Sincronizacion'
    ];
    
    sheetBeneficiarios.addTable({
        name: 'TblBeneficiarios',
        ref: 'A1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: benefCols.map(c => ({ name: c })),
        rows: [
            ['TP-BEN-000001', '12345678', 'Juan', 'Perez', 'Gomez', '15/05/1980', 'Masculino', 'Casado', '999888777', 'juan@test.com', 'San Martin', 'Moyobamba', 'Jepelacio', 'JEPELACIO', 'Centro', 'Barrio 1', 'Calle Principal', 'A', '1', '-6.0', '-76.9', 'Calle Principal A-1', 'PENDIENTE', '']
        ]
    });

    // 4. BD_CARGA_FAMILIAR
    const sheetFamiliares = workbook.addWorksheet('BD_CARGA_FAMILIAR');
    const famCols = [
        'ID_Familiar', 'ID_Beneficiario', 'Parentesco', 'DNI', 'Nombres', 'Apellidos', 'Fecha_Nacimiento'
    ];
    sheetFamiliares.addTable({
        name: 'TblCargaFamiliar',
        ref: 'A1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2' },
        columns: famCols.map(c => ({ name: c })),
        rows: [
            ['TP-FAM-000001', 'TP-BEN-000001', 'Hijo', '87654321', 'Luis', 'Perez Rojas', '10/10/2010']
        ]
    });

    // 5. BD_UBICACIONES
    const sheetUbicaciones = workbook.addWorksheet('BD_UBICACIONES');
    const ubicCols = ['ID_Ubicacion', 'Nombre', 'Estado', 'Fecha_Creacion'];
    sheetUbicaciones.addTable({
        name: 'TblUbicaciones',
        ref: 'A1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2' },
        columns: ubicCols.map(c => ({ name: c })),
        rows: [
            ['UB-001', 'JEPELACIO', 'Activo', '25/08/2026'],
            ['UB-002', 'MOYOBAMBA', 'Activo', '25/08/2026']
        ]
    });

    // 6. Hoja JEPELACIO (Ejemplo generada dinámicamente)
    const sheetJep = workbook.addWorksheet('JEPELACIO');
    sheetJep.mergeCells('A1:E2');
    const jepTitle = sheetJep.getCell('A1');
    jepTitle.value = 'BENEFICIARIOS - JEPELACIO';
    jepTitle.font = { name: 'Segoe UI', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
    jepTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
    jepTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Table in JEPELACIO
    const viewCols = ['ID', 'DNI', 'Nombres', 'Apellidos', 'Celular', 'Direccion'];
    sheetJep.addTable({
        name: 'Tbl_JEPELACIO',
        ref: 'A4',
        headerRow: true,
        style: { theme: 'TableStyleMedium2' },
        columns: viewCols.map(c => ({ name: c })),
        rows: [
            ['TP-BEN-000001', '12345678', 'Juan', 'Perez Gomez', '999888777', 'Calle Principal A-1']
        ]
    });
    
    // Write to file
    const outPath = path.join(process.cwd(), 'techo_propio_excel', 'Techo_Propio_Base.xlsx');
    
    if (!fs.existsSync(path.dirname(outPath))) {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
    }
    
    await workbook.xlsx.writeFile(outPath);
    console.log(`Excel creado en: ${outPath}`);
}

createExcelBase().catch(console.error);
