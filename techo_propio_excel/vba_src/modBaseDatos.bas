Attribute VB_Name = "modBaseDatos"
Option Explicit

' ==========================================
' MODULO: modBaseDatos
' PROPOSITO: Funciones auxiliares y generación de IDs
' ==========================================

Public Function GenerarNuevoID(tipo As String) As String
    Dim wsConfig As Worksheet
    Set wsConfig = ThisWorkbook.Sheets("CONFIGURACION")
    Dim tblConfig As ListObject
    Set tblConfig = wsConfig.ListObjects("TblConfiguracion")
    
    Dim paramNombre As String
    Dim prefijo As String
    
    If tipo = "Beneficiario" Then
        paramNombre = "Ultimo_ID_Beneficiario"
        prefijo = "TP-BEN-"
    ElseIf tipo = "Familiar" Then
        paramNombre = "Ultimo_ID_Familiar"
        prefijo = "TP-FAM-"
    Else
        Exit Function
    End If
    
    ' Buscar parámetro en tabla de configuración
    Dim foundCell As Range
    Set foundCell = tblConfig.DataBodyRange.Columns(1).Find(What:=paramNombre, LookAt:=xlWhole)
    
    If Not foundCell Is Nothing Then
        Dim ultimoNum As Long
        ultimoNum = CLng(foundCell.Offset(0, 1).Value)
        
        ultimoNum = ultimoNum + 1
        foundCell.Offset(0, 1).Value = CStr(ultimoNum)
        
        GenerarNuevoID = prefijo & Format(ultimoNum, "000000")
    Else
        MsgBox "Falta el parámetro de configuración: " & paramNombre, vbCritical, "Error DB"
        GenerarNuevoID = prefijo & "ERROR"
    End If
End Function
