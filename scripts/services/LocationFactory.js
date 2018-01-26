(function () {

	'use strict';

	angular
		.module('app')
		.factory('LocationFactory', LocationFactory);

	LocationFactory.$inject = ['authService', '$http', '$q', '$log'];

	function LocationFactory(authService, $http, $q, $log) {


		var getCoordinates = function (countryCode, city, stateOrProvince, postalCode) {
			if (authService.isAuthenticated()) {
				console.log("verifying location...");
				var location = [];

				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http({
					url: 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates',
					method: 'GET',
					params: {
						countryCode: countryCode,
						city: city,
						region: stateOrProvince,
						postal: postalCode,
						f: 'json'
					},
					headers: {
						'Authorization': undefined
					},
					paramSerializer: '$httpParamSerializerJQLike' /*,
					transformRequest: function (data, headersGetter) {
						var headers = headersGetter();
						console.log(headers);
						delete headers['Authorization'];
						console.log(headers);
						return headers;
					} */
				}).then(function success(response) {
					return response.data;
				}, function error(response) {
					// this function will be called when the request returned error status
					$log.error("Failed to get geocoded result...");
					return null;
				});
			} else {
				authService.login();
			}
		}

		return {
			getCoordinates: getCoordinates
		};
	}
})();
