namespace Dotnet.Database.Models;

public class Message : BaseEntity
{
    public required string Role { get; set; }
    public required string Content { get; set; }
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
}
