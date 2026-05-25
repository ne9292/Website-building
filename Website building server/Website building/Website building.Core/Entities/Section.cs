namespace Website_building.Core.Entities
{
    public class Section
    {
        public int Id { get; set; }
        public int PageId { get; set; }//מקשר לאיזה דף האלמנט שייך
        public string Type { get; set; }//סוג האלמנט כמו כותרת, פסקה, תמונה וכו
        public string ContentJson { get; set; }//תוכן האלמנט בפורמט JSON כדי לאפשר גמישות בתוכן
        public string StylesJson { get; set; }//סגנונות האלמנט בפורמט JSON כדי לאפשר עיצוב גמיש
        public int OrderIndex { get; set; }//סדר ההופעה בדף
    }
}