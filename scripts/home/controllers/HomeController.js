(function () {

	'use strict';

	angular
		.module('app')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['authService', 'UserProfile', 'AuthID', 'filePermissions', 'managementProfile', 'ProfileFactory', 'PresenceFactory', 'GeoFactory', '$state', '$mdSidenav', '$mdToast', '$log'];

	function HomeController(authService, UserProfile, AuthID, filePermissions, managementProfile, ProfileFactory, PresenceFactory, GeoFactory, $state, $mdSidenav, $mdToast, $log) {
		var vm = this;
		vm.auth = authService;
		vm.user = UserProfile;
		if (vm.auth.isAuthenticated()) {
			$state.go('home.main.index');
		}

		//if (vm.user) {
		/*ProfileFactory.getApiToken().then(function (token) {
			PresenceFactory.setOnline(AuthID).then(function (authIDArray) {
				console.log(authIDArray);
				ProfileFactory.getUsers(authIDArray, vm.user.location, token).then(function (result) {
					console.log(result);
				}, function (err) {
					console.log(err);
				})
			}, function (err) {
				console.log(err);
			});
			GeoFactory.findUsers(vm.user.location, 100, 0, token).then(function (results) {
				console.log(results);
			}, function (err) {
				console.log(err);
			});
		}, function (err) {
			$log.error('Unable to retrieve API token.');
		});*/

		ProfileFactory.getApiToken().then(function (token) {
				ProfileFactory.getCurrentThumbnail(vm.user._id, token).then(function (result) {
					if (result.thumbnail && angular.isArray(result.thumbnail) && result.thumbnail.length > 0) {
						vm.picture = result.thumbnail[0].url + '?policy=' + filePermissions.policy + '&signature=' + filePermissions.signature;
						console.log(vm.picture);
					}
					vm.currentPreviewVisible = true;
				}, function (err) {
					vm.loadedFile = [{
						url: '../images/icons/blank_user.svg',
						mimetype: 'image/svg'
					}];
					if (err.status && err.status == 404) {
						$log.log('No thumbnail found.');
						vm.picture = managementProfile.picture;
						console.log(vm.picture);
					} else {
						$log.error('Unable to retrieve your current thumbnail.');
						$mdToast.show(
							$mdToast.simple()
							.textContent('Unable to retrieve your current thumbnail.')
							.theme('error-toast')
							.hideDelay(3000)
							.position('top right')
						);
						vm.picture = managementProfile.picture;
						console.log(vm.picture);
					}
				});
			},
			function (err) {
				$log.error('Unable to retrieve API token.');
			});

		vm.username = vm.user.username;
		vm.role = managementProfile.app_metadata.role[0];
		vm.DOB = new Date(vm.user.DOB);
		vm.profession = vm.user.profession;
		vm.brand = vm.user.brand;
		vm.location = vm.user.city;
		vm.bio = vm.user.biography;
		/*} else {
			authService.getID().then(function (userID) {
				ProfileFactory.getApiToken().then(function success(token) {
					ProfileFactory.getProfile(userID, token).then(function (profile) {
						console.log(profile);
						vm.user = profile.data;
						PresenceFactory.setOnline(vm.user.uid, vm.user._id, token).then(function (authIDArray) {
							console.log(authIDArray);
							ProfileFactory.getUsers(authIDArray, vm.user.location, token).then(function (result) {
								console.log(result);
							}, function (err) {
								console.log(err);
							})
						}, function (err) {
							console.log(err);
						});
						GeoFactory.findUsers(vm.user.location, 100, 0, token).then(function (results) {
							console.log(results);
						}, function (err) {
							console.log(err);
						});
						ProfileFactory.getApiToken().then(function (token) {
								ProfileFactory.getCurrentThumbnail(vm.user._id, token).then(function (result) {
									if (result.thumbnail && angular.isArray(result.thumbnail) && result.thumbnail.length > 0) {
										vm.picture = result.thumbnail[0].url + '?policy=' + filePermissions.policy + '&signature=' + filePermissions.signature;
										console.log(vm.picture);
									}
									vm.currentPreviewVisible = true;
								}, function (err) {
									vm.loadedFile = [{
										url: '../images/icons/blank_user.svg',
										mimetype: 'image/svg'
									}];
									if (err.status && err.status == 404) {
										$log.log('No thumbnail found.');
										vm.picture = managementProfile.picture;
										console.log(vm.picture);
									} else {
										$log.error('Unable to retrieve your current thumbnail.');
										$mdToast.show(
											$mdToast.simple()
											.textContent('Unable to retrieve your current thumbnail.')
											.theme('error-toast')
											.hideDelay(3000)
											.position('top right')
										);
										vm.picture = managementProfile.picture;
										console.log(vm.picture);
									}
								});
							},
							function (err) {
								$log.error('Unable to retrieve API token.');
							});

						vm.username = vm.user.username;
						vm.role = (managementProfile ? managementProfile.app_metadata.role[0] : null);
						vm.DOB = new Date(vm.user.DOB);
						vm.profession = vm.user.profession;
						vm.brand = vm.user.brand;
						vm.location = vm.user.city;
						vm.bio = vm.user.biography;
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
		}*/

		vm.toggleProfileSidebar = buildToggler('right');
		vm.isProfileSidebarOpen = function () {
			return $mdSidenav('right').isOpen();
		};

		function buildToggler(navID) {
			return function () {
				// Component lookup should always be available since we are not using `ng-if`
				$mdSidenav(navID)
					.toggle()
					.then(function () {
						$log.debug("toggle " + navID + " is done");
					});
			};
		}

		vm.close = function () {
			// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav('right').close()
				.then(function () {
					$log.debug("close RIGHT is done");
				});
		};

		vm.editProfile = function () {
			$state.go('home.edit-profile.photos');
		}

		vm.logout = function () {
			vm.auth.logout();
		}

		console.log('Welcome Home!');
	}
})();
