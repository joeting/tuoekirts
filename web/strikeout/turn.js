turn = (function(){

	return {
		Model : {
			save : function(data)
			{

				$.ajax({
					url: '/strikeout/turn/'+fbAPI.getUserId(),
					data: data,
					type: 'POST',
					dataType: 'json',
			        cache: false,
					error: function(e,r,t){
						console.log(e);
					}
				});
			},

			get : function(){
				var data = $.parseQuery();

				return $.ajax({
					url: 'http://localhost:3000/turn/'+data.gid,
					data: data,
					type: 'GET',
					dataType: 'jsonp',
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