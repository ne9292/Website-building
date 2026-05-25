namespace Website_building.Core.Entities
{
    public class Site
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string SiteName { get; set; }
        public string Subdomain { get; set; }
        public string PrimaryColor { get; set; } = "#3b82f6";
        public string FontFamily { get; set; } = "Arial";
        public string? LogoUrl { get; set; }
        public bool IsPublished { get; set; } = false;
        public List<Page> Pages { get; set; } = new();
    }
}