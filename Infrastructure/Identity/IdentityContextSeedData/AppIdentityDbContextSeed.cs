using System;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Core.Entities.Identity;

namespace Infrastructure.Identity.IdentityContextSeedData
{
	public class AppIdentityDbContextSeed
	{
		public static async Task SeedUserAsync(UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
		{
			if (!userManager.Users.Any())
			{
				// Create a new user with the "admin" role
				var user1 = new AppUser
				{
					DisplayName = "Ahmed",
					Email = "ahmedfathymohamed1998@gmail.com",
					UserName = "ahmedfathymohamed1998@gmail.com",
					Address = new Address
					{
						FirstName = "Ahmed",
						LastName = "Fathy",
						Street = "6th street",
						City = "Cairo",
						State = "Giza",
						ZipCode = "3387722"
					}
				};
				if (!await roleManager.RoleExistsAsync("admin"))
				{
					await roleManager.CreateAsync(new IdentityRole("admin"));
				}
				await userManager.CreateAsync(user1, "AhmedFathy_2m");
				await userManager.AddToRoleAsync(user1, "admin");
			
			

			
				var user2 = new AppUser
				{
					DisplayName = "Mohamed",
					Email = "ahmedfathymohamed@hotmail.com",
					UserName = "ahmedfathymohamed@hotmail.com",
					Address = new Address
					{
						FirstName = "Mohamed",
						LastName = "Fathy",
						Street = "6th street",
						City = "Cairo",
						State = "Giza",
						ZipCode = "3387733"
					}
				};
				await userManager.CreateAsync(user2, "AhmedFathy_3m");

				// Assign the "admin" role to the user
				await userManager.AddToRoleAsync(user2, "admin");
			}
		}
	}
}