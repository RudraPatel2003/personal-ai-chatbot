using Carter;
using Dotnet.Endpoints.Messages.Requests;
using Dotnet.Services.Logging;
using Microsoft.Extensions.AI;

namespace Dotnet.Endpoints.Messages;

public class MessageEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        RouteGroupBuilder messagesGroup = app.MapGroup("/messages");

        _ = messagesGroup.MapPost("/chat", HandleChat);
    }

    private static async Task HandleChat(
        HttpContext context,
        IChatClient chatClient,
        ChatRequest request,
        ILoggingService loggingService
    )
    {
        await loggingService.Log("POST /api/dotnet/messages/chat", request);

        // Grab cancellation token to stop model once user ends stream
        // Otherwise, the model will continue to run the request to completion
        CancellationToken cancellationToken = context.RequestAborted;

        // Prepare chat history to give context to the model
        List<ChatMessage> chatHistory =
        [
            new ChatMessage(ChatRole.System, request.SystemPrompt),
            .. request.Messages.Select(m => new ChatMessage(
                m.Role == "user" ? ChatRole.User : ChatRole.Assistant,
                m.Content
            )),
        ];

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
