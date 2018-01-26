(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditLocationInfoController', EditLocationInfoController);

	EditLocationInfoController.$inject = ['UserProfile', 'authService', 'ProfileFactory', 'LocationFactory', '$http', '$q', '$mdToast', '$mdDialog', '$log', '$scope', '$timeout'];

	function EditLocationInfoController(UserProfile, authService, ProfileFactory, LocationFactory, $http, $q, $mdToast, $mdDialog, $log, $scope, $timeout) {

		console.log(UserProfile);
		$scope.$parent.selectedIndex = 2;

		var vm = this;
		vm.auth = authService;
		vm.countries = [];
		vm.statesAndProvinces = [];
		vm.stateOrProvince = '';
		vm.isUS = false;
		vm.postalCode = '';
		$scope.buttonDisabled = false;

		$http.get('/json/countries.json').then(function (json) {
			if (json) {
				vm.countries = json.data;
			}
		}, function (err) {
			console.log(err);
			$log.log(err);
			$log.log('Unable to parse JSON for countries.')
		});

		if (UserProfile) {
			vm.country = {
				name: UserProfile.country.name,
				code: UserProfile.country.countryCode
			};
			vm.city = UserProfile.city;
			vm.state = UserProfile.state;
			vm.postalCode = UserProfile.postalcode;
			vm.tagline = UserProfile.headline;

			$http.get('/json/states_and_provinces.json').then(function (json) {
				if (json) {
					return getAllStatesByCountryCode(vm.country.code, json.data).then(function (states) {
						console.log(states);
						vm.statesAndProvinces = states;
						if (vm.state) {
							return searchStateByName(vm.state, states).then(function (stateObject) {
								console.log(stateObject);
								vm.stateOrProvince = stateObject;
							}, function (error) {
								vm.stateOrProvince = '';
							});
						}
					}, function (error) {
						vm.statesAndProvinces = '';
					});
				}
			}, function (err) {
				console.log(err);
				$log.log(err);
				$log.log('Unable to parse JSON for countries.')
			});
		}

		function getAllStatesByCountryCode(countryCode, countries) {
			return $q(function (resolve, reject) {
				if (countryCode == 'US') {
					vm.isUS = true;
				} else {
					vm.isUS = false;
				}
				var tempStates = null;
				angular.forEach(countries, function (value, key) {
					if (value.countryCode === countryCode) {
						tempStates = value.states;
						resolve(value.states);
					}
				});
				if (!tempStates) {
					reject(tempStates);
				}
			});
		}

		function searchStateByName(stateName, states) {
			return $q(function (resolve, reject) {
				var tempState = null;
				angular.forEach(states, function (value, key) {
					if (value.name === stateName) {
						tempState = value;
						resolve(value);
					}
				});
				if (!tempState) {
					reject(tempState);
				}
			});
		}

		vm.isAmerica = function () {
			return vm.isUS;
		}

		vm.hasStatesAndProvinces = function () {
			return vm.statesAndProvinces && vm.statesAndProvinces.length > 0;
		}

		$scope.updateLocationForm = function (form) {
			$http.get('/json/states_and_provinces.json').then(function (json) {
				if (json) {
					getAllStatesByCountryCode(vm.country.code, json.data);
					console.log(vm.statesAndProvinces);
				}
			}, function (err) {
				console.log(err);
				$log.log(err);
				$log.log('Unable to parse JSON for countries.')
			});
		}

		var verifyLocation = function () {
			return $q(function (resolve, reject) {
				if (vm.isAmerica() && vm.postalCode && vm.postalCode.match(/^[0-9]{5}$/)) {
					return LocationFactory.getCoordinates('US', null, null, vm.postalCode).then(function (results) {
						console.log(results);
						if (!results) {
							reject(500);
						} else if (!results.candidates || results.candidates.length == 0) {
							reject(404);
						} else {
							resolve(results);
						}
					});
				} else {
					return LocationFactory.getCoordinates(vm.country.code, vm.city, vm.stateOrProvince, null).then(function (results) {
						if (!results) {
							reject(500);
						} else if (!results.candidates || results.candidates.length == 0) {
							reject(404);
						} else {
							resolve(results);
						}
					});
				}
			});
		}

		vm.save = function (form) {
			console.log(form);
			$scope.buttonDisabled = true;
			showDialog(true);
			verifyLocation().then(function (results) {
				console.log(results);
				vm.locationCandidates = results.candidates;
				vm.locationCandidate = vm.locationCandidates[0];
				console.log(vm.locationCandidate);
				var params = {
					country: vm.country,
					state: vm.stateOrProvince.name,
					city: vm.city,
					postalcode: vm.postalCode,
					coordinates: [vm.locationCandidate.location.x, vm.locationCandidate.location.y]
				};
				ProfileFactory.getApiToken().then(function success(token) {
					ProfileFactory.updateLocationInfo(UserProfile._id, params, token).then(function (result) {
						$scope.isSaving = false;
						console.log('Location info successfully updated.');
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
						vm.country = result.data.updated_profile.country;
						vm.state = result.data.updated_profile.state;
						vm.city = result.data.updated_profile.city;
						vm.postalCode = result.data.updated_profile.postalCode;
					}, function (error) {
						$scope.isSaving = false;
						$mdToast.show(
							$mdToast.simple()
							.textContent('Unable to update your location info.')
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
			}, function (error) {
				console.log(error);
				if (error == 500) {
					$mdToast.show(
						$mdToast.simple()
						.textContent('Something appears to be wrong. Please try again later.')
						.action('OK')
						.highlightAction(true)
						.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
						.parent(document.querySelectorAll('#app-container'))
						.position('bottom right'));
				} else if (error == 404) {
					$mdToast.show(
						$mdToast.simple()
						.textContent('We couldn\'t find a location that matched the one you gave us.')
						.action('OK')
						.highlightAction(true)
						.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
						.parent(document.querySelectorAll('#app-container'))
						.position('bottom right'));
				}
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
