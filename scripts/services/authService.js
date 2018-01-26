(function () {

	'use strict';

	angular
		.module('app')
		.service('authService', authService);

	authService.$inject = ['PresenceFactory', '$state', 'angularAuth0', 'firebase', '$firebaseAuth', '$q', '$http', '$timeout', '$log'];

	function authService(PresenceFactory, $state, angularAuth0, firebase, $firebaseAuth, $q, $http, $timeout, $log) {

		var userID;
		var accessToken = {};
		var idToken = {};

		var login = function () {
			angularAuth0.authorize();
		}

		var handleAuthentication = function () {
			angularAuth0.parseHash(function (err, authResult) {
				if (authResult && authResult.accessToken && authResult.idToken) {
					accessToken = authResult.accessToken;
					idToken = authResult.idToken;
					setSession(authResult);
					$state.go('home.main.index');
				} else if (err) {
					$log.log('authService[handleAuthentication]: No token, or an invalid token provided');
					console.log(err);
					$timeout(function () {
						$state.go('login');
					});
				}
			});
		}

		function setSession(authResult) {
			// Set the time that the access token will expire at
			let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
			localStorage.setItem('kutz_member_access_token', authResult.accessToken);
			localStorage.setItem('kutz_member_id_token', authResult.idToken);
			localStorage.setItem('kutz_member_access_token_expires_at', expiresAt);
		}

		var getID = function () {
			return $q(function (resolve, reject) {
				if (!userID && !localStorage.getItem('kutz_member_ID')) {
					console.log('Retrieving new user ID...');
					angularAuth0.client.userInfo(localStorage.getItem('kutz_member_access_token'), function (err, info) {
						if (info) {
							console.log('The user\'s ID is ' + info.sub);
							userID = info.sub;
							localStorage.setItem('kutz_member_ID', userID);
							resolve(userID);
						} else {
							console.log(err);
							reject("Error: unable to get user ID.");
						}
					});
				} else {
					console.log('Retrieving cached user ID.')
					var cachedID = userID || localStorage.getItem('kutz_member_ID');
					resolve(cachedID);
				}
			});
		}

		var logout = function () {
			// Remove tokens and expiry time from localStorage
			/*getApiToken().then(function (token) {
				getID().then(function (ID) {
					PresenceFactory.setOffline(ID, token).then(function (result) {
						$log.log('User marked as offline.');
						deleteCache();
					}, function (err) {
						$log.error('Unable to mark user as offline...');
					});
				}, function (err) {
					$log.error('Unable to get user ID...');
				});
			}, function(err) {
				$log.error('Unable to get API token...');
			})*/

			var Auth = firebase.auth()
			var authData = Auth.currentUser;
			if (authData) { // Order of tasks is important below.
				console.log('Signing out of firebase....');
				getID().then(function (authID) {
					deleteCache();
					PresenceFactory.setOffline(authID).then(function () {
						$log.log('Firebase user presence is offline.')
						Auth.signOut().then(function () {
							$log.log('Firebase user signed out.')
						}).catch(function(err) {
							console.log(err);
						});
					}, function (err) {
						console.log(err);
					})
				}, function (err) {
					console.log('Unable to get')
				})

			}
			$state.go('home.main');
		}

		var isAuthenticated = function () {
			var isValid = false;
			var expiration = localStorage.getItem('kutz_member_access_token_expires_at');
			if (localStorage.getItem('kutz_member_access_token') && expiration) {
				isValid = (new Date().getTime() < expiration);
			}
			return isValid;
		}

		var getApiToken = function () {
			if (!hasValidApiToken()) { // If there is no valid management API token cached.
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

		var getFirebaseToken = function (authID) {
			return $http({
				url: '/authenticate-firebase',
				method: 'POST',
				data: {
					'authID': authID
				},
				async: true
			}).then(function success(response) {
				// this function will be called when the request is success
				console.log("everything ok");
				console.log(JSON.stringify(response));
				localStorage.setItem("firebase_token", response.data);
				return response.data;
			}, function error(response) {
				// this function will be called when the request returned error status
				console.log("entered error");
				console.log(JSON.stringify(response));
				return null;
			});
		}

		var loginFirebase = function (firebaseToken) {
			return firebase.auth().signInWithCustomToken(firebaseToken).then(function (firebaseUser) {
				$log.info("Retrieved firebaseUser: " + JSON.stringify(firebaseUser));
				return firebaseUser;
			}, function (err) {
				$log.warn("Error getting firebaseUser from \'signInWithCustomToken\' in authService.")
			});
		}

		var hasValidApiToken = function () {
			var isValid = false;
			var expiration = localStorage.getItem('kutz_member_api_token_expires_at');
			if (localStorage.getItem('kutz_member_api_token') && expiration) {
				isValid = (new Date().getTime() < expiration);
			}
			return isValid;
		}

		var hasValidMgmtToken = function () {
			var isValid = false;
			var expiration = localStorage.getItem('kutz_management_api_token_expires_at');
			if (localStorage.getItem('kutz_management_api_token') && expiration) {
				isValid = (new Date().getTime() < expiration);
			}
			return isValid;
		}

		function deleteCache() {
			localStorage.removeItem('kutz_member_access_token');
			localStorage.removeItem('kutz_member_id_token');
			localStorage.removeItem('kutz_member_access_token_expires_at');
			localStorage.removeItem('kutz_member_api_token');
			localStorage.removeItem('kutz_member_api_token_expires_at');
			localStorage.removeItem('kutz_management_api_token');
			localStorage.removeItem('kutz_management_api_token_expires_at');
			localStorage.removeItem('kutz_member_ID');
			accessToken = null;
			idToken = null;
			userID = null;
		}

		return {
			login: login,
			handleAuthentication: handleAuthentication,
			getID: getID,
			logout: logout,
			isAuthenticated: isAuthenticated,
			getFirebaseToken: getFirebaseToken,
			loginFirebase: loginFirebase,
			hasValidApiToken: hasValidApiToken,
			hasValidMgmtToken: hasValidMgmtToken
		}
	}
})();
