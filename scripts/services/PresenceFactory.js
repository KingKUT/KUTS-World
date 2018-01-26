(function () {

	'use strict';

	angular
		.module('app')
		.factory('PresenceFactory', PresenceFactory);

	PresenceFactory.$inject = ['$http', 'firebase', '$firebaseObject', '$firebaseArray', '$q', '$log'];

	function PresenceFactory($http, firebase, $firebaseObject, $firebaseArray, $q, $log) {

		var usersRef = firebase.database().ref('/presence');
		var connectedRef = firebase.database().ref('.info/connected');

		var setOnline = function (authID) {
			return $q(function (resolve, reject) {
				var connected = $firebaseObject(connectedRef);
				var online = $firebaseArray(usersRef.child(authID));

				connected.$watch(function () {
					if (connected.$value === true) {
						online.$add(true).then(function (connectedRef) {
							connectedRef.onDisconnect().remove();
						});
					}
				});
				return $firebaseArray(usersRef).$loaded()
					.then(function (authIDs) {
						resolve(authIDs);
					})
					.catch(function (error) {
						console.log("Error:", error);
						reject(null);
					});
			});
		}

		var getOnlineUserAuthIDs = function () {
			var onlineUserIDs = $firebaseArray(usersRef);
			return onlineUserIDs.$loaded()
				.then(function (authIDs) {
					return authIDs;
				})
				.catch(function (error) {
					console.log("Error:", error);
					return null;
				});
		}


		/**return $http({ // Performed if there is no cached api token.
			url: '/set-last-online',
			method: 'PATCH',
			data: {
				object_id: objectID,
				apiToken: apiToken
			}
		}).then(function success(response) {
			return response;
		}, function error(response) {
			// this function will be called when the request returned error status
			$log.log('Unable to set last online.');
			return null;
		});*/

		var setOffline = function (authID) {
			return $q(function (resolve, reject) {
				firebase.database().ref('/presence/' + authID).remove()
					.then(function () {
						console.log('user removed from firebase');
						resolve();
					}).catch(function (err) {
						console.log('user NOT removed from firebase');
						console.log(err)
						reject(err);
					});
			});
		}

		return {
			setOnline: setOnline,
			getOnlineUserAuthIDs: getOnlineUserAuthIDs,
			setOffline: setOffline
				//registerBasicProfile: registerBasicProfile
		};
	}
})();
