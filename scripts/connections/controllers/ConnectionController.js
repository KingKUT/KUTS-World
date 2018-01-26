(function () {

	'use strict';

	angular
		.module('app')
		.controller('ConnectionController', ConnectionController);

	ConnectionController.$inject = ['authService', 'ProfileFactory', 'UserProfile', '$state', '$mdToast'];

	function ConnectionController(authService, ProfileFactory, UserProfile, $state, $mdToast) {

		var vm = this;
		vm.auth = authService;
		vm.connectedUsers = [];
		
	}
})();