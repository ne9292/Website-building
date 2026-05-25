using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Website_building.Core.Interfaces;
using Website_building.Core.Resources;

[Authorize]
[ApiController]
[Route("api/sites")]
public class SitesController : ControllerBase
{
    private readonly ISiteService _siteService;

    public SitesController(ISiteService siteService)
    {
        _siteService = siteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMySites()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var sites = await _siteService.GetSitesByUserIdAsync(userId);
        return Ok(sites);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSite(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.GetSiteByIdAsync(id);
        if (site == null) return NotFound();
        if (site.UserId != userId) return Forbid();
        return Ok(site);
    }

    [AllowAnonymous]
    [HttpGet("public/{url}")]
    public async Task<IActionResult> GetPublicSite(string url)
    {
        if (string.IsNullOrWhiteSpace(url) || !System.Text.RegularExpressions.Regex.IsMatch(url, @"^[a-zA-Z0-9\-]+$"))
            return BadRequest("כתובת לא תקינה");

        var site = await _siteService.GetSiteByUrlAsync(url);
        if (site == null) return NotFound();
        return Ok(site);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSite(CreateSiteDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var site = await _siteService.CreateSiteAsync(userId, model);
        return Ok(site);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSite(int id, UpdateSiteDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var success = await _siteService.UpdateSiteAsync(id, userId, model);
        if (!success) return Forbid();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSite(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var success = await _siteService.DeleteSiteAsync(id, userId);
        if (!success) return Forbid();
        return Ok();
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> SetPublishStatus(int id, [FromBody] SetPublishDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var success = await _siteService.SetPublishStatusAsync(id, userId, model.IsPublished);
        if (!success) return Forbid();
        return Ok();
    }
}