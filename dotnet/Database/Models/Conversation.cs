namespace Dotnet.Database.Models;

public class Conversation : BaseEntity
{
    public required List<Message> Messages { get; set; }
}
