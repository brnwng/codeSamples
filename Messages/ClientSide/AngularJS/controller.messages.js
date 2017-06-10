        (function () {
            "use strict";

            angular.module('sabioApp')
                .directive('scrollBottom', ScrollBottom)
                .directive('autoGrow', AutoGrow)
                .directive('ngEnter', NgEnter)
                .controller('messageController', MessageController)

            ScrollBottom.$inject = ['$timeout']

            // directive to scroll to bottom
            function ScrollBottom($timeout) {
                return {
                    scope: {
                        scrollBottom: "="
                    },
                    link: function (scope, element) {
                        scope.$watchCollection('scrollBottom', function (newValue) {
                            if (newValue && sabio.page.loadingPages == false) {
                                $timeout(function () {
                                    $(element).scrollTop($(element)[0].scrollHeight);
                                }, 0);
                            }
                        });
                    }
                }
            }

            function AutoGrow() {
                return function (scope, element, attr) {
                    var minHeight = element[0].offsetHeight,
                      paddingLeft = element.css('paddingLeft'),
                      paddingRight = element.css('paddingRight');

                    var $shadow = angular.element('<div></div>').css({
                        position: 'absolute',
                        top: -10000,
                        left: -10000,
                        width: element[0].offsetWidth - parseInt(paddingLeft || 0) - parseInt(paddingRight || 0),
                        fontSize: element.css('fontSize'),
                        fontFamily: element.css('fontFamily'),
                        lineHeight: element.css('lineHeight'),
                        resize: 'none'
                    });
                    angular.element(document.body).append($shadow);

                    var update = function () {
                        var times = function (string, number) {
                            for (var i = 0, r = ''; i < number; i++) {
                                r += string;
                            }
                            return r;
                        }

                        var val = element.val().replace(/</g, '&lt;')
                          .replace(/>/g, '&gt;')
                          .replace(/&/g, '&amp;')
                          .replace(/\n$/, '<br/>&nbsp;')
                          .replace(/\n/g, '<br/>')
                          .replace(/\s{2,}/g, function (space) { return times('&nbsp;', space.length - 1) + ' ' });
                        $shadow.html(val);

                        element.css('height', Math.max($shadow[0].offsetHeight + 10 /* the "threshold" */, minHeight) + 'px');
                    }

                    element.bind('keyup keydown keypress change', update);
                    update();
                }
            }

            function NgEnter() {
                return function (scope, element, attrs) {
                    element.bind("keydown", function (e) {
                        if (e.which === 13) {
                            if (!e.shiftKey) {
                                scope.$apply(function () {
                                    scope.$eval(attrs.ngEnter, { 'e': e });
                                });
                                e.preventDefault();
                            }
                        }
                    });
                };
            }

            MessageController.$inject = ['$scope', '$baseController', '$messageService', '$modal', '$userService', '$timeout'];

            function MessageController($scope, $baseController, $messageService, $modal, $userService, $timeout) {

                var vm = this;
                vm.$scope = $scope;
                vm.$messageService = $messageService;
                vm.$modal = $modal;
                vm.$userService = $userService;

                vm.senderId = sabio.page.guid;
                vm.senderName = sabio.page.fullName;

                vm.receiverId = null;
                vm.receiverName = null;
                vm.receiverPersonId = null;

                vm.currentConvo = null; // convo object
                vm.readMessages = [];

                vm.selectedConvo = null;

                vm.today = new Date();

                vm.pageNumber = 1;
                sabio.page.loadingPages = false;

                // conversations
                vm.conversations = vm.conversations || []; // collection of conversation
                // messages
                vm.messages = vm.messages || []; // collection of messages coming from server
                // new message
                vm.newMessage = {
                    "convoId": null,
                    "senderId": vm.senderId,
                    "senderFullName": vm.senderName
                };

                vm.newConvo = {
                    "senderId": vm.senderId,
                    "senderFullName": vm.senderName
                };

                // INSTANT MESSAGING - connecting to SignalR
                vm.$scope.chatHub = null; // holds reference to hub

                var connection = $.hubConnection();

                vm.$scope.chatHub = connection.createHubProxy('privateHub'); // initHub

                connection.start();

                // bindable functions
                vm.getConversationList = _getConversationList;
                vm.getConversationListSuccess = _getConversationListSuccess;

                vm.getMessagesByConvoId = _getMessagesByConvoId;
                vm.getMessagesByConvoIdSuccess = _getMessagesByConvoIdSuccess;

                vm.postMessage = _postMessage;
                vm.postMessageSuccess = _postMessageSuccess;

                vm.postConversationMsg = _postConversationMsg;
                vm.postConversationMsgSuccess = _postConversationMsgSuccess;

                vm.readMsgs = _readMsgs;
                vm.updateReadMsg = _updateReadMsg;
                vm.updateReadMsgSuccess = _updateReadMsgSuccess;
                vm.onFlagSuccess = _onFlagSuccess;
                vm.loadMessages = _loadMessages;
                vm.selectConvo = _selectConvo;
                vm.isActive = _isActive;

                vm.findIndex = _findIndex;
                vm.open = _open;
                vm.pollFlag = _pollFlag;
                // merge base controller with model - simulates inheritance
                $baseController.merge(vm, $baseController);
                // wrapper for dependency on $scope
                vm.notify = vm.$messageService.getNotifier($scope);

                // start up function
                render();

                // SignalR broadcast messages
                vm.$scope.chatHub.on('broadcastMessage', function (message) {

                    vm.notify(function () {

                        // create if does not exist
                        vm.conversations = vm.conversations || [];
                        vm.messages = vm.messages || [];

                        var newMessage = {
                            convoId: message.rMessage.ConvoId,
                            senderId: message.rMessage.SenderId,
                            content: message.rMessage.Content,
                            isRead: message.rMessage.IsRead,
                            newConvo: message.rMessage.NewConvo,
                            senderFullName: message.rMessage.SenderFullName,
                            id: message.rMessage.Id,
                            flag: message.rMessage.Flag,
                            senderPersonId: message.rMessage.SenderPersonId
                        }

                        var newConversation = {
                            id: message.rMessage.ConvoId,
                            senderId: message.rMessage.SenderId,
                            content: message.rMessage.Content,
                            newConvo: message.rMessage.NewConvo,
                            senderFullName: message.rMessage.SenderFullName,
                            flag: message.rMessage.Flag,
                            senderPersonId: message.rMessage.SenderPersonId
                        }

                        newMessage.created = new Date();

                        if (vm.conversations.length == 0) {

                            vm.conversations.push(newConversation);
                            vm.messages.push(newMessage);

                            // set conversation information
                            vm.receiverId = newMessage.senderId;
                            vm.receiverName = newMessage.senderFullName;
                            vm.receiverPersonId = newMessage.senderPersonId;
                            vm.newMessage.convoId = newMessage.convoId;
                            vm.currentConvo = newConversation;

                            return;
                        }

                        // if new convo
                        if (newConversation.newConvo && vm.conversations.length > 0) {

                            newConversation.updated = new Date();
                            vm.conversations.unshift(newConversation);
                            if (vm.messages.length == 0) {
                                vm.messages.push(newMessage);
                                vm.receiverId = newMessage.senderId;
                            }
                        }

                        // check convoIds before appending to the list
                        if (vm.currentConvo) {
                            
                            if (newMessage.convoId == vm.currentConvo.id) {

                                vm.messages.push(newMessage);
                            }
                        }

                        // flag new message
                        if (newConversation.flag) {

                            // loop through conversation list
                            for (var i = 0; i < vm.conversations.length; i++) {

                                // get current convo
                                var currentConvo = vm.conversations[i];

                                // update list when ids match
                                if (newConversation.id == currentConvo.id) {

                                    // get current convo index
                                    var convoIndex = vm.findIndex(vm.conversations, 'id', currentConvo.id)
                                    newConversation.updated = new Date();

                                    // remove from array
                                    vm.conversations.splice(convoIndex, 1);

                                    // add updated back into array
                                    vm.conversations.splice(0, 0, newConversation);

                                }
                            }
                        }
                    });
                });

                function render() {
                    console.log("messages rendering");

                    // get conversations
                    vm.getConversationList(vm.senderId);
                    vm.pollFlag();

                }

                function _selectConvo(item) {
                    vm.selectedConvo = item;

                    // reset pagination
                    vm.pageNumber = 1;
                }

                function _isActive(item) {
                    return vm.selectedConvo == item;
                }

                // flags new messages
                function _pollFlag() {
                    $timeout(function () {
                        vm.$userService.flagMessages(_onFlagSuccess);
                        vm.pollFlag();
                    }, 1000);
                };

                // *** GET CONVERSATIONS
                function _getConversationList(senderId) {

                    if (vm.conversations) {
                        vm.conversations.length = 0;
                    }

                    vm.$messageService.getConversationList(senderId, vm.getConversationListSuccess);
                }

                function _getConversationListSuccess(data, textStatus, jqXHR) {

                    if (vm.conversations) {
                        vm.conversations.length = 0;
                    }

                    vm.notify(function () {

                        if (data.items != null) {

                            for (var i = 0; i < data.items.length; i++) {
                                var currentConvo = data.items[i]

                                var date = currentConvo.updated
                                var newDate = new Date(date);

                                currentConvo.updated = newDate;

                                if (currentConvo.content === null) {
                                    currentConvo.content = 'New message...';
                                }
                            }

                            vm.conversations = data.items;

                            // get messages for first convo
                            vm.currentConvo = data.items[0];

                            vm.selectedConvo = vm.currentConvo;

                            // set convoId to post new message
                            vm.newMessage.convoId = vm.currentConvo.id;

                            // get messages service
                            vm.getMessagesByConvoId(vm.currentConvo, vm.pageNumber);
                            // select first convo on start up
                            vm.selectConvo(vm.currentConvo);
                            vm.isActive(vm.currentConvo);
                            vm.$userService.flagMessages(_onFlagSuccess);
                        }
                    })
                }

                // *** GET MESSAGES
                function _getMessagesByConvoId(convo, pageNumber) {
                    vm.currentConvo = convo;

                    // flag new convo false
                    convo.newConvo = false;

                    vm.receiverName = (convo.senderId == vm.senderId) ? convo.receiverFullName : convo.senderFullName;
                    vm.receiverId = (convo.senderId == vm.senderId) ? convo.receiverId : convo.senderId;
                    vm.receiverPersonId = (convo.senderId == vm.senderId) ? convo.receiverPersonId : convo.senderPersonId;

                    if (vm.currentConvo.id != vm.selectedConvo.id || convo.flag == true) {
                        convo.flag = false;
                        // set convoId to post new message
                        vm.newMessage.convoId = vm.currentConvo.id;

                        vm.messages.length = 0;
                        sabio.page.loadingPages = false;

                        // send service to get messages
                        vm.$messageService.getMessagesByConvoId(vm.newMessage.convoId, 1, vm.getMessagesByConvoIdSuccess);

                    } else if (vm.pageNumber > 1 && vm.currentConvo.id == vm.selectedConvo.id) {
                        vm.$messageService.getMessagesByConvoId(vm.newMessage.convoId, vm.pageNumber, vm.getMessagesByConvoIdSuccess);
                    } else {
                        vm.$messageService.getMessagesByConvoId(vm.newMessage.convoId, vm.pageNumber, vm.getMessagesByConvoIdSuccess);
                    }
                }

                function _getMessagesByConvoIdSuccess(data, textStatus, jqXHR) {

                    vm.notify(function () {
                        vm.readMessages = vm.readMessages || [];
                        vm.readMessages.length = 0;

                        // convert server time to local time
                        for (var i = 0; i < data.items.length; i++) {
                            var currentMessage = data.items[i]

                            var date = currentMessage.created
                            var updatedDate = currentMessage.updated
                            var newDate = new Date(date);
                            var newUpdate = new Date(updatedDate);

                            currentMessage.created = newDate;
                            currentMessage.updated = newUpdate;

                        }

                        // getting initial messages for convo
                        if (vm.pageNumber == 1) {
                            vm.messages.length = 0;
                            vm.messages = data.items;

                            // getting paginated messages
                        } else if (vm.pageNumber > 1) {

                            vm.newMessages = data.items;

                            // push each message to the array
                            if (vm.newMessages) {
                                for (var i = 0; i < vm.newMessages.length; i++) {
                                    var message = vm.newMessages[i];

                                    vm.messages.push(message);
                                }
                            }
                        }

                        // update read messages
                        vm.readMsgs();

                        // clear messages
                        vm.newMessage.content = null;

                        // send receiver name
                        vm.receiverName = vm.receiverName;

                    })
                }

                // polling to flag unread message in conversation
                function _onFlagSuccess(data) {
                    for (var l = 0; l < data.items.length; l++) {
                        var convoId = data.items[l].unreadConvo;
                        for (var i = 0; i < vm.conversations.length; i++) {
                            var conversation = vm.conversations[i];
                            if (convoId == conversation.id) {
                                conversation.flag = true;
                            }
                        }
                    }
                };

                // ** POST MESSAGES
                function _postMessage(isValid) {

                    if (isValid && vm.receiverId) {

                        vm.$messageService.postMessage(vm.newMessage, vm.postMessageSuccess);

                    } else if (isValid && vm.receiverId == null) {
                        toastr.error("No receipient selected!")
                    }
                }

                function _postMessageSuccess(data, textStatus, jqXHR) {
                    vm.notify(function () {

                        // push message to array for user

                        vm.newMessage.id = data.item;
                        vm.newMessage.flag = true;
                        vm.$scope.chatHub.invoke('send', vm.newMessage, vm.receiverId);
                        vm.newMessage.created = new Date();
                        vm.messages.push(vm.newMessage);

                        sabio.page.loadingPages = false

                        // get current convo index
                        if (vm.conversations.length > 1) {
                            var convoIndex = vm.findIndex(vm.conversations, 'id', vm.newMessage.convoId)
                            // get current conversation
                            var currentConvo = vm.conversations[convoIndex];

                            // remove from conversation array
                            vm.conversations.splice(convoIndex, 1);
                            // insert conversation
                            vm.conversations.splice(0, 0, currentConvo);
                        }

                        // reset message
                        vm.newMessage = {
                            'convoId': vm.newMessage.convoId,
                            'senderId': vm.senderId,
                            'senderFullName': vm.senderName
                        };
                        // reset form
                        vm.messageForm.$setPristine();
                        vm.messageForm.$setUntouched();
                    })
                }

                function _postConversationMsg(convo) {

                    vm.receiverName = convo.receiverFullName;
                    vm.receiverId = convo.receiverId;
                    vm.receiverPersonId = convo.receiverPersonId;

                    vm.$messageService.postConversationMsg(convo, vm.postConversationMsgSuccess)
                }

                function _postConversationMsgSuccess(data, textStatus, jqXHR) {

                    if (data.isSuccessful) {

                        // sender person id
                        vm.newConvo.senderPersonId = sabio.page.personId;

                        // new convo
                        if (data.item != 0) {

                            vm.conversations = vm.conversations || [];
                            vm.messages = vm.messages || [];

                            // set newConvo to true (new convo indicator in PrivateHub - c#)
                            vm.newConvo.newConvo = true;

                            // set convo id
                            vm.newConvo.convoId = data.item;
                            vm.newMessage.convoId = data.item;

                            // set current convo information
                            vm.currentConvo = vm.newConvo
                            vm.currentConvo.id = vm.newConvo.convoId;

                            // send to chatHub
                            vm.$scope.chatHub.invoke('send', vm.newConvo, vm.newConvo.receiverId);

                            if (vm.conversations.length == 0) {
                                // add dates
                                vm.newConvo.updated = new Date();
                                vm.newConvo.created = new Date();

                                // push convo and msg to view
                                vm.conversations.push(vm.newConvo);
                                vm.messages.push(vm.newConvo);

                                // active convo
                                vm.selectedConvo = vm.newConvo
                                vm.selectConvo(vm.newConvo);
                                vm.isActive(vm.newConvo);
                            } else if (vm.conversations.length > 0) {
                                vm.messages.length = 0;

                                // convo id
                                vm.newConvo.id = vm.newConvo.convoId;

                                // flag false for sender
                                vm.newConvo.newConvo = false;
                                // get new dates
                                vm.newConvo.updated = new Date();
                                vm.newConvo.created = new Date();
                                // push to lists
                                vm.conversations.unshift(vm.newConvo);
                                vm.messages.push(vm.newConvo);

                                // active convo
                                vm.selectedConvo = vm.newConvo
                                vm.selectConvo(vm.newConvo);
                                vm.isActive(vm.newConvo);
                            }
                        }
                            // previous convo
                        else {
                            vm.getConversationList(vm.senderId);

                            // old convo
                            vm.newConvo.newConvo = false;

                            // set current convo information
                            vm.currentConvo = vm.newConvo
                            vm.currentConvo.id = vm.newConvo.convoId;

                            // SignalR - send message to hub
                            vm.$scope.chatHub.invoke('send', vm.newConvo, vm.newConvo.receiverId);

                        }
                    }
                }

                function _readMsgs() {

                    if (vm.messages) {
                        for (var i = 0; i < vm.messages.length; i++) {
                            var message = vm.messages[i];

                            // check if message is not read
                            if (!message.isRead) {
                                // check if message wasn't sent by the original sender
                                if (message.senderId != vm.senderId) {

                                    // push it to an array
                                    vm.readMessages.push(message.id);
                                    // flag true
                                    message.isRead = true;
                                }
                            }
                        }

                        // check if readMessages array exists
                        if (vm.readMessages.length > 0) {

                            // join the array to send thru API
                            vm.readMessages = vm.readMessages.join("&mids=");

                            // send to api
                            if (vm.readMessages != 0) {
                                vm.updateReadMsg(vm.readMessages)

                                for (var i = 0; i < vm.conversations.length; i++) {
                                    var currentConvo = vm.conversations[i];

                                    if (currentConvo.id == message.convoId) {
                                        currentConvo.flag = false;
                                        currentConvo.newConvo = false;

                                        // flag active current convo
                                        vm.selectConvo(currentConvo);
                                        vm.isActive(currentConvo);
                                    }
                                }
                            }
                        }
                    }
                }

                function _updateReadMsg(ids) {

                    vm.$messageService.updateReadMessages(ids, vm.updateReadMsgSuccess);
                }

                function _updateReadMsgSuccess(data, textStatus, jqXHR) {

                    vm.notify(function () {
                        // clear and create new array
                        vm.readMessages = [];
                    })
                }

                function _loadMessages() {

                    ++vm.pageNumber;
                    sabio.page.loadingPages = true;

                    vm.getMessagesByConvoId(vm.selectedConvo, vm.pageNumber);
                }

                // function to get the index by the value of a property
                function _findIndex(array, attr, value) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i][attr] === value) {
                            return i;
                        }
                    }
                    return -1;
                }

                function _open() {
                    // clear form
                    vm.newConvo = {
                        "senderId": vm.senderId
                    };
                    // open modal instance
                    var modalInstance = $modal.open({
                        // template for modal
                        templateUrl: '/scripts/sabio/send-message-modal/sendMessageModal.tpl.html',
                        // define modal controller
                        controller: 'MessageModalInstanceCtrl',
                        // get data
                        resolve: {
                            newConvo: function () {
                                return vm.newConvo;
                            }
                        }
                    });

                    // get new data when modal returns ok button
                    modalInstance.result.then(function (newConvo) {
                        vm.newConvo = newConvo
                        //newConvo = vm.newConvo

                        if (vm.senderId != vm.newConvo.receiverId) {
                            // service to post conversation & msg
                            vm.postConversationMsg(vm.newConvo);
                        } else {
                            toastr.error("Can't send messages to yourself!")
                        }
                    })
                }
            }
        })();