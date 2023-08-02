(function($,window,document,undefined){'use strict';var pluginName='loadingModal',defaults={position:'auto',text:'',color:'#fff',opacity:'0.9',backgroundColor:'rgb(0,0,0)',animation:'doubleBounce'};function Plugin(element,options){this.element=element;this.animations={doubleBounce:'<div class="sk-double-bounce"><div class="sk-child sk-double-bounce1"></div><div class="sk-child sk-double-bounce2"></div></div>',rotatingPlane:'<div class="sk-rotating-plane"></div>',wave:'<div class="sk-wave"> <div class="sk-rect sk-rect1"></div> <div class="sk-rect sk-rect2"></div> <div class="sk-rect sk-rect3"></div> <div class="sk-rect sk-rect4"></div> <div class="sk-rect sk-rect5"></div> </div>',wanderingCubes:'<div class="sk-wandering-cubes"><div class="sk-cube sk-cube1"></div><div class="sk-cube sk-cube2"></div></div>',spinner:'<div class="sk-spinner sk-spinner-pulse"></div>',chasingDots:'<div class="sk-chasing-dots"><div class="sk-child sk-dot1"></div><div class="sk-child sk-dot2"></div></div>',threeBounce:'<div class="sk-three-bounce"><div class="sk-child sk-bounce1"></div><div class="sk-child sk-bounce2"></div><div class="sk-child sk-bounce3"></div></div>',circle:'<div class="sk-circle"> <div class="sk-circle1 sk-child"></div> <div class="sk-circle2 sk-child"></div> <div class="sk-circle3 sk-child"></div> <div class="sk-circle4 sk-child"></div> <div class="sk-circle5 sk-child"></div> <div class="sk-circle6 sk-child"></div> <div class="sk-circle7 sk-child"></div> <div class="sk-circle8 sk-child"></div> <div class="sk-circle9 sk-child"></div> <div class="sk-circle10 sk-child"></div> <div class="sk-circle11 sk-child"></div> <div class="sk-circle12 sk-child"></div> </div>',cubeGrid:'<div class="sk-cube-grid"> <div class="sk-cube sk-cube1"></div> <div class="sk-cube sk-cube2"></div> <div class="sk-cube sk-cube3"></div> <div class="sk-cube sk-cube4"></div> <div class="sk-cube sk-cube5"></div> <div class="sk-cube sk-cube6"></div> <div class="sk-cube sk-cube7"></div> <div class="sk-cube sk-cube8"></div> <div class="sk-cube sk-cube9"></div> </div>',fadingCircle:'<div class="sk-fading-circle"> <div class="sk-circle1 sk-circle"></div> <div class="sk-circle2 sk-circle"></div> <div class="sk-circle3 sk-circle"></div> <div class="sk-circle4 sk-circle"></div> <div class="sk-circle5 sk-circle"></div> <div class="sk-circle6 sk-circle"></div> <div class="sk-circle7 sk-circle"></div> <div class="sk-circle8 sk-circle"></div> <div class="sk-circle9 sk-circle"></div> <div class="sk-circle10 sk-circle"></div> <div class="sk-circle11 sk-circle"></div> <div class="sk-circle12 sk-circle"></div> </div>',foldingCube:'<div class="sk-folding-cube"> <div class="sk-cube1 sk-cube"></div> <div class="sk-cube2 sk-cube"></div> <div class="sk-cube4 sk-cube"></div> <div class="sk-cube3 sk-cube"></div> </div>'};this.settings=$.extend({},defaults,options);this._defaults=defaults;this._name=pluginName;this.modal=null;this.modalText=null;this.animationBox=null;this.modalBg=null;this.init();return this;}
$.extend(Plugin.prototype,{init:function(){var $modal=$('<div class="jquery-loading-modal jquery-loading-modal--visible"></div>');var $modalBg=$('<div class="jquery-loading-modal__bg"></div>');var $animationBox=$('<div class="jquery-loading-modal__animation"></div>');var $infoBox=$('<div class="jquery-loading-modal__info-box"></div>');var $text=$('<div class="jquery-loading-modal__text"></div>');if(this.settings.text!==''){$text.html(this.settings.text);}else{$text.hide();}
$animationBox.append(this.animations[this.settings.animation]);$infoBox.append($animationBox).append($text);$modal.append($modalBg);$modal.append($infoBox);if(this.settings.position==='auto'&&this.element.tagName.toLowerCase()!=='body'){$modal.css('position','absolute');$(this.element).css('position','relative');}else if(this.settings.position!=='auto'){$(this.element).css('position',this.settings.position);}
$(this.element).append($modal);this.modalBg=$modalBg;this.modal=$modal;this.modalText=$text;this.animationBox=$animationBox;this.color(this.settings.color);this.backgroundColor(this.settings.backgroundColor);this.opacity(this.settings.opacity);},hide:function(){var modal=this.modal;modal.removeClass('jquery-loading-modal--visible').addClass('jquery-loading-modal--hidden');setTimeout(function(){modal.hide();},1000);},backgroundColor:function(color){this.modalBg.css({'background-color':color});},color:function(color){$('[data-custom-style]').remove();this.modalText.css('color',color);this.animationBox.find('*').each(function(k,e){if($(e).css('background-color')&&$(e).css('background-color')!='rgba(0, 0, 0, 0)'){$(e).css('background-color',color);}
if(window.getComputedStyle(e,':before').getPropertyValue('background-color')!=='rgba(0, 0, 0, 0)'){$('body').append('<style data-custom-style>.'+$(e).attr('class').split(' ')[0]+':before {background-color: '+color+' !important;}</style>');}});},opacity:function(opacity){this.modalBg.css({'opacity':opacity});},show:function(){this.modal.show().removeClass('jquery-loading-modal--hidden').addClass('jquery-loading-modal--visible');},animation:function(animation){this.animationBox.html('');this.animationBox.append(this.animations[animation]);},destroy:function(){$('[data-custom-style]').remove();this.modal.remove();},text:function(text){this.modalText.html(text);}});$.fn[pluginName]=function(options){var args=arguments;if(options===undefined||typeof options==='object'){return this.each(function(){if(!$.data(this,'plugin_'+pluginName)){$.data(this,'plugin_'+pluginName,new Plugin(this,options));}});}else if(typeof options==='string'&&options[0]!=='_'&&options!=='init'){var returns;this.each(function(){var instance=$.data(this,'plugin_'+pluginName);if(instance instanceof Plugin&&typeof instance[options]==='function'){returns=instance[options].apply(instance,Array.prototype.slice.call(args,1));}
if(options==='destroy'){$.data(this,'plugin_'+pluginName,null);}});return returns!==undefined?returns:this;}};})(jQuery,window,document);