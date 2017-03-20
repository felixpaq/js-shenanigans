(function(_$) {

    "use strict";
    /**
     * Created by felixpaq on 18/01/17.
     */

    /**
     * @typedef {Object} Updatable
     * @property {String} update_url
     */

    /**
     * Updatable
     * @constructor
     */
    var Updatable = window.Updatable = function () {};

    Updatable.prototype.init = function () {
        this.update_url = '';
        this.selectors = {
            base: "[data-updatable-field]"
        };
        this.updatable_fields = new Updatable.updatable_fields();
    };

    Updatable.prototype.create_fields = function (html_root) {
        get_elements(this.selectors.base, html_root).each(_$.proxy(function (index, element) {
            var field = _$(element).attr(clean_selector_to_attribute(this.selectors.base));
            if (this.hasOwnProperty(field)) {
                this.updatable_fields.push(new Updatable.updatable_field(field, _$(element)));
            }
        }, this));
    };

    Updatable.prototype.bind_fields = function () {
        this.updatable_fields.each(function (index, field) {
            field._$element.on('focus', _$.proxy(set_field, this, field));
            field._$element.on('blur', _$.proxy(update_field, this, field));
            field._$element.on('keypress', _$.proxy(update_field, this, field));
        }.bind(this));
    };

    /**
     * Defines basic callback for update
     * @function field_updated
     * @param {string} field
     * @param {string} new_value
     */
    Updatable.prototype.field_updated = function (field, new_value) {
        this.updatable_fields.find_by_field(field)._$element.val(new_value);
        this.updatable_fields.find_by_field(field).update_size();
    };

    /**
     * Makes a call to the server to update a field
     * @function update
     * @param {string} field
     * @param {string} new_value
     */
    Updatable.prototype.update = function (field, new_value) {
        if (this.hasOwnProperty(field) && this.update_url != undefined) {
            if (new_value != '') {
                var out_data = {
                    field_to_update: field,
                    value_to_set: new_value
                };
                _$.ajax({
                    type: "PUT",
                    url: this.update_url,
                    data: out_data,
                    success: _$.proxy(function (in_data) {
                        this.update_field(field, in_data[field]);
                    }, this),
                    dataType: 'json'
                });
            } else {
                this.update_field(field, this[field]);
            }
        }
    };

    /**
     * Updates the field on the html element
     * @function update_field
     * @param {string} field
     * @param {string} new_value
     */
    Updatable.prototype.update_field = function (field, new_value) {
        if (this.hasOwnProperty(field)) {
            this[field] = new_value;
            this.field_updated(field, new_value);
        }
    };

    /**
     * Set the field on the object
     * @function set_field
     * @param {string} field
     * @param {string} new_value
     */
    Updatable.prototype.set_field = function (field, new_value) {
        if (this.hasOwnProperty(field)) {
            this[field] = new_value;
        }
    };

    /**
     * @typedef {Object} UpdatableFields
     * @property {Array} fields
     */
    /**
     * Updatable fields - Container for invoice fields
     * @constructor
     */
    Updatable.updatable_fields = function () {
        this.fields = [];
    };

    /**
     * Add a field to the list
     * @function push
     * @param {InvoicedItem} field
     */
    Updatable.updatable_fields.prototype.push = function (field) {
        this.fields.push(field);
    };

    /**
     * Helper to retrieve an invoice field by it's field
     * @param {String} field
     * @returns {UpdatableField}
     */
    Updatable.updatable_fields.prototype.find_by_field = function (field) {
        return _$.grep(this.fields, function (e) {
            return e.field == field;
        })[0];
    };

    /**
     * UpdatableFields.each callback
     *
     * @callback UpdatableFieldsEachCallback
     * @param {Number} index
     * @param {Object} element
     */

    /**
     * Loops through the fields
     * @function
     * @param {UpdatableFieldsEachCallback} callback
     */
    Updatable.updatable_fields.prototype.each = function (callback) {
        var index, length = this.fields.length;

        for (index = 0; index < length; index++) {
            callback.call(this, index, this.fields[index]);
        }
    };

    /**
     * @typedef {Object} UpdatableField
     * @property {String} field
     * @property {jQuery} _$element
     *
     * Create an invoice field so it can manage it's own width
     * @constructor
     * @param {String} field
     * @param {jQuery} _$element
     */
    Updatable.updatable_field = function (field, _$element) {
        this.field = field;
        this._$element = _$element;
        this.update_size();
        this._$element.on('keyup keydown', $.proxy(this.update_size, this))
    };

    /**
     * Callback used by jQuery to auto update the width of the input after modification
     * @function
     * @name update_size
     */
    Updatable.updatable_field.prototype.update_size = function () {
        // (t.match(/\n/g) || []).length
        if (this._$element.is('textarea')) {
            var new_width, new_height,
                val = this._$element.val(),
                lines = val.split('\n');

            var field = this.field;

            var lines_lengths = lines.map(function (line) {
                var cleaned_line = line.trim();
                return cleaned_line.length;
            });

            new_width = Math.max.apply(null, lines_lengths) * 8;
            new_height = lines.length * 17;

            this._$element.width(new_width).height(new_height);

        } else if (this._$element.is('input[type="text"]')) {
            this._$element.width(this._$element.val().length * 8);
        }
    };

    function update_field(updatable_field, e){
        events_conditions(e, function(){
            this.update(updatable_field.field, updatable_field._$element.val());
        }.bind(this));
    }

    function set_field(updatable_field, e){
        events_conditions(e, function(){
            this.set_field(updatable_field.field, updatable_field._$element.val());
        }.bind(this));
    }

})(jQuery);
