using Sabio.Web.Domain;
using Sabio.Web.Models.Requests;
using Sabio.Web.Models.Responses;
using Sabio.Web.Services;
using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Sabio.Web.Controllers.Api
{
    [RoutePrefix("api/messaging")]
    public class MessagingApiController : BaseApiController
    {

        IMessagingService _messagingService = new MessagingService();
        IUserService _userService = new UserService();

        ItemResponse<int> itemResponse = new ItemResponse<int>();
        // success response
        SuccessResponse successResponse = new SuccessResponse();

        [Route("convomsg"), HttpPost]
        public HttpResponseMessage CreateConversationMsg(ConversationMsgAddRequest payload)
        {
            try
            {
                itemResponse.Item = _messagingService.CreateConversationMsg(payload);

                return Request.CreateResponse(itemResponse);
            }
            catch (Exception ex)
            {
                // Adds to errorlog if error
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest error = new ErrorLogAddRequest();
                error.ErrorFunction = "Sabio.Web.Controllers.Api.CreateConversationMsg";
                error.ErrorMessage = ex.Message;
                error.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(error);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }

        // Insert message with convoId
        [Route("msg"), HttpPost]
        public HttpResponseMessage CreateMessage(MessagesAddRequest payload)
        {
            try
            {
                itemResponse.Item = _messagingService.CreateMessage(payload);

                return Request.CreateResponse(itemResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest error = new ErrorLogAddRequest();
                error.ErrorFunction = "Sabio.Web.Controllers.Api.CreateMessage";
                error.ErrorMessage = ex.Message;
                error.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(error);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }

        // Get conversation list by senderid
        [Route("clist={senderId:Guid}"), HttpGet]
        public HttpResponseMessage GetConvoListBySenderId(Guid senderId)
        {
            try
            {
                ItemsResponse<MessagingConversation> mcItemsResponse = new ItemsResponse<MessagingConversation>();

                mcItemsResponse.Items = _messagingService.GetConversationsBySenderId(senderId);

                return Request.CreateResponse(mcItemsResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest payload = new ErrorLogAddRequest();
                payload.ErrorFunction = "Sabio.Web.Controllers.Api.GetConvoListBySenderId";
                payload.ErrorMessage = ex.Message;
                payload.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(payload);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }

        // Get Messages By Convo Id
        [Route("convo/{id:int}/{pageNumber:int}"), HttpGet]
        public HttpResponseMessage GetMessagesByConvoId(int id, int pageNumber)
        {
            // TODO: add try catch

            try
            {
                ItemsResponse<Messaging> mItemsResponse = new ItemsResponse<Messaging>();

                mItemsResponse.Items = _messagingService.GetMessagesByConvoId(id, pageNumber);

                return Request.CreateResponse(mItemsResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest payload = new ErrorLogAddRequest();
                payload.ErrorFunction = "Sabio.Web.Controllers.Api.GetMessagesByConvoId";
                payload.ErrorMessage = ex.Message;
                payload.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(payload);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        // Update IsRead by Ids

        [Route("readmsg"), HttpPut]
        public HttpResponseMessage UpdateReadMessages([FromUri] int[] mids)
        {
            try
            {
                _messagingService.UpdateReadMessages(mids);
                return Request.CreateResponse(successResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest error = new ErrorLogAddRequest();
                error.ErrorFunction = "Sabio.Web.Controllers.Api.UpdateReadMessages";
                error.ErrorMessage = ex.Message;
                error.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(error);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }

        [Route("convoread/{id:int}"), HttpPut]
        public HttpResponseMessage UpdateConvoRead([FromUri] int id)
        {
            try
            {
                _messagingService.UpdateConvoRead(id);
                return Request.CreateResponse(successResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest error = new ErrorLogAddRequest();
                error.ErrorFunction = "Sabio.Web.Controllers.Api.UpdateConvoRead";
                error.ErrorMessage = ex.Message;
                error.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(error);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }

        [Route("deleteconvo/{id:int}"), HttpDelete]
        public HttpResponseMessage DeleteConversation([FromUri] int id)
        {
            try
            {
                _messagingService.DeleteConversation(id);
                return Request.CreateResponse(successResponse);
            }
            catch (Exception ex)
            {
                ErrorLogService svc = new ErrorLogService();
                ErrorLogAddRequest error = new ErrorLogAddRequest();
                error.ErrorFunction = "Sabio.Web.Controllers.Api.DeleteConversation";
                error.ErrorMessage = ex.Message;
                error.UserId = UserService.UserSelect().PersonId;
                svc.ErrorLogInsert(error);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }

        }
    }
}
