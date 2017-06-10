using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.SignalR;
using Sabio.Web.Models.Requests;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using Microsoft.AspNet.Identity;

namespace Sabio.Web.Hubs
{
    // add app.MapSignalR(); to start up to start SignalR

    public class PrivateHub : Hub
    {
        // create concurrent dictionary to store user guids and connection ids
        private static readonly ConcurrentDictionary<string, ChatUser> MyUsers = new ConcurrentDictionary<string, ChatUser>();

        public void Send(MessagesAddRequest receivedMessage, string receiverUserId)
        {
            // get connection id of logged in user
            var getConnectionId = Context.ConnectionId;
            // get user id
            var userId = Context.User.Identity.GetUserId();

            // declare receiver ChatUser obj
            ChatUser receiver;

            // get receiver information with passed in receiver guid (user id)
            if (MyUsers.TryGetValue(receiverUserId, out receiver))
            {
                // get connected user
                ChatUser sender = GetUser(userId);

                // declare IEnumerable string for all connection ids
                IEnumerable<string> allReceivers;

                // lock ensures that one thread does not enter a critical section of code
                // while another thread is in the critical section. If another thread tries
                // to enter a locked code, it will wait, block, until the object is released.
                lock (receiver.ConnectionIds)
                {
                    lock (sender.ConnectionIds)
                    {
                        // combine receiver and sender connection ids
                        allReceivers = receiver.ConnectionIds.Concat(sender.ConnectionIds);
                    }
                }

                // loop through each id and broadcast to all connection ids
                foreach (var cid in allReceivers)
                {
                    // Broadcast to every other connection ID except current user
                    // ** handle pushed messaged for current user on the front end (postMessageSuccess)
                    if (cid != getConnectionId)
                    {
                        Clients.Client(cid).broadcastMessage(new
                        {
                            //set the variables to the received data
                            sender = sender.ChatUserId,
                            rMessage = receivedMessage
                        });
                    }
                }
            }
        }

        public override Task OnConnected()
        {
            // get connection id of logged in user
            var getConnectionId = Context.ConnectionId;
            // connected sender user guid
            var userId = Context.User.Identity.GetUserId();
            // add new connected user to the concurrentdictionary, if user exists, add connection id, else add new user
            var user = MyUsers.GetOrAdd(userId, _ => new ChatUser
            {
                ChatUserId = userId,
                ConnectionIds = new HashSet<string>()
            });

            // lock connection ids and add new connection id
            lock (user.ConnectionIds)
            {
                user.ConnectionIds.Add(getConnectionId);
            }

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            // user id
            var userId = Context.User.Identity.GetUserId();
            // connection id
            var getConnectionId = Context.ConnectionId;
            if (stopCalled)
            {
                // create user
                ChatUser user;
                // get data from the concurrent dictionary
                MyUsers.TryGetValue(userId, out user);
                // check if user is connected
                if (user != null)
                {
                    lock (user.ConnectionIds)
                    {
                        // remove the connectionid if it matches the one in the concurrentdictionary
                        user.ConnectionIds.RemoveWhere(cid => cid.Equals(getConnectionId));
                        // check if there are NOT any other connection ids
                        if (!user.ConnectionIds.Any())
                        {
                            // remove the whole user from the hub
                            ChatUser removedUser;
                            MyUsers.TryRemove(userId, out removedUser);
                        }
                    }
                }
            }

            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            return base.OnReconnected();
        }

        // getting user id and connection id for that particular user
        private ChatUser GetUser(string userId)
        {
            ChatUser user;
            MyUsers.TryGetValue(userId, out user);

            return user;
        }
    }

    public class ChatUser
    {
        public string ChatUserId { get; set; }
        public HashSet<string> ConnectionIds { get; set; } // HashSet - ensures unique strings
    }
}