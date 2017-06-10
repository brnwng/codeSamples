using System;

namespace Sabio.Web.Domain
{
    public class MessagingConversation
    {
        public int ID { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Subject { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public string Content { get; set; }
        public string SenderFirst { get; set; }
        public string SenderLast { get; set; }
        public string ReceiverFirst { get; set; }
        public string ReceiverLast { get; set; }
        public bool IsRead { get; set; }
        public int SenderPersonId { get; set; }
        public int ReceiverPersonId { get; set; }
        public string SenderFullName
        {
            get { return string.Format("{0} {1}", SenderFirst, SenderLast); }
        }
        public string ReceiverFullName
        {
            get { return string.Format("{0} {1}", ReceiverFirst, ReceiverLast); }
        }
    }
}