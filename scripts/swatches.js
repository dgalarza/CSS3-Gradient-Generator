if(typeof cssGradient === 'undefined') {
	var cssGradient = {};
}

/**
* Color Swatch API for use with Gradient Generator
* cssGradient.swatch provides all functionality related to color
* swatches and their properties including setting the color and position
* of a swatch within a gradient.
*
* This API returns 2 accessor methods, the first for retrieving the
* current palette of swatches, the second to retrieve the currently
* selected swatch.
*/
cssGradient.swatch = (function () {
	
	// Hold our color swatch palette here
	var palette = {};
	
	// Hold a count of how many swatches were created with our pallete for ID names
	var swatchCount = 0;
		
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
		
		// Set up the event handler for keyup detection on manual gradient position
		$('.slider-input input').bind('keyup', slideInputUpdate);
		
		// Setup the jQuery live event handler for click events on swatches
		$('.swatch').live('click', swatchClick);
		
		// Setup the slider with methods relating to swatches
		$swatchControls.find('.swatch-slider').slider({
			change : slideChange,
			slide : slideChange,
		});
		
		// Reset our current swatch to swatch-1
		currentSwatch = 'swatch-1';
		$('#swatch-1').click();
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
		palette[element] = {
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
	};
	
	/**
	* Click handler for the remove swatch trigger. This removes the swatch
	* from the page as well as its entry in the gradients array.
	*
	* Once it is removed, the gradient sample is updated to show this.
	*/
	removeSwatch = function(e) {
		e.preventDefault();

		// Remove the swatch from our palette
		delete palette[currentSwatch];
		
		// Remove the swatch from the page
		$container.find('#' + currentSwatch).remove();
		
		// Set our current selected swatch after removing this swatch
		var nextSwatch = $container.find('.swatch')[0];
		$(nextSwatch).click();		
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
		var _thisSwatch = palette[currentSwatch];
		
		$swatchControls.find('.swatch-slider')
			.slider('option', 'value', _thisSwatch.position);
			
		$swatchControls.find('.slider-input input[type=text]').attr('value', _thisSwatch.position);
	};
	
	/**
	* Set the color of the current swatch
	*
	* @param {String} Color for swatch
	*/
	var setColor = function(color) {
		palette[currentSwatch].color = color;
		$('#' + currentSwatch).find('a').css('background-color', '#' + color);
	};
	
	/**
	* Set the color position of the swatch in the gradient
	*
	* @param {String} Swatch ID
	* @param {String} Position value
	*/
	var setPosition = function(swatch, position) {
		palette[swatch].position = position;
	};
	
	/**
	* Handle the gradient position slider change, updating the 
	* position of the color in the gradient live, while the user
	* adjusts the slider.
	*/
	var slideChange = function (e, ui) {			
		palette[currentSwatch].position = ui.value;
		$swatchControls.find('.slider-input input[type=text]').attr('value', ui.value);
	};
	
	/**
	* Handle keyup detection for slider input field so that we can
	* update the live gradient sample and CSS code sample as soon
	* as the user alters the data.
	*/
	var slideInputUpdate = function (e) {
		e.preventDefault();
		var target = e.target;
		var value = this.value;
		
		//Make sure our value is within the limits before updating
		if(value >=0 && value <= 100) {
			$swatchControls.find('.swatch-slider').slider('option', 'value', value);			
			palette[currentSwatch].position = value;			
		}
	}
	
	// Return the Public API for color swatches
	return {
		'init' : init,
		
		// Mutator Methods
		'setColor' : setColor,
		
		// Accessor methods
		'getCurrentSwatch' : function () { return currentSwatch; },
		'getPalette' : function () { return palette; }
	};
	
})();