Attribute VB_Name = "modSyncAPI"
Option Explicit

' ==========================================
' MODULO: modSyncAPI
' PROPOSITO: Enviar datos de Excel a Next.js API
' ==========================================

Public Sub SincronizarConAPI()
    On Error GoTo ErrGeneral
    
    Dim wsBD As Worksheet
    Dim tbl As ListObject
    
    ' 1. Validar Hoja
    On Error Resume Next
    Set wsBD = ThisWorkbook.Sheets("BD_BENEFICIARIOS")
    On Error GoTo ErrGeneral
    
    If wsBD Is Nothing Then
        MsgBox "No se encontro la hoja 'BD_BENEFICIARIOS'. Verifica el nombre de la hoja en tu Excel.", vbCritical, "Error de Estructura"
        Exit Sub
    End If
    
    ' 2. Validar Tabla
    On Error Resume Next
    Set tbl = wsBD.ListObjects("TblBeneficiarios")
    If tbl Is Nothing Then
        If wsBD.ListObjects.Count > 0 Then
            Set tbl = wsBD.ListObjects(1) ' Intentar usar la primera tabla disponible si le cambiaron el nombre
        End If
    End If
    On Error GoTo ErrGeneral
    
    If tbl Is Nothing Then
        MsgBox "No se encontro una tabla (ListObject) en la hoja 'BD_BENEFICIARIOS'.", vbCritical, "Error de Estructura"
        Exit Sub
    End If
    
    If tbl.DataBodyRange Is Nothing Then
        MsgBox "No hay beneficiarios para sincronizar. La tabla esta vacia.", vbInformation
        Exit Sub
    End If
    
    ' 3. Construir JSON manualmente
    Dim jsonString As String
    jsonString = "{""beneficiarios"":["
    
    Dim i As Long
    Dim countRows As Long
    countRows = 0
    
    ' Obtener indices de columnas de forma segura
    Dim colID As Integer, colDNI As Integer, colNom As Integer, colApP As Integer, colApM As Integer
    Dim colFec As Integer, colSex As Integer, colEst As Integer, colCel As Integer, colCor As Integer
    Dim colDep As Integer, colPro As Integer, colDis As Integer, colCen As Integer, colBar As Integer
    Dim colDir As Integer, colSync As Integer
    
    On Error Resume Next
    colID = tbl.ListColumns("ID_Beneficiario").Index
    colDNI = tbl.ListColumns("DNI").Index
    colNom = tbl.ListColumns("Nombres").Index
    colApP = tbl.ListColumns("Apellido_Paterno").Index
    colApM = tbl.ListColumns("Apellido_Materno").Index
    colFec = tbl.ListColumns("Fecha_Nacimiento").Index
    colSex = tbl.ListColumns("Sexo").Index
    colEst = tbl.ListColumns("Estado_Civil").Index
    colCel = tbl.ListColumns("Celular").Index
    colCor = tbl.ListColumns("Correo").Index
    colDep = tbl.ListColumns("Departamento").Index
    colPro = tbl.ListColumns("Provincia").Index
    colDis = tbl.ListColumns("Distrito").Index
    colCen = tbl.ListColumns("Centro_Poblado").Index
    colBar = tbl.ListColumns("Barrio_Sector").Index
    colDir = tbl.ListColumns("Direccion").Index
    colSync = tbl.ListColumns("Estado_Sincronizacion").Index
    On Error GoTo ErrGeneral
    
    If colSync = 0 Then
        MsgBox "Falta la columna 'Estado_Sincronizacion' en la tabla. Agregala para poder rastrear que se envio a la nube.", vbCritical, "Falta Columna"
        Exit Sub
    End If
    
    For i = 1 To tbl.ListRows.Count
        Dim estadoSync As String
        estadoSync = GetColValue(tbl, i, colSync)
        
        If estadoSync = "PENDIENTE" Then
            If countRows > 0 Then jsonString = jsonString & ","
            
            jsonString = jsonString & "{"
            jsonString = jsonString & """ID_Beneficiario"":""" & EscapeJSON(GetColValue(tbl, i, colID)) & ""","
            jsonString = jsonString & """DNI"":""" & EscapeJSON(GetColValue(tbl, i, colDNI)) & ""","
            jsonString = jsonString & """Nombres"":""" & EscapeJSON(GetColValue(tbl, i, colNom)) & ""","
            jsonString = jsonString & """Apellido_Paterno"":""" & EscapeJSON(GetColValue(tbl, i, colApP)) & ""","
            jsonString = jsonString & """Apellido_Materno"":""" & EscapeJSON(GetColValue(tbl, i, colApM)) & ""","
            jsonString = jsonString & """Fecha_Nacimiento"":""" & EscapeJSON(GetColValue(tbl, i, colFec)) & ""","
            jsonString = jsonString & """Sexo"":""" & EscapeJSON(GetColValue(tbl, i, colSex)) & ""","
            jsonString = jsonString & """Estado_Civil"":""" & EscapeJSON(GetColValue(tbl, i, colEst)) & ""","
            jsonString = jsonString & """Celular"":""" & EscapeJSON(GetColValue(tbl, i, colCel)) & ""","
            jsonString = jsonString & """Correo"":""" & EscapeJSON(GetColValue(tbl, i, colCor)) & ""","
            jsonString = jsonString & """Departamento"":""" & EscapeJSON(GetColValue(tbl, i, colDep)) & ""","
            jsonString = jsonString & """Provincia"":""" & EscapeJSON(GetColValue(tbl, i, colPro)) & ""","
            jsonString = jsonString & """Distrito"":""" & EscapeJSON(GetColValue(tbl, i, colDis)) & ""","
            jsonString = jsonString & """Centro_Poblado"":""" & EscapeJSON(GetColValue(tbl, i, colCen)) & ""","
            jsonString = jsonString & """Barrio_Sector"":""" & EscapeJSON(GetColValue(tbl, i, colBar)) & ""","
            jsonString = jsonString & """Direccion"":""" & EscapeJSON(GetColValue(tbl, i, colDir)) & """"
            jsonString = jsonString & "}"
            
            countRows = countRows + 1
        End If
    Next i
    
    jsonString = jsonString & "]}"
    
    If countRows = 0 Then
        MsgBox "Todos los registros ya estan sincronizados en la nube.", vbInformation, "Al dia"
        Exit Sub
    End If
    
    ' 4. Enviar a Next.js via HTTP
    Dim http As Object
    On Error Resume Next
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    If http Is Nothing Then
        Set http = CreateObject("MSXML2.XMLHTTP")
    End If
    On Error GoTo ErrGeneral
    
    Dim url As String
    url = "https://mazaquiroz.com/api/sync-excel"
    
    http.Open "POST", url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "x-api-key", "excel_secret_key_2026"
    
    On Error GoTo ErrHTTP
    http.send jsonString
    On Error GoTo ErrGeneral
    
    ' 5. Procesar Respuesta
    If http.Status = 200 Then
        ' Marcar como sincronizados
        For i = 1 To tbl.ListRows.Count
            If GetColValue(tbl, i, colSync) = "PENDIENTE" Then
                tbl.ListRows(i).Range(1, colSync).Value = "SINCRONIZADO"
            End If
        Next i
        
        MsgBox "Sincronizacion completada con exito. (" & countRows & " registros enviados)", vbInformation, "Exito"
    Else
        MsgBox "Error del servidor web: " & http.Status & " - " & http.responseText, vbCritical, "Error en API"
    End If
    
    Set http = Nothing
    Exit Sub

ErrHTTP:
    MsgBox "No se pudo conectar con el servidor web. Verifica tu conexion a internet o si el panel esta caido." & vbCrLf & "Detalle: " & Err.Description, vbCritical, "Error de Conexion"
    If Not http Is Nothing Then Set http = Nothing
    Exit Sub
    
ErrGeneral:
    MsgBox "Ocurrio un error general en la macro (Linea: " & Erl & ")." & vbCrLf & "Error " & Err.Number & ": " & Err.Description, vbCritical, "Error de Codigo"
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

Private Function GetColValue(tbl As ListObject, rowIdx As Long, colIdx As Integer) As String
    If colIdx > 0 Then
        GetColValue = CStr(tbl.ListRows(rowIdx).Range(1, colIdx).Value)
    Else
        GetColValue = ""
    End If
End Function
