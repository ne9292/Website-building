namespace Website_building.Core.Entities
{
    public class Page
    {
        public int Id { get; set; }
        public int SiteId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsHome { get; set; }
        public List<Section> Sections { get; set; } = new();
    }
}