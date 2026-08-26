' ==========================================
' USERFORM: frmBeneficiario
' PROPOSITO: Interfaz gráfica de captura de datos
' INSTRUCCIONES: Crear un UserForm llamado "frmBeneficiario".
' Agregar los siguientes controles con estos nombres:
' - txtID, txtDNI, txtNombres, txtApPaterno, txtApMaterno, txtFechaNac, txtCelular, txtCorreo
' - cboSexo (ComboBox), cboEstadoCivil (ComboBox)
' - txtDepartamento, txtProvincia, txtDistrito
' - cboUbicacion (ComboBox)
' - txtCentroPoblado, txtBarrio, txtDireccion
' - lstFamiliares (ListBox - 5 columnas)
' - Botones: btnGuardar, btnCancelar
' - Labels: lblModo
' Copiar este código dentro del módulo del UserForm.
' ==========================================
Option Explicit

Private Sub UserForm_Initialize()
    ' Inicializar Combos
    cboSexo.Clear
    cboSexo.AddItem "Masculino"
    cboSexo.AddItem "Femenino"
    
    cboEstadoCivil.Clear
    cboEstadoCivil.AddItem "Soltero(a)"
    cboEstadoCivil.AddItem "Casado(a)"
    cboEstadoCivil.AddItem "Viudo(a)"
    cboEstadoCivil.AddItem "Divorciado(a)"
    cboEstadoCivil.AddItem "Conviviente"
    
    ' Configurar ListBox Familiares
    With lstFamiliares
        .ColumnCount = 5
        .ColumnWidths = "60;60;80;100;60" ' Parentesco, DNI, Nombres, Apellidos, Fecha Nac
    End With
    
    ' Llenar ubicaciones disponibles
    ActualizarCboUbicaciones
End Sub

Private Sub btnGuardar_Click()
    ' Validaciones
    If Trim(txtDNI.Value) = "" Or Len(Trim(txtDNI.Value)) <> 8 Or Not IsNumeric(txtDNI.Value) Then
        MsgBox "Ingrese un DNI válido de 8 dígitos.", vbExclamation, "Validación"
        txtDNI.SetFocus
        Exit Sub
    End If
    
    If Trim(txtNombres.Value) = "" Or Trim(txtApPaterno.Value) = "" Then
        MsgBox "Los nombres y apellido paterno son obligatorios.", vbExclamation, "Validación"
        Exit Sub
    End If
    
    If cboUbicacion.ListIndex = -1 Then
        MsgBox "Debe seleccionar una ubicación de registro.", vbExclamation, "Validación"
        cboUbicacion.SetFocus
        Exit Sub
    End If
    
    ' Guardar
    GuardarBeneficiario
End Sub

Private Sub btnCancelar_Click()
    Unload Me
End Sub

Private Sub btnAgregarFamiliar_Click()
    ' Simulación simple: pedir datos por InputBox para agregar al ListBox
    Dim vParentesco, vDNI, vNombres, vApellidos, vFecha
    vParentesco = InputBox("Parentesco (Ej: Hijo, Conyuge):", "Carga Familiar")
    If vParentesco = "" Then Exit Sub
    vDNI = InputBox("DNI:", "Carga Familiar")
    vNombres = InputBox("Nombres:", "Carga Familiar")
    vApellidos = InputBox("Apellidos:", "Carga Familiar")
    vFecha = InputBox("Fecha Nacimiento (DD/MM/AAAA):", "Carga Familiar")
    
    lstFamiliares.AddItem vParentesco
    lstFamiliares.List(lstFamiliares.ListCount - 1, 1) = vDNI
    lstFamiliares.List(lstFamiliares.ListCount - 1, 2) = vNombres
    lstFamiliares.List(lstFamiliares.ListCount - 1, 3) = vApellidos
    lstFamiliares.List(lstFamiliares.ListCount - 1, 4) = vFecha
End Sub

Private Sub btnEliminarFamiliar_Click()
    If lstFamiliares.ListIndex <> -1 Then
        lstFamiliares.RemoveItem lstFamiliares.ListIndex
    Else
        MsgBox "Seleccione un familiar de la lista para eliminar.", vbInformation
    End If
End Sub
