namespace Dotnet.Database.Models;

public class Conversation : BaseEntity
{
    public required string Name { get; set; }
    public required List<Message> Messages { get; set; }
}
