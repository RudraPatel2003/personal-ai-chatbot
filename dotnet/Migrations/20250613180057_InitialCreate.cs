using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dotnet.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.CreateTable(
            name: "Conversations",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(
                    type: "timestamp with time zone",
                    nullable: false,
                    defaultValueSql: "now()"
                ),
            },
            constraints: table => _ = table.PrimaryKey("PK_Conversations", x => x.Id)
        );

        _ = migrationBuilder.CreateTable(
            name: "Messages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Role = table.Column<string>(type: "text", nullable: false),
                Content = table.Column<string>(type: "text", nullable: false),
                ConversationId = table.Column<Guid>(type: "uuid", nullable: true),
                CreatedAt = table.Column<DateTime>(
                    type: "timestamp with time zone",
                    nullable: false,
                    defaultValueSql: "now()"
                ),
            },
            constraints: table =>
            {
                _ = table.PrimaryKey("PK_Messages", x => x.Id);
                _ = table.ForeignKey(
                    name: "FK_Messages_Conversations_ConversationId",
                    column: x => x.ConversationId,
                    principalTable: "Conversations",
                    principalColumn: "Id"
                );
            }
        );

        _ = migrationBuilder.CreateIndex(
            name: "IX_Messages_ConversationId",
            table: "Messages",
            column: "ConversationId"
        );
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.DropTable(name: "Messages");

        _ = migrationBuilder.DropTable(name: "Conversations");
    }
}
