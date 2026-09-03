Attribute VB_Name = "modImpresion"
Option Explicit

Public Sub CrearPlantillaFicha()
    Dim ws As Worksheet
    Dim sheetName As String
    sheetName = "FICHA_IMPRESION"
    
    ' Eliminar si existe
    Application.DisplayAlerts = False
    On Error Resume Next
    ThisWorkbook.Sheets(sheetName).Delete
    On Error GoTo 0
    Application.DisplayAlerts = True
    
    ' Crear nueva hoja
    Set ws = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    ws.Name = sheetName
    
    ' -------------------------
    ' CONFIGURAR HOJA Y TAMAÑOS
    ' -------------------------
    ws.Cells.Font.Name = "Arial"
    ws.Cells.Font.Size = 9
    ws.PageSetup.PaperSize = xlPaperA4
    ws.PageSetup.Orientation = xlPortrait
    ws.PageSetup.Zoom = False
    ws.PageSetup.FitToPagesWide = 1
    ws.PageSetup.FitToPagesTall = 1
    ws.PageSetup.LeftMargin = Application.InchesToPoints(0.2)
    ws.PageSetup.RightMargin = Application.InchesToPoints(0.2)
    ws.PageSetup.TopMargin = Application.InchesToPoints(0.2)
    ws.PageSetup.BottomMargin = Application.InchesToPoints(0.2)
    
    ' Anchos de columna (A-H)
    ws.Columns("A:A").ColumnWidth = 18
    ws.Columns("B:B").ColumnWidth = 18
    ws.Columns("C:C").ColumnWidth = 18
    ws.Columns("D:D").ColumnWidth = 18
    ws.Columns("E:E").ColumnWidth = 18
    ws.Columns("F:F").ColumnWidth = 18
    ws.Columns("G:G").ColumnWidth = 18
    ws.Columns("H:H").ColumnWidth = 18
    
    ' -------------------------
    ' SECCIÓN 1: ENCABEZADO
    ' -------------------------
    ws.Range("A1:E3").Merge
    ws.Range("A1").Value = "Ficha del Beneficiario — Techo Propio"
    ws.Range("A1").Font.Size = 16
    ws.Range("A1").Font.Bold = True
    ws.Range("A1").Font.Color = RGB(25, 42, 86) ' Azul oscuro
    
    ws.Range("A4:E4").Merge
    ws.Range("A4").Value = "Programa Construcción en Sitio Propio (CSP) — Constructora Maza Quiroz"
    ws.Range("A4").Font.Size = 9
    ws.Range("A4").Font.Color = RGB(100, 100, 100)
    
    ws.Range("G1:H1").Merge
    ws.Range("G1").Value = "EXP: [AQUÍ_EXP]"
    ws.Range("G1").Interior.Color = RGB(25, 42, 86)
    ws.Range("G1").Font.Color = RGB(255, 255, 255)
    ws.Range("G1").Font.Bold = True
    ws.Range("G1").HorizontalAlignment = xlCenter
    
    ws.Range("G2:H2").Merge
    ws.Range("G2").Value = "Expediente en Revisión"
    ws.Range("G2").Interior.Color = RGB(41, 128, 185)
    ws.Range("G2").Font.Color = RGB(255, 255, 255)
    ws.Range("G2").HorizontalAlignment = xlCenter
    
    ws.Range("F4:H4").Merge
    ws.Range("F4").Value = "Emitido: " & Format(Date, "dd 'de' mmmm 'de' yyyy")
    ws.Range("F4").HorizontalAlignment = xlRight
    ws.Range("F4").Font.Color = RGB(100, 100, 100)
    
    ' -------------------------
    ' SECCIÓN 2: DATOS DEL POSTULANTE
    ' -------------------------
    CrearTitulo ws, "A6:H6", "DATOS DEL POSTULANTE Y NÚCLEO FAMILIAR"
    
    ws.Range("A8:D8").Merge
    CrearCampo ws, "A8", "NOMBRES Y APELLIDOS DEL POSTULANTE"
    ws.Range("A9:D9").Merge
    ws.Range("A9").Name = "val_NombresCompletos"
    ws.Range("A9").Font.Size = 12
    ws.Range("A9").Font.Bold = True
    DibujarLinea ws.Range("A9:D9")
    
    ws.Range("F8:H8").Merge
    CrearCampo ws, "F8", "DNI DEL POSTULANTE"
    ws.Range("F9:H9").Merge
    ws.Range("F9").Name = "val_DNI"
    ws.Range("F9").Font.Size = 11
    ws.Range("F9").Font.Bold = True
    DibujarLinea ws.Range("F9:H9")
    
    ws.Range("A11:B11").Merge
    CrearCampo ws, "A11", "NOMBRES"
    ws.Range("A12:B12").Merge
    ws.Range("A12").Name = "val_Nombres"
    DibujarLinea ws.Range("A12:B12")
    
    ws.Range("C11:D11").Merge
    CrearCampo ws, "C11", "APELLIDO PATERNO"
    ws.Range("C12:D12").Merge
    ws.Range("C12").Name = "val_ApePaterno"
    DibujarLinea ws.Range("C12:D12")
    
    ws.Range("E11:F11").Merge
    CrearCampo ws, "E11", "APELLIDO MATERNO"
    ws.Range("E12:F12").Merge
    ws.Range("E12").Name = "val_ApeMaterno"
    DibujarLinea ws.Range("E12:F12")
    
    ws.Range("G11:H11").Merge
    CrearCampo ws, "G11", "FECHA DE NACIMIENTO"
    ws.Range("G12:H12").Merge
    ws.Range("G12").Name = "val_FecNac"
    DibujarLinea ws.Range("G12:H12")
    
    ws.Range("A14:D14").Merge
    CrearCampo ws, "A14", "TELÉFONO / CELULAR"
    ws.Range("A15:D15").Merge
    ws.Range("A15").Name = "val_Celular"
    DibujarLinea ws.Range("A15:D15")
    
    ws.Range("E14:H14").Merge
    CrearCampo ws, "E14", "ESTADO CIVIL"
    ws.Range("E15:H15").Merge
    ws.Range("E15").Name = "val_EstadoCivil"
    DibujarLinea ws.Range("E15:H15")
    
    ' -------------------------
    ' SECCIÓN 3: CARGA FAMILIAR
    ' -------------------------
    CrearTitulo ws, "A18:H18", "CARGA FAMILIAR / INTEGRANTES"
    
    ' Cabeceras de tabla
    ws.Range("A20:B20").Merge
    ws.Range("A20").Value = "Parentesco"
    ws.Range("C20:E20").Merge
    ws.Range("C20").Value = "Nombres y Apellidos"
    ws.Range("F20").Value = "DNI"
    ws.Range("G20:H20").Merge
    ws.Range("G20").Value = "F. Nacimiento"
    
    ws.Range("A20:H20").Font.Bold = True
    ws.Range("A20:H20").Interior.Color = RGB(245, 245, 245)
    Bordes ws.Range("A20:H20")
    
    ' Fila placeholder (la llenaremos dinámicamente)
    ws.Range("A21").Value = "PlaceholderFam"
    ws.Range("A21").Name = "inicio_CargaFam"
    
    ' -------------------------
    ' SECCIÓN 4: UBICACIÓN
    ' -------------------------
    CrearTitulo ws, "A24:H24", "UBICACIÓN DEL PREDIO — UBIGEO PERÚ"
    
    ws.Range("A26:C26").Merge
    CrearCampo ws, "A26", "DEPARTAMENTO"
    ws.Range("A27:C27").Merge
    ws.Range("A27").Name = "val_Dep"
    DibujarLinea ws.Range("A27:C27")
    
    ws.Range("D26:E26").Merge
    CrearCampo ws, "D26", "PROVINCIA"
    ws.Range("D27:E27").Merge
    ws.Range("D27").Name = "val_Prov"
    DibujarLinea ws.Range("D27:E27")
    
    ws.Range("F26:H26").Merge
    CrearCampo ws, "F26", "DISTRITO"
    ws.Range("F27:H27").Merge
    ws.Range("F27").Name = "val_Dist"
    DibujarLinea ws.Range("F27:H27")
    
    ws.Range("A29:B29").Merge
    CrearCampo ws, "A29", "CENTRO POBLADO"
    ws.Range("A30:B30").Merge
    ws.Range("A30").Name = "val_CenPob"
    DibujarLinea ws.Range("A30:B30")
    
    ws.Range("C29:D29").Merge
    CrearCampo ws, "C29", "BARRIO / SECTOR"
    ws.Range("C30:D30").Merge
    ws.Range("C30").Name = "val_Barrio"
    DibujarLinea ws.Range("C30:D30")
    
    ws.Range("E29:F29").Merge
    CrearCampo ws, "E29", "JR. / AV. / CALLE"
    ws.Range("E30:F30").Merge
    ws.Range("E30").Name = "val_Calle"
    DibujarLinea ws.Range("E30:F30")
    
    ws.Range("G29:H29").Merge
    CrearCampo ws, "G29", "PARTIDA REGISTRAL"
    ws.Range("G30:H30").Merge
    ws.Range("G30").Name = "val_Partida"
    DibujarLinea ws.Range("G30:H30")
    
    ws.Range("A32:B32").Merge
    CrearCampo ws, "A32", "MANZANA (MZ.)"
    ws.Range("A33:B33").Merge
    ws.Range("A33").Name = "val_Mz"
    DibujarLinea ws.Range("A33:B33")
    
    ws.Range("C32:D32").Merge
    CrearCampo ws, "C32", "LOTE (LT.)"
    ws.Range("C33:D33").Merge
    ws.Range("C33").Name = "val_Lt"
    DibujarLinea ws.Range("C33:D33")
    
    ws.Range("E32:F32").Merge
    CrearCampo ws, "E32", "COORDENADA X"
    ws.Range("E33:F33").Merge
    ws.Range("E33").Name = "val_CX"
    DibujarLinea ws.Range("E33:F33")
    
    ws.Range("G32:H32").Merge
    CrearCampo ws, "G32", "COORDENADA Y"
    ws.Range("G33:H33").Merge
    ws.Range("G33").Name = "val_CY"
    DibujarLinea ws.Range("G33:H33")
    
    ' -------------------------
    ' SECCIÓN 5: LINDEROS
    ' -------------------------
    CrearTitulo ws, "A36:H36", "ÁREA Y LINDEROS DEL TERRENO"
    
    ws.Range("A38:B38").Merge
    CrearCampo ws, "A38", "ÁREA TOTAL (m2)"
    ws.Range("A39:B39").Merge
    ws.Range("A39").Name = "val_Area"
    DibujarLinea ws.Range("A39:B39")
    
    ws.Range("C38:D38").Merge
    CrearCampo ws, "C38", "POR EL FRENTE (m)"
    ws.Range("C39:D39").Merge
    ws.Range("C39").Name = "val_Frente"
    DibujarLinea ws.Range("C39:D39")
    
    ws.Range("E38:F38").Merge
    CrearCampo ws, "E38", "POR LA DERECHA (m)"
    ws.Range("E39:F39").Merge
    ws.Range("E39").Name = "val_Derecha"
    DibujarLinea ws.Range("E39:F39")
    
    ws.Range("G38:H38").Merge
    CrearCampo ws, "G38", "POR EL FONDO (m)"
    ws.Range("G39:H39").Merge
    ws.Range("G39").Name = "val_Fondo"
    DibujarLinea ws.Range("G39:H39")
    
    ' Izquierda (A41)
    ws.Range("A41:B41").Merge
    CrearCampo ws, "A41", "POR LA IZQUIERDA (m)"
    ws.Range("A42:B42").Merge
    ws.Range("A42").Name = "val_Izquierda"
    DibujarLinea ws.Range("A42:B42")
    
    ' -------------------------
    ' SECCIÓN 6: FIRMAS
    ' -------------------------
    ws.Range("A48:C48").Merge
    DibujarLinea ws.Range("A48:C48")
    ws.Range("A49:C49").Merge
    ws.Range("A49").Value = "Firma del Postulante"
    ws.Range("A49").HorizontalAlignment = xlCenter
    ws.Range("A49").Font.Size = 8
    
    ws.Range("A50:C50").Merge
    ws.Range("A50").Name = "val_FirmaNombres"
    ws.Range("A50").HorizontalAlignment = xlCenter
    ws.Range("A50").Font.Bold = True
    ws.Range("A50").Font.Size = 9
    
    ws.Range("A51:C51").Merge
    ws.Range("A51").Name = "val_FirmaDNI"
    ws.Range("A51").HorizontalAlignment = xlCenter
    ws.Range("A51").Font.Size = 9
    
    ws.Range("F48:H48").Merge
    DibujarLinea ws.Range("F48:H48")
    ws.Range("F49:H49").Merge
    ws.Range("F49").Value = "Responsable Técnico"
    ws.Range("F49").HorizontalAlignment = xlCenter
    ws.Range("F49").Font.Size = 8
    
    ws.Range("F50:H50").Merge
    ws.Range("F50").Value = "Firma y Sello"
    ws.Range("F50").HorizontalAlignment = xlCenter
    ws.Range("F50").Font.Size = 8
    
    ' Ajustes finales visuales
    ActiveWindow.DisplayGridlines = False
    
    MsgBox "Plantilla FICHA_IMPRESION creada con exito.", vbInformation
