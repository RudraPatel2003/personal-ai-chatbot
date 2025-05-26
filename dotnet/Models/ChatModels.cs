namespace Dotnet.Models;

public class ChatRequest
{
    public required string Id { get; set; }
    public required List<Message> Messages { get; set; }
}

public class Message
{
    public required string Role { get; set; }
    public required string Content { get; set; }
}
