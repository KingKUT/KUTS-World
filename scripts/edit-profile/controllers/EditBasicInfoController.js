(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditBasicInfoController', EditBasicInfoController);

	EditBasicInfoController.$inject = ['UserProfile', 'managementProfile', 'authService', 'ProfileFactory', '$http', '$mdToast', '$mdDialog', '$log', '$scope', '$timeout'];

	function EditBasicInfoController(UserProfile, managementProfile, authService, ProfileFactory, $http, $mdToast, $mdDialog, $log, $scope, $timeout) {

		console.log(UserProfile);
		$scope.$parent.selectedIndex = 1;

		var vm = this;
		vm.auth = authService;
		console.log(managementProfile);
		vm.user = managementProfile;
		vm.professions = [];
		vm.userProfession = '';
		var thisYear = new Date();
		var today = new Date();
		vm.maxDate = new Date(thisYear.getFullYear() - 18, today.getMonth(), today.getDate());
		var form1 = {};
		$scope.buttonDisabled = false;

		if (UserProfile) {
			vm.username = UserProfile.username;
			vm.brand = UserProfile.brand;
			vm.userProfession = UserProfile.profession;
			vm.DOB = new Date(UserProfile.DOB);
		} else {
			vm.userProfession = '';
		}

		$http.get('/json/listings.json').then(function (json) {
			if (json) {
				vm.professions = vm.professions.concat(json.data);
				vm.professions.push({
					id: vm.professions.length - 1,
					text: 'Other',
					icon: ""
				});
				console.log(vm.professions);
				//vm.userProfession = vm.professions[0].text;
			} else {
				$log.log('No listings available');
			}
		}, function (err) {
			$log.log("Unable to parse JSON for professions.")
		});

		vm.save = function (form) {
			showDialog(true);
			$scope.buttonDisabled = true;
			console.log(form);
			var params = {
				username: form.name.$modelValue,
				brand: form.brand.$modelValue,
				profession: form.profession.$modelValue,
				DOB: new Date(form.DOB.$modelValue),
			}
			console.log(params);
			ProfileFactory.getApiToken().then(function success(token) {
				ProfileFactory.updateBasicInfo(UserProfile._id, params, token).then(function (result) {
					$scope.isSaving = false;
					console.log('Basic profile info successfully updated.');
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
					// Update the scope variables
					vm.username = result.data.updated_profile.username;
					vm.brand = result.data.updated_profile.brand;
					vm.userProfession = result.data.updated_profile.profession;
					vm.DOB = new Date(result.data.updated_profile.DOB);
				}, function (error) {
					$scope.isSaving = false;
					$log.error('Unable to update profile.');
					$mdToast.show(
						$mdToast.simple()
						.textContent('Unable to update your thumbnail.')
						.theme('error-toast')
						.hideDelay(3000)
						.position('top right')
					);
					$timeout(function () {
						$scope.buttonDisabled = false;
					}, 5000);
				});
			}, function () {
				$scope.isSaving = false;
				$log.error('Unable to retrieve member api token.');
				$mdToast.show(
					$mdToast.simple()
					.textContent('Unable to update your thumbnail.')
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
