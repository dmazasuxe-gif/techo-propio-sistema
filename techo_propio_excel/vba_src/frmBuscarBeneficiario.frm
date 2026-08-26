VERSION 5.00
Begin {C62A69F0-16DC-11CE-9E98-00AA00574A4F} frmBuscarBeneficiario 
   Caption         =   "CONSULTA DE EXPEDIENTE "
   ClientHeight    =   7416
   ClientLeft      =   108
   ClientTop       =   456
   ClientWidth     =   14268
   OleObjectBlob   =   "frmBuscarBeneficiario.frx":0000
   StartUpPosition =   1  'Centrar en propietario
End
Attribute VB_Name = "frmBuscarBeneficiario"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
'====================================================================================================
'               CÓDIGO DEL USERFORM DE BÚSQUEDA Y EXPEDIENTE DIGITAL
'====================================================================================================
Option Explicit

Private Sub Frame3_Click()

End Sub

Private Sub UserForm_Initialize()
    On Error Resume Next
    With Me.lstBusquedaFamiliares
        .ColumnCount = 6
        .ColumnWidths = "75 pt;90 pt;60 pt;90 pt;90 pt;60 pt"
        .Clear
    End With
    Me.lblEstadoSinc.Caption = "ESTADO: -"
    On Error GoTo 0
End Sub

Private Sub btnBuscar_Click()
    Dim wsBD As Worksheet, wsFam As Worksheet
    Dim busqueda As String
    Dim filaBD As Long, ultFilaBD As Long
    Dim i As Long, ultFilaFam As Long
    Dim idTitular As String
    Dim encontrado As Boolean
    
    busqueda = Trim(Me.txtBuscarTermino.Text)
    If busqueda = "" Then
        MsgBox "Por favor ingrese un número de DNI o código de expediente.", vbExclamation, "Búsqueda"
        Me.txtBuscarTermino.SetFocus
        Exit Sub
    End If
    
    Set wsBD = Sheets("BD_BENEFICIARIOS")
    Set wsFam = Sheets("BD_CARGA_FAMILIAR")
    
    ultFilaBD = wsBD.Cells(wsBD.Rows.Count, "A").End(xlUp).Row
    encontrado = False
    
    ' Buscar por ID (Columna 1) o DNI (Columna 2)
    For filaBD = 4 To ultFilaBD
        If UCase(Trim(wsBD.Cells(filaBD, 1).Value)) = UCase(busqueda) Or _
           Trim(CStr(wsBD.Cells(filaBD, 2).Value)) = busqueda Then
            
            encontrado = True
            idTitular = wsBD.Cells(filaBD, 1).Value
            
            ' Poblar datos del Titular
            On Error Resume Next
            Me.txtResID.Text = idTitular
            Me.txtResDNI.Text = wsBD.Cells(filaBD, 2).Value
            Me.txtResNombreComp.Text = wsBD.Cells(filaBD, 3).Value & " " & wsBD.Cells(filaBD, 4).Value & " " & wsBD.Cells(filaBD, 5).Value
            Me.txtResFechaNac.Text = wsBD.Cells(filaBD, 6).Value
            Me.txtResSexo.Text = wsBD.Cells(filaBD, 7).Value
            
            ' Estado Civil
            Me.txtResEstCivil.Text = wsBD.Cells(filaBD, 8).Value
            Me.txtResEstCivil.Text = wsBD.Cells(filaBD, 8).Value
            
            Me.txtResCelular.Text = wsBD.Cells(filaBD, 9).Value
            Me.txtResUbi.Text = wsBD.Cells(filaBD, 14).Value
            Me.txtResUbi.Text = wsBD.Cells(filaBD, 14).Value
            Me.txtResDistrito.Text = wsBD.Cells(filaBD, 13).Value & " / " & wsBD.Cells(filaBD, 12).Value
            Me.txtResDireccion.Text = wsBD.Cells(filaBD, 22).Value
            Me.txtResMzLt.Text = "Mz. " & wsBD.Cells(filaBD, 18).Value & " Lt. " & wsBD.Cells(filaBD, 19).Value
            Me.txtResCoord.Text = wsBD.Cells(filaBD, 20).Value & ", " & wsBD.Cells(filaBD, 21).Value
            
            ' Estado de sincronización (solo Caption para Label)
            Me.lblEstadoSinc.Caption = "ESTADO: " & wsBD.Cells(filaBD, 23).Value
            On Error GoTo 0
            
            Exit For
        End If
    Next filaBD
    
    If Not encontrado Then
        MsgBox "No se encontró ningún beneficiario con el criterio: " & busqueda, vbInformation, "Sin coincidencias"
        Exit Sub
    End If
    
    ' Cargar familiares vinculados en el ListBox
    On Error Resume Next
    Me.lstBusquedaFamiliares.Clear
    ultFilaFam = wsFam.Cells(wsFam.Rows.Count, "A").End(xlUp).Row
    
    For i = 4 To ultFilaFam
        If UCase(Trim(wsFam.Cells(i, 2).Value)) = UCase(idTitular) Then
            With Me.lstBusquedaFamiliares
                .AddItem wsFam.Cells(i, 1).Value
                .List(.ListCount - 1, 1) = wsFam.Cells(i, 3).Value
                .List(.ListCount - 1, 2) = wsFam.Cells(i, 4).Value
                .List(.ListCount - 1, 3) = wsFam.Cells(i, 5).Value
                .List(.ListCount - 1, 4) = wsFam.Cells(i, 6).Value
                .List(.ListCount - 1, 5) = wsFam.Cells(i, 7).Value
            End With
        End If
    Next i
    On Error GoTo 0
End Sub

Private Sub txtBuscarTermino_KeyDown(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)
    If KeyCode = 13 Then
        Call btnBuscar_Click
    End If
End Sub

Private Sub btnLimpiar_Click()
    On Error Resume Next
    Me.txtBuscarTermino.Text = ""
    Me.txtResID.Text = ""
    Me.txtResDNI.Text = ""
    Me.txtResNombreComp.Text = ""
    Me.txtResFechaNac.Text = ""
    Me.txtResSexo.Text = ""
    Me.txtResEstCivil.Text = ""
    Me.txtResEstCivil.Text = ""
    Me.txtResCelular.Text = ""
    Me.txtResUbi.Text = ""
    Me.txtResUbi.Text = ""
    Me.txtResDistrito.Text = ""
    Me.txtResDireccion.Text = ""
    Me.txtResMzLt.Text = ""
    Me.txtResCoord.Text = ""
    Me.lblEstadoSinc.Caption = "ESTADO: -"
    Me.lstBusquedaFamiliares.Clear
    Me.txtBuscarTermino.SetFocus
    On Error GoTo 0
End Sub

Private Sub btnCerrar_Click()
    Unload Me
End Sub

