fbAPI = (function(){
	var _user;

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

		getUserFriends: function(){
			var dfs = $.Deferred();
			FB.api('/me/friends?fields=id,name,picture', function(res){
				dfs.resolve(res);
			});
			return dfs.promise();
		},

		setUserAuth: function(user){
			_user=user;
		},

		postOnFBWall : function(msg, id){
			FB.api('/'+id+'/feed', 'post', {message: msg},
				function(res){
			});
		}
	}
})();