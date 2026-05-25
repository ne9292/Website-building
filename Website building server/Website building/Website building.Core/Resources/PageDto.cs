namespace Website_building.Core.Resources
{
    public class PageDto
    {
        public int Id { get; set; }
        public int SiteId { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsHome { get; set; }
        public List<SectionDto> Sections { get; set; } = new();
    }

    public class SectionDto
    {
        public string Type { get; set; }
        public string ContentJson { get; set; }
        public string StylesJson { get; set; }
        public int OrderIndex { get; set; }
    }

    public class CreatePageDto
    {
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsHome { get; set; } = false;
    }

    public class SectionUpdateDto
    {
        public string Type { get; set; }
        public string ContentJson { get; set; }
        public string StylesJson { get; set; }
        public int OrderIndex { get; set; }
    }

    public class UpdatePageDto
    {
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsHome { get; set; }
        public List<SectionUpdateDto> Sections { get; set; } = new();
    }
}