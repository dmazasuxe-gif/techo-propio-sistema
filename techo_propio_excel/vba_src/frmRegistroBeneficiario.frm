VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmRegistroBeneficiario 
   Caption         =   "REGISTRO DE BENEFICIARIO Y CARGA FAMILIAR"
   ClientHeight    =   10728
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   13080
   OleObjectBlob   =   "frmRegistroBeneficiario.frx":0000
   StartUpPosition =   1  'Centrar en propietario
End
Attribute VB_Name = "frmRegistroBeneficiario"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'====================================================================================================
'                       CÓDIGO DEL USERFORM: frmRegistroBeneficiario
'                               (SIN CAMPO DE CORREO)
'====================================================================================================
Option Explicit

Private Sub Label13_Click()

End Sub

' ---------------------------------------------------------------------------------------------------
' 1. INICIALIZACIÓN DEL FORMULARIO Y CARGA DE LISTAS DESPLEGABLES
' ---------------------------------------------------------------------------------------------------
Private Sub UserForm_Initialize()
    Dim wsCfg As Worksheet, wsUbi As Worksheet
    Dim ultID As Long, i As Long
    
    Set wsCfg = Sheets("CONFIGURACION")
    Set wsUbi = Sheets("BD_UBICACIONES")
    
    ' Generar correlativo automático oficial
    ultID = wsCfg.Range("B2").Value + 1
    Me.txtID.Text = "TP-BEN-" & Format(ultID, "000000")
    Me.txtID.Locked = True
    
    ' Listas desplegables de datos personales
    With Me.cmbSexo
        .Clear
        .AddItem "Masculino"
        .AddItem "Femenino"
    End With
    
    With Me.cmbEstadoCivil
        .Clear
        .AddItem "Soltero(a)"
        .AddItem "Casado(a)"
        .AddItem "Conviviente"
        .AddItem "Divorciado(a)"
        .AddItem "Viudo(a)"
    End With
    
    ' Listas geográficas
    With Me.cmbDepartamento
        .Clear
        .AddItem "San Martín"
        .AddItem "Amazonas"
        .AddItem "Loreto"
        .Text = "San Martín"
    End With
    
    With Me.cmbProvincia
        .Clear
        .AddItem "Moyobamba"
        .AddItem "Rioja"
        .AddItem "San Martín (Tarapoto)"
        .AddItem "Lamas"
        .Text = "Moyobamba"
    End With
    
    With Me.cmbDistrito
        .Clear
        .AddItem "Jepelacio"
        .AddItem "Moyobamba"
        .AddItem "Calzada"
        .AddItem "Soritor"
        .AddItem "Habana"
        .AddItem "Yantaló"
    End With
    
    ' Cargar Ubicaciones activas desde la base de datos
    Me.cmbUbicacion.Clear
    For i = 4 To wsUbi.Cells(wsUbi.Rows.Count, "B").End(xlUp).Row
        If wsUbi.Cells(i, "B").Value <> "" Then
            Me.cmbUbicacion.AddItem wsUbi.Cells(i, "B").Value
        End If
    Next i
    
    ' Lista de Parentescos para carga familiar
    With Me.cmbFamParentesco
        .Clear
        .AddItem "Cónyuge / Conviviente"
        .AddItem "Hijo(a)"
        .AddItem "Padre / Madre"
        .AddItem "Hermano(a)"
        .AddItem "Nieto(a)"
        .AddItem "Suegro(a)"
        .AddItem "Otro"
    End With
    
    ' Configurar columnas del ListBox de Familiares
    With Me.lstFamiliares
        .ColumnCount = 5
        .ColumnWidths = "90 pt;60 pt;90 pt;90 pt;60 pt"
        .Clear
    End With
End Sub

' ---------------------------------------------------------------------------------------------------
' 2. AUTOCALCULAR DIRECCIÓN COMPLETA
' ---------------------------------------------------------------------------------------------------
Private Sub txtCalle_Change(): ActualizarDireccion: End Sub
Private Sub txtMz_Change(): ActualizarDireccion: End Sub
Private Sub txtLote_Change(): ActualizarDireccion: End Sub

Private Sub ActualizarDireccion()
    Me.txtDireccionAuto.Text = Trim(Me.txtCalle.Text & " Mz. " & Me.txtMz.Text & " Lt. " & Me.txtLote.Text)
End Sub

