Attribute VB_Name = "modInicio"
Option Explicit

' ==========================================
' MODULO: modInicio
' PROPOSITO: Macros asignadas a los botones de la hoja INICIO
' ==========================================

Public Sub btnRegistrarBeneficiario_Click()
    On Error GoTo ErrorHandler
    
    ' Actualizar lista de ubicaciones en el formulario antes de mostrar
    ActualizarCboUbicaciones
    
    ' Mostrar formulario en modo "Nuevo"
    frmBeneficiario.lblModo.Caption = "NUEVO REGISTRO"
    frmBeneficiario.txtID.Value = "AUTO"
    frmBeneficiario.txtID.Enabled = False
    
    ' Limpiar campos
    LimpiarFichaBeneficiario
    
    frmBeneficiario.Show
    Exit Sub
ErrorHandler:
    MsgBox "Ocurrió un error al abrir el formulario: " & Err.Description, vbCritical, "Error"
End Sub

Public Sub btnBuscarBeneficiario_Click()
    ' Por ahora usaremos un InputBox simple para buscar por DNI
    Dim dniBuscado As String
    dniBuscado = InputBox("Ingrese el DNI del beneficiario a buscar:", "Buscar Beneficiario")
    
    If Trim(dniBuscado) = "" Then Exit Sub
    
    Dim wsBD As Worksheet
    Set wsBD = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    Dim tbl As ListObject
    Set tbl = wsBD.ListObjects("TblBeneficiarios")
    
    Dim cell As Range
    Dim colDNI As Integer
    colDNI = tbl.ListColumns("DNI").Index
    
    ' Buscar DNI
    Dim foundRow As Range
    Set foundRow = tbl.DataBodyRange.Columns(colDNI).Find(What:=dniBuscado, LookAt:=xlWhole)
    
    If Not foundRow Is Nothing Then
        ' Cargar datos en el formulario
        CargarBeneficiarioEnFormulario foundRow.Row
        frmBeneficiario.lblModo.Caption = "EDITAR REGISTRO"
        frmBeneficiario.Show
    Else
        MsgBox "No se encontró ningún beneficiario con el DNI: " & dniBuscado, vbExclamation, "Búsqueda"
    End If
End Sub

Public Sub btnNuevaUbicacion_Click()
    Dim nuevaUbicacion As String
    nuevaUbicacion = InputBox("Ingrese el nombre de la NUEVA UBICACIÓN:" & vbCrLf & "(Ej: RIOJA, NUEVA CAJAMARCA)", "Crear Ubicación")
    
    If Trim(nuevaUbicacion) = "" Then Exit Sub
    
    CrearNuevaUbicacion UCase(Trim(nuevaUbicacion))
End Sub

Public Sub btnListaBeneficiarios_Click()
    ThisWorkbook.Sheets("BD_BENEFICIARIOS").Visible = xlSheetVisible
    ThisWorkbook.Sheets("BD_BENEFICIARIOS").Activate
End Sub

Public Sub btnExportarBase_Click()
    ExportarBaseDatos
End Sub
