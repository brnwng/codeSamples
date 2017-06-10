
// on error handler
page.handlers.onError = function (jqXHR, textStatus, errorThrown) {

    var currentPage = window.location.pathname

    //console.log(jqXHR);
    
    var data = {
        "errorFunction": jqXHR.status,
        "errorMessage": errorThrown + " - " + currentPage + " - " + jqXHR.responseText,
        "userId": page.personId
    }

    if (page.personId) {
        services.createErrorLog(data);

    } else {
        data.userId = null; // if not logged in
        //console.log(data.userId);
        services.createErrorLog(data);
    }

    //console.log(data.userId);

    switch (jqXHR.status) {
        case 401: toastr.error(errorThrown + " - The email or password you've entered is invalid. Please try again.")
            break;
        case 200:
            console.log(errorThrown);
            //toastr.error(errorThrown)
            break;

        default: console.log(jqXHR.status + " " + errorThrown + " on " + currentPage)//toastr.error(jqXHR.status + " " + errorThrown + " on " + currentPage)
            break;
    }

}

// service to create error
services.createErrorLog = function (data) {
    page.sendErrorAjax("errorlog", "POST", data);
}


// Wrapper for ALL Ajax calls with error log
page.sendAjax = function (path, type, data, onSuccess) {

    // This is where our API is stored.
    // 1. Create URL
    var url = "/api/" + path;

    // step 2: Create our Package (C2D2SET)dd
    var settings = {
        /*C2D2SET*/
        cache: false, // <== usually set to FALSE will tell teh endpoint not to cache the page
        contentType: "application/x-www-form-urlencoded; charset=UTF-8", // <== this is the format our content will be in

        dataType: "json", // <== format our data is in
        data: data, // <== our payload (an object, a simple object)

        success: onSuccess, // <== method will fire if the endpoint tells us transmission is successful
        error: page.handlers.onError, // <== method will fire if endpoint throws an error
        type: type, // <== the type of request (GET, POST, PUT, DELETE)
        xhrFields: {
            withCredentials: true
        }
    };

    if (data != null) {

        if (typeof (data) == 'string') {
            settings.data = data; //our payload (an object, a simple object)
        } else {
            settings.data = JSON.stringify(data) // convert to string
            settings.contentType = "application/json"
        }
    }

    // STEP 3: Send the pacakage to the endpoint

    $.ajax(url, settings);
} // end page.sendAjax

// Wrapper for send error ajax
page.sendErrorAjax = function (path, type, data) {

    // This is where our API is stored.
    // 1. Create URL
    var url = "/api/" + path;

    // step 2: Create our Package (C2D2SET)dd
    var settings = {
        /*C2D2SET*/
        cache: false, // <== usually set to FALSE will tell teh endpoint not to cache the page
        contentType: "application/x-www-form-urlencoded; charset=UTF-8", // <== this is the format our content will be in

        dataType: "json", // <== format our data is in
        data: data, // <== our payload (an object, a simple object)

        type: type, // <== the type of request (GET, POST, PUT, DELETE)
        xhrFields: {
            withCredentials: true
        }
    };

    if (data != null) {

        if (typeof (data) == 'string') {
            settings.data = data; //our payload (an object, a simple object)
        } else {
            settings.data = JSON.stringify(data) // convert to string
            settings.contentType = "application/json"
        }
    }

    // STEP 3: Send the pacakage to the endpoint

    $.ajax(url, settings);
} // end page.sendAjax

page.ajaxType = {

    POST: "POST",
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE"
};