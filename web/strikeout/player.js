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

			getAllGames: function(){
				return $.ajax({
					url: 'http://localhost:3000/game/'+fbAPI.getUserId()+'/all',
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
						url: '/strikeout/user/'+fbAPI.getUserId(),
						data: data,
						type: 'POST',
						dataType: 'json',
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

				$.when(
					player.Model.getAllGames(),
					fbAPI.getUserFriends()
				).done(function(data, friends){
					console.log(data[0]);
					var gameData = data[0];
					var player = [];
					var cur_game = {};

					for(var i=0; i<gameData.length; i++){
						player[i] = {};
						if(gameData[i].player1 !== fbAPI.getUserId())
						{
							player[i].id = gameData[i].player1;
						}
						else if(gameData[i].player2 !== fbAPI.getUserId())
						{
							player[i].id = gameData[i].player2;
						}
						player[i].gameId = gameData[i]._id;
					}

					for(var i=0; i<player.length; i++){
						for(var j=0; j<friends.data.length; j++){
							if(friends.data[j].id === player[i].id){
								player[i].pic = friends.data[j].picture;
								player[i].name = friends.data[j].name;
								break;
							}
						}
					}
					cur_game.player = player;
					$('div.current_games').html($('script.current_games').tmpl(cur_game));
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

				$('div.friendsList_page').on('click', 'li', function(e){
					var id = $(this).data('id');
					$.when(
						game.Model.create(id)
					).done(function(res){
						window.open('strikeout.html?newGame=true&gid='+res.game,'_self');
					});
				});

				$('div.current_games').on('click','.userImg img', function(e){
					var obj = $(this);
					window.open('strikeout.html?newGame=false&gid='+obj.data('gid'),'_self');
				});
			}
		}
	}
})();