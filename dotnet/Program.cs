using System.Text.Json.Serialization;
using Carter;
using Dotnet.Database.Context;
using Dotnet.Services.Logging;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();

// Add JSON serialization configuration
builder.Services.Configure<JsonOptions>(options =>
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles
);

// Add DbContext
string connectionString =
    builder.Configuration.GetConnectionString("PersonalAiChatbot")
    ?? throw new ArgumentException("Connection string is not set");

builder.Services.AddDbContext<ChatbotContext>(options =>
    options.UseNpgsql(
        connectionString,
        postgresOptions => postgresOptions.SetPostgresVersion(new Version(17, 5))
    )
);

// Add Carter
builder.Services.AddCarter();

// Add healthchecks
builder.Services.AddHealthChecks();

// Add Ollama Service
string ollamaUri =
    builder.Configuration.GetValue<string>("OllamaUri")
    ?? throw new ArgumentException("OllamaUri is not set");

const string ollamaModel = "llama3.2:3b";

builder.Services.AddSingleton<IChatClient>(serviceProvider => new OllamaChatClient(
    new Uri(ollamaUri),
    ollamaModel
));

// Add Logging Service
builder.Services.AddSingleton<ILoggingService, RabbitMqLogger>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "dotnet";
    config.Title = "dotnet v1";
    config.Version = "v1";
});

WebApplication app = builder.Build();

// Run database migrations
using (IServiceScope scope = app.Services.CreateScope())
{
    ChatbotContext dbContext = scope.ServiceProvider.GetRequiredService<ChatbotContext>();
    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    _ = app.MapOpenApi();
    _ = app.UseOpenApi();
    _ = app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "PersonalAiChatbot";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
        config.ServerUrl = "/api/dotnet";
    });
}

app.UseHttpsRedirection();

// Map endpoints
app.MapCarter();
app.MapHealthChecks("/health");

// Global error handler
app.UseExceptionHandler(errorApp =>
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        IExceptionHandlerFeature? exceptionHandlerFeature =
            context.Features.Get<IExceptionHandlerFeature>();

        Exception? exception = exceptionHandlerFeature?.Error;

        if (exception is not null)
        {
            await context.Response.WriteAsJsonAsync(new { error = exception.Message });
        }
        else
        {
            await context.Response.WriteAsJsonAsync(
                new { error = "An unexpected error occurred." }
            );
        }
    })
);

app.Run();
