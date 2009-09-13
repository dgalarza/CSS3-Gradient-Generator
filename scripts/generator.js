/**
* CSS3 Webkit Gradient Generator
*
* @author dgalarza - Damian Galarza
* Release under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
*/

(function () {
	
	var generator = {
		
		gradientProps : {
			'type' : 'linear',
			'dStart' : 'left bottom',
			'dEnd' : 'left top',
			gradients : []
		},
		
		swatchCount : 0,
		currentSwatch : null,
		sample : $('#sample-btn'),
		picker : $('#color-picker'),
		gradientString : $('#gradient-css ul'),
		
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
						
			generator.currentSwatch = $('#swatch-1');
		},
				
		/**
		* Retrieves the color sent from ColorPicker plugin
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
		* Set's the gradient on our sample
		*/
		setGradient : function () {
			var gradientProps = generator.gradientProps;
			var sample = generator.sample;
			var gradientString = '-webkit-gradient(' + gradientProps.type + ',' + gradientProps.dStart + ',' + gradientProps.dEnd + ',';
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
		* Generates a webkit gradient string for the user
		* based of the colors selected
		*/
		updateGradientString : function () {
			var gString = generator.gradientString;
			var gProps = generator.gradientProps;
			var gradients = gProps.gradients;
			
			//Clear the old gradient code
			$(gString).html('');
			
			//Set up the general linear gradient properties
			$(gString)
				.append( generator.createProp(gProps.type, ',') )
				.append( generator.createProp(gProps.dStart, ','))
				.append( generator.createProp(gProps.dEnd, ','));
			
			//Loop through each gradient color
			for(var i=0; i<gradients.length; i++) {
				if(i !== gradients.length-1) var delimiter = ',';
				else delimiter = '';
				
				var gradient = gradients[i];
				var position = gradient.position / 100;
				
				$(gString).append( generator.createProp('color-stop(' + position + ',' + '#' + gradient.color + ')', delimiter) );
			}
		},
		
		/**
		* Simulate creating a CSS property
		*
		* @param {String} | Content for CSS prop definition
		* @param {String} | (Optional) Property seperator
		*/
		createProp : function(data, delimiter) {
			var delimiter = delimiter || '';
			var li = document.createElement('li');
			$(li).html(data + delimiter);
			return $(li);
		}
	};
	
	/**
	* Handles all color swatch related activity
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
		* Create a new color swatch
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
		* Takes a swatch ID element and set's it up 
		* 
		* @param {String} | Element ID
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
		* Removes a swatch from the page, trigger click handler
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
				console.log('removed');
				generator.setGradient();
				generator.updateGradientString();
			}
		},
		
		/**
		* Handle a swatch click
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
		* Handle the gradient position slider change
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
		* Handle keyup detection for slider input field
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
		* Find swatch in array
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