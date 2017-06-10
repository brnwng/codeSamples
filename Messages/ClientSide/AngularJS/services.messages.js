services.messages = services.messages || {};

// get conversation list
services.messages.getConversationList = function (senderId, onSuccess) {
    page.sendAjax("messaging/clist=" + senderId, "GET", null, onSuccess);
}

// get message by convo id
services.messages.getMessagesByConvoId = function (convoId, pageNum, onSuccess) {
    page.sendAjax("messaging/convo/" + convoId + "/" + pageNum, "GET", null, onSuccess);
}

// service to post start of conversation
services.messages.postConversationMsg = function (data, onSuccess) {
    page.sendAjax("messaging/convomsg", "POST", data, onSuccess);
}

// service to post messages
services.messages.postMessage = function (data, onSuccess) {
    page.sendAjax("messaging/msg", "POST", data, onSuccess);
}

// service to update read messages
services.messages.updateReadMessages = function (ids, onSuccess) {
    page.sendAjax("messaging/readmsg/?mids=" + ids, "PUT", null, onSuccess);
}

// service to update convo
services.messages.updateConvoRead = function (id, onSuccess) {
    page.sendAjax("messaging/convoread/" + id, "PUT", null, onSuccess);
}

services.messages.deleteConvo = function (id, onSuccess) {
    page.sendAjax("messaging/deleteconvo/" + id, "DELETE", null, onSuccess);
}