End Sub

Private Sub CrearTitulo(ws As Worksheet, rng As String, txt As String)
    ws.Range(rng).Merge
    ws.Range(rng).Value = "  " & txt
    ws.Range(rng).Interior.Color = RGB(245, 245, 250)
    ws.Range(rng).Font.Color = RGB(25, 42, 86)
    ws.Range(rng).Font.Bold = True
    ws.Range(rng).Font.Size = 10
    ws.Range(rng).HorizontalAlignment = xlLeft
    ws.Range(rng).VerticalAlignment = xlCenter
    Bordes ws.Range(rng)
End Sub

Private Sub CrearCampo(ws As Worksheet, cell As String, txt As String)
    ws.Range(cell).Value = txt
    ws.Range(cell).Font.Color = RGB(150, 150, 150)
    ws.Range(cell).Font.Size = 8
    ws.Range(cell).Font.Bold = True
    ws.Range(cell).HorizontalAlignment = xlLeft
    ws.Range(cell).VerticalAlignment = xlCenter
End Sub

Private Sub DibujarLinea(rng As Range)
    With rng.Borders(xlEdgeBottom)
        .LineStyle = xlContinuous
        .Color = RGB(200, 200, 200)
        .Weight = xlThin
    End With
    ' Aprovechamos para forzar la alineación izquierda de los datos ingresados aquí
    rng.HorizontalAlignment = xlLeft
    rng.VerticalAlignment = xlCenter
