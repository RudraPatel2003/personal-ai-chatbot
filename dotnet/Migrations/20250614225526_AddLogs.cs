using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dotnet.Migrations;

/// <inheritdoc />
public partial class AddLogs : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.CreateTable(
            name: "Logs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Title = table.Column<string>(type: "text", nullable: false),
                Description = table.Column<string>(type: "text", nullable: true),
                CreatedBy = table.Column<string>(type: "text", nullable: false),
                CreatedAt = table.Column<DateTime>(
                    type: "timestamp with time zone",
                    nullable: false,
                    defaultValueSql: "now()"
                ),
            },
            constraints: table => _ = table.PrimaryKey("PK_Logs", x => x.Id)
        );
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.DropTable(name: "Logs");
    }
}
