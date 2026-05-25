using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Website_building.Data.Migrations
{
    public partial class AddMissingColumnsToSections : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Sections') AND name = N'StylesJson')
                    ALTER TABLE [Sections] ADD [StylesJson] nvarchar(max) NOT NULL DEFAULT '{}';
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Sections') AND name = N'OrderIndex')
                    ALTER TABLE [Sections] ADD [OrderIndex] int NOT NULL DEFAULT 0;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Sections') AND name = N'StylesJson')
                    ALTER TABLE [Sections] DROP COLUMN [StylesJson];
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'Sections') AND name = N'OrderIndex')
                    ALTER TABLE [Sections] DROP COLUMN [OrderIndex];
            ");
        }
    }
}
