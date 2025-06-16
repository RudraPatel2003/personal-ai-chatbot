using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dotnet.Migrations;

/// <inheritdoc />
public partial class AddName : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.AddColumn<string>(
            name: "Name",
            table: "Conversations",
            type: "text",
            nullable: false,
            defaultValue: ""
        );
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        _ = migrationBuilder.DropColumn(name: "Name", table: "Conversations");
    }
}
