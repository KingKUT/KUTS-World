(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditMediaDialogController', EditMediaDialogController);

	EditMediaDialogController.$inject = ['$scope', '$mdDialog', 'mediaObj', 'caption'];

	function EditMediaDialogController($scope, $mdDialog, mediaObj, caption) {
		var vm = this; 
		vm.mediaObj = mediaObj;
		vm.myHtml = caption;
		console.log(caption);
		console.log(mediaObj);
		
		$scope.hide = function () {
			$mdDialog.hide();
		};

		vm.cancel = function () {
			$mdDialog.cancel();
		};

		vm.done = function () {
			$mdDialog.hide(vm.myHtml);
		};
	}
})();
