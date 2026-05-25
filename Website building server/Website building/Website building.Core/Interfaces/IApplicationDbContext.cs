using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using Website_building.Core.Entities;


namespace Website_building.Core.Interfaces
{
    public interface IApplicationDbContext
    {
        DbSet<Site> Sites { get; set; }
        DbSet<Page> Pages { get; set; }
        DbSet<Section> Sections { get; set; }
        DbSet<Media> MediaGallery { get; set; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}