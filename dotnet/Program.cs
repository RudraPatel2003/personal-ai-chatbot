using Carter;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.AI;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();

// Add Carter
builder.Services.AddCarter();

// Add Ollama Service
string ollamaUri =
    builder.Configuration.GetValue<string>("OllamaUri")
    ?? throw new ArgumentException("OllamaUri is not set");

const string ollamaModel = "llama3.2:3b";

builder.Services.AddSingleton<IChatClient>(serviceProvider => new OllamaChatClient(
    new Uri(ollamaUri),
    ollamaModel
));

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.DocumentName = "dotnet";
    config.Title = "dotnet v1";
    config.Version = "v1";
});

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    _ = app.MapOpenApi();
    _ = app.UseOpenApi();
    _ = app.UseSwaggerUi(config =>
    {
        config.DocumentTitle = "TodoAPI";
        config.Path = "/swagger";
        config.DocumentPath = "/swagger/{documentName}/swagger.json";
        config.DocExpansion = "list";
        config.ServerUrl = "/api/dotnet";
    });
}

app.UseHttpsRedirection();
app.MapCarter();

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
