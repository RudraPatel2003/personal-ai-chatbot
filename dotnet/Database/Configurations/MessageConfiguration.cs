using Dotnet.Database.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dotnet.Database.Configurations;

public class MessageConfiguration : BaseEntityConfiguration<Message>
{
    public new void Configure(EntityTypeBuilder<Message> builder)
    {
        base.Configure(builder);
    }
}
