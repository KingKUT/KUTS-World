(function () {

	'use strict';

	angular
		.module('app')
		.controller('RegisterController', RegisterController);

	RegisterController.$inject = ['managementProfile', 'UserProfile', 'authService', 'ProfileFactory', 'LocationFactory', '$http', '$state', '$mdToast', '$mdDialog', '$q', '$log', '$scope'];

	function RegisterController(managementProfile, UserProfile, authService, ProfileFactory, LocationFactory, $http, $state, $mdToast, $mdDialog, $q, $log, $scope) {

		if (UserProfile) {
			console.log('already registered!');
			$state.go('home.main');
		}

		var vm = this;
		vm.auth = authService;
		vm.user = managementProfile;
		console.log(managementProfile);
		vm.page = 1;
		vm.professions = [];
		vm.profession = '';
		vm.countries = [];
		vm.country = '';
		var thisYear = new Date();
		var today = new Date();
		vm.maxDate = new Date(thisYear.getFullYear() - 18, today.getMonth(), today.getDate());
		var form1 = {};
		var form2 = {};
		var form3 = {};

		$http.get('/json/listings.json').then(function (json) {
			if (json) {
				vm.professions = vm.professions.concat(json.data);
				vm.professions.push({
					id: vm.professions.length - 1,
					text: 'Other',
					icon: ""
				});
				console.log(vm.professions);
				//vm.profession = vm.professions[0].text;
			} else {
				$log.log('No listings available');
			}
		}, function (err) {
			$log.log("Unable to parse JSON for professions.")
		});

		$http.get('/json/countries.json').then(function (json) {
			if (json) {
				vm.countries = json.data;
			}
		}, function (err) {
			console.log(err);
			$log.log(err);
			$log.log('Unable to parse JSON for countries.')
		});

		vm.nextPage = function (form) {
			vm.page = 2;
		}

		vm.goBack = function () {
			if (vm.page > 1) {
				vm.page = vm.page - 1;
			}
		}

		/** ---------------------------------------------- Second page -------------------------------------------------- **/
		vm.countries = [];
		vm.statesAndProvinces = [];
		vm.stateOrProvince = '';
		vm.isUS = false;
		vm.postalCode = '';

		$http.get('/json/countries.json').then(function (json) {
			if (json) {
				vm.countries = json.data;
			}
		}, function (err) {
			console.log(err);
			$log.log(err);
			$log.log('Unable to parse JSON for countries.')
		});

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
					resolve([]);
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
					getAllStatesByCountryCode(vm.country.code, json.data).then(function (results) {
						vm.statesAndProvinces = results;
						console.log(vm.statesAndProvinces);
					});
				}
			}, function (err) {
				console.log(err);
				$log.log(err);
				$log.log('Unable to parse JSON for countries.')
			});
		}

		vm.verifyLocation = function (form) {
			if (vm.isAmerica() && vm.postalCode && vm.postalCode.match(/^[0-9]{5}$/)) {
				return LocationFactory.getCoordinates('US', null, null, vm.postalCode).then(function (results) {
					console.log(results);
					if (!results) {
						vm.page = 2;
						$mdToast.show(
							$mdToast.simple()
							.textContent('Something appears to be wrong. Please try again later.')
							.action('OK')
							.highlightAction(true)
							.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
							.parent(document.querySelectorAll('#app-container'))
							.position('bottom right'));
					} else if (!results.candidates || results.candidates.length == 0) {
						vm.page = 2;
						$mdToast.show(
							$mdToast.simple()
							.textContent('We couldn\'t find a location that matched the one you gave us.')
							.action('OK')
							.highlightAction(true)
							.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
							.parent(document.querySelectorAll('#app-container'))
							.position('bottom right'));
					} else {
						vm.locationCandidates = results.candidates;
						vm.locationCandidate = vm.locationCandidates[0];
						form2 = form;
						vm.page = 3;
						console.log(vm.locationCandidate);
					}
				});
			} else {
				return LocationFactory.getCoordinates(vm.country.code, vm.city, vm.stateOrProvince, null).then(function (results) {
					if (!results) {
						vm.page = 2;
						$mdToast.show(
							$mdToast.simple()
							.textContent('Something appears to be wrong. Please try again later.')
							.action('OK')
							.highlightAction(true)
							.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
							.parent(document.querySelectorAll('#app-container'))
							.position('bottom right'));
					} else if (!results.candidates || results.candidates.length == 0) {
						vm.page = 2;
						$mdToast.show(
							$mdToast.simple()
							.textContent('We couldn\'t find a location that matched the one you gave us.')
							.action('OK')
							.highlightAction(true)
							.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
							.parent(document.querySelectorAll('#app-container'))
							.position('bottom right'));
					} else {
						vm.locationCandidates = results.candidates;
						vm.locationCandidate = vm.locationCandidates[0];
						form2 = form;
						vm.page = 3;
						console.log(vm.locationCandidate);
					}
				});
			}
		}

		/** ---------------------------------------------- Third page -------------------------------------------------- **/

		vm.interests = [];
		$scope.buttonDisabled = false;

		vm.save = function (form) {
			console.log(form);
			if (vm.bio && vm.bio.length > 75) {
				form.biography.$setValidity('required', true);
				$log.log('Saving...');
				$scope.buttonDisabled = true;
				showDialog(true);
				authService.getID().then(function (userID) {
					console.log(vm.interests);
					ProfileFactory.getApiToken().then(function success(token) {
						var profile = {
							uid: userID,
							username: vm.name,
							email: vm.user.email,
							brand: vm.brand,
							profession: vm.profession,
							DOB: vm.DOB,
							country: vm.country,
							state: vm.stateOrProvince.name,
							city: vm.city,
							postalcode: vm.postalCode,
							coordinates: [vm.locationCandidate.location.x, vm.locationCandidate.location.y],
							biography: vm.bio.toString(),
							interests: vm.interests,
							headline: vm.headline
						};

						$log.log(profile);
						ProfileFactory.registerBasicProfile(profile, token).then(function (result) {
							if (result && result.status == '200') {
								console.log(result.data);
								$scope.isSaving = false;
								$state.go('home.main', {
									UserProfile: result.data.profile
								});
							} else {
								$mdToast.show(
									$mdToast.simple()
									.textContent('Unable to register your account. Please try again later.')
									.action('OK')
									.highlightAction(true)
									.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
									.parent(document.querySelectorAll('#app-container'))
									.position('bottom right'));
							}
						}, function (err) {
							$log.error('Unable to register profile');
							$mdToast.show(
								$mdToast.simple()
								.textContent('Unable to register your account. Please try again later.')
								.action('OK')
								.highlightAction(true)
								.highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
								.parent(document.querySelectorAll('#app-container'))
								.position('bottom right'));
						});
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
				}, function (err) {
					$log.error('Unable to retrieve user ID!');
					$scope.isSaving = false;
					$timeout(function () {
						$scope.buttonDisabled = false;
					}, 5000);
				});
			} else {
				form.biography.$setValidity('required', false);
			}
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
