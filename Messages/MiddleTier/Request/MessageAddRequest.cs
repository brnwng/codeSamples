using System.ComponentModel.DataAnnotations;

namespace Sabio.Web.Models.Requests
{
    public class MessagesAddRequest
    {
        [Required]
        public int ConvoId { get; set; }
        [Required]
        public string SenderId { get; set; }
        [Required]
        public string Content { get; set; }
        public bool NewConvo { get; set; }
        public string SenderFullName { get; set; }
        public bool IsRead { get; set; }
        public int Id { get; set; }
        public bool Flag { get; set; }
        public int SenderPersonId { get; set; }


    }
}