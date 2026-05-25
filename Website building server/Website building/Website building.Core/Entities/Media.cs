namespace Website_building.Core.Entities
{
    public class Media
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FileName { get; set; }
        public string FileUrl { get; set; }
        public string FileType { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}