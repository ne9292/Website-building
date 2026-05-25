
using Website_building.Core.Resources;

namespace Website_building.Core.Interfaces
{
    public interface IPageService
    {
        Task<IEnumerable<PageDto>> GetPagesBySiteAsync(int siteId);
        Task<PageDto> GetPageByIdAsync(int pageId);
        Task<PageDto> CreatePageAsync(int siteId, CreatePageDto model);
        Task<bool> UpdatePageAsync(int pageId, UpdatePageDto model);
        Task<bool> DeletePageAsync(int pageId);
    }
}