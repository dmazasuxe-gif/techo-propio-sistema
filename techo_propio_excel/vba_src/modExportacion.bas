Attribute VB_Name = "modExportacion"
Option Explicit

' ==========================================
' MODULO: modExportacion
' PROPOSITO: Exportar bases a un .xlsx sin macros
' ==========================================

Public Sub ExportarBaseDatos()
    On Error GoTo ErrHandler
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    ' Crear nuevo libro
    Dim wbNuevo As Workbook
    Set wbNuevo = Workbooks.Add
    
    ' Copiar hojas de BD
    CopiarHoja ThisWorkbook.Sheets("BD_BENEFICIARIOS"), wbNuevo
    CopiarHoja ThisWorkbook.Sheets("BD_CARGA_FAMILIAR"), wbNuevo
    CopiarHoja ThisWorkbook.Sheets("BD_UBICACIONES"), wbNuevo
    
    ' Eliminar hojas por defecto del nuevo libro (Sheet1, etc)
    Dim ws As Worksheet
    For Each ws In wbNuevo.Sheets
        If Left(ws.Name, 3) <> "BD_" Then
            ws.Delete
        End If
    Next ws
    
    ' Romper vínculos (por si acaso al copiar la tabla quedaron vinculadas fórmulas)
    Dim varLinks As Variant
    varLinks = wbNuevo.LinkSources(Type:=xlLinkTypeExcelLinks)
    If IsArray(varLinks) Then
        Dim i As Integer
        For i = LBound(varLinks) To UBound(varLinks)
            wbNuevo.BreakLink Name:=varLinks(i), Type:=xlLinkTypeExcelLinks
        Next i
    End If
    
    ' Guardar
    Dim ruta As String
    ruta = ThisWorkbook.Path & "\Exportacion_TechoPropio_" & Format(Now, "yyyymmdd_hhmmss") & ".xlsx"
    
    wbNuevo.SaveAs Filename:=ruta, FileFormat:=xlOpenXMLWorkbook
    wbNuevo.Close SaveChanges:=False
    
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    
    MsgBox "Base de datos exportada correctamente en:" & vbCrLf & ruta, vbInformation, "Exportación Exitosa"
    
    Exit Sub
ErrHandler:
    Application.DisplayAlerts = True
    Application.ScreenUpdating = True
    MsgBox "Error al exportar la base de datos: " & Err.Description, vbCritical, "Error"
End Sub

Private Sub CopiarHoja(wsOrigen As Worksheet, wbDestino As Workbook)
    ' Copiar como valores para evitar macros o tablas vinculadas complejas
    Dim wsNueva As Worksheet
    Set wsNueva = wbDestino.Sheets.Add(After:=wbDestino.Sheets(wbDestino.Sheets.Count))
    wsNueva.Name = wsOrigen.Name
    
    wsOrigen.Cells.Copy
    
    ' Pegar valores y formatos
    wsNueva.Range("A1").PasteSpecial Paste:=xlPasteValues
    wsNueva.Range("A1").PasteSpecial Paste:=xlPasteFormats
    
    Application.CutCopyMode = False
End Sub
