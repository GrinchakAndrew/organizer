	
	
	$(document).ready(function(){
			var timeout = 0; 
				timeout = setTimeout(function(){
					$('.series').first().click();
					clearTimeout(timeout);
				}, 700);
		});
	