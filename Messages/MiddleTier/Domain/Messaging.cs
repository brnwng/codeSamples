using System;

namespace Sabio.Web.Domain
{
    public class Messaging
    {
        public int Id { get; set; }
        public string SenderId { get; set; }
        public int ConvoId { get; set; }
        public string Content { get; set; }
        public bool IsRead { get; set; }
        public bool IsNotified { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
    }
}