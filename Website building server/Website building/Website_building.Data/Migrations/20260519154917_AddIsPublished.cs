using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Website_building.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPublished : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Sites",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Sites");
        }
    }
}