' ---------------------------------------------------------------------------------------------------
' 3. GESTIÓN DE CARGA FAMILIAR EN EL LISTBOX
' ---------------------------------------------------------------------------------------------------
Private Sub btnAgregarFamiliar_Click()
    If Trim(Me.txtFamDNI.Text) = "" Or Trim(Me.txtFamNombres.Text) = "" Then
        MsgBox "Debe ingresar al menos el DNI y Nombres del familiar.", vbExclamation, "Validación Familiar"
        Exit Sub
    End If
    
    With Me.lstFamiliares
        .AddItem Me.cmbFamParentesco.Text
        .List(.ListCount - 1, 1) = Me.txtFamDNI.Text
        .List(.ListCount - 1, 2) = Me.txtFamNombres.Text
        .List(.ListCount - 1, 3) = Me.txtFamApellidos.Text
        .List(.ListCount - 1, 4) = Me.txtFamFechaNac.Text
    End With
    
    ' Limpiar campos del familiar para el siguiente
    Me.cmbFamParentesco.Text = ""
    Me.txtFamDNI.Text = ""
    Me.txtFamNombres.Text = ""
    Me.txtFamApellidos.Text = ""
    Me.txtFamFechaNac.Text = ""
    Me.txtFamDNI.SetFocus
End Sub

Private Sub btnEliminarFamiliar_Click()
    If Me.lstFamiliares.ListIndex >= 0 Then
        Me.lstFamiliares.RemoveItem Me.lstFamiliares.ListIndex
    Else
        MsgBox "Seleccione un familiar de la lista para quitarlo.", vbInformation, "Aviso"
    End If
End Sub