End Sub

Private Sub Bordes(rng As Range)
    Dim b As Variant
    For Each b In Array(xlEdgeTop, xlEdgeBottom, xlEdgeLeft, xlEdgeRight)
        With rng.Borders(b)
            .LineStyle = xlContinuous
            .Color = RGB(200, 200, 200)
            .Weight = xlThin
        End With
    Next b
End Sub

' ----------------------------------------------------
' LÓGICA DE POBLADO DE DATOS
' ----------------------------------------------------
Public Sub LlenarFicha(DNI As String)
    Dim wsFicha As Worksheet
    Dim wsBen As Worksheet
    Dim wsFam As Worksheet
    Dim tblBen As ListObject
    Dim tblFam As ListObject
    
    On Error Resume Next
    Set wsFicha = ThisWorkbook.Sheets("FICHA_IMPRESION")
    Set wsBen = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    Set wsFam = ThisWorkbook.Sheets("BD_CARGA_FAMILIAR")
    Set tblBen = wsBen.ListObjects("TblBeneficiarios")
    Set tblFam = wsFam.ListObjects("TblCargaFamiliar")
    On Error GoTo 0
    
    If wsFicha Is Nothing Then
        MsgBox "No existe la hoja FICHA_IMPRESION. Ejecute CrearPlantillaFicha primero.", vbExclamation
        Exit Sub
    End If
    
    If tblBen Is Nothing Then Exit Sub
    
    ' 1. Buscar Beneficiario
    Dim i As Long
    Dim rowBen As Long
    rowBen = 0
    For i = 1 To tblBen.ListRows.Count
        If CStr(tblBen.ListRows(i).Range(1, tblBen.ListColumns("DNI").Index).Value) = DNI Then
            rowBen = i
            Exit For
        End If
    Next i
    
    If rowBen = 0 Then
        MsgBox "No se encontro el DNI en BD_BENEFICIARIOS", vbCritical
        Exit Sub
    End If
    
    Dim idBen As String
    idBen = GetValue(tblBen, rowBen, "ID_Beneficiario")
    
    ' 2. Llenar Datos Principales
    On Error Resume Next
    wsFicha.Range("G1").Value = "EXP: " & GetValue(tblBen, rowBen, "Expediente", "Nombre de Grupo")
    
    Dim nom As String, pat As String, mat As String
    nom = GetValue(tblBen, rowBen, "Nombres")
    pat = GetValue(tblBen, rowBen, "Apellido_Paterno")
    mat = GetValue(tblBen, rowBen, "Apellido_Materno")
    
    wsFicha.Range("val_NombresCompletos").Value = UCase(nom & " " & pat & " " & mat)
    wsFicha.Range("val_DNI").Value = DNI
    wsFicha.Range("val_Nombres").Value = UCase(nom)
    wsFicha.Range("val_ApePaterno").Value = UCase(pat)
    wsFicha.Range("val_ApeMaterno").Value = UCase(mat)
    wsFicha.Range("val_FecNac").Value = GetValue(tblBen, rowBen, "Fecha_Nacimiento")
    wsFicha.Range("val_Celular").Value = GetValue(tblBen, rowBen, "Celular")
    wsFicha.Range("val_EstadoCivil").Value = GetValue(tblBen, rowBen, "Estado_Civil")
    
    wsFicha.Range("val_Dep").Value = UCase(GetValue(tblBen, rowBen, "Departamento", "Departament"))
    wsFicha.Range("val_Prov").Value = UCase(GetValue(tblBen, rowBen, "Provincia"))
    wsFicha.Range("val_Dist").Value = UCase(GetValue(tblBen, rowBen, "Distrito"))
    wsFicha.Range("val_CenPob").Value = UCase(GetValue(tblBen, rowBen, "Centro_Poblado"))
    wsFicha.Range("val_Barrio").Value = UCase(GetValue(tblBen, rowBen, "Barrio_Sector"))
    wsFicha.Range("val_Calle").Value = UCase(GetValue(tblBen, rowBen, "Calle", "Calle / Jr. / Av."))
    wsFicha.Range("val_Partida").Value = UCase(GetValue(tblBen, rowBen, "Partida Registral", "Partida_Registral", "Partida Regist"))
    
    wsFicha.Range("val_Mz").Value = UCase(GetValue(tblBen, rowBen, "Manzana"))
    wsFicha.Range("val_Lt").Value = UCase(GetValue(tblBen, rowBen, "Lote"))
    wsFicha.Range("val_CX").Value = GetValue(tblBen, rowBen, "Coordenada X", "Coordenada_X")
    wsFicha.Range("val_CY").Value = GetValue(tblBen, rowBen, "Coordenada Y", "Coordenada_Y")
    
    wsFicha.Range("val_Area").Value = GetValue(tblBen, rowBen, "Area Total", "Area_Total", "Area Total ")
    wsFicha.Range("val_Frente").Value = GetValue(tblBen, rowBen, "Por el Frente", "Por_Frente", "Por el Frente ")
    wsFicha.Range("val_Derecha").Value = GetValue(tblBen, rowBen, "Por la Derecha", "Por_Derecha", "Por la Derecha ")
    wsFicha.Range("val_Fondo").Value = GetValue(tblBen, rowBen, "Por el Fondo", "Por_Fondo", "Por el Fondo ")
    wsFicha.Range("val_Izquierda").Value = GetValue(tblBen, rowBen, "Por la Izquierda", "Por_Izquierda", "Por la Izquierda ")
    
    wsFicha.Range("val_FirmaNombres").Value = UCase(nom & " " & pat & " " & mat)
    wsFicha.Range("val_FirmaDNI").Value = "DNI: " & DNI
    On Error GoTo 0
    
    ' 3. Llenar Carga Familiar Dinámica
    ' Limpiar filas anteriores de carga familiar
    Dim rStart As Range
    Set rStart = wsFicha.Range("inicio_CargaFam")
    
    ' Borrar cualquier fila generada dinamicamente entre inicio_CargaFam y UBICACIÓN DEL PREDIO
    ' Para simplificar, buscaremos la fila de UBICACIÓN y borraremos las filas intermedias
    Dim rUbicacion As Range
    Dim searchRow As Long
    For searchRow = rStart.Row + 1 To rStart.Row + 20
        If wsFicha.Cells(searchRow, 1).Value Like "*UBICACI?N*" Then
            Set rUbicacion = wsFicha.Cells(searchRow, 1)
            Exit For
        End If
    Next searchRow
    
    If Not rUbicacion Is Nothing Then
        If rUbicacion.Row > rStart.Row + 1 Then
            wsFicha.Rows(rStart.Row + 1 & ":" & rUbicacion.Row - 2).Delete Shift:=xlUp
        End If
    End If
    
    rStart.EntireRow.Clear
    
    ' Rellenar desde la BD
    Dim countFam As Integer
    countFam = 0
    Dim currentRow As Long
    currentRow = rStart.Row
    
    If Not tblFam Is Nothing Then
        Dim f As Long
        For f = 1 To tblFam.ListRows.Count
            If GetValue(tblFam, f, "ID_Beneficiario") = idBen Then
                countFam = countFam + 1
                If countFam > 1 Then
                    wsFicha.Rows(currentRow).Insert Shift:=xlDown
                    currentRow = currentRow + 1
                End If
                
                ' Merges para la fila de datos
                wsFicha.Range("A" & currentRow & ":B" & currentRow).Merge
                wsFicha.Range("C" & currentRow & ":E" & currentRow).Merge
                wsFicha.Range("G" & currentRow & ":H" & currentRow).Merge
                
                wsFicha.Range("A" & currentRow).Value = GetValue(tblFam, f, "Parentesco")
                wsFicha.Range("C" & currentRow).Value = GetValue(tblFam, f, "Nombres") & " " & GetValue(tblFam, f, "Apellidos")
                wsFicha.Range("F" & currentRow).Value = GetValue(tblFam, f, "DNI")
                wsFicha.Range("G" & currentRow).Value = GetValue(tblFam, f, "Fecha_Nacimiento")
                
                wsFicha.Range("A" & currentRow & ":H" & currentRow).HorizontalAlignment = xlLeft
                wsFicha.Range("A" & currentRow & ":H" & currentRow).VerticalAlignment = xlCenter
                Bordes wsFicha.Range("A" & currentRow & ":H" & currentRow)
            End If
        Next f
    End If
    
    If countFam = 0 Then
        wsFicha.Range("A" & currentRow & ":H" & currentRow).Merge
        wsFicha.Range("A" & currentRow).Value = "Sin carga familiar registrada"
        wsFicha.Range("A" & currentRow).HorizontalAlignment = xlCenter
        Bordes wsFicha.Range("A" & currentRow & ":H" & currentRow)
    End If
    
