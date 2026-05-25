using Microsoft.Extensions.DependencyInjection;
using Website_building.Application.Services;
using Website_building.Core.Interfaces;

namespace Website_building.Service
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<ISiteService, SiteService>();
            services.AddScoped<IPageService, PageService>();
            services.AddScoped<IAuthService, AuthService>();
            return services;
        }
    }
}
