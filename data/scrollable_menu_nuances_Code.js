	/*...*/
	slide : function() {
		/*
		the task is to create a scrollable menu so that it will 
		scroll down or scroll up at the distance of its height, while 
		the scrolling area is that of the whole document.
		So, solution is: 
		1. get the height of the scrollable;
		2. get the step: step is the necessary amount of individual scrollings per scrollable document.body to take the 
		scrollable down\up, while each step will take scrollable up \ down at the rate of its height at a time.
		3. see if we are scrolling up or down: currentStep_s (makes known the needed amount of steps it takes to scroll up or down) is 
		   compared against the index of steps that will store the value of the previously made scrollings. 
		   If the steps that are necessary are greater than the value of the index - we need to scroll down, 
		   else - when the index is greater than the currentStep_s variable - we are scrolling upward
		*/
				var scrollable = document.getElementById('leftbar'), 
					scrollableHeight = document.getElementById('leftbar').offsetHeight,
					currentStep_s = document.documentElement.scrollTop || document.body.scrollTop / scrollableHeight|0,
					scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
					scrollDown = currentStep_s > menu.steps,
					scrollUp  = currentStep_s < menu.steps,
					_timeout,
					downer = function() {
						 menu.steps = currentStep_s;
						 scrollable.style.top = scrollableHeight *  currentStep_s + 'px';
						 /*note, that we are scrolling by the value of the height of the scrollable!*/
						 scrollable.style.opacity = 0;
						 for( ;parseFloat(document.querySelector('#leftbar').style.opacity) < 1; 
								scrollable.style.opacity = (parseFloat(document.querySelector('#leftbar').style.opacity) + 0.0001)) {
						 }
					},
					uppertaker = function() {
						 menu.steps = currentStep_s;
						 scrollable.style.top = scrollableHeight * currentStep_s + 'px';
						 /*note, that we are scrolling by the value of the height of the scrollable!*/
						 scrollable.style.opacity = 0;
						 for( ; parseFloat(document.querySelector('#leftbar').style.opacity) < 1; 
								scrollable.style.opacity = (parseFloat(document.querySelector('#leftbar').style.opacity) + 0.0001)) {
						 }
					},
					subRoutine = function() {
						if(scrollDown) {
							downer();
						}
						if(scrollUp){
							uppertaker();
						}
				};
				
				_timeout = setTimeout (function(){
					clearTimeout(_timeout);
					subRoutine();
				}, 130);
	/*...*/