End Sub

' ----------------------------------------------------
' LÓGICA DE EXPORTACIÓN A PDF
' ----------------------------------------------------
Public Sub ExportarFichaPDF(DNI As String)
    ' 1. Llenar la ficha primero
    LlenarFicha DNI
    
    ' 2. Exportar
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("FICHA_IMPRESION")
    On Error GoTo 0
    
    If ws Is Nothing Then Exit Sub
    
    Dim rutaPDF As String
    rutaPDF = ThisWorkbook.Path & "\Ficha_Beneficiario_" & DNI & ".pdf"
    
    On Error Resume Next
    ws.ExportAsFixedFormat Type:=xlTypePDF, Filename:=rutaPDF, _
        Quality:=xlQualityStandard, IncludeDocProperties:=True, _
        IgnorePrintAreas:=False, OpenAfterPublish:=True
    
    If Err.Number <> 0 Then
        MsgBox "Error al exportar PDF: " & Err.Description & vbCrLf & "Verifique si el PDF ya está abierto.", vbCritical
    Else
        MsgBox "Ficha generada y abierta exitosamente: " & vbCrLf & rutaPDF, vbInformation, "Ficha Exportada"
    End If
    On Error GoTo 0
End Sub

' --- Helpers ---
Private Function GetValue(tbl As ListObject, rowIdx As Long, col1 As String, Optional col2 As String = "", Optional col3 As String = "") As String
    On Error Resume Next
    Dim c As Integer
    c = tbl.ListColumns(col1).Index
    If c = 0 And col2 <> "" Then c = tbl.ListColumns(col2).Index
    If c = 0 And col3 <> "" Then c = tbl.ListColumns(col3).Index
    
    If c > 0 Then
        GetValue = CStr(tbl.ListRows(rowIdx).Range(1, c).Value)
    Else
        GetValue = ""
    End If
    On Error GoTo 0
End Function
