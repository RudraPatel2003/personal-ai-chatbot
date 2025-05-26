using Carter;
using Microsoft.Extensions.AI;

namespace Dotnet.Endpoints;

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
        // Grab cancellation token to stop model once user ends stream
        // Otherwise, the model will continue to run the request to completion
        CancellationToken cancellationToken = context.RequestAborted;

        // Prepare chat history to give context to the model
        List<ChatMessage> chatHistory = [new(ChatRole.User, request.Prompt)];

        // For streaming, manually write the response to the response stream
        // Use X-Accel-Buffering to disable buffering for nginx
        context.Response.ContentType = "text/plain";
        context.Response.Headers.Append("X-Accel-Buffering", "no");

        await using StreamWriter writer = new(context.Response.Body);
        await foreach (
            ChatResponseUpdate update in chatClient.GetStreamingResponseAsync(chatHistory)
        )
        {
            await writer.WriteAsync(update.Text);
            await writer.FlushAsync();

            if (cancellationToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}

public class ChatRequest
{
    public required string Prompt { get; set; }
}
