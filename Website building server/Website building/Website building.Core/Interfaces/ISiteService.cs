using Website_building.Core.Resources;

namespace Website_building.Core.Interfaces
{
    public interface ISiteService
    {
        Task<SiteDto> GetSiteByIdAsync(int id);
        Task<SiteDto> GetSiteByUrlAsync(string url);
        Task<IEnumerable<SiteDto>> GetSitesByUserIdAsync(string userId);
        Task<SiteDto> CreateSiteAsync(string userId, CreateSiteDto model);
        Task<bool> UpdateSiteAsync(int id, string userId, UpdateSiteDto model);
        Task<bool> DeleteSiteAsync(int id, string userId);
        Task<bool> SetPublishStatusAsync(int id, string userId, bool isPublished);
    }
}