using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Website_building.Core.Resources;
using Website_building.Core.Interfaces;
using Website_building.Core.Entities; // חובה בשביל ApplicationUser

namespace Website_building.Application.Services
{
    public class AuthService : IAuthService
    {
        // משתמשים ב-ApplicationUser במקום ב-IdentityUser הכללי
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto model)
        {
            // כאן אנחנו מוסיפים גם את ה-FullName מה-DTO לישות החדשה
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email,
                FullName = model.FullName // עכשיו זה יזוהה!
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "המשתמש נרשם בהצלחה!"
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "משתמש לא נמצא במערכת" };
            }

            var result = await _userManager.CheckPasswordAsync(user, model.Password);

            if (!result)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "סיסמה שגויה, נסה שוב" };
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "התחברת בהצלחה!",
                Token = token
            };
        }

        // גם כאן החלפנו ל-ApplicationUser
        private string GenerateJwtToken(ApplicationUser user)
        {
            var key = _configuration["Jwt:Key"];

            if (string.IsNullOrEmpty(key))
            {
                throw new Exception("שגיאה קריטית: המפתח 'Jwt:Key' לא נמצא בקובץ appsettings.json!");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("FullName", user.FullName) // הוספת השם לטוקן (אופציונלי)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}