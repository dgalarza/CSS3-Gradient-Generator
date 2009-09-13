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
			var swatch = $(cPicker).find('.swatch-color');
			
			console.log(pName);
			var gradient = swatch.findSwatch(pName);
			gradient.color = color;
			
			$(swatch).css('background-color', '#' + color);
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
			
			//Loop through gradient colors
			$.each(gradients, function(index, gradient){
				var position = gradient.position / 100;
				
				$(gString).append( generator.createProp('color-stop(' + position + ',' + '#' + gradient.color + ')', ',') );
			});
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
			swatch.setupSwatch('swatch-1');
			swatch.setupSwatch('swatch-2');
			
			//enable the first swatch's slider
			$('#swatch-1 .swatch-slider').slider('enable');
			
			//Set up the click handler for add swatch
			$('#add-swatch').click(function(e){
				e.preventDefault();
				swatch.createSwatch();
			});
			
			//Set up JQuery live click handler for remove swatch triggers
			$('.remove-trigger').live('click', swatch.removeSwatch);
			
			console.log(generator.gradientProps.gradients);
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
			swatch.setupSwatch('swatch-' + swatchID);
	
		},
		
		/**
		* Takes a swatch ID element and set's it up 
		* 
		* @param {String} | Element ID
		*/
		setupSwatch : function (element) {
			var $_thisSwatch = $('#' + element);
			$_thisSwatch.click(swatch.swatchClick);
			generator.swatchCount++;
					
			var tmpGradient = {
				'color' : 'bd1746',
				'id' : element,
				'position' : 0
			};
			
			generator.gradientProps.gradients.push(tmpGradient);
			
			$_thisSwatch.find('.swatch-slider').slider({
				change : swatch.slideChange,
				slide : swatch.slideChange,
				stop : generator.updateGradientString
			})
			.slider('disable');
		},
		
		/**
		* Removes a swatch from the page, trigger click handler
		*/
		removeSwatch : function(e) {
			e.preventDefault();
			
			if(confirm('Are you sure you want to remove this color swatch?') ){
				var target = e.target;
				var rel = target.rel;

				delete generator.gradientProps.gradients[rel];
				target = $(target).parent();
				$(target).remove();

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
			var target = e.target;
			target = $(target).parent();
			var id = $(target).attr('id');
			
			var gradient = swatch.findSwatch(id);
			gradient['position'] = ui.value;
			generator.setGradient();
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