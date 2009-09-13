/**
* CSS3 Webkit Gradient Generator
*
* This script handles all the functionality found on the CSS3 Webkit Gradient Generator.
* The gradient generator is a showcase of webkit CSS gradients and provides a simple 
* GUI for a user to create a webkit gradient that can then be used anywhere an image 
* could be use in CSS.
*
* The generator is intended to be viewed in a webkit browser in order to get all 
* the features, such as the live gradient sampling. Non-webkit browsers will be able to generate
* the webkit code, but will not be able to view a live sample.
*
* @author dgalarza - Damian Galarza
* Released under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
* http://gradients.glrzad.com/
*/

(function () {
	
	var generator = {
		
		/**
		* Hold our gradient properties here, setup default values
		*/
		gradientProps : {
			'type' : 'linear',
			'xStart' : 'left',
			'yStart' : 'bottom',
			'xEnd'   : 'left',
			'yEnd'   : 'top',
			gradients : []
		},
		
		/**
		* Keep track of the select custom option states here
		*/
		selectStates : {
			'xStart' : false,
			'yStart' : false,
			'xEnd'	 : false,
			'yEnd'	 : false
		},
		
		/**
		* Other general, reuseable variables here
		*/
		swatchCount : 0,
		currentSwatch : null,
		sample : $('#sample-btn'),
		picker : $('#color-picker'),
		gradientString : $('#gradient-css pre'),
		
		/**
		* Let's set everything up
		*/
		init : function () {
			swatch.init();		
			
			generator.picker.ColorPicker({
				flat: true,
				onChange : generator.retrieveColor,
			})
			.ColorPickerSetColor('#bd1746')
			.mouseup(generator.updateGradientString);
			
			//Set up our direction select options
			$('.select-wrapper select').change(generator.selectChange);
			$('.select-wrapper input[type=text]').keyup(generator.selectCustomChange);
			
			generator.currentSwatch = $('#swatch-1');
		},
				
		/**
		* Retrieves the color sent from ColorPicker plugin
		* and set's the swatch's color accordingly
		*/
		retrieveColor : function (hsb, hex, rgb) {
			var color = hex;
			var cPicker = generator.currentSwatch;
			var pName = $(cPicker).attr('id');
			var _thisSwatch = $(cPicker).find('.swatch-color');

			var gradient = swatch.findSwatch(pName);
			gradient.color = color;
			
			$(_thisSwatch).css('background-color', '#' + color);
			generator.setGradient();
		},
		
		/**
		* Run's through the gradient's properties and applies
		* the gradient to our live button sample
		*
		*/
		setGradient : function () {
			var gradientProps = generator.gradientProps;
			var sample = generator.sample;
			var gradientString = '-webkit-gradient(' + gradientProps.type + ',' + generator.fetchGradientStart() + ',' + generator.fetchGradientEnd() + ',';
			var gradientData = '';
			$.each(generator.gradientProps.gradients, function (index, obj) {
				var percent = (obj.position / 100);
				gradientData = gradientData + 'color-stop(' + percent + ', #' + obj.color + '),';
			});		
						
			gradientString = gradientString + gradientData;
			gradientString = gradientString.substr(0, gradientString.length - 1) + ')';
			$(sample).css('background', gradientString);
		},
		
		/**
		* Retreive the gradient's start point
		*/
		fetchGradientStart : function () {
			var gradientProps = generator.gradientProps;
			return gradientProps.xStart + ' ' + gradientProps.yStart;
		},
		
		/**
		* Retrieves the gradient's end point
		*/
		fetchGradientEnd : function () {
			var gradientProps = generator.gradientProps;
			return gradientProps.xEnd + ' ' + gradientProps.yEnd;
		},
		
		/**
		* Generates a webkit gradient string for the user
		* and display it on the page so the user can then take their gradient string and use it
		*/
		updateGradientString : function () {
			var gString = generator.gradientString;
			var gProps = generator.gradientProps;
			var gradients = gProps.gradients;
			
			//Clear the old gradient code
			$(gString).html('');
			
			//Set up the general linear gradient properties
			$(gString)
				.append( generator.createProp('-webkit-gradient(', ''))
				.append( generator.createProp(gProps.type, ',', true) )
				.append( generator.createProp(generator.fetchGradientStart(), ',', true))
				.append( generator.createProp(generator.fetchGradientEnd(), ',', true));
			
			//Loop through each gradient color
			for(var i=0; i<gradients.length; i++) {
				if(i !== gradients.length-1) var delimiter = ',';
				else delimiter = '';
				
				var gradient = gradients[i];
				var position = gradient.position / 100;
				
				$(gString).append( generator.createProp('color-stop(' + position + ',' + '#' + gradient.color + ')', delimiter, true) );
			}
			
			$(gString).append(generator.createProp(')', '', false));
		},
		
		/**
		* Return a text node for our CSS code generation
		*
		* @param {String} | Content for CSS prop definition
		* @param {String} | (Optional) Property seperator
		*/
		createProp : function(data, delimiter, separator) {
			var delimiter = delimiter || '';
			
			if(separator) separator = '    ';
			else separator = '';
			
			var span = document.createTextNode(separator + data + delimiter + "\n");
			return $(span);
		},
		
		/**
		* Gradient direction select change handler
		* Handles the Custom option as well as updates
		* the live sample and CSS once the user makes a change
		*/
		selectChange : function(e) {
			e.preventDefault();
			e.preventDefault();
			var target = e.target;
			var prop = $(target).attr('id');
			var tValue = $(target).attr('value');
			
			if(tValue !== 'custom') {
				//reset the custom field if it once was set
				if(generator.selectStates[prop]) {
					generator.selectStates[prop] = false;
					
					var $wrapper = $(target).parent();
					$wrapper.find('input[type=text]').addClass('hide').attr('value', 0);
				}
				
				generator.gradientProps[prop] = $(target).attr('value');
				generator.setGradient();
				generator.updateGradientString();			
								
			}else{
				//Use a custom value
				var $wrapper = $(target).parent();
				$wrapper.find('input[type=text]').removeClass('hide');
				
				generator.selectStates[prop] = true;				
			}	
		},
		
		/**
		* Handle the input of data in a custom gradient
		* direction text box.
		*/
		selectCustomChange : function(e) {
			e.preventDefault();
			var target = e.target;
			var $container = $(target).parent();
			
			var prop = $container.attr('id');
			prop = prop.split('-');
			prop = prop[0];
			
			generator.gradientProps[prop] = $(target).attr('value');
			
			generator.setGradient();
			generator.updateGradientString();
		}
	};
	
	/**
	* Handles all color swatch related activity such as creating and
	* intializing a swatch and its components such as the slider and
	* remove trigger.
	*/
	var swatch = {
		
		g : generator,
		container : null,
		
		//Set up the swatch handler
		init : function () {
			//Cache our swatch container up front
			swatch.container = $('#color-swatches');
			
			//Set up the intial swatches
			swatch.setupSwatch('swatch-1', {'color' : '23adad', 'position': 12});
			swatch.setupSwatch('swatch-2', {'color' : '2e2326', 'position' : 77});
			
			//enable the first swatch's slider
			$('#swatch-1 .swatch-slider').slider('enable');
			
			//Set up the click handler for add swatch
			$('#add-swatch').click(function(e){
				e.preventDefault();
				swatch.createSwatch();
			});
			
			//Set up JQuery live click handler for remove swatch triggers
			$('.remove-trigger').live('click', swatch.removeSwatch);
			$('.slider-input input').live('keyup', swatch.slideInputUpdate);
		},
		
		/**
		* Create a new color swatch on the page and in the array
		* Once the swatch is set up, we will set up its functionality
		*/
		createSwatch : function () {
			var $newSwatch = $('#swatch-template').clone(true);
	
			var swatchID = generator.swatchCount + 1;
			
			$newSwatch
				.attr('id', 'swatch-' + swatchID)
				.removeClass('hide')
				.find('.remove-trigger').attr('rel', 'swatch-' + swatchID);
				
			swatch.container.append($newSwatch);
			
			/*
			* Find out last color swatch so we can make the new swatch
			* a similar color and position it accordingly
			*/
			var lastSwatch = generator.gradientProps.gradients.length - 1;
			lastSwatch = generator.gradientProps.gradients[lastSwatch];
		
			swatch.setupSwatch('swatch-' + swatchID, {
				color : lastSwatch.color,
				position : lastSwatch.position + 10
			});
		},
		
		/**
		* Takes a swatch ID element and set's it up including
		* setting up the swatche's start color, position, the slider
		* associated with the swatch, etc.
		* 
		* @param {String} | Element ID
		* @param {Object} | Configuration parameters for the object (Color and position)
		*/
		setupSwatch : function (element, config) {
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
		},
		
		/**
		* Click handler for the remove swatch trigger. This removes the swatch
		* from the page as well as its entry in the gradients array.
		*
		* Once it is removed, the gradient sample is updated to show this.
		*/
		removeSwatch : function(e) {
			e.preventDefault();
			
			if(confirm('Are you sure you want to remove this color swatch?') ){
				var target = e.target;
				var rel = target.rel;

				var gradients = generator.gradientProps.gradients;
				var index = 0;
				
				//Find the index of this gradient swatch
				for(var i=0; i<gradients.length;i++) {
					var gradient = gradients[i];
					if(gradient.id === rel) {
						index = i;
						break;
					}
				};
				
				generator.gradientProps.gradients.remove(index);
				
				target = $(target).parent();
				$(target).remove();
				
				generator.setGradient();
				generator.updateGradientString();
			}
		},
		
		/**
		* Handle a swatch click, setting it as the current swatch,
		* allowing the user to edit it.
		*/
		swatchClick : function (e) {
			e.preventDefault();
			
			//Find the main swatch container always
			var target = e.target;
			if( !$(target).hasClass('swatch')) {
				while(!$(target).hasClass('swatch')) {
					target = $(target).parent();
				}
			}
			
			//Identify the clicked swatch as the current swatch	
			generator.currentSwatch = $(target);
			
			//Remove active swatch status from other swatch
			swatch.container.find('.selected-swatch').removeClass('selected-swatch');
			swatch.container.find('.swatch-slider').slider('disable');
			
			//Set up selected state for our clicked swatch
			$(target)
				.addClass('selected-swatch')
				.find('.swatch-slider').slider('enable');
			
			var gradient = swatch.findSwatch(generator.currentSwatch.attr('id'))
			var color = gradient.color;
			generator.picker.ColorPickerSetColor(color);
		},
		
		/**
		* Handle the gradient position slider change, updating the 
		* position of the color in the gradient live, while the user
		* adjusts the slider.
		*
		*/
		slideChange : function (e, ui) {			
			var slider = e.target;
			var target = $(slider).parent();
			var id = $(target).attr('id');
			
			var gradient = swatch.findSwatch(id);
			gradient['position'] = ui.value;
			generator.setGradient();
			swatch.updateSliderInput(slider, ui.value);
		},
		
		/**
		* Handles updating the slider input based on using the slider
		* 
		* @param {String} | Value to display in text box
		*/
		updateSliderInput : function (slider, value) {
			var input = $(slider).parent().find('.slider-input input');
			input.attr('value', value);
		},
		
		/**
		* Handle keyup detection for slider input field so that we can
		* update the live gradient sample and CSS code sample as soon
		* as the user alters the data.
		*/
		slideInputUpdate : function (e) {
			e.preventDefault();
			var target = e.target;
			var _thisSlider = target;
			var value = $(target).attr('value');
			
			//Make sure our value is within the limits before updating
			if(value >=0 && value <= 100) {
				while( !$(_thisSlider).hasClass('swatch')) {
					_thisSlider = $(_thisSlider).parent();
				}

				var swatchName = $(_thisSlider).attr('id');
				
				_thisSlider = $(_thisSlider).find('.swatch-slider');
				_thisSlider.slider('option', 'value', value);
				
				var gradient = swatch.findSwatch(swatchName);
				gradient.position = value
				
				generator.setGradient();
				generator.updateGradientString();
				
			}
		},
		
		/**
		* Find swatch in array based of the swatch's ID
		*
		* @param {String} | Swatch ID
		*/
		findSwatch : function (swatchName) {
			var swatches = generator.gradientProps.gradients;
			for(var i=0; i<swatches.length; i++) {
				var cSwatch  = swatches[i];
				if(cSwatch.id === swatchName) return cSwatch;
			}
			
			return false;
		}
	};
	
	$(document).ready(function () {
		generator.init();
	});
	
})();