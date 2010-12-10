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
	
	// Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};
	
	// Hold our color swatch palette here
	var palette = [];
	
	// Hold a count of how many swatches were created with our pallete for ID names
	var swatchCount = 0;
		
	// Cache the container
	var $container;
	
	// Hold our currently selected swatch ID here
	var currentSwatch = 0;	
	
	// Color Format, default to rgb
	var colorFormat = 'rgb';
	
	// Hold the swatch controls
	var $swatchControls = $('#swatch-controls');
	
	//Set up the swatch handler
	var init = function () {
		//Cache our swatch container up front
		$container = $('#color-swatches');		
		
		// Let's see if the user has a preference for another color format
		checkCookie();
		
		//Set up the click handler for add swatch
		$('#add-swatch').click(function(e){
			e.preventDefault();
			createSwatch();
			$('#' + currentSwatch).click();
		});
		
		// Set up events for switching color format
		$('#color-format').change(function (e) {
			var val = $(this).val();
						
			colorFormat = val;			
			setCookie(val);
		});
		
		// Set up the event handler for keyup detection on manual gradient position
		$('#slider-input input[type=text]').bind('keyup', slideInputUpdate);
		
		// Setup the jQuery live event handler for click events on swatches
		$('#color-swatches li.swatch').live('click', swatchClick);
		
		// Setup the slider with methods relating to swatches
		$swatchControls.find('#swatch-slider').slider({
			change : slideChange,
			slide : slideChange,
		});
		
		$swatchControls.find('#remove-trigger').click(removeSwatch);
	};
	
	/**
	* Creates a new color swatch on the page and in our palette.
	*
	* @param {Object} (Optional) Set of configuration properties for this swatch
	*/
	var createSwatch = function (config) {
		// Clone our template swatch
		var $newSwatch = $('#swatch-template').clone(true);
		
		// Update swatchCount
		swatchCount++;
		
		var swatchID = swatchCount,
			paletteLength = palette.length,
			lastSwatch = palette[paletteLength - 1];
		
		// Setup our new swatch
		$newSwatch
			.attr('id', 'swatch-' + swatchID)
			.attr('rel', 'swatch-' + swatchID)
			.removeClass('hide');
		
		// Append swatch to page
		$container.append($newSwatch);
		
		// Use a config object if one was sent
		if(config) {
			setupSwatch('swatch-' + swatchID, config);
		} 
		// If there is a previous swatch, let's progressively update this one
		else if(lastSwatch) {
			
			var newRgb = getUpdatedHue(lastSwatch.rgb);
			
			var swatchConfig = {
				rgb : newRgb,
				hex : rgbToHex(newRgb),
				position : getNextPosition(lastSwatch.position)
			};
			
			setupSwatch('swatch-' + swatchID, swatchConfig);
		} 
		// Otherwise, just set up the swatch with the defaults
		else {
			setupSwatch('swatch-' + swatchID);
		}
		
		// Click the swatch, setting it as the current swatch
		$newSwatch.click();
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
		var config = config || function() {
			
			var colors = getColorTemplate();
			
			return {
				'rgb' : colors.rgb,
				'hex' : colors.hex,
				'position' : 0
			}
			
		}();
		
		var $_thisSwatch = $('#' + element);
		$_thisSwatch.click(swatchClick);
	
		//Update our swatch count (simply used for naming conventions)
		swatchCount++;
		
		//Set up a new swatch object
		palette.push({
			'rgb' : config.rgb,
			'hex' : config.hex,
			'id' : element,
			'position' : config.position
		});
		
		
		//Set up the swatches color
		$_thisSwatch.find('a').css('background-color', 'rgb(' + config.rgb.r + ',' + config.rgb.g + ',' + config.rgb.b + ')');
		
		currentSwatch = palette.length-1;
		
		// Update the slider
		updateSlider(config.position);
	};
	
	/**
	* Click handler for the remove swatch trigger. This removes the swatch
	* from the page as well as its entry in the gradients array.
	*
	* Once it is removed, the gradient sample is updated to show this.
	*/
	var removeSwatch = function(e) {
		e.preventDefault();
			
		var nextIndex;
		currentSwatch === 0 ? nextIndex = 1 : nextIndex = currentSwatch - 1;
				
		// Remove the swatch from the page
		$('#' + palette[currentSwatch].id).remove();
		
		// Remove the swatch from our palette
		palette.remove(currentSwatch);
		
		// Set our current selected swatch after removing this swatch
		var nextSwatch = palette[nextIndex];
		if(nextSwatch) $('#' + nextSwatch.id).click();		
	};
	
	/**
	* Handle a swatch click
	*/
	var swatchClick = function (e) {
		e.preventDefault();
		currentSwatch = findSwatch(this.id);

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
		$('#swatch-slider').slider('option', 'value', _thisSwatch.position);
		$('#slider-input input[type=text]').attr('value', _thisSwatch.position);
	};
	
	/**
	* Set the color of the current swatch
	*
	* @param {String} RGB Color for swatch
	* @param {String} HEX Color for swatch
	*/
	var setColor = function(rgb, hex) {
		var current = palette[currentSwatch];
			current.hex = hex;
			current.rgb = rgb;
			
		
		$('#' + current.id).find('a').css('background-color', hex);
	};
	
	/**
	* Set the color position of the swatch in the gradient
	*
	* @param {String} Swatch ID
	* @param {String} Position value
	*/
	var setPosition = function(swatch, position) {
		if(palette[swatch]) {
			palette[swatch].position = position;
		}
	};
	
	/**
	* Handle the gradient position slider change, updating the 
	* position of the color in the gradient live, while the user
	* adjusts the slider.
	*/
	var slideChange = function (e, ui) {
		if(palette[currentSwatch]) {
			palette[currentSwatch].position = ui.value;
			$('#slider-input input[type=text]').attr('value', ui.value);
		}
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
			$('#swatch-slider').slider('option', 'value', value);			
			palette[currentSwatch].position = value;			
		}
	};
	
	/**
	* Returns a color template for swatch configuration
	* based on color format
	*/
	var getColorTemplate = function () {

	};
	
	/**
	* Find a specific swatch in our palette
	*
	* @param {String} The ID of the string we're looking for
	* @return {Int} Index of the swatch if found
	* @return {Bool} False if not found
	*/
	var findSwatch = function(swatchID) {
		for(var i=0; i<palette.length; i++) {
			if(palette[i].id === swatchID) return i;
		}
		
		return false;
	};
	
	/**
	* Take a color code and get a darker color
	* 
	* @param {Object} Some color object to build from
	* @return {Object} Updated Color Object
	*/
	var getUpdatedHue = function (color) {
		return {
			'r' : nextInRange(color.r),
			'g' : nextInRange(color.g),
			'b' : nextInRange(color.b)
		};
	};
	
	/**
	* Get the next RGB value based on a previous value
	* passed in.
	*
	* @param {Int} The value for the RGB segment
	* @return {Int} Increased color value
	*/
	var nextInRange = function (color) {
		if(color === 0) {
			color++;
		}
					
		var delta = Math.ceil(255 / color) / 10;
		
		var newColor = Math.ceil(delta * color) + color;
		if(newColor > 255) return 255;
		
		return newColor;
	};
	
	/**
	* Return a new progressive position for the a color
	* based off of some previous position value
	*
	* @param {Int} Previous Color Position
	*/
	var getNextPosition = function (position) {			
		var diff =  100 - position;
		var delta = Math.ceil(diff * 0.5);
		
		return delta + position;
		
		return position;
	};
	
	/**
	* Dumps all of the existing colors in our palette, removing all swatches
	*/
	var emptyPalette = function () {
		// Clear the palette array
		palette = [];
		
		$('#color-swatches .swatch').remove();
	};
	
	/**
	* Checks to see if the user has a preferred color format
	* for gradient colors. If so, set it now.
	*/
	var checkCookie = function () {
		var cookie = document.cookie;
		
		if(cookie.length === 0) return false;
		
		var data = cookie.split(';');
		var _this, key, val;
		
		var whiteList = ['rgb', 'hex'];
		
		for (var i=0, len = data.length; i < len; i++) {
			
			_this = data[i].split('=');
			
			key = _this[0].replace(/^\s+|\s+$/g,"");
			val = _this[1];
			
			if (key === 'format') {
				if (whiteList.indexOf(val) !== -1) {
					colorFormat = val;
					$('#color-format option[value=' + val + ']')[0].selected = true;
				}
				else {
					setCookie('rgb');
				}
			}
		}
	};
	
	/**
	* When the user selects a color format, lets remember it
	*
	* @param {String} Color format
	*/
	var setCookie = function (format) {
		var date = new Date();		
		date.setTime(date.getTime() + ( 730 * 24 * 60 * 60 * 1000 ));
				
		var expires = "; expires=" + date.toGMTString();
		
		document.cookie = 'format=' + format + expires + "; path=/";
	};
	
	/**
	* Takes an RGB object and converts it into a hex string
	*
	* @param {Object} RGB Colors
	*/
	var rgbToHex = function(rgb) {
		var hex = rgb.b | (rgb.g << 8) | (rgb.r << 16);
		return hex.toString(16);
	};
	
	// Return the Public API for color swatches
	return {
		'init' : init,
		
		// Mutator Methods
		'setColor' : setColor,
		'createSwatch' : createSwatch,
		'emptyPalette' : emptyPalette,
		'rgbToHex' : rgbToHex,
		
		// Accessor methods
		'getColorFormat' : function () { return colorFormat; },
		'getCurrentSwatch' : function () { return currentSwatch; },
		'getPalette' : function () { return palette; },
		'getPaletteLength' : function () { return palette.length; },
		'getSwatchColor' : function () { return palette[currentSwatch].rgb; }
	};
	
})();