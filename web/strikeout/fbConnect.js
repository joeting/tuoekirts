fbConnect = (function(){
	var _user;

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
						appId      : '481358151881628',
						status     : true,
						cookie     : true,
						xfbml      : true,
						oauth      : true
					});

					FB.getLoginStatus(function(response) {
						if (response.authResponse) {
							dfs.resolve(response);
						} else {
							dfs.resolve(response);
						}
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
					var rediectUrl= "http://173.167.126.50:9012/ts/web/init.html";
					var perms = "user_groups,publish_stream,email,offline_access,user_about_me, user_work_history, friends_work_history, user_education_history, friends_education_history, user_location, friends_location, user_hometown, friends_hometown, read_friendlists";
					var	url = '//graph.facebook.com/oauth/authorize?client_id=' +
					481358151881628 + '&scope=' + perms + '&redirect_uri=' + encodeURIComponent(rediectUrl);
					window.open(url,'_self');
				})
			}
		}
	}
})();