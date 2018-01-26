(function () {

	'use strict';

	angular
		.module('app')
		.run(run);

	run.$inject = ['authService', 'ProfileFactory', 'firebase', '$rootScope'];

	function run(authService, ProfileFactory, firebase, $rootScope) {
		// Handle the authentication
		// result in the hash
		authService.handleAuthentication();

		firebase.auth().onAuthStateChanged(function (user) {
			if (user) {
				console.log("onAuthStateChanged in app.run called! A user is currently signed!"); // User is signed in.
				ProfileFactory.getApiToken().then(function success(token) {
					authService.getID().then(function (authID) {
						ProfileFactory.setLastOnline(authID, token).then(function (result) {
							console.log(result.data.message);
						}, function (err) {
							console.log(err);
						});
					}, function (err) {
						console.log(err);
					});
				}, function (err) {
					console.log(err);
				});
			} else {
				// No user is signed in.
				console.log("onAuthStateChanged in app.run called. No user signed in to firebase...."); // User is not signed in.
				if (authService.isAuthenticated()) {
					authService.getID().then(function (authID) {
						console.log(authID);
						authService.getFirebaseToken(authID).then(function (firebaseToken) {
							authService.loginFirebase(firebaseToken).then(function (firebaseUser) {
								authService.firebaseUser = firebaseUser;
								console.log("Logged in user is " + vm.firebaseUser);
							}, function (err) {
								$log.warn("Error reauthenticating firebaseUser from \'loginFirebase\' in app.run")
								authService.logout();
							});
						}, function (err) {
							console.log(err);
							authService.logout();
						});
					}, function (err) {
						console.log(err);
						authService.logout();
					});
				} else {
					console.log('User logged out and is unauthorized to be reauthenticated to firebase.');
				}
			}
		});

		$rootScope.$on("$routeChangeError", function (event, next, previous, error) {
			// We can catch the error thrown when the $requireSignIn promise is rejected.
			if (error === "AUTH_REQUIRED") {
				authService.getID().then(function (authID) {
					console.log(authID);
					authService.getFirebaseToken(authID).then(function (firebaseToken) {
						authService.loginFirebase(firebaseToken).then(function (firebaseUser) {
							authService.firebaseUser = firebaseUser;
							console.log("Logged in user is " + vm.firebaseUser);
						}, function (err) {
							$log.warn("Error reauthenticating firebaseUser from \'loginFirebase\' in app.run")
							authService.logout();
						});
					}, function (err) {
						console.log(err);
						authService.logout();
					});
				}, function (err) {
					console.log(err);
					authService.logout();
				});
			}
		});
	}
})();
