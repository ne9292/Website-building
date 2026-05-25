

using Microsoft.AspNetCore.Identity;

namespace Website_building.Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
    }
}
