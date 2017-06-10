using Hangfire;
using Sabio.Web.Controllers.Attributes;
using Sabio.Web.Domain;
using Sabio.Web.Models.Responses;
using Sabio.Web.Services;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;

namespace Sabio.Web.Controllers
{
    [AnonAuthorize(Roles="User")]
    public class MessagingNgController : BaseController
    {
        IUserService _userService = new UserService();

        public ActionResult Messages()
        {
            // Run Hangfire Functions here. - check for unread messages and sends an email with Hangfire
            RecurringJob.AddOrUpdate("isReadCheck", () => EmailCheck(), Cron.HourInterval(6));

            return View();
        }

        #region EmailCheck Method
        public void EmailCheck()
        {
            ItemResponse<ReceiverUserInfo> emailResponse = new ItemResponse<ReceiverUserInfo>();
            ItemsResponse<IsReadIsNotified> checkResponse = new ItemsResponse<IsReadIsNotified>();
            // Instantiate List for emails to be sent
            List<string> emailList = new List<string>();
            // Check which messages have not been read or notified.
            checkResponse.Items = MessagingService.isReadCheck();
            // How many emails do we have to send/check
            int responseLength;
            // If there aren't any , break out
            if (checkResponse.Items == null)
            {
                return;
            }
            responseLength = checkResponse.Items.Count;

            // Loop through each item in response.items
            for (var i = 0; i < responseLength; i++)
            {
                var item = checkResponse.Items[i];
                if (item.MessageSenderId == item.ConversationSenderId)
                {
                    // Run Stored Proc to get email with item.ConversationReceiverId
                    emailResponse.Item = _userService.UserSelectById(item.ConversationReceiverId);
                }
                else
                {
                    // Run Stored Proc to get email with item.ConversationSenderId
                    emailResponse.Item = _userService.UserSelectById(item.ConversationSenderId);
                }
                // Push emailResponse.Item.Email into emailArr
                emailList.Add(emailResponse.Item.Email);

                // Stored proc that updates IsNotified by ConvoId
                MessagingService.UpdateIsNotified(item.ConvoId);
            }
            // Remove Duplicates in emailList
            IEnumerable<string> distinctList = emailList.Distinct();
            // Send Email for each unique email in List
            foreach (string email in distinctList)
            {
                BackgroundJob.Enqueue(() => MessagingService.UnreadNotificationEmail(email));
            }
        }
        #endregion
    }
}