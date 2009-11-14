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
	
	// Hold our currently selected swatch ID here
	var currentSwatch = 'swatch-1';
	
	// Hold the swatch controls
	var $swatchControls = $('#swatch-controls');
	
	//Set up the swatch handler
	var init = function () {
		//Cache our swatch container up front
		$container = $('#color-swatches');
		
		//Set up the intial swatches
		setupSwatch('swatch-1', {'color' : '23adad', 'position': 12});
		setupSwatch('swatch-2', {'color' : '2e2326', 'position' : 77});
				
		//Set up the click handler for add swatch
		$('#add-swatch').click(function(e){
			e.preventDefault();
			createSwatch();
		});
		
		$('.swatch').live('click', swatchClick);
		
		$swatchControls.find('.swatch-slider').slider({
			change : slideChange,
			slide : slideChange,
		});
		
		currentSwatch = 'swatch-1';
		
		//Set up JQuery live click handler for remove swatch triggers
		//$('.remove-trigger').live('click', swatch.removeSwatch);
		//$('.slider-input input').live('keyup', swatch.slideInputUpdate);
	};
	
	var createSwatch = function () {
		var $newSwatch = $('#swatch-template').clone(true);
		
		// Update swatchCount
		swatchCount++;
		
		var swatchID = swatchCount;
		
		// Setup our new swatch
		$newSwatch
			.attr('id', 'swatch-' + swatchID)
			.attr('rel', 'swatch-' + swatchID)
			.removeClass('hide');
		
		$container.append($newSwatch);
		
		setupSwatch('swatch-' + swatchID);
		
	};
	
	/**
	* Takes a swatch ID element and set's it up including
	* setting up the swatche's start color, position, the slider
	* associated with the swatch, etc.
	* 
	* @param {String} | Element ID
	* @param {Object} | Configuration parameters for the object (Color and position)
	*/
	var setupSwatch = function (element, config) {
		var config = config || {'color' : '000000', 'position' : 0};
		var $_thisSwatch = $('#' + element);
		$_thisSwatch.click(swatchClick);
	
		//Update our swatch count (simply used for naming conventions)
		swatchCount++;
		
		//Set up a new swatch object
		collection[element] = {
			'color' : config.color,
			'id' : element,
			'position' : config.position
		};
		
		// Update the slider
		updateSlider(config.position);
		
		//Set up the swatches color
		$_thisSwatch.find('a').css('background-color', '#' + config.color);
		$swatchControls.find('.remove-trigger').click(removeSwatch);
		
		currentSwatch = element;
		
		// Move the commented code below to generator
		
		// generator.setGradient();
		// generator.updateGradientString();
	};
	
	/**
	* Click handler for the remove swatch trigger. This removes the swatch
	* from the page as well as its entry in the gradients array.
	*
	* Once it is removed, the gradient sample is updated to show this.
	*/
	removeSwatch = function(e) {
		e.preventDefault();

		// Remove the swatch from our collection
		delete collection[currentSwatch];
		
		// Remove the swatch from the page
		$container.find('#' + currentSwatch).remove();
		
		// Set our current selected swatch after removing this swatch
		var nextSwatch = $container.find('.swatch')[0];
		$(nextSwatch).click();
		
		// generator.setGradient();
		// generator.updateGradientString();
		
	};
	
	/**
	* Handle a swatch click
	*/
	var swatchClick = function (e) {
		e.preventDefault();
		currentSwatch = this.id;

		$container.find('.selected-swatch').removeClass('selected-swatch');
		$(this).addClass('selected-swatch');
		
		updateSlider();
	};
	
	/**
	* Update the slider based on the currently selected swatch
	*
	*/
	var updateSlider = function() {
		var _thisSwatch = collection[currentSwatch];
		
		$swatchControls.find('.swatch-slider')
			.css('background-color', _thisSwatch.color)
			.slider('option', 'value', _thisSwatch.position);
			
		$swatchControls.find('.slider-input input[type=text]').attr('value', _thisSwatch.position);
	};
	
	/**
	* Set the color of a swatch
	*
	* @param {String} Swatch ID
	* @param {String} Color for swatch
	*/
	var setColor = function(swatch, color) {
		collection[swatch].color = color;
	};
	
	/**
	* Set the color position of the swatch in the gradient
	*
	* @param {String} Swatch ID
	* @param {String} Position value
	*/
	var setPosition = function(swatch, position) {
		collection[swatch].position = position;
	};
	
	/**
	* Handle the gradient position slider change, updating the 
	* position of the color in the gradient live, while the user
	* adjusts the slider.
	*/
	var slideChange = function (e, ui) {			
		var slider = e.target;
		
		collection[currentSwatch].position = ui.value;
		$swatchControls.find('.slider-input input[type=text]').attr('value', ui.value);
	};
	
	// Return the Public API for color swatches
	return {
		'init' : init,
		'setColor' : setColor,
		'setPosition' : setPosition,
		
		// Accessor methods
		'getCurrentSwatch' : function () { return currentSwatch; },
		'getCollection' : function () { return collection; }
	};
	
})();