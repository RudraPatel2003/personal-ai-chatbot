using Dotnet.Database.Models;

namespace Dotnet.Endpoints.Messages.Requests;

public class ChatRequest
{
    public required List<Message> Messages { get; set; }
}
