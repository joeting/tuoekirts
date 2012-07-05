player = (function(){

	var _userFriends;

	return {
		Model:{
			getPlayer: function(){
				return $.ajax({
					url: 'http://localhost:3000/user/'+fbAPI.getUserId(),
					type: 'GET',
					dataType: "jsonp",
			        cache: false
				});
			},

			createPlayer: function(){
				$.when(
					fbAPI.getUserInfo()
				).done(function(fbData){
					var data={
						alias : fbAPI.getUserId(),
						fbid : fbAPI.getUserId(),
						fbprofile : fbData,
						wins : 0,
						loss : 0,
						rating : 0
					};

					$.ajax({
						url: 'http://localhost:3000/user/'+fbAPI.getUserId(),
						data: data,
						type: 'POST',
						dataType: 'json',
				        cache: false,
						success: function(res){
							console.log(res);
						},
						error: function(e,r,t){
							console.log(e);
						}
					});
				});
			}
		},

		View:{
			displayData: function(){
				var userData;
				$.when(
					fbAPI.getUserInfo(),
					fbAPI.getUserPic(),
					player.Model.getPlayer()
				).done(function(userData, pic, playerData){
					if(playerData[0].length === 0)
					{
						player.Model.createPlayer();
					}
					userData.pic = pic;
					$('div.player').html($('script.player').tmpl(userData));
				});
			}
		},

		Ctrl:{
			init: function(){

			},

			load: function(){
				$(".connect_friends").on('click', function(e){
					var player_options = $(".player_options");
					var friendsList_page = $("div.friendsList_page");

					$.when(
						fbAPI.getUserFriends()
					).done(function(friends){
						player_options.animate({
						marginLeft: -player_options.outerWidth(),
						opacity: 0
						},function(){
						});

						player_options.addClass('floatLeft');
						friendsList_page.html($('script.friendsList_page').tmpl(friends));

						friendsList_page.animate({
							marginLeft : 10,
							opacity: 1
						}, function(){
						});
					});
				});

				$('div.friendsList_page').on('click', '.back_player', function(e){
					var player_options = $(".player_options");
					var friendsList_page = $("div.friendsList_page");

					friendsList_page.animate({
						marginLeft : friendsList_page.outerWidth(),
						opacity: 0
					}, function(){
						player_options.removeClass('floatLeft');
					});

					player_options.animate({
						marginLeft : 10,
						opacity: 1
					},function(){

					});
				});


			}
		}
	}
})();