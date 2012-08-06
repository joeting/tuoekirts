game = (function(){

	var _gameObj;

	return {
		Model : {
			create: function(oppId){
				var data = {
					player1 : fbAPI.getUserId(),
					player2 : oppId
				};
				return $.ajax({
					url: '/strikeout/game/'+fbAPI.getUserId(),
					data: data,
					type: 'POST',
					dataType: 'json',
			        cache: false
				});
			},

			get: function(gameId){
				if(_gameObj)
				{
					return _gameObj;
				}
				else
				{
					return $.ajax({
						url: 'http://192.168.0.105:3000/game/'+gameId,
						type: 'GET',
						dataType: 'jsonp',
				        cache: false
					});
				}
			},

			set: function(obj){
				_gameObj = obj;
			},

			end: function(gameId){
				var data = {
					status : 'end',
					winner : fbAPI.getUserId(),
					loser : _gameObj.player1 == fbAPI.getUserId() ? _gameObj.player2 : _gameObj.player1
				};

				return $.ajax({
					url: '/strikeout/game/'+gameId,
					data: data,
					type: 'PUT',
					dataType: 'json',
			        cache: false
				});
			}
		},

		View : {

		},

		Ctrl : {

		}
	}
})();