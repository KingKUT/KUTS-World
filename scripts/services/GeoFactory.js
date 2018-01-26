(function () {

	'use strict';

	angular
		.module('app')
		.factory('GeoFactory', GeoFactory);

	GeoFactory.$inject = ['authService', 'ProfileFactory', '$http', '$log'];

	function GeoFactory(authService, ProfileFactory, $http, $log) {

		var findUsersByDistance = function (location, proximity, apiToken) {
			if (authService.isAuthenticated()) {
				console.log("Requesting last online users near me...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/member-api/find-users-near-me-by-distance', {
					params: {
						location: location,
						proximity: proximity,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}, function error(response) {
					// this function will be called when the request returned error status
					$log.error("Failed to get users near you...");
					return null;
				});
			} else {
				authService.login();
			}
		}

		var findUsers = function (location, limit, offset, apiToken) {
			if (authService.isAuthenticated()) {
				console.log("Requesting users near me...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/member-api/find-users', {
					params: {
						location: location,
						limit: limit,
						offset: offset,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}, function error(response) {
					// this function will be called when the request returned error status
					$log.error("Failed to get users near you....");
					return null;
				});

			} else {
				authService.login();
			}
		}

		return {
			findUsersByDistance: findUsersByDistance,
			findUsers: findUsers
		}
	}
})();
