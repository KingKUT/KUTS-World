(function () {

	'use strict';

	angular
		.module('app', ['auth0.auth0', 'ui.router', 'ngAnimate', 'ngAria', 'ngCookies', 'ngMessages', 'ngResource', 'ngSanitize', 'ngMaterial', 'firebase', 'angular-filepicker', 'froala', 'angularCroppie'])
		.config(config).constant('FirebaseUrl', 'https://kuts-world.firebaseio.com/');;

	config.$inject = [
		'$stateProvider',
		'$locationProvider',
		'$urlRouterProvider',
		'$resourceProvider',
		'$mdThemingProvider',
		'$sceDelegateProvider',
		'angularAuth0Provider',
		'filepickerProvider'
	];

	function config(
		$stateProvider,
		$locationProvider,
		$urlRouterProvider,
		$resourceProvider,
		$mdThemingProvider,
		$sceDelegateProvider,
		angularAuth0Provider,
		filepickerProvider
	) {

		$stateProvider
			.state('home', {
				abstract: true,
				resolve: {
					AuthID: function (authService) {
						if (authService.isAuthenticated()) {
							return authService.getID().then(function (authID) {
								console.log("AuthID:", authID);
								return authID;
							}, function (err) {
								console.log("Unable to retrieve auth ID.");
								return null;
							})
						} else {
							authService.login();
						}
					},
					UserProfile: function (authService, AuthID, ProfileFactory, $http, $state) {
						console.log('passing through abstract state...');
						return ProfileFactory.getApiToken().then(function success(token) {
							return ProfileFactory.getProfile(AuthID, token).then(function (result) {
								console.log('apiToken:', token);
								console.log('profile:', result);
								return result;
							}, function (err) {
								if (err.status == 500) {
									// send an error page
								} else if (err.status == 404) {
									console.log('No profile available. User needs to sign up.')
									$state.go('home.register');
								}
								return null;
							});
						}, function error(response) {
							// this function will be called when the request returned error status
							console.log('Unable to retrieve member api token');
							return null;
						});
					},
					managementProfile: function (authService, AuthID, ProfileFactory, $http, $state) {
						return ProfileFactory.getManagementToken().then(function (mgmtToken) {
							return ProfileFactory.getManagementProfile(mgmtToken, AuthID).then(function (mgmtProfile) {
								console.log('mgmtToken:', mgmtToken);
								console.log('mgmtProfile:', mgmtProfile);
								return mgmtProfile;
							}, function (err) {
								console.log('Unable to retrieve member management profile');
								return null;
							});
						}, function (err) {
							console.log('Unable to retrieve member management api token');
							return null;
						});
					},
					filePermissions: function (authService, SecurityFactory, $http) {
						console.log('Retrieving permissions....');
						return $http({
							url: '/policy',
							method: 'GET'
						}).then(function success(response) {
							// this function will be called when the request is successful
							var policy = response.data.policy;
							var signature = response.data.signature;
							console.log(policy);
							console.log(signature);
							SecurityFactory.setSecurity(policy, signature);
							return {
								policy,
								signature
							};
						});
					}
				}
			})
			.state('home.main', {
				url: '/',
				templateUrl: 'scripts/home/views/home.html',
				controller: 'HomeController',
				controllerAs: 'vm',
				resolve: {
					UserProfile: function (UserProfile, authService, AuthID, ProfileFactory, $http, $state) {
						if (UserProfile) {
							return UserProfile;
						} else {
							return ProfileFactory.getApiToken().then(function success(token) {
								return ProfileFactory.getProfile(AuthID, token).then(function (result) {
									console.log('apiToken:', token);
									console.log('profile:', result);
									return result;
								}, function (err) {
									if (err.status == 500) {
										// send an error page
									} else if (err.status == 404) {
										console.log('No profile available. User needs to sign up.')
										$state.go('home.register');
									}
									return null;
								});
							}, function error(response) {
								// this function will be called when the request returned error status
								console.log('Unable to retrieve member api token');
								return null;
							});
						}
					},
					AuthID: function (AuthID, authService) {
						if (authService.isAuthenticated()) {
							if (AuthID) {
								return AuthID;
							} else {
								return authService.getID().then(function (authID) {
									console.log("AuthID:", authID);
									return authID;
								}, function (err) {
									console.log("Unable to retrieve auth ID.");
									return null;
								})
							}
						} else {
							authService.login();
						}
					},
					firebaseUser: function (authService, UserProfile) {
						return authService.getFirebaseToken(UserProfile.uid).then(function (firebaseToken) {
							console.log(UserProfile);
							return authService.loginFirebase(firebaseToken)
								.then(function (firebaseUser) {
									console.log(firebaseUser)
									return firebaseUser;
								}, function (err) {
									console.log("Unable to to initialize chat and online presence service.");
									return null;
								});
						}, function (err) {
							console.log(err);
							return null;
						});
					},
				}
			})
			.state('home.main.index', {
				url: 'members',
				views: {
					'': {
						templateUrl: 'scripts/home/views/members/views/members.html',
						controllerAs: 'vm',
						controller: function ($scope) {
							console.log("Inside home.main.index");
							$scope.$parent.selectedNavIndex = "index";
						}
					},
					'header@home.main.index': {
						templateUrl: 'scripts/home/views/members/views/home-members-preview.html',
						controllerAs: 'vm',
						controller: function (authService, UserProfile, AuthID, filePermissions, managementProfile, ProfileFactory, PresenceFactory, SecurityFactory, GeoFactory, $scope, $state) {
							var vm = this;
							$scope.unknownFile = {
								url: '../images/icons/blank_user.svg',
								mimetype: 'image/svg'
							};

							var makeURL = function (thumbnail, policy, signature) {
								var location = '';
								if (thumbnail) {
									location = thumbnail.url + '?policy=' + policy + '&signature=' + signature;
								} else {
									location = '../images/icons/blank_user.svg';
								}
								console.log(location);
								return location;
							}
							var security = SecurityFactory.getSecurity();
							ProfileFactory.getApiToken().then(function (token) {
								PresenceFactory.setOnline(AuthID).then(function (authIDArray) {
									console.log(authIDArray);
									ProfileFactory.getUsers(authIDArray, UserProfile.location, token).then(function (result) {
										console.log(result);
										vm.members = result.members;
									}, function (err) {
										console.log(err);
									});
								}, function (err) {
									console.log(err);
								});
								GeoFactory.findUsers(UserProfile.location, 100, 0, token).then(function (results) {
									console.log(results);
								}, function (err) {
									console.log(err);
								});
							}, function (err) {
								$log.error('Unable to retrieve API token.');
							});
							var rand = 1;
							$scope.initRand = function () {
								rand = Math.floor((Math.random() * 2) + 1)
							}

							$scope.getRandomSpan = function () {
								return rand;
							}
						}
					}
				}
			})
			.state('home.register', {
				url: '/register',
				controller: 'RegisterController',
				templateUrl: 'scripts/register/views/register.html',
				controllerAs: 'vm'
			})
			.state('home.choose-interests', {
				url: '/interests',
				controller: 'InterestController',
				templateUrl: 'scripts/interests/views/interests.html',
				controllerAs: 'vm'
			})
			.state('home.suggested-connections', {
				url: '/suggested-connections',
				controller: 'ConnectionController',
				templateUrl: 'scripts/connections/views/connections.html',
				controllerAs: 'vm'
			})
			.state('home.profile', {
				url: '/profile',
				controller: 'ProfileController',
				templateUrl: 'scripts/profile/views/profile.html',
				controllerAs: 'vm',
			})
			.state('home.edit-profile', {
				url: '/edit/profile',
				abstract: true,
				templateUrl: 'scripts/edit-profile/views/edit-profile.html',
			})
			.state('home.edit-profile.photos', {
				url: '/photos',
				views: {
					'': {
						templateUrl: 'scripts/edit-profile/views/edit-profile-photos.html',
						controller: 'EditPhotoController',
						controllerAs: 'vm'
					},
					'thumbnail@home.edit-profile.photos': {
						templateUrl: 'scripts/edit-profile/views/edit-thumbnail.html',
						controller: 'EditThumbnailController',
						controllerAs: 'vm'
					},
					'banner@home.edit-profile.photos': {
						templateUrl: 'scripts/edit-profile/views/edit-banner.html',
						controller: 'EditBannerController',
						controllerAs: 'vm'
					},
					'gallery@home.edit-profile.photos': {
						//templateUrl: 'scripts/edit-profile/views/edit-albums.html',
						templateUrl: 'scripts/edit-profile/views/edit-gallery.html',
						controller: 'EditGalleryController',
						controllerAs: 'vm'
					}
				}
			})
			.state('home.edit-profile.basic-info', {
				url: '/basic-info',
				views: {
					'': {
						templateUrl: 'scripts/edit-profile/views/edit-basic-info.html',
						controller: 'EditBasicInfoController',
						controllerAs: 'vm'
					}
				},
				resolve: {
					UserProfile: function (authService, ProfileFactory, $http, $state) {
						console.log('passing through abstract state...');
						return authService.getID().then(function (authID) {
							return ProfileFactory.getApiToken().then(function success(token) {
								return ProfileFactory.getProfile(authID, token).then(function (result) {
									console.log(result);
									return result;
								}, function (err) {
									if (err.status == 500) {
										// send an error page
									} else if (err.status == 404) {
										console.log('No profile available. User needs to sign up.')
										$state.go('home.register');
									}
									return null;
								});
							}, function error(response) {
								// this function will be called when the request returned error status
								console.log('Unable to retrieve member api token');
								return null;
							});
						}, function (err) {
							console.log('Unable to retrieve user ID.'); // IMPORTANT: Do something if ID isn't retrieved!
						});
					}
				}
			})
			.state('home.edit-profile.location-info', {
				url: '/location-info',
				views: {
					'': {
						templateUrl: 'scripts/edit-profile/views/edit-location-info.html',
						controller: 'EditLocationInfoController',
						controllerAs: 'vm'
					}
				},
				resolve: {
					UserProfile: function (authService, ProfileFactory, $http, $state) {
						return authService.getID().then(function (authID) {
							return ProfileFactory.getApiToken().then(function success(token) {
								return ProfileFactory.getProfile(authID, token).then(function (result) {
									console.log(result);
									return result;
								}, function (err) {
									if (err.status == 500) {
										// send an error page
									} else if (err.status == 404) {
										console.log('No profile available. User needs to sign up.')
										$state.go('home.register');
									}
									return null;
								});
							}, function error(response) {
								// this function will be called when the request returned error status
								console.log('Unable to retrieve member api token');
								return null;
							});
						}, function (err) {
							console.log('Unable to retrieve user ID.'); // IMPORTANT: Do something if ID isn't retrieved!
						});
					}
				}
			})
			.state('home.edit-profile.personal-info', {
				url: '/personal-info',
				views: {
					'': {
						templateUrl: 'scripts/edit-profile/views/edit-personal-info.html',
						controller: 'EditPersonalInfoController',
						controllerAs: 'vm'
					}
				},
				resolve: {
					UserProfile: function (authService, ProfileFactory, $http, $state) {
						return authService.getID().then(function (authID) {
							return ProfileFactory.getApiToken().then(function success(token) {
								return ProfileFactory.getProfile(authID, token).then(function (result) {
									console.log(result);
									return result;
								}, function (err) {
									if (err.status == 500) {
										// send an error page
									} else if (err.status == 404) {
										console.log('No profile available. User needs to sign up.')
										$state.go('home.register');
									}
									return null;
								});
							}, function error(response) {
								// this function will be called when the request returned error status
								console.log('Unable to retrieve member api token');
								return null;
							});
						}, function (err) {
							console.log('Unable to retrieve user ID.'); // IMPORTANT: Do something if ID isn't retrieved!
						});
					}
				}
			})
			.state('login', {
				url: '/login',
				controller: 'LoginController',
				templateUrl: 'scripts/login/views/login.html',
				controllerAs: 'vm'
			})
			.state('callback', {
				url: '/callback',
				controller: 'CallbackController',
				templateUrl: 'scripts/callback/views/callback.html',
				controllerAs: 'vm'
			});

		// Initialization for the angular-auth0 library
		angularAuth0Provider.init({
			clientID: 'wvqpcGtLM9NXnvCogzsZb4XJvLqN4ANC',
			domain: 'kuts-world.auth0.com',
			responseType: 'token id_token',
			audience: 'https://kuts-world.auth0.com/userinfo',
			redirectUri: 'http://localhost:9000/callback',
			scope: 'openid'
		});

		filepickerProvider.setKey('AGYHCMfSWaL0r4juoNVNwz');

		var setup = {
			apiKey: "AIzaSyAvt3ZE7ESCwzUSLnHf_jAFl80VPedaKlo",
			authDomain: "kuts-world.firebaseapp.com",
			databaseURL: "https://kuts-world.firebaseio.com",
			projectId: "kuts-world",
			storageBucket: "kuts-world.appspot.com",
			messagingSenderId: "968983547637"
		};
		firebase.initializeApp(setup);

		$urlRouterProvider.otherwise('/');

		$locationProvider.hashPrefix('');

		/// Comment out the line below to run the app
		// without HTML5 mode (will use hashes in routes)
		$locationProvider.html5Mode(true);

		/*$mdThemingProvider.definePalette('KutzRed', {
			'50': '#FFEBEE',
			'100': 'FFCDD2',
			'200': 'EF9A9A',
			'300': 'E57373',
			'400': 'EF5350',
			'500': 'F44336',
			'600': 'E53935',
			'700': 'D32F2F',
			'800': 'C62828',
			'900': 'B71C1C',
			'A100': 'FF8A80',
			'A200': 'FF5252',
			'A400': 'FF1744',
			'A700': 'D50000',
			'contrastDefaultColor': 'light', // whether, by default, text (contrast)
			// on this palette should be dark or light

			'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
				'200', '300', '400', 'A100'
			],
			'contrastLightColors': undefined // could also specify this if default was 'dark'
		});

		$mdThemingProvider.definePalette('KutzOrange', {
			'50': 'FFF3E0',
			'100': 'FFE0B2',
			'200': 'FFCC80',
			'300': 'FFB74D',
			'400': 'FFA726',
			'500': 'FF9800',
			'600': 'FB8C00',
			'700': 'F57C00',
			'800': 'EF6C00',
			'900': 'E65100',
			'A100': 'FFD180',
			'A200': 'FFAB40',
			'A400': 'FF9100',
			'A700': 'FF6D00',
			'contrastDefaultColor': 'light', // whether, by default, text (contrast)
			// on this palette should be dark or light

			'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
				'200', '300', '400', 'A100'
			],
			'contrastLightColors': undefined // could also specify this if default was 'dark'
		});

		$mdThemingProvider.theme('default')
			.accentPalette('KutzOrange', {
				'default': 'A200'
			});*/


		$mdThemingProvider.theme('default')
			.primaryPalette('red', {
				'default': '400',
				'hue-1': '100',
				'hue-2': '600',
				'hue-3': 'A100'
			}).dark();
		$mdThemingProvider.theme('default')
			.accentPalette('purple', {
				'default': '400', // use shade 200 for default, and keep all other shades the same
				'hue-1': '100',
				'hue-2': '600',
				'hue-3': 'A100'
			}).dark();
		$mdThemingProvider.theme('default')
			.backgroundPalette('grey', {
				'default': '100'
			});

		$mdThemingProvider.enableBrowserColor({
			theme: 'default', // Default is 'default'
			palette: 'accent', // Default is 'primary', any basic material palette and extended palettes are available
			hue: 'A100' // Default is '800'
		});


		$sceDelegateProvider.resourceUrlWhitelist([
			// Allow same origin resource loads.
			'self',
			// Allow loading from our assets domain.  Notice the difference between * and **.
			'http://gd.geobytes.com/**',
			'http://geocode.arcgis.com/arcgis/rest/**'
		]);
	}

})();
