Attribute VB_Name = "modBeneficiarios"
Option Explicit

' ==========================================
' MODULO: modBeneficiarios
' PROPOSITO: CRUD de Beneficiarios
' ==========================================

Public Sub LimpiarFichaBeneficiario()
    With frmBeneficiario
        .txtDNI.Value = ""
        .txtNombres.Value = ""
        .txtApPaterno.Value = ""
        .txtApMaterno.Value = ""
        .txtFechaNac.Value = ""
        .cboSexo.ListIndex = -1
        .cboEstadoCivil.ListIndex = -1
        .txtCelular.Value = ""
        .txtCorreo.Value = ""
        .txtDepartamento.Value = "San Martín" ' Por defecto
        .txtProvincia.Value = ""
        .txtDistrito.Value = ""
        .cboUbicacion.ListIndex = -1
        .txtCentroPoblado.Value = ""
        .txtBarrio.Value = ""
        .txtDireccion.Value = ""
        .lstFamiliares.Clear
    End With
End Sub

Public Sub GuardarBeneficiario()
    On Error GoTo ErrHandler
    
    Dim wsBD As Worksheet
    Set wsBD = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    Dim tbl As ListObject
    Set tbl = wsBD.ListObjects("TblBeneficiarios")
    
    Dim idBeneficiario As String
    Dim isNew As Boolean
    
    If frmBeneficiario.txtID.Value = "AUTO" Or frmBeneficiario.txtID.Value = "" Then
        isNew = True
        idBeneficiario = GenerarNuevoID("Beneficiario")
        frmBeneficiario.txtID.Value = idBeneficiario
    Else
        isNew = False
        idBeneficiario = frmBeneficiario.txtID.Value
    End If
    
    Dim newRow As ListRow
    If isNew Then
        Set newRow = tbl.ListRows.Add
    Else
        ' Buscar fila para editar
        Dim foundCell As Range
        Set foundCell = tbl.DataBodyRange.Columns(tbl.ListColumns("ID_Beneficiario").Index).Find(What:=idBeneficiario, LookAt:=xlWhole)
        If Not foundCell Is Nothing Then
            Set newRow = tbl.ListRows(foundCell.Row - tbl.HeaderRowRange.Row)
        Else
            MsgBox "Error: No se encontró el registro para actualizar.", vbCritical
            Exit Sub
        End If
    End If
    
    ' Guardar datos en BD_BENEFICIARIOS
    With newRow
        .Range(1, tbl.ListColumns("ID_Beneficiario").Index).Value = idBeneficiario
        .Range(1, tbl.ListColumns("DNI").Index).Value = frmBeneficiario.txtDNI.Value
        .Range(1, tbl.ListColumns("Nombres").Index).Value = frmBeneficiario.txtNombres.Value
        .Range(1, tbl.ListColumns("Apellido_Paterno").Index).Value = frmBeneficiario.txtApPaterno.Value
        .Range(1, tbl.ListColumns("Apellido_Materno").Index).Value = frmBeneficiario.txtApMaterno.Value
        .Range(1, tbl.ListColumns("Fecha_Nacimiento").Index).Value = frmBeneficiario.txtFechaNac.Value
        .Range(1, tbl.ListColumns("Sexo").Index).Value = frmBeneficiario.cboSexo.Value
        .Range(1, tbl.ListColumns("Estado_Civil").Index).Value = frmBeneficiario.cboEstadoCivil.Value
        .Range(1, tbl.ListColumns("Celular").Index).Value = frmBeneficiario.txtCelular.Value
        .Range(1, tbl.ListColumns("Correo").Index).Value = frmBeneficiario.txtCorreo.Value
        .Range(1, tbl.ListColumns("Departamento").Index).Value = frmBeneficiario.txtDepartamento.Value
        .Range(1, tbl.ListColumns("Provincia").Index).Value = frmBeneficiario.txtProvincia.Value
        .Range(1, tbl.ListColumns("Distrito").Index).Value = frmBeneficiario.txtDistrito.Value
        .Range(1, tbl.ListColumns("Ubicacion").Index).Value = frmBeneficiario.cboUbicacion.Value
        .Range(1, tbl.ListColumns("Centro_Poblado").Index).Value = frmBeneficiario.txtCentroPoblado.Value
        .Range(1, tbl.ListColumns("Barrio_Sector").Index).Value = frmBeneficiario.txtBarrio.Value
        .Range(1, tbl.ListColumns("Direccion").Index).Value = frmBeneficiario.txtDireccion.Value
        .Range(1, tbl.ListColumns("Estado_Sincronizacion").Index).Value = "PENDIENTE"
    End With
    
    ' Guardar Carga Familiar (Eliminar anteriores y recrear)
    GuardarCargaFamiliar idBeneficiario
    
    ' Actualizar hoja visual de la Ubicación
    ActualizarHojaUbicacion frmBeneficiario.cboUbicacion.Value, idBeneficiario
    
    MsgBox "Beneficiario registrado correctamente.", vbInformation, "Éxito"
    frmBeneficiario.Hide
    
    Exit Sub
ErrHandler:
    MsgBox "Ocurrió un error al guardar el beneficiario: " & Err.Description, vbCritical, "Error"
End Sub

