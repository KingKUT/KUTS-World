(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditPhotoController', EditPhotoController);

	EditPhotoController.$inject = ['authService', 'UserProfile', 'managementProfile', 'ProfileFactory', 'PresenceFactory', '$scope', '$state', '$document', '$log'];

	function EditPhotoController(authService, UserProfile, managementProfile, ProfileFactory, PresenceFactory, $scope, $state, $document, $log) {

		$scope.$parent.selectedIndex = 0;
	}
})();
