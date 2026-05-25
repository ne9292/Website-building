using Microsoft.EntityFrameworkCore;
using Website_building.Core.Resources;
using Website_building.Core.Interfaces;
using Website_building.Core.Entities;

namespace Website_building.Application.Services
{
    public class SiteService : ISiteService
    {
        // שימוש בממשק במקום במחלקה ישירה
        private readonly IApplicationDbContext _context;

        public SiteService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SiteDto> GetSiteByIdAsync(int id)
        {
            // כאן ה-Sites יזוהה כי הוא קיים בממשק
            var site = await _context.Sites.FindAsync(id);

            if (site == null) return null;

            return new SiteDto
            {
                Id = site.Id,
                UserId = site.UserId,
                SiteName = site.SiteName,
                Subdomain = site.Subdomain,
                PrimaryColor = site.PrimaryColor,
                IsPublished = site.IsPublished
            };
        }

        public async Task<SiteDto> GetSiteByUrlAsync(string url)
        {
            var site = await _context.Sites
                .Include(s => s.Pages)
                    .ThenInclude(p => p.Sections)
                .FirstOrDefaultAsync(s => s.Subdomain == url);

            if (site == null || !site.IsPublished) return null;

            return new SiteDto
            {
                Id = site.Id,
                SiteName = site.SiteName,
                Subdomain = site.Subdomain,
                UserId = site.UserId,
                PrimaryColor = site.PrimaryColor,
                Pages = site.Pages.Select(p => new PageDto
                {
                    Id = p.Id,
                    SiteId = p.SiteId,
                    Title = p.Title,
                    Slug = p.Slug,
                    IsHome = p.IsHome,
                    Sections = p.Sections.Select(s => new SectionDto
                    {
                        Type = s.Type,
                        ContentJson = s.ContentJson,
                        StylesJson = s.StylesJson
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<IEnumerable<SiteDto>> GetSitesByUserIdAsync(string userId)
        {
            return await _context.Sites
                .Where(s => s.UserId == userId)
                .Select(s => new SiteDto
                {
                    Id = s.Id,
                    SiteName = s.SiteName,
                    Subdomain = s.Subdomain,
                    PrimaryColor = s.PrimaryColor,
                    IsPublished = s.IsPublished,
                    UserId = s.UserId
                })
                .ToListAsync();
        }

        public async Task<SiteDto> CreateSiteAsync(string userId, CreateSiteDto model)
        {
            var site = new Site
            {
                UserId = userId,
                SiteName = model.SiteName,
                Subdomain = model.Subdomain,
                PrimaryColor = model.PrimaryColor,
                FontFamily = model.FontFamily
            };

            _context.Sites.Add(site);
            await _context.SaveChangesAsync();

            return new SiteDto
            {
                Id = site.Id,
                UserId = site.UserId,
                SiteName = site.SiteName,
                Subdomain = site.Subdomain,
                PrimaryColor = site.PrimaryColor
            };
        }

        public async Task<bool> UpdateSiteAsync(int id, string userId, UpdateSiteDto model)
        {
            var site = await _context.Sites.FindAsync(id);
            if (site == null || site.UserId != userId) return false;

            site.SiteName = model.SiteName ?? site.SiteName;
            site.PrimaryColor = model.PrimaryColor ?? site.PrimaryColor;
            site.FontFamily = model.FontFamily ?? site.FontFamily;
            site.LogoUrl = model.LogoUrl ?? site.LogoUrl;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSiteAsync(int id, string userId)
        {
            var site = await _context.Sites.FindAsync(id);
            if (site == null || site.UserId != userId) return false;

            _context.Sites.Remove(site);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetPublishStatusAsync(int id, string userId, bool isPublished)
        {
            var site = await _context.Sites.FindAsync(id);
            if (site == null || site.UserId != userId) return false;

            site.IsPublished = isPublished;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}