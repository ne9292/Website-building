using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Website_building.Core.Interfaces;
using Website_building.Core.Resources;

[Authorize]
[ApiController]
[Route("api/sites/{siteId}/pages")]
public class PagesController : ControllerBase
{
    private readonly IPageService _pageService;
    private readonly ISiteService _siteService;

    public PagesController(IPageService pageService, ISiteService siteService)
    {
        _pageService = pageService;
        _siteService = siteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPages(int siteId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.GetSiteByIdAsync(siteId);
        if (site == null || site.UserId != userId) return Forbid();

        var pages = await _pageService.GetPagesBySiteAsync(siteId);
        return Ok(pages);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePage(int siteId, CreatePageDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.GetSiteByIdAsync(siteId);
        if (site == null || site.UserId != userId) return Forbid();

        try
        {
            var page = await _pageService.CreatePageAsync(siteId, model);
            return Ok(page);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{pageId}")]
    public async Task<IActionResult> UpdatePage(int siteId, int pageId, UpdatePageDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.GetSiteByIdAsync(siteId);
        if (site == null || site.UserId != userId) return Forbid();

        var success = await _pageService.UpdatePageAsync(pageId, model);
        if (!success) return NotFound();
        return Ok();
    }

    [HttpDelete("{pageId}")]
    public async Task<IActionResult> DeletePage(int siteId, int pageId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.GetSiteByIdAsync(siteId);
        if (site == null || site.UserId != userId) return Forbid();

        var success = await _pageService.DeletePageAsync(pageId);
        if (!success) return NotFound();
        return Ok();
    }
}