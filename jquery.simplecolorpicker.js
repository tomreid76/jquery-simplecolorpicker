/*!
 * jQuery Simple Color Picker v1.0
 * https://github.com/tomreid76/jquery-simplecolorpicker
 *
 * Copyright 2013 Tom Reid
 * Released under the MIT license
 */
;(function( $, window, document, undefined ){

    // our plugin constructor
    var SimpleColorPicker = function( elem, options ){
        this.$input = $(elem);
        this.options = options;
        this.metadata = eval(this.$input.data( 'options' ));
    };

    // the plugin prototype
    SimpleColorPicker.prototype = {

        //default options
        defaults: {
            defaultColor: {name: 'default (white)', hex: 'fff'}, //color used if input does not have a hex in the value attr.
            boxBorderWidth: 1, //border width for input and picker box
            cellWidth: 20, //width of the color cells
            cellHeight: 20, //height of the color cells
            cellBorder: 1, //border width of the color cells
            inputWidth: 25, //overall width of the picker box
            inputHeight: 25, //height of the input
            columns: 10, 	// # of columns
            colors: [
                {name: 'brown',  hex: '7a4100'},
                {name: 'green',  hex: '00aa00'},
                {name: 'red',    hex: 'cc0000'},
                {name: 'aqua',   hex: '039799'},
                {name: 'pink',   hex: 'b0307a'},
                {name: 'purple', hex: '762ca7'},
                {name: 'orange', hex: 'cc6600'},
                {name: 'gray',   hex: '555555'},
                {name: 'black',  hex: '000000'},
                {name: 'blue',   hex: '0000dd'}
            ],
            iconPosition: 'center',
            animationSpeed: 50, //slide animation speed, set to 0 for no anim
            pickerClass: 'color-picker-chooser', //css class for the picker
            textCurrentColor: 'Current color: ' //text shown in title attribute of input once a selection is made
        },

        init: function() {

            //reference to this
            var _t = this;

            // get all config and merge (options are passed in calling plugin function, metadata can be attached to DOM element)
            _t.config = $.extend(true, {}, _t.defaults, _t.options, _t.metadata);

            //calculate dimensions of picker dropdown
            _t.config.totalWidth = _t.config.columns * (_t.config.cellWidth + (2 * _t.config.cellBorder));
            _t.config.totalHeight = Math.ceil((_t.config.colors.length) / _t.config.columns) * (_t.config.cellHeight + (2 * _t.config.cellBorder));

            //set CSS, bg-color, etc...
            _t.setupInputElement();

            //get the picker
            _t.$picker = _t.getPickerMenu();

            //append the picker to body
            $('body').append(_t.$picker);

            //bind events
            _t.bindPickerEvents();

            //bind resize re-position picker
            $(window).resize(function () {
                _t.setPickerPosition(_t.$picker);
            });
            return _t;
        },

        getIconPosition: function() {
            var pos;
            switch (this.config.iconPosition) {
                case 'center':
                    pos = 'center';
                    break;
                case 'left':
                    pos = '4px center';
                    break;
                case 'right':
                default:
                    pos = (this.config.inputWidth - 20) + 'px';
                    break;
            }
            return pos;
        },

        setupInputElement: function() {
            var _t = this,
                defaultColor = (_t.$input.val() && _t.$input.val() !== '') ? _t.$input.val() : _t.config.defaultColor.hex;
            _t.$input.css({
                'backgroundColor': '#' + defaultColor,
                'backgroundPosition': _t.getIconPosition(),
                'borderWidth': _t.config.boxBorderWidth + 'px',
                'width': _t.config.inputWidth + 'px',
                'height': _t.config.inputHeight + 'px',
                'color': '#' + _t.$input.val()
            });
        },

        //close picker
        close: function() {
            var _t = this;
            _t.$picker.slideUp(_t.config.animationSpeed).find('a').removeClass('selected');
            _t.$input.removeClass('open').focus();
            $(document).off('mouseup.cp' + _t.colorPickerInstance, 'html');
        },

        //open picker
        open: function() {
            var _t = this;
            _t.setPickerPosition(_t.$picker); //reset picker position
            _t.$input.addClass('open');
            _t.$picker.slideDown(_t.config.animationSpeed);
            $(document).on('mouseup.cp' + _t.colorPickerInstance, 'html',  function() {_t.close.call(_t)});
        },

        //set position of picker to attach to bot-left of input
        setPickerPosition: function($picker) {
            var _t = this,
                offset = _t.$input.offset(),
                height = _t.$input.height();
            $picker.css({
                'top': offset.top + height + _t.config.boxBorderWidth,
                'left': offset.left
            });
        },

        //creates the cell array and returns to caller
        getCells: function() {
            var _t = this,

                cellCount = _t.config.colors.length,
                $cells = $('<div/>'),
                i,
                $cell;

            for (i = 0; i < cellCount; i++) {
                $cell = $("<li tabindex='0' title='"+ _t.config.colors[i].name +"' data-color='" + _t.config.colors[i].hex + "'></li>");
                $cell.css({
                    'width': _t.config.cellWidth + 'px',
                    'height': _t.config.cellHeight + 'px',
                    'border': _t.config.cellBorder + 'px solid #fff',
                    'lineHeight': _t.config.cellHeight + 'px',
                    'backgroundColor': '#' + _t.config.colors[i].hex
                });

                $cells.append($cell);
            }
            return $cells;
        },

        //create picker container
        getPickerMenu: function() {
            var _t = this;

            _t.colorPickerInstance = $('.' + _t.config.pickerClass).length + 1;
            var $picker = $("<ul class='" + _t.config.pickerClass + "' id='cp-" + _t.colorPickerInstance + "' />"),
                $cells;

            _t.setPickerPosition($picker);
            $picker.css({
                'borderWidth': _t.config.boxBorderWidth + 'px',
                'width': _t.config.totalWidth + 'px',
                'height': _t.config.totalHeight + 'px',
                'display': 'none'
            });
            //get cells
            $cells = _t.getCells($picker);
            //append cells
            $picker.append($cells.children());
            //return picker
            return $picker;
        },

        //bind events on input
        bindPickerEvents: function() {
            var _t = this,
                $cell = _t.$picker.find('li');

            _t.$input.bind({
                mouseup: function (event) {
                    (_t.$picker.is(':visible')) ? _t.close() : _t.open();
                    event.stopPropagation();
                },
                keydown: function (event) {
                    switch (event.which) {
                        //enter key
                        case 13:
                            _t.$input.trigger('mouseup');
                            break;
                        //escape
                        case 27:
                            _t.close();
                            event.stopPropagation();
                            break;
                        //down arrow
                        case 40:
                            _t.open();
                            _t.$picker.find('li:first').focus().addClass('selected');
                            break;
                        case 9:
                            if (_t.$picker.is(':visible')) {
                                _t.$picker.find('li:first').focus().addClass('selected');
                                event.preventDefault();
                            }
                            break;
                    }
                }
            });
            $cell.bind({
                keydown: function (event) {
                    var $t = $(this),
                        $all = $t.siblings().andSelf();

                    switch (event.which) {
                        //enter key
                        case 13:
                            $t.trigger('mouseup');
                            break;
                        //escape key
                        case 27:
                            $t.removeClass('selected');

                            _t.close();
                            event.stopPropagation();
                            break;
                        //left arrow
                        case 37:
                            if ($t.prevAll().length === 0) {
                                $t.removeClass('selected').siblings(':last').focus().addClass('selected');
                            } else {
                                $t.removeClass('selected').prev().focus().addClass('selected');
                            }
                            break;
                        //up arrow
                        case 38:
                            var pos = $all.index($t) - _t.config.columns;
                            if (pos > -1) {
                                $t.removeClass('selected');
                                $($all[pos]).addClass('selected').focus();
                            } else {
                                $t.removeClass('selected');
                                _t.close();
                            }
                            break;
                        //right arrow and tab
                        case 39: case 9:
                        if ($t.nextAll().length === 0) {
                            $t.removeClass('selected').siblings(':first').focus().addClass('selected');
                        } else {
                            $t.removeClass('selected').next().focus().addClass('selected');
                        }
                        break;
                        //down arrow
                        case 40:
                            var newPos = $all.index($t) + _t.config.columns;
                            if (newPos < $all.length) {
                                $t.removeClass('selected');
                                $($all[newPos]).addClass('selected').focus();
                                //if includeDefault is true
                            } else if (_t.config.includeDefault && (newPos < $all.length + (_t.config.columns - 1))) {
                                $t.removeClass('selected');
                                $all.last().addClass('selected').focus();
                            }
                            break;

                    }
                    return false;
                },
                mouseup: function (event) {
                    var $this = $(this);
                    $this.siblings().andSelf().removeClass('selected');
                    //chosen color
                    var newColor = $this.attr('data-color'),
                        newColorName = $this.attr('title');
                    //update input
                    _t.$input.val(newColor).removeClass('open').focus().css({
                        'backgroundColor': '#' + newColor,
                        'color': '#' + newColor
                    }).attr('title', _t.config.textCurrentColor + newColorName);
                    _t.close();
                    event.stopPropagation();
                    return false;
                }
            });
        }
    };

    //Plugin.defaults = Plugin.prototype.defaults;

    $.fn.simpleColorPicker = function(options) {
        return this.each(function() {
            new SimpleColorPicker(this, options).init();
        });
    };

})( jQuery, window , document );