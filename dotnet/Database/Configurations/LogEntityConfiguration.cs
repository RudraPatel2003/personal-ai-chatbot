using Dotnet.Database.Models;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dotnet.Database.Configurations;

public class LogConfiguration : BaseEntityConfiguration<Log>
{
    public new void Configure(EntityTypeBuilder<Log> builder)
    {
        base.Configure(builder);
    }
}
