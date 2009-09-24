/**
 * uBox jQuery plugin
 * Author: Miro Zoricak (zoricak at udesign.sk)
 * Website: http://zori.udesign.sk
 * v 1.0 beta
 */
(function($){
	var images = [], settings;
	
	$.fn.uBox = function(userSettings){
		settings = $.fn.uBox.settings;											// use global var settings instead of $.fn.uBox.settings to save space
		$.extend(settings, userSettings);										// apply user's settings
		$(window).resize($.fn.uBox.resizeHandler);								// re-center image when user resizes window
		return this.each(function(index, el){									// run this for every assigned image
			while(typeof images[index] != "undefined"){ index++ }				// these two lines fix incorrect behaviour when multiple uBoxes are uset at once
			images[index] = null;
			$(el).hide();														// hide image from the user
			$.fn.uBox.prepare(index, el);										// prepare image for being uBoxable
			$(this).bind("click", index, $.fn.uBox.clickHandler);
		});
	}
	
	$.fn.uBox.clickHandler = function(event){
		var origImg = images[event.data];										// get image from global images storage
		if($("#uBoxMagnified").size() > 0){										// close any open boxes
			$("#uBoxMagnified").trigger("click");
			if($("#uBoxMagnified").attr("src") == origImg.src) return;
		}
		var image = $("<img id='uBoxMagnified' />");							// recreate image
		$(image).attr("src", origImg.src);
		$(image).attr("alt", origImg.alt);
		$(image).css({
			width: origImg.thumbWidth, 
			height: origImg.thumbHeight,
			position: "absolute",
			top: $(origImg.element).offset().top+"px",
			left: $(origImg.element).offset().left+"px",
			zIndex: 1000,
			opacity: 0.4,
			cursor: "pointer",
			"-moz-box-shadow": settings.shadow ? "black 0px 0px 10px" : "",		// allow box shadow on firefox 3.1
			"-webkit-box-shadow": settings.shadow ? "black 0px 0px 10px" : "",	// allow box shadow on webkit
			backgroundColor: "black",
			border: "1px solid #999",
			padding: "3px"
		});
		
		var alt = $("<div id='uBoxMagnifiedAlt'>"+$(image).attr("alt")+"</div>");
		alt.css({
			position: "absolute",
			width: origImg.originalWidth - 16,
			height: 25+"px",
			top: $(window).height()/2 + origImg.originalHeight/2 + $(window).scrollTop() - 40 +"px",
			left: $(window).width()/2 - origImg.originalWidth/2 + $(window).scrollLeft() + 2 +"px",
			backgroundColor: "black",
			opacity: 0,
			zIndex: 1001,
			color: "white",
			padding: "10px",
			cursor: "pointer"
		});
		alt.click(function(){$("#uBoxMagnified").trigger('click')});			// clicks on alt div close uBox
		
		$(image).bind("click", origImg, $.fn.uBox.dispose);						// animate image back and remove it
		$("body").prepend(image);
		$(image).animate({
			width: origImg.originalWidth,
			height: origImg.originalHeight,
			top: $(window).height()/2 - origImg.originalHeight/2 + $(window).scrollTop() +"px",
			left: $(window).width()/2 - origImg.originalWidth/2 + $(window).scrollLeft() +"px",
			opacity: 1
		}, settings.showSpeed, settings.showEasing, function(){
			$("body").append(alt);												// add the image title box
			settings.showImageAlt ? $(alt).fadeTo(settings.showImageAltSpeed, 0.5) : "";
		});
	}
	
	$.fn.uBox.dispose = function(event){										// animate box back to original thumb and remove it from DOM, also remove the alt div
		var origImg = event.data;
		$("#uBoxMagnifiedAlt").remove();
		$("#uBoxMagnified").animate({
			width: origImg.thumbWidth+"px",
			height: origImg.thumbHeight+"px",
			top: $(origImg.element).offset().top+"px",
			left: $(origImg.element).offset().left+"px",
			opacity: 0
		}, settings.hideSpeed, settings.hideEasing, function(){
			$(this).remove() 
		});
	}
	
	$.fn.uBox.prepare = function(index, el){									// retrieves image parameters and stores them in the images array
		$(el).load(function(){													// wait for image to load (fixes webkit image dimension calculation problems)
			var width = $(el).width();
			var height = $(el).height();
			var newDim = proportionalResize({width: width, height: height});	// calculate thumb dimensions
			$(el).css({
				width:newDim.width+"px", 
				height:newDim.height+"px",
				cursor: "pointer",
				msInterpolationMode: "bicubic"									// fixes the nearest-neighbour resizing on IE7 (IE6 still sucks ass)
			});
			images[index] = {
				originalWidth: width,
				originalHeight: height,
				thumbWidth: newDim.width,
				thumbHeight: newDim.height,
				src: $(el).attr('src'),
				alt: $(el).attr('alt'),
				element: el
			};
			$(el).show();														// okay now we are ready to show the thumb to the user
		});
	}
	
	$.fn.uBox.resizeHandler = function(){										// reposition uBox, if any is open when user resizes window
		var box = $("#uBoxMagnified");
		if(box.size() > 0){
			box.css({
				top: $(window).height()/2 - box.height()/2 + $(window).scrollTop() +"px",
				left: $(window).width()/2 - box.width()/2 + $(window).scrollLeft() +"px"
			});
			box.css({
				top: $(window).height()/2 + box.height()/2 + $(window).scrollTop() - 40 +"px",
				left: $(window).width()/2 - box.width()/2 + $(window).scrollLeft() + 2 +"px"
			});
		}
	}
	
	$.fn.uBox.settings = {
		thumbWidth: 100,
		thumbHeight: 100,
		shadow: true,			// only affects webkit (Safari 3+ and Chrome)
		showSpeed: 400,			// how fast is the uBox show animation
		showEasing: "linear",	// easing for the show animation (requires easing plugin)
		hideSpeed: 400,			// how fast is the uBox hide animation
		hideEasing: "linear",	// easing for the hide animation (requires easing plugin)
		showImageAlt: true,		// true shows the transparent frame at the bottom of uBox containing image alt
		showImageAltSpeed: 800	// speed of the alt div fade-in animation
	}
	
	proportionalResize = function(dim){											// compute maximum possible dimensions of an image that fits into rectangle defined by settings.thumbWidth and settings.thumbHeight
		var ratio = dim.width / dim.height;
		var nw = 0, nh = 0;
		if(dim.width > dim.height){
			nw = settings.thumbWidth;
			nh = settings.thumbWidth/ratio;
		} else {
			nw = settings.thumbHeight*ratio;
			nh = settings.thumbHeight;
		}
		return {width: nw, height: nh};
	}
})(jQuery)