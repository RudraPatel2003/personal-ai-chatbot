using Dotnet.Database.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dotnet.Database.Configurations;

public class ConversationConfiguration : BaseEntityConfiguration<Conversation>
{
    public new void Configure(EntityTypeBuilder<Conversation> builder)
    {
        base.Configure(builder);

        _ = builder
            .HasMany(c => c.Messages)
            .WithOne()
            .HasForeignKey("ConversationId")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
