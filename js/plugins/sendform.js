
//send form plugin
define(['jquery', 'funcs'], function($, f) {
	$.fn.sendForm = function (callback, validate) {

		return this.each(function() {

			var   form = this
				, data = {}
				, $form = $(form)
				, method = ($form.attr('method') || 'post').toUpperCase()
				, action = $form.attr('action')
				, isValid = true
			;

			$(this).on('submit', function(e) {
				e.preventDefault();

				data = getData($form);
				isValid = true;

				if ( f.isFunction(validate) ) {
					isValid = validate(data);
				}

				if ( isValid !== true ) {
					callback.call(form, isValid);
					return;
				}

				var   xhr = new XMLHttpRequest()
					, formData = new FormData( form )
				;

				xhr.open(method, action);
				xhr.onload = function() {
					var r = xhr.responseText;
					callback.call(form, r);
				}

				xhr.send(formData);
			});
		});
	}

	function getData( $form ) {
		var data = {};

		$form.find('[name]').each(function() {

			var   input = this
				, $input = $(input)
				, name = $input.attr('name')
				, val = $input.val()
				, type = $input.attr('type')
			;

			if ( type == 'checkbox' ) {
				val = +!!input.checked;
			}

			if ( type == 'radio' ) {
				val = $form.find('[name="'+name+'"]:checked').val();
			}

			data[ name ] = val;
		});

		return data;
	}
});
