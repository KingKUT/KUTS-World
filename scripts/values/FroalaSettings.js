(function () {

	'use strict';

	angular
		.module('app')
		.value('froalaConfig', {
			height: 500,
			charCounterCount: true,
			charCounterMax: 5000,
			imageAllowedTypes: ['jpeg', 'jpg', 'png'],
			imageEditButtons: ['imageDisplay', 'imageAlign', 'imageInfo', 'imageRemove', 'imageReplace', 'imageDisplay', 'imageAlt', 'imageSize'],
			imageMaxSize: 30 * 1024 * 1024,
			videoAllowedTypes: ['mp4', 'mpg', '3gp', '3g2', 'mv4', 'avi', 'mov'],
			videoMaxSize: 720 * 1024 * 1024,
			fileUpload: true,
			spellcheck: true,
			toolbarButtons: ["bold", "italic", "underline", "strikeThrough", 'subscript', 'superscript', 'outdent', 'indent', 'clearFormatting', "|", "align", "formatOL", "formatUL", 'insertImage', 'insertVideo']
		});
})()