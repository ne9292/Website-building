using Microsoft.EntityFrameworkCore;
using Website_building.Core.Resources;
using Website_building.Core.Interfaces;
using Website_building.Core.Entities;

namespace Website_building.Application.Services
{
    public class PageService : IPageService
    {
        private readonly IApplicationDbContext _context;

        public PageService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PageDto>> GetPagesBySiteAsync(int siteId)
        {
            return await _context.Pages
                .Include(p => p.Sections) // חייבים לטעון את ה-Sections מה-DB
                .Where(p => p.SiteId == siteId)
                .Select(p => new PageDto
                {
                    Id = p.Id,
                    SiteId = p.SiteId,
                    Title = p.Title,
                    Slug = p.Slug,
                    IsHome = p.IsHome,
                    // מוסיפים את השורה הזו כדי שהתוכן יעבור לאנגולר
                    Sections = p.Sections.Select(s => new SectionDto
                    {
                        Type = s.Type,
                        ContentJson = s.ContentJson,
                        StylesJson = s.StylesJson
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<PageDto> GetPageByIdAsync(int pageId)
        {
            // הוספנו .Include כדי שה-SQL יביא גם את הרכיבים השמורים
            var page = await _context.Pages
                .Include(p => p.Sections)
                .FirstOrDefaultAsync(p => p.Id == pageId);

            if (page == null) return null;

            return new PageDto
            {
                Id = page.Id,
                SiteId = page.SiteId,
                Title = page.Title,
                Slug = page.Slug,
                IsHome = page.IsHome,
                // כאן אנחנו מחזירים את הרכיבים לאנגולר
                Sections = page.Sections.Select(s => new SectionDto
                {
                    Type = s.Type,
                    ContentJson = s.ContentJson,
                    StylesJson = s.StylesJson
                }).ToList()
            };
        }

        public async Task<PageDto> CreatePageAsync(int siteId, CreatePageDto model)
        {
            // מקסימום 6 דפים לאתר
            var count = await _context.Pages.CountAsync(p => p.SiteId == siteId);
            if (count >= 6) throw new InvalidOperationException("מקסימום 6 דפים לאתר");

            var page = new Page
            {
                SiteId = siteId,
                Title = model.Title,
                Slug = model.Slug,
                IsHome = model.IsHome
            };

            _context.Pages.Add(page);
            await _context.SaveChangesAsync();

            return new PageDto
            {
                Id = page.Id,
                SiteId = page.SiteId,
                Title = page.Title,
                Slug = page.Slug,
                IsHome = page.IsHome
            };
        }

        public async Task<bool> UpdatePageAsync(int pageId, UpdatePageDto model)
        {
            // אנחנו מוסיפים .Include(p => p.Sections) כדי שהשרת יטען גם את הרכיבים הקיימים של הדף
            var page = await _context.Pages
                .Include(p => p.Sections)
                .FirstOrDefaultAsync(p => p.Id == pageId);

            if (page == null) return false;

            // עדכון פרטי הדף הבסיסיים
            page.Title = model.Title ?? page.Title;
            page.Slug = model.Slug ?? page.Slug;
            page.IsHome = model.IsHome;

            // --- כאן אנחנו סוגרים את החור של שמירת התוכן ---

            // מחיקת הרכיבים הישנים (כדי להחליף אותם בחדשים מהעורך)
            _context.Sections.RemoveRange(page.Sections);

            // הוספת הרכיבים החדשים שהגיעו מהאנגולר
            if (model.Sections != null)
            {
                page.Sections = model.Sections.Select(s => new Section
                {
                    Type = s.Type,
                    ContentJson = s.ContentJson, // כאן נשמרים המיקומים והאלמנטים שגררת
                    StylesJson = s.StylesJson,
                    OrderIndex = s.OrderIndex,
                    PageId = pageId
                }).ToList();
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePageAsync(int pageId)
        {
            var page = await _context.Pages.FindAsync(pageId);
            if (page == null) return false;

            _context.Pages.Remove(page);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}