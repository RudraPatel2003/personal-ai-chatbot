using System.Text;
using System.Text.Json;
using Dotnet.Database.Models;
using RabbitMQ.Client;

namespace Dotnet.Services.Logging;

public class RabbitMqLogger : ILoggingService, IDisposable
{
    private const string QueueName = "logging.queue";
    private readonly ConnectionFactory _factory;
    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqLogger()
    {
        _factory = new ConnectionFactory
        {
            HostName = "rabbitmq",
            Port = 5672,
            UserName = "admin",
            Password = "password",
        };

        _ = Task.Run(InitializeAsync);
    }

    private async Task InitializeAsync()
    {
        _connection = await _factory.CreateConnectionAsync();
        _channel = await _connection.CreateChannelAsync();

        _ = await _channel.QueueDeclareAsync(
            queue: QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null
        );
    }

    public async Task Log(string title, object? description, string createdBy = "dotnet")
    {
        if (_channel is null)
        {
            return;
        }

        Log log = new()
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = GetDescriptionAsString(description),
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
        };

        byte[] body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(log));

        await _channel.BasicPublishAsync(exchange: "", routingKey: QueueName, body: body);
    }

    private static string? GetDescriptionAsString(object? value)
    {
        return value is null ? null
            : value is string ? value as string
            : JsonSerializer.Serialize(value);
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);

        _channel?.Dispose();
        _connection?.Dispose();

        _channel = null;
        _connection = null;
    }
}
