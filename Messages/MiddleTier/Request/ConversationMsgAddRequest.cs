using System.ComponentModel.DataAnnotations;

namespace Sabio.Web.Models.Requests
{
    public class ConversationMsgAddRequest
    {
        [Required]
        public string SenderId { get; set; }
        [Required]
        public string ReceiverId { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Content { get; set; }
    }
}