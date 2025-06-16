namespace Dotnet.Services.Logging;

public interface ILoggingService
{
    Task Log(string title, object? description, string createdBy = "dotnet");
}
