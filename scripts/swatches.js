if(typeof cssGradient === 'undefined') {
	var cssGradient = {};
}

cssGradient.swatch = (function () {
	
	// Hold our color swatch collection here
	var collection = {};
	
	// Hold a count of how many swatches were created with our pallete for ID names
	var swatchCount = 0;
	//g : generator,
	
	// Cache the container
	var $container;
	
	//Set up the swatch handler
	var init = function () {
		//Cache our swatch container up front
		$container = $('#color-swatches');
		
		//Set up the intial swatches
		//setupSwatch('swatch-1', {'color' : '23adad', 'position': 12});
		//setupSwatch('swatch-2', {'color' : '2e2326', 'position' : 77});
		
		//enable the first swatch's slider
		/*
		$('#swatch-1 .swatch-slider').slider('enable');
		
		//Set up the click handler for add swatch
		$('#add-swatch').click(function(e){
			e.preventDefault();
			swatch.createSwatch();
		});
		
		//Set up JQuery live click handler for remove swatch triggers
		$('.remove-trigger').live('click', swatch.removeSwatch);
		$('.slider-input input').live('keyup', swatch.slideInputUpdate);
		*/
	};
	
	var createSwatch = function () {
		var $newSwatch = $('#swatch-template').clone(true);
		
		// Update swatchCount
		swatchCount++;
		
		var swatchID = swatchCount;
		
		// Setup our new swatch
		$newSwatch
			.attr('id', 'swatch-' + swatchID)
			.removeClass('hide')
			.find('.remove-trigger').attr('rel', 'swatch-' + swatchID);
		
		$container.append($newSwatch);
		
	};
	
	/**
	* Takes a swatch ID element and set's it up including
	* setting up the swatche's start color, position, the slider
	* associated with the swatch, etc.
	* 
	* @param {String} | Element ID
	* @param {Object} | Configuration parameters for the object (Color and position)
	*/
	setupSwatch = function (element, config) {
		var config = config || {'color' : '000000', 'position' : 0};
		var $_thisSwatch = $('#' + element);
		$_thisSwatch.click(swatch.swatchClick);
	
		//Update our swatch count (simply used for naming conventions)
		generator.swatchCount++;
		
		//Set up a new swatch object
		var tmpGradient = {
			'color' : config.color,
			'id' : element,
			'position' : config.position
		};
		
		//Push our new gradient to the gradient array
		generator.gradientProps.gradients.push(tmpGradient);
		
		//Set up the swatch's slider
		$_thisSwatch.find('.swatch-slider').slider({
			change : swatch.slideChange,
			slide : swatch.slideChange,
			stop : generator.updateGradientString,
			value : config.position
		})
		.slider('disable');
			
		swatch.updateSliderInput($_thisSwatch.find('.swatch-slider'), config.position);
		
		//Set up the swatches color
		$_thisSwatch.find('.swatch-color').css('background-color', '#' + config.color);
		
		generator.setGradient();
		generator.updateGradientString();
	};
	
	return {
		'init' : init,
		'createSwatch' : createSwatch
	};
	
})();