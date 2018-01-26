(function () {

	'use strict';

	angular
		.module('app')
		.controller('InterestController', InterestController);

	InterestController.$inject = ['authService', 'ProfileFactory', 'UserProfile', '$state', '$mdToast'];

	function InterestController(authService, ProfileFactory, UserProfile, $state, $mdToast) {

		var vm = this;
		vm.auth = authService;
		vm.interests = [];
		vm.separatorKeys = [9, 13, 32];
		console.log(UserProfile);

		if (!UserProfile) {
			if (authService.isAuthenticated()) {
				authService.getID().then(function (userID) {
					ProfileFactory.getApiToken().then(function success(token) {
						ProfileFactory.getProfile(userID, token).then(function (profile) {
							console.log(profile);
							UserProfile = profile;
							vm.saveData = saveData;
						}, function (err) {
							console.log('Unable to retrieve profile');
						});
					}, function error(response) {
						// this function will be called when the request returned error status
						console.log('Unable to retrieve member api token');
					});
				}, function (err) {
					console.log('Unable to retrieve user ID.'); // IMPORTANT: Do something if ID isn't retrieved!
				});
			} else {
				console.log('User not authenticated. Must login...')
				$state.go('login');
			}
		}
		else {
			vm.saveData = saveData;
		}

		function saveData() {
			ProfileFactory.getApiToken().then(function (token) {
				ProfileFactory.saveInterests(UserProfile._id, vm.interests, token).then(function (result) {
					console.log(result.data.message);
					console.log(result.data.updated_profile);
					if (!UserProfile.connections) {
						$state.go()
					}
				}, function (err) {
					console.log('Unable to save your interests...');
					$mdToast.show(
						$mdToast.simple()
						.textContent('Unable to save your interests. Please try again later.')
						.action('OK')
						.highlightAction(true)
						.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
						.parent(document.querySelectorAll('#app-container'))
						.position('bottom right'));
				});
			}, function (err) {
				console.log('Unable to retrieve token');
				$mdToast.show(
					$mdToast.simple()
					.textContent('Unable to save your interests. Please try again later.')
					.action('OK')
					.highlightAction(true)
					.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
					.parent(document.querySelectorAll('#app-container'))
					.position('bottom right'));
			});
		}
	}
})();
