Attribute VB_Name = "Módulo1"
'====================================================================================================
'               SISTEMA TECHO PROPIO - MÓDULO DE MACROS PRINCIPALES
'====================================================================================================
Option Explicit

Sub AbrirFormularioRegistro()
    ' Abre la ventana flotante de registro de beneficiario
    On Error Resume Next
    frmRegistroBeneficiario.Show
    If Err.Number <> 0 Then
        MsgBox "Asegúrate de haber creado el UserForm con el nombre 'frmRegistroBeneficiario'.", vbCritical, "Error al abrir"
    End If
    On Error GoTo 0
End Sub

Sub AbrirFormularioBuscar()
    On Error Resume Next
    frmBuscarBeneficiario.Show
    If Err.Number <> 0 Then
        Sheets("BD_BENEFICIARIOS").Activate
    End If
    On Error GoTo 0
End Sub

Sub IrPanelControl()
    Sheets("PANEL_CONTROL").Activate
End Sub

Sub IrBDBeneficiarios()
    Sheets("BD_BENEFICIARIOS").Activate
End Sub

Sub IrBDCargaFamiliar()
    Sheets("BD_CARGA_FAMILIAR").Activate
End Sub

Sub IrBDUbicaciones()
    Sheets("BD_UBICACIONES").Activate
End Sub

Sub IrReportes()
    Sheets("REPORTES_DASHBOARD").Activate
End Sub
