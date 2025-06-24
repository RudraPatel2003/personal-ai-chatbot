using Carter;
using Dotnet.Database.Context;
using Dotnet.Database.Models;
using Dotnet.Endpoints.Conversations.Requests;
using Dotnet.Services.Logging;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;

namespace Dotnet.Endpoints.Conversations;

public class ConversationEndpoints : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        RouteGroupBuilder conversationsGroup = app.MapGroup("/conversations");

        _ = conversationsGroup.MapGet("/", GetAllConversations);
        _ = conversationsGroup.MapGet("/{id:guid}", GetConversationById);
        _ = conversationsGroup.MapPost("/", CreateConversation);
        _ = conversationsGroup.MapPost("/{id:guid}/chat", HandleChat);
        _ = conversationsGroup.MapPut("/{id:guid}", UpdateConversation);
        _ = conversationsGroup.MapDelete("/{id:guid}", DeleteConversation);
    }

    private static async Task<Ok<List<Conversation>>> GetAllConversations(
        ChatbotContext dbContext,
        ILoggingService loggingService
    )
    {
        await loggingService.Log("GET /api/dotnet/conversations", null);

        List<Conversation> conversations = await dbContext
            .Conversations.OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return TypedResults.Ok(conversations);
    }

    private static async Task<Results<Ok<Conversation>, NotFound>> GetConversationById(
        Guid id,
        ChatbotContext dbContext,
        ILoggingService loggingService
    )
    {
        await loggingService.Log($"GET /api/dotnet/conversations/{id}", null);

        Conversation? conversation = await dbContext
            .Conversations.Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == id);

        return conversation is null ? TypedResults.NotFound() : TypedResults.Ok(conversation);
    }

    private static async Task<Created<Conversation>> CreateConversation(
        CreateConversationRequest request,
        ChatbotContext dbContext,
        ILoggingService loggingService
    )
    {
        await loggingService.Log("POST /api/dotnet/conversations", request);

        Conversation conversation = new() { Name = request.Name, Messages = [] };

        _ = dbContext.Conversations.Add(conversation);
        _ = await dbContext.SaveChangesAsync();

        return TypedResults.Created($"/conversations/{conversation.Id}", conversation);
    }

    private static async Task HandleChat(
        Guid id,
        ChatRequest request,
        IChatClient chatClient,
        ChatbotContext dbContext,
        ILoggingService loggingService,
        HttpContext httpContext
    )
    {
        await loggingService.Log($"POST /api/dotnet/conversations/{id}/chat", request);

        // find the conversation we are adding to
        Conversation? conversation = await dbContext
            .Conversations.Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (conversation is null)
        {
            return;
        }

        // add user message to conversation
        Message userMessage = new()
        {
            Role = "user",
            Content = request.UserPrompt,
            CreatedAt = DateTime.UtcNow,
        };

        conversation.Messages.Add(userMessage);

        _ = await dbContext.SaveChangesAsync();

        // prepare chat history to give context to the model
        List<ChatMessage> chatHistory =
        [
            new ChatMessage(ChatRole.System, request.SystemPrompt),
            .. conversation.Messages.Select(m => new ChatMessage(
                m.Role == "user" ? ChatRole.User : ChatRole.Assistant,
                m.Content
            )),
        ];

        // Create assistant message early so we can update it as we stream
        Message assistantMessage = new()
        {
            Role = "assistant",
            Content = string.Empty,
            CreatedAt = DateTime.UtcNow,
        };

        conversation.Messages.Add(assistantMessage);

        _ = await dbContext.SaveChangesAsync();

        // For streaming, manually write the response to the response stream
        // Use X-Accel-Buffering to disable buffering for nginx
        httpContext.Response.ContentType = "text/plain";
        httpContext.Response.Headers.Append("X-Accel-Buffering", "no");

        // start streaming the response
        string response = string.Empty;
        int updateCount = 0;
        const int updateInterval = 5; // Save to database every 5 updates

        await using StreamWriter writer = new(httpContext.Response.Body);
        await foreach (
            ChatResponseUpdate update in chatClient.GetStreamingResponseAsync(chatHistory)
        )
        {
            // send response to client
            await writer.WriteAsync(update.Text);
            await writer.FlushAsync();

            // add to database if we've reached the update interval
            response += update.Text;
            updateCount++;

            if (updateCount % updateInterval == 0)
            {
                assistantMessage.Content = response;
                _ = await dbContext.SaveChangesAsync();
            }
        }

        // Save the final content to ensure we have the complete response
        assistantMessage.Content = response;
        _ = await dbContext.SaveChangesAsync();
    }

    private static async Task<Results<Ok<Conversation>, NotFound>> UpdateConversation(
        Guid id,
        UpdateConversationRequest request,
        ChatbotContext dbContext,
        ILoggingService loggingService
    )
    {
        await loggingService.Log($"PUT /api/dotnet/conversations/{id}", request);

        Conversation? conversation = await dbContext.Conversations.FindAsync(id);

        if (conversation is null)
        {
            return TypedResults.NotFound();
        }

        conversation.Name = request.Name;

        _ = await dbContext.SaveChangesAsync();

        return TypedResults.Ok(conversation);
    }

    private static async Task<Results<NoContent, NotFound>> DeleteConversation(
        Guid id,
        ChatbotContext dbContext,
        ILoggingService loggingService
    )
    {
        await loggingService.Log($"DELETE /api/dotnet/conversations/{id}", null);

        Conversation? conversation = await dbContext
            .Conversations.Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (conversation is null)
        {
            return TypedResults.NotFound();
        }

        _ = dbContext.Conversations.Remove(conversation);
        _ = await dbContext.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}
