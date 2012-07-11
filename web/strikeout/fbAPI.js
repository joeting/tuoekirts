fbAPI = (function(){
	var _user;
	var _friends;

	function sortByName(a, b) {
	    var x = a.name.toLowerCase();
	    var y = b.name.toLowerCase();
	    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	}

	return{
		getAccessToken: function(){
			return _user.authResponse.accessToken;
		},

		getUserId: function(){
			return _user.authResponse.userID;
		},

		getUserStatus: function(){
			return _user.status;
		},

		getUserPic: function(){
			var dfs = $.Deferred();
			FB.api('/me/picture', function(res){
				dfs.resolve(res);
			});
			return dfs.promise();
		},

		getFriendPic: function(id){
			var dfs = $.Deferred();
			FB.api('/'+id+'/picture', function(res){
				dfs.resolve(res);
			});
			return dfs.promise();
		},

		getUserInfo: function(){
			var dfs = $.Deferred();
			FB.api('/me', function(res){
				dfs.resolve(res);
			});
			return dfs.promise();
		},

		getUserFriend: function(id){
			var dfs = $.Deferred();
			FB.api('/'+id+'?fields=id,name,picture', function(res){
				dfs.resolve(res);
			});
			return dfs.promise();
		},
		getUserFriends: function(){
			var dfs = $.Deferred();
			if(_friends)
			{
				dfs.resolve(_friends);
			}
			else
			{
				FB.api('/me/friends?fields=id,name,picture', function(res){
					res.data = res.data.sort(sortByName);
					fbAPI.setUserFriends(res);
					dfs.resolve(res);
				});
			}
			return dfs.promise();
		},

		setUserAuth: function(user){
			_user=user;
		},

		setUserFriends: function(friends){
			_friends=friends;
		},

		postOnFBWall : function(msg, id){
			FB.api('/'+id+'/feed', 'post', {message: msg},
				function(res){
			});
		}
	}
})();