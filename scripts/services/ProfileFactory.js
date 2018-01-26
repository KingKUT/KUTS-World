(function () {

	'use strict';

	angular
		.module('app')
		.factory('ProfileFactory', ProfileFactory);

	ProfileFactory.$inject = ['authService', '$http', '$q', '$log'];

	function ProfileFactory(authService, $http, $q, $log) {


		var getProfile = function (UID, apiToken) {
			return $q(function (resolve, reject) {
				console.log("Requesting profile...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/member-api/get-profile', {
					params: {
						UID: UID,
						apiToken: apiToken
					}
				}).then(function success(response) {
					resolve(response.data);
				}, function error(response) {
					$log.error("Failed to get profile....");
					reject(response);
				});
			});
		}

		var getUsers = function (authIDArray, location, apiToken) {
				console.log("Requesting online users...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/get-users', {
					params: {
						authIDArray: authIDArray,
						location: location,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}, function error(response) {
					// this function will be called when the request returned error status
					$log.error("Failed to get online users....");
					return "Failed to get online users....";
				});
		}

		var getCurrentThumbnail = function (objectID, apiToken) {
				console.log("Requesting thumbnail...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/get-thumbnail', {
					params: {
						object_id: objectID,
						apiToken: apiToken

					}
				}).then(function success(response) {
					return response.data;
				}).catch(function (error) {
					// this function will be called when the request returned error status
					return $q.reject(error);
				});
		}

		var getCurrentBanner = function (objectID, apiToken) {
				console.log("Requesting banner...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/get-banner', {
					params: {
						object_id: objectID,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}).catch(function (error) {
					// this function will be called when the request returned error status
					return $q.reject(error);
				});
		}

		var getAlbums = function (objectID, apiToken) {
				console.log("Requesting albums...");
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/get-all-albums', {
					params: {
						object_id: objectID,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}).catch(function (error) {
					// this function will be called when the request returned error status
					return $q.reject(error);
				});
		}

		var getMedia = function (albumID, apiToken) {
				$http.defaults.headers.common['Content-Type'] = 'application/json';
				return $http.get('/get-media-from-album', {
					params: {
						album_id: albumID,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response.data;
				}).catch(function (error) {
					// this function will be called when the request returned error status
					return $q.reject(error);
				});
		}
		
		var setLastOnline = function (authID, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/set-last-online',
					method: 'PATCH',
					data: {
						authID: authID,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(response);
				});
		}

		var updateBasicInfo = function (objectID, params, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/update-basic-info',
					method: 'PATCH',
					data: {
						object_id: objectID,
						params: params,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(response);
				});
		}

		var updateLocationInfo = function (objectID, params, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/update-location-info',
					method: 'PATCH',
					data: {
						object_id: objectID,
						params: params,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(response);
				});
		}

		var updatePersonalInfo = function (objectID, params, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/update-personal-info',
					method: 'PATCH',
					data: {
						object_id: objectID,
						params: params,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(response);
				});
		}


		var updateThumbnail = function (objectID, filestackFile, googleFile, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/update-thumbnail',
					method: 'PATCH',
					data: {
						object_id: objectID,
						filestack_file: filestackFile,
						google_storage_file: googleFile,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(response);
				});
		}

		var updateBanner = function (objectID, bannerFile, apiToken) {
				$log.log('Saving...');
				return $http({
					url: '/update-banner',
					method: 'PATCH',
					data: {
						object_id: objectID,
						filestack_file: filestackFile,
						google_storage_file: googleFile,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					return $q.reject(repsonse);
				});
		}

		var addThumbnailToAlbum = function (UID, filestackFile, googleFile, apiToken) {
				$log.log('Adding Thumbnail to album...');
				return $http({
					url: '/add-thumbnail-to-album',
					method: 'POST',
					data: {
						uid: UID,
						filestack_file: filestackFile,
						google_storage_file: googleFile,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					console.log('Unable to add the thumbnail to your album.');
					return null;
				});
		}

		var addBannerToAlbum = function (UID, bannerFile, apiToken) {
				$log.log('Adding Banner to album...');
				return $http({
					url: '/add-banner-to-album',
					method: 'POST',
					data: {
						uid: UID,
						banner_file: bannerFile,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					console.log('Unable to add the banner to your album.');
					return null;
				});
		}

		var registerBasicProfile = function (profile, apiToken) {
				$log.log('Saving...');
				return $http({ // Performed if there is no cached api token.
					url: '/register-basic-profile',
					method: 'POST',
					data: {
						profile: profile,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					// this function will be called when the request returned error status
					console.log('Unable to register profile.');
					return null;
				});
		}

		var saveInterests = function (objectID, interests, apiToken) {
				$log.log('Saving interests...');
				return $http({
					url: '/save-interests',
					method: 'POST',
					data: {
						object_id: objectID,
						interests: interests,
						apiToken: apiToken
					}
				}).then(function success(response) {
					return response;
				}, function error(response) {
					// this function will be called when the request returned error status
					console.log('Unable to retrieve token.');
					return null;
				});
		}

		var getApiToken = function () {
			if (!authService.hasValidApiToken()) { // If there is no valid management API token cached.
				console.log("Retrieving  new KUTZ API token...");
				return $http({ // Performed if there is no cached api token.
					url: '/get-api-token',
					method: 'POST'
				}).then(function success(response) {
					var apiToken = response.data.access_token;
					console.log("This is the requested member API token:\n" + apiToken);
					localStorage.setItem('kutz_member_api_token', response.data.access_token);
					localStorage.setItem('kutz_member_api_token_expires_at', (response.data.expires_in * 1000) + new Date().getTime());
					return apiToken;
				}, function error(response) {
					// this function will be called when the request returned error status
					console.log('Unable to retrieve member api token');
					return null;
				});
			} else {
				console.log("Returning cached MEMBER API token.");
				return $q(function (resolve, reject) {
					resolve(localStorage.getItem('kutz_member_api_token'));
				});
			}
		};

		var getManagementToken = function () {
			if (!authService.hasValidMgmtToken()) { // If there is no valid management API token cached.
				console.log("Requesting new MANAGEMENT API token.");
				return $http({
					url: '/get-managementAPI-token',
					method: 'POST'
				}).then(function success(response) {
					// this function will be called when the request is success
					var mgmtToken = response.data.access_token;
					console.log("This is the requested management API token:\n" + mgmtToken);
					localStorage.setItem('kutz_management_api_token', mgmtToken);
					localStorage.setItem('kutz_management_api_token_expires_at',
						(response.data.expires_in * 1000) + new Date().getTime());
					return mgmtToken;
				}, function error(response) {
					// this function will be called when the request returned error status
					$log.error("Failed to get management API token!");
					console.log(JSON.stringify(response));
					return null;
				});
			} else {
				console.log("Returning cached management API token.");
				return $q(function (resolve, reject) {
					resolve(localStorage.getItem('kutz_management_api_token'));
				});
			}
		};

		var getManagementProfile = function (managementAPIToken, userID) {
			console.log("Requesting new management profile...");
			$http.defaults.headers.common['Authorization'] = 'Bearer ' + managementAPIToken;
			return $http({
				url: 'https://kuts-world.auth0.com/api/v2/users/' + userID,
				method: 'GET'
			}).then(function success(response) {
				// this function will be called when the request is success
				//console.log(JSON.stringify(response.data));
				console.log("Successfully retrieved user profile!\n");
				console.log('Managment profile is:\n');
				console.log(response.data);
				return response.data;
			}, function error(err) {
				// this function will be called when the request returned error status
				$log.error("Failed to retrieve all team members....");
				return null;
			});
		}

		return {
			getProfile: getProfile,
			getUsers: getUsers,
			getCurrentThumbnail: getCurrentThumbnail,
			getCurrentBanner: getCurrentBanner,
			getAlbums: getAlbums,
			getMedia: getMedia,
			setLastOnline: setLastOnline,
			updateBasicInfo: updateBasicInfo,
			updateLocationInfo: updateLocationInfo,
			updatePersonalInfo: updatePersonalInfo,
			updateThumbnail: updateThumbnail,
			updateBanner: updateBanner,
			addThumbnailToAlbum: addThumbnailToAlbum,
			addBannerToAlbum: addBannerToAlbum,
			registerBasicProfile: registerBasicProfile,
			saveInterests: saveInterests,
			getApiToken: getApiToken,
			getManagementToken: getManagementToken,
			getManagementProfile: getManagementProfile
				/*setNickname: setNickname,
				checkNicknameAvailability: checkNicknameAvailability,
				setGravatar: setGravatar*/
		};
	}
})();
