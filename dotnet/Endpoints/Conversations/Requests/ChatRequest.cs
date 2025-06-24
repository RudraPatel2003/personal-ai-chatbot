namespace Dotnet.Endpoints.Conversations.Requests;

public class ChatRequest
{
    public required string SystemPrompt { get; set; }
    public required string UserPrompt { get; set; }
}
