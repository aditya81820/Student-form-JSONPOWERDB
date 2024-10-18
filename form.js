var jpdbBaseURL = "http://api.login2explore.com:5577";
var jpdbIRL = '/api/irl';
var jpdbIML = '/api/iml';
var studDBName = "STUD-DB";
var studRelationName = 'StudData';
var connToken = "90934480|-31949223005737711|90962781";

function resetForm() {
    document.getElementById('enrollmentForm').reset();
    setInitialState();
}

function setInitialState() {
    document.getElementById('rollNo').disabled = false;
    document.getElementById('fullName').disabled = false;
    document.getElementById('Class').disabled = false;
    document.getElementById('birthDate').disabled = false;
    document.getElementById('address').disabled = false;
    document.getElementById('enrollmentDate').disabled = false;
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('updateBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('rollNo').focus();
}

function validateData() {
    var rollNo = $('#rollNo').val();
    var fullName = $('#fullName').val();
    var Class = $('#Class').val();
    var birthDate = $('#birthDate').val();
    var address = $('#address').val();
    var enrollmentDate = $('#enrollmentDate').val();

    if (rollNo === '') {
        alert('Roll No is Missing');
        $('#rollNo').focus();
        return "";
    }
    if (fullName === '') {
        alert('Full Name is Missing');
        $('#fullName').focus();
        return "";
    }
    if (Class === '') {
        alert('Class is Missing');
        $('#Class').focus();
        return "";
    }
    if (birthDate === '') {
        alert('Birth Date is Missing');
        $('#birthDate').focus();
        return "";
    }
    if (address === '') {
        alert('Address is Missing');
        $('#address').focus();
        return "";
    }
    if (enrollmentDate === '') {
        alert('Enrollment Date is Missing');
        $('#enrollmentDate').focus();
        return "";
    }

    var jsonStrObj = {
        rollNo: rollNo,
        fullName: fullName,
        class: Class,
        birthDate: birthDate,
        address: address,
        enrollmentDate: enrollmentDate
    };

    return JSON.stringify(jsonStrObj);
}

function saveData() {
    var jsonStrObj = validateData();
    if (jsonStrObj === '') return "";

    var putRequest = createPUTRequest(connToken, jsonStrObj, studDBName, studRelationName);
    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    if (resJsonObj.status === 200) {
        alert("Record updated successfully!");
    } else {
        alert("Update failed!");
    }
    resetForm();
    $('#rollNo').focus();
}

function updateData() {
    $('#updateBtn').prop("disabled", false);
    var jsonchg = validateData();
    
    if (jsonchg === '') return "";  // Handle empty validation
    
    var recno = localStorage.getItem("recno");  // Get the recno
    if (!recno) {
        alert("No record selected for update");
        return;
    }

    var updateRequest = createUpdateRecordRequest(connToken, jsonchg, studDBName, studRelationName, recno);
    
    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseURL, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    
    if (resJsonObj.status === 200) {
        alert("Record updated successfully!");
    } else {
        alert("Update failed!");
    }
    
    resetForm();
    $('#rollNo').focus();
}


function getRollNOJsonObj() {
    var rollNo = $('#rollNo').val();
    var jsonStr = { rollNo: rollNo };
    return JSON.stringify(jsonStr);
}

function fillData(jsonObj) {
    saveRecNo2LS(jsonObj);
    var data = JSON.parse(jsonObj.data).record;
    $("#rollNo").val(data.rollNo);
    $("#fullName").val(data.fullName);
    $("#Class").val(data.class);
    $("#birthDate").val(data.birthDate);
    $("#address").val(data.address);
    $("#enrollmentDate").val(data.enrollmentDate);
}

function saveRecNo2LS(jsonObj) {
    var lvData = JSON.parse(jsonObj.data);
    localStorage.setItem("recno", lvData.rec_no);
}
function createUpdateRecordRequest(token, jsonObj, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n" + "\"cmd\" : \"UPDATE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\":{ \""
            + reqId
            + "\":\n"
            + jsonObj
            + "\n"
            + "}}";
    return req;
}

function getSTUD() {
    var rollNoJsonObj = getRollNOJsonObj();
    var getRequest = createGET_BY_KEYRequest(connToken, studDBName, studRelationName, rollNoJsonObj);

    jQuery.ajaxSetup({ async: false });
    var resJsonObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseURL, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    if (resJsonObj.status === 400) {
        // Roll No not found, allow user to fill other fields and save data
        $("#fullName, #Class, #birthDate, #address, #enrollmentDate").prop("disabled", false);
        $("#saveBtn").prop("disabled", false);
        $("#resetBtn").prop("disabled", false);
        $("#fullName").focus();
    } else if (resJsonObj.status === 200) {
        // Roll No exists, fill in the data and enable the update option
        $("#rollNo").prop("disabled", true);
        fillData(resJsonObj);
        $("#updateBtn").prop("disabled", false);
        $("#resetBtn").prop("disabled", false);
        $("#fullName, #Class, #birthDate, #address, #enrollmentDate").prop("disabled", false);
        $("#fullName").focus();
    }
}
