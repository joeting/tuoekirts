fbConnect = (function(){
	var _user;
	var APP_ID = 481358151881628;

	return {
		Model:{

		},

		View:{

		},

		Ctrl:{
			init: function(){
				var dfs = $.Deferred();
				window.fbAsyncInit = function() {
					FB.init({
						appId      : APP_ID,
						status     : true,
						cookie     : true,
						xfbml      : true,
						oauth      : true
					});

					FB.getLoginStatus(function(response) {
						fbAPI.setUserAuth(response);
						dfs.resolve(response);
					});
			    };

			    var e = document.createElement('script');
				e.src = '//connect.facebook.net/en_US/all.js';
				e.async = true;
				document.getElementById('fb-root').appendChild(e);

			    return dfs.promise();
			},

			load: function(){
				$('.button').on('click',function(e){
					$('.st-loginBox').fadeOut();
				});

				$('.st-fbButton').on('click', function(e){
					var rediectUrl= "http://10.111.2.240:9012/ts/web/init.html";
//					var perms = "user_groups, publish_stream, email, offline_access, user_about_me, user_work_history, user_location, friends_location, user_hometown, friends_games_activity, friends_hometown, read_friendlists";
					var perms = "";
					var	url = '//graph.facebook.com/oauth/authorize?client_id=' +
					APP_ID + '&scope=' + perms + '&redirect_uri=' + encodeURIComponent(rediectUrl);
					window.open(url,'_self');
				})
			}
		}
	}
})();