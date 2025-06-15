namespace Dotnet.Database.Models;

public class Log : BaseEntity
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string CreatedBy { get; set; } = "dotnet";
}
