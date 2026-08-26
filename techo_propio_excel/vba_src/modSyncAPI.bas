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
            Set tbl = wsBD.ListObjects(1)
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
    Dim colID As Integer, colExp As Integer, colDNI As Integer, colNom As Integer, colApP As Integer, colApM As Integer
    Dim colFec As Integer, colEst As Integer, colCel As Integer
    Dim colDep As Integer, colPro As Integer, colDis As Integer, colCen As Integer, colBar As Integer
    Dim colParR As Integer, colSync As Integer
    
    Dim colCal As Integer, colMan As Integer
    Dim colLot As Integer, colCooX As Integer, colCooY As Integer
    Dim colAreT As Integer, colPorF As Integer, colPorD As Integer, colPorI As Integer, colPorFnd As Integer
    
    On Error Resume Next
    colID = tbl.ListColumns("ID_Beneficiario").Index
    
    colExp = tbl.ListColumns("Expediente").Index
    If colExp = 0 Then colExp = tbl.ListColumns("Nombre de Grupo").Index
    
    colDNI = tbl.ListColumns("DNI").Index
    colNom = tbl.ListColumns("Nombres").Index
    colApP = tbl.ListColumns("Apellido_Paterno").Index
    colApM = tbl.ListColumns("Apellido_Materno").Index
    colFec = tbl.ListColumns("Fecha_Nacimiento").Index
    colEst = tbl.ListColumns("Estado_Civil").Index
    colCel = tbl.ListColumns("Celular").Index
    
    colDep = tbl.ListColumns("Departamento").Index
    If colDep = 0 Then colDep = tbl.ListColumns("Departament").Index
    colPro = tbl.ListColumns("Provincia").Index
    colDis = tbl.ListColumns("Distrito").Index
    colCen = tbl.ListColumns("Centro_Poblado").Index
    colBar = tbl.ListColumns("Barrio_Sector").Index
    
    colParR = tbl.ListColumns("Partida Registral").Index
    If colParR = 0 Then colParR = tbl.ListColumns("Partida_Registral").Index
    If colParR = 0 Then colParR = tbl.ListColumns("Partida Regist").Index
    
    colSync = tbl.ListColumns("Estado_Sincronizacion").Index
    
    ' Nuevas columnas
    colCal = tbl.ListColumns("Calle").Index
    If colCal = 0 Then colCal = tbl.ListColumns("Calle / Jr. / Av.").Index
    colMan = tbl.ListColumns("Manzana").Index
    colLot = tbl.ListColumns("Lote").Index
    
    colCooX = tbl.ListColumns("Coordenada X").Index
    If colCooX = 0 Then colCooX = tbl.ListColumns("Coordenada_X").Index
    If colCooX = 0 Then colCooX = 18 ' Fallback a numero de columna
    
    colCooY = tbl.ListColumns("Coordenada Y").Index
    If colCooY = 0 Then colCooY = tbl.ListColumns("Coordenada_Y").Index
    If colCooY = 0 Then colCooY = 19
    
    colAreT = tbl.ListColumns("Area Total").Index
    If colAreT = 0 Then colAreT = tbl.ListColumns("Area_Total").Index
    colPorF = tbl.ListColumns("Por el Frente").Index
    colPorD = tbl.ListColumns("Por la Derecha").Index
    colPorI = tbl.ListColumns("Por la Izquierda").Index
    colPorFnd = tbl.ListColumns("Por el Fondo").Index
    On Error GoTo ErrGeneral
    
    If colSync = 0 Then
        MsgBox "Falta la columna 'Estado_Sincronizacion' en la tabla. Agregala para poder rastrear que se envio a la nube.", vbCritical, "Falta Columna"
        Exit Sub
    End If
    
    For i = 1 To tbl.ListRows.Count
        Dim currentID As String
        currentID = GetColValue(tbl, i, colID)
        
        ' Removemos la condicion de "PENDIENTE" para enviar TODOS los registros siempre
        If currentID <> "" Then
            If countRows > 0 Then jsonString = jsonString & ","
            
            jsonString = jsonString & "{"
            jsonString = jsonString & """ID_Beneficiario"":""" & EscapeJSON(currentID) & ""","
            jsonString = jsonString & """Expediente"":""" & EscapeJSON(GetColValue(tbl, i, colExp)) & ""","
            jsonString = jsonString & """DNI"":""" & EscapeJSON(GetColValue(tbl, i, colDNI)) & ""","
            jsonString = jsonString & """Nombres"":""" & EscapeJSON(GetColValue(tbl, i, colNom)) & ""","
            jsonString = jsonString & """Apellido_Paterno"":""" & EscapeJSON(GetColValue(tbl, i, colApP)) & ""","
            jsonString = jsonString & """Apellido_Materno"":""" & EscapeJSON(GetColValue(tbl, i, colApM)) & ""","
            jsonString = jsonString & """Fecha_Nacimiento"":""" & EscapeJSON(GetColValue(tbl, i, colFec)) & ""","
            jsonString = jsonString & """Estado_Civil"":""" & EscapeJSON(GetColValue(tbl, i, colEst)) & ""","
            jsonString = jsonString & """Celular"":""" & EscapeJSON(GetColValue(tbl, i, colCel)) & ""","
            jsonString = jsonString & """Departamento"":""" & EscapeJSON(GetColValue(tbl, i, colDep)) & ""","
            jsonString = jsonString & """Provincia"":""" & EscapeJSON(GetColValue(tbl, i, colPro)) & ""","
            jsonString = jsonString & """Distrito"":""" & EscapeJSON(GetColValue(tbl, i, colDis)) & ""","
            jsonString = jsonString & """Centro_Poblado"":""" & EscapeJSON(GetColValue(tbl, i, colCen)) & ""","
            jsonString = jsonString & """Barrio_Sector"":""" & EscapeJSON(GetColValue(tbl, i, colBar)) & ""","
            jsonString = jsonString & """Partida_Registral"":""" & EscapeJSON(GetColValue(tbl, i, colParR)) & ""","
            
            ' Nuevos
            jsonString = jsonString & """Calle"":""" & EscapeJSON(GetColValue(tbl, i, colCal)) & ""","
            jsonString = jsonString & """Manzana"":""" & EscapeJSON(GetColValue(tbl, i, colMan)) & ""","
            jsonString = jsonString & """Lote"":""" & EscapeJSON(GetColValue(tbl, i, colLot)) & ""","
            jsonString = jsonString & """Coordenada_X"":""" & EscapeJSON(GetColValue(tbl, i, colCooX)) & ""","
            jsonString = jsonString & """Coordenada_Y"":""" & EscapeJSON(GetColValue(tbl, i, colCooY)) & ""","
            jsonString = jsonString & """Area_Total"":""" & EscapeJSON(GetColValue(tbl, i, colAreT)) & ""","
            jsonString = jsonString & """Por_Frente"":""" & EscapeJSON(GetColValue(tbl, i, colPorF)) & ""","
            jsonString = jsonString & """Por_Derecha"":""" & EscapeJSON(GetColValue(tbl, i, colPorD)) & ""","
            jsonString = jsonString & """Por_Izquierda"":""" & EscapeJSON(GetColValue(tbl, i, colPorI)) & ""","
            jsonString = jsonString & """Por_Fondo"":""" & EscapeJSON(GetColValue(tbl, i, colPorFnd)) & ""","
            
            ' Carga Familiar JSON
            jsonString = jsonString & """Carga_Familiar"":""" & EscapeJSON(GetCargaFamiliarJSON(currentID)) & """"
            
            jsonString = jsonString & "}"
            
            countRows = countRows + 1
        End If
    Next i
    
    jsonString = jsonString & "]}"
    
    If countRows = 0 Then
        MsgBox "La tabla esta completamente vacia. No hay nada que sincronizar.", vbInformation, "Vacio"
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
            tbl.ListRows(i).Range(1, colSync).Value = "SINCRONIZADO"
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

