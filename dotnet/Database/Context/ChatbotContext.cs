using Dotnet.Database.Models;
using Microsoft.EntityFrameworkCore;

namespace Dotnet.Database.Context;

public class ChatbotContext(DbContextOptions<ChatbotContext> options) : DbContext(options)
{
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Log> Logs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        _ = modelBuilder.ApplyConfigurationsFromAssembly(typeof(ChatbotContext).Assembly);
    }
}
