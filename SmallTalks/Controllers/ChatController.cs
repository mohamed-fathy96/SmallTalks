
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmallTalks.Extensions;

namespace SmallTalks.Controllers
{
	
	public class ChatController : BaseController
	{
		private readonly UserManager<AppUser> _userManager;
		private readonly SignInManager<AppUser> _signInManager;



	

		public ChatController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager)
		{
			_userManager = userManager;
			_signInManager = signInManager;
		}

		[HttpGet]
		public async Task<ActionResult<List<string>>> GetAllNamesOfUsersAsync()
		{
			var userNames = await _userManager.GetAllUserNamesAsync();
			return Ok(userNames.ToList());
		}

		

	


	}
}
