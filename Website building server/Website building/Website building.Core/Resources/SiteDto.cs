namespace Website_building.Core.Resources
{
    public class SiteDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string SiteName { get; set; }
        public string Subdomain { get; set; }
        public string PrimaryColor { get; set; }
        public bool IsPublished { get; set; }
        public List<PageDto> Pages { get; set; } = new();
    }

    public class SetPublishDto
    {
        public bool IsPublished { get; set; }
    }

    public class CreateSiteDto
    {
        public string SiteName { get; set; }
        public string Subdomain { get; set; }
        public string PrimaryColor { get; set; } = "#3b82f6";
        public string FontFamily { get; set; } = "Arial";
    }

    public class UpdateSiteDto
    {
        public string SiteName { get; set; }
        public string PrimaryColor { get; set; }
        public string FontFamily { get; set; }
        public string LogoUrl { get; set; }
    }
}