' ---------------------------------------------------------------------------------------------------
' 4. GUARDAR EXPEDIENTE COMPLETO (TITULAR + FAMILIARES)
' ---------------------------------------------------------------------------------------------------
Private Sub btnGuardar_Click()
    Dim wsBD As Worksheet, wsFam As Worksheet, wsCfg As Worksheet
    Dim nextBD As Long, nextFam As Long
    Dim ultNumBen As Long, ultNumFam As Long
    Dim strIDBen As String, strIDFam As String
    Dim i As Long
    Dim filaCfgBen As Long, filaCfgFam As Long
    
    ' 1. Validaciones
    If Trim(Me.txtDNI.Text) = "" Or Trim(Me.txtNombres.Text) = "" Or Trim(Me.txtApePaterno.Text) = "" Then
        MsgBox "Por favor complete los campos obligatorios: DNI, Nombres y Apellido Paterno.", vbCritical, "Validación"
        Exit Sub
    End If
    
    If Len(Trim(Me.txtDNI.Text)) <> 8 Then
        MsgBox "El DNI del titular debe tener exactamente 8 dígitos.", vbExclamation, "Validación DNI"
        Exit Sub
    End If
    
    Set wsBD = Sheets("BD_BENEFICIARIOS")
    Set wsFam = Sheets("BD_CARGA_FAMILIAR")
    Set wsCfg = Sheets("CONFIGURACION")
    
    ' 2. Obtener el último número de Beneficiario de forma segura
    ultNumBen = 0
    For i = 1 To 10
        If InStr(1, UCase(wsCfg.Cells(i, 1).Value), "BENEFICIARIO") > 0 Then
            ultNumBen = Val(wsCfg.Cells(i, 2).Value)
            filaCfgBen = i
            Exit For
        End If
    Next i
    If filaCfgBen = 0 Then filaCfgBen = 2: ultNumBen = Val(wsCfg.Range("B2").Value)
    
    ultNumBen = ultNumBen + 1
    strIDBen = "TP-BEN-" & Format(ultNumBen, "000000")
    
    ' 3. Guardar Titular en BD_BENEFICIARIOS
    nextBD = wsBD.Cells(wsBD.Rows.Count, "A").End(xlUp).Row + 1
    If nextBD < 4 Then nextBD = 4
    
    wsBD.Cells(nextBD, 1).Value = strIDBen
    wsBD.Cells(nextBD, 2).Value = Me.txtDNI.Text
    wsBD.Cells(nextBD, 3).Value = Me.txtNombres.Text
    wsBD.Cells(nextBD, 4).Value = Me.txtApePaterno.Text
    wsBD.Cells(nextBD, 5).Value = Me.txtApeMaterno.Text
    wsBD.Cells(nextBD, 6).Value = Me.txtFechaNac.Text
    wsBD.Cells(nextBD, 7).Value = Me.cmbSexo.Text
    wsBD.Cells(nextBD, 8).Value = Me.cmbEstadoCivil.Text
    wsBD.Cells(nextBD, 9).Value = Me.txtCelular.Text
    wsBD.Cells(nextBD, 10).Value = ""                         ' Correo omitido
    wsBD.Cells(nextBD, 11).Value = Me.cmbDepartamento.Text
    wsBD.Cells(nextBD, 12).Value = Me.cmbProvincia.Text
    wsBD.Cells(nextBD, 13).Value = Me.cmbDistrito.Text
    wsBD.Cells(nextBD, 14).Value = Me.cmbUbicacion.Text
    wsBD.Cells(nextBD, 15).Value = Me.txtCentroPoblado.Text
    wsBD.Cells(nextBD, 16).Value = Me.txtBarrio.Text
    wsBD.Cells(nextBD, 17).Value = Me.txtCalle.Text
    wsBD.Cells(nextBD, 18).Value = Me.txtMz.Text
    wsBD.Cells(nextBD, 19).Value = Me.txtLote.Text
    wsBD.Cells(nextBD, 20).Value = Me.txtCoordX.Text
    wsBD.Cells(nextBD, 21).Value = Me.txtCoordY.Text
    wsBD.Cells(nextBD, 22).Value = Me.txtDireccionAuto.Text
    wsBD.Cells(nextBD, 23).Value = "PENDIENTE"
    wsBD.Cells(nextBD, 24).Value = ""
    
    ' 4. Obtener el último número de Carga Familiar de forma segura
    ultNumFam = 0
    For i = 1 To 10
        If InStr(1, UCase(wsCfg.Cells(i, 1).Value), "FAMILIAR") > 0 Then
            ultNumFam = Val(wsCfg.Cells(i, 2).Value)
            filaCfgFam = i
            Exit For
        End If
    Next i
    If filaCfgFam = 0 Then filaCfgFam = 3: ultNumFam = Val(wsCfg.Range("B3").Value)
    
    ' Guardar registros de familiares si existen en la lista
    If Me.lstFamiliares.ListCount > 0 Then
        For i = 0 To Me.lstFamiliares.ListCount - 1
            ultNumFam = ultNumFam + 1
            strIDFam = "TP-FAM-" & Format(ultNumFam, "000000")
            nextFam = wsFam.Cells(wsFam.Rows.Count, "A").End(xlUp).Row + 1
            If nextFam < 4 Then nextFam = 4
            
            wsFam.Cells(nextFam, 1).Value = strIDFam
            wsFam.Cells(nextFam, 2).Value = strIDBen
            wsFam.Cells(nextFam, 3).Value = Me.lstFamiliares.List(i, 0) ' Parentesco
            wsFam.Cells(nextFam, 4).Value = Me.lstFamiliares.List(i, 1) ' DNI
            wsFam.Cells(nextFam, 5).Value = Me.lstFamiliares.List(i, 2) ' Nombres
            wsFam.Cells(nextFam, 6).Value = Me.lstFamiliares.List(i, 3) ' Apellidos
            wsFam.Cells(nextFam, 7).Value = Me.lstFamiliares.List(i, 4) ' Fecha Nac
        Next i
    End If
    
    ' 5. Actualizar los contadores en la hoja CONFIGURACION
    wsCfg.Cells(filaCfgBen, 2).Value = ultNumBen
    wsCfg.Cells(filaCfgFam, 2).Value = ultNumFam
    
    MsgBox "¡Beneficiario " & strIDBen & " registrado con éxito con " & Me.lstFamiliares.ListCount & " familiar(es)!", vbInformation, "Registro Techo Propio"
    
    Call btnLimpiar_Click
End Sub

' ---------------------------------------------------------------------------------------------------
' 5. BOTONES LIMPIAR Y CERRAR
' ---------------------------------------------------------------------------------------------------
Private Sub btnLimpiar_Click()
    Dim wsCfg As Worksheet
    Set wsCfg = Sheets("CONFIGURACION")
    
    Me.txtID.Text = "TP-BEN-" & Format(wsCfg.Range("B2").Value + 1, "000000")
    Me.txtDNI.Text = ""
    Me.txtNombres.Text = ""
    Me.txtApePaterno.Text = ""
    Me.txtApeMaterno.Text = ""
    Me.txtFechaNac.Text = ""
    Me.cmbSexo.Text = ""
    Me.cmbEstadoCivil.Text = ""
    Me.txtCelular.Text = ""
    Me.txtCentroPoblado.Text = ""
    Me.txtBarrio.Text = ""
    Me.txtCalle.Text = ""
    Me.txtMz.Text = ""
    Me.txtLote.Text = ""
    Me.txtCoordX.Text = ""
    Me.txtCoordY.Text = ""
    Me.txtDireccionAuto.Text = ""
    Me.lstFamiliares.Clear
End Sub

Private Sub btnCerrar_Click()
    Unload Me
End Sub

