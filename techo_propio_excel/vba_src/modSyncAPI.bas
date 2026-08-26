Attribute VB_Name = "modSyncAPI"
Option Explicit

' ==========================================
' MODULO: modSyncAPI
' PROPOSITO: Enviar datos de Excel a Next.js API
' ==========================================

Public Sub SincronizarConAPI()
    On Error GoTo ErrHandler
    
    Dim wsBD As Worksheet
    Set wsBD = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    Dim tbl As ListObject
    Set tbl = wsBD.ListObjects("TblBeneficiarios")
    
    If tbl.DataBodyRange Is Nothing Then
        MsgBox "No hay beneficiarios para sincronizar.", vbInformation
        Exit Sub
    End If
    
    ' 1. Construir JSON manualmente (simplificado para VBA sin librerias externas)
    Dim jsonString As String
    jsonString = "{""beneficiarios"":["
    
    Dim i As Long
    Dim countRows As Long
    countRows = 0
    
    For i = 1 To tbl.ListRows.Count
        ' Solo sincronizar los que estén PENDIENTE
        Dim estadoSync As String
        estadoSync = tbl.ListRows(i).Range(1, tbl.ListColumns("Estado_Sincronizacion").Index).Value
        
        If estadoSync = "PENDIENTE" Then
            If countRows > 0 Then jsonString = jsonString & ","
            
            jsonString = jsonString & "{"
            jsonString = jsonString & """ID_Beneficiario"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("ID_Beneficiario").Index).Value) & ""","
            jsonString = jsonString & """DNI"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("DNI").Index).Value) & ""","
            jsonString = jsonString & """Nombres"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Nombres").Index).Value) & ""","
            jsonString = jsonString & """Apellido_Paterno"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Apellido_Paterno").Index).Value) & ""","
            jsonString = jsonString & """Apellido_Materno"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Apellido_Materno").Index).Value) & ""","
            jsonString = jsonString & """Fecha_Nacimiento"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Fecha_Nacimiento").Index).Value) & ""","
            jsonString = jsonString & """Sexo"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Sexo").Index).Value) & ""","
            jsonString = jsonString & """Estado_Civil"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Estado_Civil").Index).Value) & ""","
            jsonString = jsonString & """Celular"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Celular").Index).Value) & ""","
            jsonString = jsonString & """Correo"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Correo").Index).Value) & ""","
            jsonString = jsonString & """Departamento"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Departamento").Index).Value) & ""","
            jsonString = jsonString & """Provincia"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Provincia").Index).Value) & ""","
            jsonString = jsonString & """Distrito"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Distrito").Index).Value) & ""","
            jsonString = jsonString & """Centro_Poblado"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Centro_Poblado").Index).Value) & ""","
            jsonString = jsonString & """Barrio_Sector"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Barrio_Sector").Index).Value) & ""","
            jsonString = jsonString & """Direccion"":""" & EscapeJSON(tbl.ListRows(i).Range(1, tbl.ListColumns("Direccion").Index).Value) & """"
            jsonString = jsonString & "}"
            
            countRows = countRows + 1
        End If
    Next i
    
    jsonString = jsonString & "]}"
    
    If countRows = 0 Then
        MsgBox "Todos los registros ya están sincronizados.", vbInformation
        Exit Sub
    End If
    
    ' 2. Enviar a Next.js via HTTP
    Dim http As Object
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    
    Dim url As String
    ' Cambiar por la URL de producción cuando esté online
    url = "http://localhost:3000/api/sync-excel"
    
    http.Open "POST", url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "x-api-key", "excel_secret_key_2026"
    
    http.send jsonString
    
    ' 3. Procesar Respuesta
    If http.Status = 200 Then
        ' Marcar como sincronizados
        For i = 1 To tbl.ListRows.Count
            If tbl.ListRows(i).Range(1, tbl.ListColumns("Estado_Sincronizacion").Index).Value = "PENDIENTE" Then
                tbl.ListRows(i).Range(1, tbl.ListColumns("Estado_Sincronizacion").Index).Value = "SINCRONIZADO"
            End If
        Next i
        
        MsgBox "Sincronización completada con éxito. (" & countRows & " registros)", vbInformation, "Éxito"
    Else
        MsgBox "Error de servidor: " & http.Status & " - " & http.responseText, vbCritical, "Error en Sincronización"
    End If
    
    Set http = Nothing
    Exit Sub
    
ErrHandler:
    MsgBox "Ocurrió un error en la sincronización: " & Err.Description, vbCritical, "Error"
    If Not http Is Nothing Then Set http = Nothing
End Sub

Private Function EscapeJSON(ByVal txt As String) As String
    Dim res As String
    res = Replace(txt, "\", "\\")
    res = Replace(res, """", "\""")
    res = Replace(res, vbCrLf, "\n")
    res = Replace(res, vbCr, "\n")
    res = Replace(res, vbLf, "\n")
    res = Replace(res, vbTab, "\t")
    EscapeJSON = res
End Function