Private Sub GuardarCargaFamiliar(idBeneficiario As String)
    ' Primero eliminar registros anteriores de este beneficiario
    Dim wsFam As Worksheet
    Set wsFam = ThisWorkbook.Sheets("BD_CARGA_FAMILIAR")
    Dim tblFam As ListObject
    Set tblFam = wsFam.ListObjects("TblCargaFamiliar")
    
    Dim i As Long
    If Not tblFam.DataBodyRange Is Nothing Then
        For i = tblFam.ListRows.Count To 1 Step -1
            If tblFam.ListRows(i).Range(1, tblFam.ListColumns("ID_Beneficiario").Index).Value = idBeneficiario Then
                tblFam.ListRows(i).Delete
            End If
        Next i
    End If
    
    ' Insertar nuevos desde el ListBox del formulario
    Dim j As Integer
    Dim newRow As ListRow
    For j = 0 To frmBeneficiario.lstFamiliares.ListCount - 1
        Set newRow = tblFam.ListRows.Add
        newRow.Range(1, tblFam.ListColumns("ID_Familiar").Index).Value = GenerarNuevoID("Familiar")
        newRow.Range(1, tblFam.ListColumns("ID_Beneficiario").Index).Value = idBeneficiario
        newRow.Range(1, tblFam.ListColumns("Parentesco").Index).Value = frmBeneficiario.lstFamiliares.List(j, 0)
        newRow.Range(1, tblFam.ListColumns("DNI").Index).Value = frmBeneficiario.lstFamiliares.List(j, 1)
        newRow.Range(1, tblFam.ListColumns("Nombres").Index).Value = frmBeneficiario.lstFamiliares.List(j, 2)
        newRow.Range(1, tblFam.ListColumns("Apellidos").Index).Value = frmBeneficiario.lstFamiliares.List(j, 3)
        newRow.Range(1, tblFam.ListColumns("Fecha_Nacimiento").Index).Value = frmBeneficiario.lstFamiliares.List(j, 4)
    Next j
End Sub

Public Sub CargarBeneficiarioEnFormulario(rowIdx As Long)
    Dim wsBD As Worksheet
    Set wsBD = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    Dim tbl As ListObject
    Set tbl = wsBD.ListObjects("TblBeneficiarios")
    
    Dim dataRow As Range
    Set dataRow = wsBD.Rows(rowIdx)
    
    With frmBeneficiario
        .txtID.Value = dataRow.Cells(1, tbl.ListColumns("ID_Beneficiario").Index).Value
        .txtDNI.Value = dataRow.Cells(1, tbl.ListColumns("DNI").Index).Value
        .txtNombres.Value = dataRow.Cells(1, tbl.ListColumns("Nombres").Index).Value
        .txtApPaterno.Value = dataRow.Cells(1, tbl.ListColumns("Apellido_Paterno").Index).Value
        .txtApMaterno.Value = dataRow.Cells(1, tbl.ListColumns("Apellido_Materno").Index).Value
        .txtFechaNac.Value = dataRow.Cells(1, tbl.ListColumns("Fecha_Nacimiento").Index).Value
        .cboSexo.Value = dataRow.Cells(1, tbl.ListColumns("Sexo").Index).Value
        .cboEstadoCivil.Value = dataRow.Cells(1, tbl.ListColumns("Estado_Civil").Index).Value
        .txtCelular.Value = dataRow.Cells(1, tbl.ListColumns("Celular").Index).Value
        .txtCorreo.Value = dataRow.Cells(1, tbl.ListColumns("Correo").Index).Value
        .txtDepartamento.Value = dataRow.Cells(1, tbl.ListColumns("Departamento").Index).Value
        .txtProvincia.Value = dataRow.Cells(1, tbl.ListColumns("Provincia").Index).Value
        .txtDistrito.Value = dataRow.Cells(1, tbl.ListColumns("Distrito").Index).Value
        
        ' Actualizar combobox
        ActualizarCboUbicaciones
        .cboUbicacion.Value = dataRow.Cells(1, tbl.ListColumns("Ubicacion").Index).Value
        
        .txtCentroPoblado.Value = dataRow.Cells(1, tbl.ListColumns("Centro_Poblado").Index).Value
        .txtBarrio.Value = dataRow.Cells(1, tbl.ListColumns("Barrio_Sector").Index).Value
        .txtDireccion.Value = dataRow.Cells(1, tbl.ListColumns("Direccion").Index).Value
        
        ' Cargar Familiares
        .lstFamiliares.Clear
        Dim wsFam As Worksheet
        Set wsFam = ThisWorkbook.Sheets("BD_CARGA_FAMILIAR")
        Dim tblFam As ListObject
        Set tblFam = wsFam.ListObjects("TblCargaFamiliar")
        
        Dim i As Long
        If Not tblFam.DataBodyRange Is Nothing Then
            For i = 1 To tblFam.ListRows.Count
                If tblFam.ListRows(i).Range(1, tblFam.ListColumns("ID_Beneficiario").Index).Value = .txtID.Value Then
                    .lstFamiliares.AddItem tblFam.ListRows(i).Range(1, tblFam.ListColumns("Parentesco").Index).Value
                    .lstFamiliares.List(.lstFamiliares.ListCount - 1, 1) = tblFam.ListRows(i).Range(1, tblFam.ListColumns("DNI").Index).Value
                    .lstFamiliares.List(.lstFamiliares.ListCount - 1, 2) = tblFam.ListRows(i).Range(1, tblFam.ListColumns("Nombres").Index).Value
                    .lstFamiliares.List(.lstFamiliares.ListCount - 1, 3) = tblFam.ListRows(i).Range(1, tblFam.ListColumns("Apellidos").Index).Value
                    .lstFamiliares.List(.lstFamiliares.ListCount - 1, 4) = tblFam.ListRows(i).Range(1, tblFam.ListColumns("Fecha_Nacimiento").Index).Value
                End If
            Next i
        End If
    End With
End Sub
