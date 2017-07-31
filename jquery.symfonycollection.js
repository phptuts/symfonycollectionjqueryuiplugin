(function($){

    'use strict';
    
    /**
     * We select the jquery ui sortable element.
     */
    $.symfonycollection = function(element, options) {

        var plugin = this;

        var defaults =
            {
                prototype_id : 'none',//The id of the element storing the data prototype
                prototype_replace_string: 'none',//The string used to replace the
                prototype_attribute : 'data-prototype',//attribute in the html element where the prototype is stored
                hidden_order_field_class : null,//The class of the hidden input field that stores the order
                start_sort_order : 0, //The starting place for the counter used to populate the
                add_button_id: 'none', //This is the id of button that adds the row
                delete_button_class: 'none',//This is the class of buttons that deletes the row
                move_class : 'move',//handler for jquery ui
                selector_for_sortable  : "",//Element being move by jquery ui
                move_up_btn : "move_up_btn",//moves the element up
                move_down_btn : "move_down_btn", // moves the element down
                jquery_placeholder_class: "placeholder-jquery-ui",//This is the class that is applied to the placeholder for jquery ui.
                add_event: function(){},//This function fires when the you add a element to the collection
                delete_event: function(){}//Fires when you delete an element from the collection
            };

        /**
         * Delete a row from the collection
         */
        plugin.deleteRow = function(deleteBtn)
        {

            var elementContainer = deleteBtn.parents('.' +plugin.settings.selector_for_sortable);
            elementContainer.remove();
            plugin.reOrderElements();
            plugin.settings.delete_event();
        };


        /**
         * Adds a row to the series
         */
        plugin.addRow = function()
        {
            var prototype = plugin.prototype;
            prototype = prototype.replace(new RegExp(plugin.settings.prototype_replace_string, 'g'),   plugin.count );
            $element.append(prototype);
            plugin.count += 1;
            plugin.reOrderElements();
            plugin.settings.add_event();
        };

        /**
         * Indexes the hidden order field
         *
         */
        plugin.reOrderElements = function() {

            $('.' +plugin.settings.selector_for_sortable).each(function(index) {
                console.log(index);
                $(this).find('input, textarea, select').each(function() {

                    var formElement = $(this);

                    // We want to skip elements that don't have an name attribute
                    if (typeof formElement.attr('name') === typeof undefined || formElement.attr('name') === false) {
                        return;
                    }

                    var name =  formElement.attr('name');
                    name = name.replace(/\[([0-9][0-9]*)]/g, '[' + index + ']');
                    formElement.attr('name', name);

                    var id = formElement.attr('id');
                    id = id.replace(/_([0-9][0-9]*)_/g, '_' + index + '_');
                    formElement.attr('id', id);
                });

                $(this).find('label').each(function () {

                    var forAttribute = $(this).attr('for');

                    // We want to skip elements that don't have an for attribute
                    if (typeof forAttribute === typeof undefined || forAttribute === false) {
                        return;
                    }

                    forAttribute = forAttribute.replace(/_([0-9][0-9]*)_/g, '_' + index + '_');
                    $(this).attr('for', forAttribute);

                });

                if (plugin.settings.hidden_order_field_class != null) {
                    $(this).find("." + plugin.settings.hidden_order_field_class).val(index);
                }

            });
        };

        /**
         * Move the element down                                                                  *
         */
        plugin.moveElementDown = function(clickedObject)
        {
            var button = $(clickedObject);
            var elementToMove = button.parents(plugin.settings.selector_for_sortable);
            elementToMove.next().after(elementToMove);
            plugin.reOrderElements();
        };

        /**
         * Move the element up                                                                  *
         */
        plugin.moveElementUp = function(clickedObject)
        {
            var button = $(clickedObject);
            var elementToMove = button.parents(plugin.settings.selector_for_sortable);
            elementToMove.prev().before(elementToMove);
            plugin.reOrderElements();
        };


        plugin.settings = {};
        plugin.prototype = null; //This is the prototype for constructing the html
        plugin.add_button = null;
        plugin.count = null;

        //This is the element for jquery ui collection.
        var $element = $(element), // reference to the jQuery version of DOM element
            element = element;    // reference to the actual DOM element

        plugin.init = function()
        {
            plugin.settings = $.extend({}, defaults, options);
            if(
                plugin.settings.prototype_id === "" ||
                plugin.settings.prototype_replace_string === "" ||
                plugin.settings.prototype_attribute === "" ||
                plugin.settings.hidden_order_field_class === "" ||
                plugin.settings.start_sort_order === "" ||
                plugin.settings.delete_button_class === "" ||
                plugin.settings.add_button_id === "" ||
                plugin.settings.move_class === "" ||
                plugin.settings.selector_for_sortable === "" ||
                plugin.settings.move_up_btn === "" ||
                plugin.settings.move_down_btn   === ""   ||
                plugin.settings.jquery_placeholder_class === ""
            )
            {
                throw "You don't have all of the options populated";
            }

            plugin.prototype = $("#" + plugin.settings.prototype_id).attr(plugin.settings.prototype_attribute);
            plugin.add_button = $("#" + plugin.settings.add_button_id);
            plugin.count = plugin.settings.start_sort_order;

            //Event for adding a row
            plugin.add_button.on("click", function(){
                plugin.addRow();
            });

            //Event for deleting row
            $(document).on('click',"." + plugin.settings.delete_button_class, function()
            {
                plugin.deleteRow($(this));
            });


            //Event the move the jquery ui unit down
            $(document).on("click", "." + plugin.settings.move_down_btn, function(){
                plugin.moveElementDown($(this));
            });


            //Event the move the jquery ui unit up
            $(document).on("click", "." + plugin.settings.move_up_btn, function(){
                plugin.moveElementUp($(this));
            });


            //Fires the jQuery sortable
            if(plugin.count === 0)
            {
                plugin.addRow();
            }

            $(element).sortable({
                update: function( event, ui ) { plugin.reOrderElements(); },
                'handle': '.' + plugin.settings.move_class,
                placeholder: 'placeholder-jquery-ui'
            });



        };

        plugin.init();
    };




    $.fn.symfonycollection = function(options)
    {
        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function()
        {

            // if plugin has not already been attached to the element
            if (undefined === $(this).data('symfonycollection'))
            {

                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $.symfonycollection(this, options);

                // in the jQuery version of the element
                // store a reference to the plugin object
                // you can later access the plugin and its methods and properties like
                // element.data('pluginName').publicMethod(arg1, arg2, ... argn) or
                // element.data('pluginName').settings.propertyName
                $(this).data('symfonycollection', plugin);

            }
        });


    };

}(jQuery));
