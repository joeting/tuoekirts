game = (function(){

	var _gameObj;

	return {
		Model : {
			create: function(oppId){
				var data = {
					player1 : fbAPI.getUserId(),
					player2 : oppId
				}
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
						url: 'http://localhost:3000/game/'+gameId,
						type: 'GET',
						dataType: 'jsonp',
				        cache: false
					});
				}
			},

			set: function(obj){
				_gameObj = obj;
			}
		},

		View : {

		},

		Ctrl : {

		}
	}
})();