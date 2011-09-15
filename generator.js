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

$(function () {

  var swatch;

  var vendor_prefixes = [' ', '-o-', '-moz-', '-webkit-', '-ms-', ' '];

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
    },
    
    /**
    * Keep track of the select custom option states here
    */
    selectStates : {
      'xStart' : false,
      'yStart' : false,
      'xEnd'   : false,
      'yEnd'   : false
    },
    
    /**
    * Other general, reuseable variables here
    */
    sample : $('#sample-btn'),
    picker : $('#color-picker'),
    gradientString : $('#gradient-css pre'),
        
    /**
    * Let's set everything up
    */
    init : function () {
      var $selectWrapper = $('.select-wrapper');
            
      // Point to the swatch API and initialize it right away
      swatch = cssGradient.swatch;
      swatch.init();    
      
      // Create initial radom gradient
      randomizer.generateRandomGradient();
      
      // Set up our ColorPicker
      generator.picker.ColorPicker({
        flat: true,
        onChange : generator.retrieveColor,
      })
      .ColorPickerSetColor('#23adad')
      .mouseup(generator.updateCodeSample);
      
      // Setup the direction option event handlers
      
      // Set the jump menu event handlers
      $selectWrapper.find('select').change(generator.selectChange);
      
      // Set up the manual value input handler for gradient direction
      $selectWrapper.find('input[type=text]').keyup(generator.selectCustomChange);
            
      // Update our gradient whenever the slide is used
      $('#swatch-slider').bind('slidechange slide', generator.setGradient);
      
      // Extend the remove swatch click handler to update gradient code on new gradient
      $('#remove-trigger').click(generator.setGradient);
      
      // Bind the slider manual text input key up detection to update gradient on value change
      $('#slider-input input[type=text]').bind('keyup', generator.setGradient); 
            
      // Extend add swatch button click handler to update gradient code on new gradient
      $('#add-swatch').click(generator.setGradient);
            
      // On swatch click, set the color picker to the color of the swatch
      $('#color-swatches .swatch').live('click', function(){
        var color = swatch.getSwatchColor();
        generator.picker.ColorPickerSetColor(color);
      });
      
      // Apply our randomize link event
      $('#randomize-trigger').click(function (e) {
        e.preventDefault();
        swatch.emptyPalette();
        randomizer.generateRandomGradient();
        generator.setGradient();
      });
      
      $('#color-format').change(function(e) {
        generator.setGradient()
      });
      
      generator.setGradient();
            
    },
        
    /**
    * Retrieves the color sent from ColorPicker plugin
    * and set's the swatch's color accordingly
    *
    * @param {Object} HSB Color syntax
    * @param {String} Hex Color Notation
    * @param {Object} RGB Color Syntax
    */
    retrieveColor : function (hsb, hex, rgb) {
      if(swatch.getPaletteLength() > 0) {
        swatch.setColor(rgb, hex);
        generator.setGradient();
      }
    },
    
    /**
    * Run's through the gradient's properties and applies
    * the gradient to our live button sample and updates the
    * gradient string sample
    */
    setGradient : function () {

      var linear_gradient = generator.generateLinearGradient();
      var sample = generator.sample[0];

      var compiled_string = '';
      for (var i = 0, len = vendor_prefixes.length; i < len; i++) {
        compiled_string = compiled_string + 'background: ' + vendor_prefixes[i] + linear_gradient + ';';
      }
      
      compiled_string = compiled_string + 'background: ' + generator.generateWebkitGradient() + ';';
      sample.style.cssText = compiled_string;

      // Update string
      generator.updateCodeSample();
    },

    /**
     * Update the code sample for the user
     *
     **/
    updateCodeSample: function() {
      var linear_gradient = generator.generateLinearGradient();
      var $gradientString = generator.gradientString;

      var prefix = 'background-image: ';
      var gradientString = 'background-image:' + vendor_prefixes.join(linear_gradient + ";\n" + prefix);

      gradientString = gradientString.slice(0, - (prefix.length + 1));

      var gProps = generator.gradientProps;
      gradientString = gradientString + "\n" + prefix + "-webkit-gradient(\n\t";
      gradientString = gradientString + gProps.type + ",\n\t";
      gradientString = gradientString + generator.fetchGradientStart() + ",\n\t";
      gradientString = gradientString + generator.fetchGradientEnd() + ",\n\t";

      var gradients = swatch.getPalette();
      var pLength = swatch.getPaletteLength();
      var getColor = generator.getColor;

      var gradient, position;
      for (var i = 0; i < pLength; i++) {

        var delimiter = (i === pLength - 1) ? "\n" : ",\n\t";

        gradient = gradients[i];
        position = gradient.position / 100;

        gradientString = gradientString + "color-stop(" + position + ", " + getColor(gradient) + ")" + delimiter;
      }

      gradientString = gradientString + ");";

      $gradientString.html(gradientString);
    },

    getColor: function(obj) {
      var colorFormat = swatch.getColorFormat();

      var colorString;
      if (colorFormat === 'hex') {
        colorString = '#' + obj.hex.toUpperCase();
      }
      else {
        var rgb = obj.rgb;
        colorString = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
      }

      return colorString;
    },

    /**
    * Generate standarized linear gradient strings
    * @example
    *   linear-gradient(top left, rgb(255,0,0), rgb(150, 0, 0))
    */
    generateLinearGradient : function() {
      var gradientProps = generator.gradientProps,
        gradientString = gradientProps.type + '-gradient(',
        gradientData = '';
        $sample = generator.sample,
        gCount = swatch.getPaletteLength(),
        palette = swatch.getPalette();
      
      if (gradientProps.xStart !== gradientProps.xEnd) {
         gradientString = gradientString + gradientProps.xStart + ' ';
      }

      if (gradientProps.yStart !== gradientProps.yEnd) {
        gradientString = gradientString + gradientProps.yStart;
      }

      gradientString = gradientString + ', ';

      var getColor = generator.getColor;

      $.each(palette, function (index, obj) {

        if (index > 0) {
          gradientData = gradientData + ' ';
        }

        gradientData = gradientData + getColor(obj) + ' ' + obj.position + '%,';
      });
      
      gradientString = gradientString + gradientData;
      gradientString = gradientString.substr(0, gradientString.length - 1) + ')';
            
      return gradientString;
    },

    /**
    * Factory for generating Webkit gradient code
    */
    generateWebkitGradient : function () {
      var gradientProps = generator.gradientProps,
        gradientString = '-webkit-gradient(' + gradientProps.type + ',' + generator.fetchGradientStart() + ',' + generator.fetchGradientEnd() + ',',
        gradientData = '';
      
      var palette = swatch.getPalette(),
        pLength = palette.length,
        percent, obj;
      
      for(var i=0; i<pLength; i++) {
        obj = palette[i];
        percent = (obj.position / 100);
        gradientData = gradientData + 'color-stop(' + percent + ', rgb(' + obj.rgb.r  + ',' + obj.rgb.g + ',' + obj.rgb.b + ')),';
      }
      
      gradientString = gradientString + gradientData;
      gradientString = gradientString.substr(0, gradientString.length - 1) + ');';
      return gradientString;
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
    * Gradient direction select change handler
    * Handles the Custom option as well as updates
    * the live sample and CSS once the user makes a change
    */
    selectChange : function(e) {
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
        generator.updateCodeSample();
                
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
      generator.updateCodeSample();
    }
    
  };
  
  var randomizer = {
  
    /**
    * Generates a random gradient to apply
    */
    generateRandomGradient : function () {
      // Randomly determine how many colors to use in our gradient, applying 2-4 color swatches
      var swatchCount;
      do {
        swatchCount = Math.floor(4 * Math.random());
      } while(swatchCount <= 1);
      
      
      var rgb = randomizer.createRandomColor();
      
      // Create our first gradient
      swatch.createSwatch({
        'rgb' : rgb,
        'hex': swatch.rgbToHex(rgb),
        'position' : randomizer.generateRandomPosition()
      });
      
      // Now loop through and create the rest of the swatches that will make up the gradient
      for(var i=1; i<swatchCount; i++) {
        swatch.createSwatch();
      }
    },
    
    /**
    * Generate random RGB value
    *
    * @return {Int}
    */
    generateRandomRGB : function () {
      return Math.floor(255 * Math.random());
    },
  
    /**
    * Generate a random Position value
    * between 1-50
    *
    * @return {Int}
    */
    generateRandomPosition : function () {
      return Math.floor(50 * Math.random());
    },
    
    /**
    * Generate a randomized RGB color object
    */
    createRandomColor : function () {
      return {
        'r' : randomizer.generateRandomRGB(),
        'g' : randomizer.generateRandomRGB(),
        'b' : randomizer.generateRandomRGB()
      };
    }
    
  };
  
  
  generator.init();
  
});
