Attribute VB_Name = "modUbicaciones"
Option Explicit

' ==========================================
' MODULO: modUbicaciones
' PROPOSITO: Crear y gestionar hojas de ubicaciones
' ==========================================

Public Sub CrearNuevaUbicacion(nombreUbicacion As String)
    On Error GoTo ErrHandler
    
    ' Validar nombre de hoja
    If Len(nombreUbicacion) > 31 Then
        MsgBox "El nombre de la ubicación no puede tener más de 31 caracteres.", vbExclamation, "Nombre Inválido"
        Exit Sub
    End If
    
    Dim ws As Worksheet
    For Each ws In ThisWorkbook.Sheets
        If UCase(ws.Name) = nombreUbicacion Then
            MsgBox "Esta ubicación ya existe.", vbExclamation, "Duplicado"
            Exit Sub
        End If
    Next ws
    
    ' Registrar en la tabla BD_UBICACIONES
    Dim wsUbicaciones As Worksheet
    Set wsUbicaciones = ThisWorkbook.Sheets("BD_UBICACIONES")
    Dim tblUbic As ListObject
    Set tblUbic = wsUbicaciones.ListObjects("TblUbicaciones")
    
    Dim newRow As ListRow
    Set newRow = tblUbic.ListRows.Add
    newRow.Range(1, 1).Value = "UB-" & Format(tblUbic.ListRows.Count, "000")
    newRow.Range(1, 2).Value = nombreUbicacion
    newRow.Range(1, 3).Value = "Activo"
    newRow.Range(1, 4).Value = Format(Date, "dd/mm/yyyy")
    
    ' Registrar en CONFIGURACION (para dropdowns más rápidos)
    Dim wsConfig As Worksheet
    Set wsConfig = ThisWorkbook.Sheets("CONFIGURACION")
    Dim tblConfigUbic As ListObject
    Set tblConfigUbic = wsConfig.ListObjects("TblUbicacionesActivas")
    tblConfigUbic.ListRows.Add.Range(1, 1).Value = nombreUbicacion
    
    ' Crear nueva hoja física
    Dim newSheet As Worksheet
    Set newSheet = ThisWorkbook.Sheets.Add(After:=ThisWorkbook.Sheets(ThisWorkbook.Sheets.Count))
    newSheet.Name = nombreUbicacion
    
    ' Dar formato a la nueva hoja
    FormatearHojaUbicacion newSheet, nombreUbicacion
    
    MsgBox "Ubicación '" & nombreUbicacion & "' creada correctamente.", vbInformation, "Éxito"
    
    Exit Sub
ErrHandler:
    MsgBox "No se pudo crear la ubicación. Verifique el nombre e inténtelo nuevamente." & vbCrLf & "Error: " & Err.Description, vbCritical, "Error"
End Sub

Private Sub FormatearHojaUbicacion(ws As Worksheet, nombre As String)
    ' Titulo
    ws.Range("A1:E2").Merge
    ws.Range("A1").Value = "BENEFICIARIOS - " & nombre
    With ws.Range("A1")
        .Font.Name = "Segoe UI"
        .Font.Size = 18
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(16, 185, 129) ' Verde Esmeralda Tailwind
        .HorizontalAlignment = xlCenter
        .VerticalAlignment = xlCenter
    End With
    
    ' Crear Tabla
    ws.Range("A4").Value = "ID"
    ws.Range("B4").Value = "DNI"
    ws.Range("C4").Value = "Nombres"
    ws.Range("D4").Value = "Apellidos"
    ws.Range("E4").Value = "Celular"
    ws.Range("F4").Value = "Dirección"
    
    Dim tbl As ListObject
    Set tbl = ws.ListObjects.Add(xlSrcRange, ws.Range("A4:F5"), , xlYes)
    tbl.Name = "Tbl_" & Replace(nombre, " ", "_")
    tbl.TableStyle = "TableStyleMedium2"
    
    ' Limpiar fila 5 vacía que se crea por defecto
    tbl.DataBodyRange.ClearContents
    
    ' Anchos
    ws.Columns("A").ColumnWidth = 15
    ws.Columns("B").ColumnWidth = 12
    ws.Columns("C").ColumnWidth = 20
    ws.Columns("D").ColumnWidth = 25
    ws.Columns("E").ColumnWidth = 12
    ws.Columns("F").ColumnWidth = 30
    
    ActiveWindow.DisplayGridlines = False
End Sub

Public Sub ActualizarCboUbicaciones()
    ' Llena el ComboBox del UserForm con las ubicaciones registradas
    Dim wsConfig As Worksheet
    Set wsConfig = ThisWorkbook.Sheets("CONFIGURACION")
    Dim tblUbic As ListObject
    Set tblUbic = wsConfig.ListObjects("TblUbicacionesActivas")
    
    frmBeneficiario.cboUbicacion.Clear
    
    If tblUbic.DataBodyRange Is Nothing Then Exit Sub
    
    Dim cell As Range
    For Each cell In tblUbic.DataBodyRange.Columns(1).Cells
        If Trim(cell.Value) <> "" Then
            frmBeneficiario.cboUbicacion.AddItem cell.Value
        End If
    Next cell
End Sub

Public Sub ActualizarHojaUbicacion(nombreUbicacion As String, idBeneficiario As String)
    On Error Resume Next
    Dim wsUbic As Worksheet
    Set wsUbic = ThisWorkbook.Sheets(nombreUbicacion)
    
    If wsUbic Is Nothing Then Exit Sub ' Si la hoja no existe (raro), salir
    
    Dim tblVisual As ListObject
    Set tblVisual = wsUbic.ListObjects(1)
    
    ' Verificar si ya existe en la tabla visual para no duplicar
    Dim found As Range
    If Not tblVisual.DataBodyRange Is Nothing Then
        Set found = tblVisual.DataBodyRange.Columns(1).Find(What:=idBeneficiario, LookAt:=xlWhole)
    End If
    
    Dim rowTarget As Range
    If Not found Is Nothing Then
        Set rowTarget = found.EntireRow
    Else
        Dim newRow As ListRow
        Set newRow = tblVisual.ListRows.Add
        Set rowTarget = newRow.Range
    End If
    
    ' Traer info desde el form o desde la BD
    rowTarget.Cells(1, 1).Value = idBeneficiario
    rowTarget.Cells(1, 2).Value = frmBeneficiario.txtDNI.Value
    rowTarget.Cells(1, 3).Value = frmBeneficiario.txtNombres.Value
    rowTarget.Cells(1, 4).Value = frmBeneficiario.txtApPaterno.Value & " " & frmBeneficiario.txtApMaterno.Value
    rowTarget.Cells(1, 5).Value = frmBeneficiario.txtCelular.Value
    rowTarget.Cells(1, 6).Value = frmBeneficiario.txtDireccion.Value
End Sub