Private Function GetCargaFamiliarJSON(idBeneficiario As String) As String
    Dim wsFam As Worksheet
    Dim tblFam As ListObject
    
    On Error Resume Next
    Set wsFam = ThisWorkbook.Sheets("BD_CARGA_FAMILIAR")
    Set tblFam = wsFam.ListObjects("TblCargaFamiliar")
    On Error GoTo 0
    
    If tblFam Is Nothing Then
        GetCargaFamiliarJSON = "[]"
        Exit Function
    End If
    
    If tblFam.DataBodyRange Is Nothing Then
        GetCargaFamiliarJSON = "[]"
        Exit Function
    End If
    
    Dim colID As Integer, colPar As Integer, colDNI As Integer, colNom As Integer, colApe As Integer, colFec As Integer
    On Error Resume Next
    colID = tblFam.ListColumns("ID_Beneficiario").Index
    colPar = tblFam.ListColumns("Parentesco").Index
    colDNI = tblFam.ListColumns("DNI").Index
    colNom = tblFam.ListColumns("Nombres").Index
    colApe = tblFam.ListColumns("Apellidos").Index
    colFec = tblFam.ListColumns("Fecha_Nacimiento").Index
    On Error GoTo 0
    
    If colID = 0 Or colPar = 0 Then
        GetCargaFamiliarJSON = "[]"
        Exit Function
    End If
    
    Dim jsonArray As String
    jsonArray = "["
    Dim countFam As Integer
    countFam = 0
    
    Dim j As Long
    For j = 1 To tblFam.ListRows.Count
        If GetColValue(tblFam, j, colID) = idBeneficiario Then
            If countFam > 0 Then jsonArray = jsonArray & ","
            jsonArray = jsonArray & "{"
            jsonArray = jsonArray & """parentesco"":""" & EscapeJSON(GetColValue(tblFam, j, colPar)) & ""","
            jsonArray = jsonArray & """dni"":""" & EscapeJSON(GetColValue(tblFam, j, colDNI)) & ""","
            jsonArray = jsonArray & """nombres"":""" & EscapeJSON(GetColValue(tblFam, j, colNom)) & ""","
            jsonArray = jsonArray & """apellidos"":""" & EscapeJSON(GetColValue(tblFam, j, colApe)) & ""","
            jsonArray = jsonArray & """fechaNacimiento"":""" & EscapeJSON(GetColValue(tblFam, j, colFec)) & """"
            jsonArray = jsonArray & "}"
            countFam = countFam + 1
        End If
    Next j
    
    jsonArray = jsonArray & "]"
    GetCargaFamiliarJSON = jsonArray
End Function

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
