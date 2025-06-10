using Carter;
using Dotnet.Endpoints.Messages.Requests;
using Microsoft.Extensions.AI;

namespace Dotnet.Endpoints.Messages;

public class MessageEndpoints : ICarterModule
{
    private static readonly string SystemPrompt = """
        You are a helpful AI assistant.
        You provide accurate, thoughtful, and well-structured responses.
        You aim to be clear and concise while being thorough when needed.
        You can help with a wide variety of tasks including answering questions, writing, analysis, math, coding, and creative tasks.
        Provide your response in markdown format.
        """;

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
        List<ChatMessage> chatHistory =
        [
            new ChatMessage(ChatRole.System, SystemPrompt),
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
