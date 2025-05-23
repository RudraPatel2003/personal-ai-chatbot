using Carter;
using Microsoft.Extensions.AI;

namespace Endpoints;

public class MessageEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        RouteGroupBuilder messagesGroup = app.MapGroup("/messages");

        _ = messagesGroup.MapPost("/actions/chat", HandleChat);
    }

    private static async Task HandleChat(
        HttpContext context,
        IChatClient chatClient,
        ChatRequest request
    )
    {
        context.Response.ContentType = "text/plain";

        List<ChatMessage> chatHistory = [new(ChatRole.User, request.Prompt)];

        await using StreamWriter writer = new(context.Response.Body);
        await foreach (
            ChatResponseUpdate update in chatClient.GetStreamingResponseAsync(chatHistory)
        )
        {
            await writer.WriteAsync(update.Text);
            await writer.FlushAsync();
        }
    }
}

public class ChatRequest
{
    public required string Prompt { get; set; }
}
