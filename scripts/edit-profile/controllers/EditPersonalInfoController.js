(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditPersonalInfoController', EditPersonalInfoController);

	EditPersonalInfoController.$inject = ['UserProfile', 'authService', 'ProfileFactory', 'LocationFactory', '$http', '$q', '$mdToast', '$mdDialog', '$log', '$scope', '$timeout'];

	function EditPersonalInfoController(UserProfile, authService, ProfileFactory, LocationFactory, $http, $q, $mdToast, $mdDialog, $log, $scope, $timeout) {

		console.log(UserProfile);
		$scope.$parent.selectedIndex = 3;

		var vm = this;
		vm.auth = authService;
		vm.interests = [];
		$scope.buttonDisabled = false;

		if (UserProfile) {
			vm.bio = UserProfile.biography;
			vm.interests = UserProfile.interests;
			vm.headline = UserProfile.headline;
		}

		vm.save = function (form) {
			console.log(form);
			$scope.buttonDisabled = true;
			showDialog(true);
			ProfileFactory.getApiToken().then(function success(token) {
				var params = {
					biography: vm.bio.toString(),
					interests: vm.interests,
					headline: vm.headline
				};
				ProfileFactory.updatePersonalInfo(UserProfile._id, params, token).then(function (result) {
					console.log(result);
					$scope.isSaving = false;
					vm.biography = result.data.updated_profile.biography;
					vm.interests = result.data.updated_profile.interests;
					vm.headline = result.data.updated_profile.headline;
					console.log('Personal info successfully updated.');
						$log.log(result.data.message);
						$mdToast.show(
							$mdToast.simple()
							.textContent('Profile successfully updated!')
							.theme('success-toast')
							.hideDelay(3000)
							.position('bottom right')
						);
					$timeout(function () {
						$scope.buttonDisabled = false;
					}, 5000);
				}, function (error) {
					$scope.isSaving = false;
					$mdToast.show(
						$mdToast.simple()
						.textContent('Unable to update your personal info.')
						.action('OK')
						.highlightAction(true)
						.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
						.parent(document.querySelectorAll('#app-container'))
						.position('bottom right'));
					$timeout(function () {
						$scope.buttonDisabled = false;
					}, 5000);
				})
			}, function (error) {
				$scope.isSaving = false;
				$mdToast.show(
					$mdToast.simple()
					.textContent('Something appears to be wrong. Please try again later.')
					.theme('error-toast')
					.hideDelay(3000)
					.position('top right')
				);
				$timeout(function () {
						$scope.buttonDisabled = false;
					}, 5000);
			});
		}
		
		var showDialog = function (isSaving) {
			if (isSaving) {
				$scope.isSaving = isSaving;
				$mdDialog.show({
					//controller: DialogController,
					templateUrl: 'scripts/views/progress-dialog.html',
					parent: angular.element(document.body),
					scope: $scope,
					preserveScope: true,
					controller: function () {
						$scope.$watch('isSaving', function (newValue, oldValue, scope) {
							if (newValue == false) {
								$mdDialog.cancel();
							}
						})
					},
					clickOutsideToClose: false,
					escapeToClose: false,
					fullscreen: false // Only for -xs, -sm breakpoints.
				});
			}
		};
	}
})();
