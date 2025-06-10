namespace Dotnet.Database.Models;

public class Message : BaseEntity
{
    public required string Role { get; set; }
    public required string Content { get; set; }
}
