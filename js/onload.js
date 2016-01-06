	
	
	$(document).ready(function(){
			var timeout = 0; 
				timeout = setTimeout(function(){
					$('.series').first().click(function(){
						$('.blue-lining').css('display', 'initial');
						console.log('handler');
					});
					clearTimeout(timeout);
					
				}, 700);
		});
	