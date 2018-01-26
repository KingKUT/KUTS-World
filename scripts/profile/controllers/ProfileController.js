(function () {

	'use strict';

	angular
		.module('app')
		.controller('ProfileController', ProfileController);

	ProfileController.$inject = ['authService', 'UserProfile', '$state', '$http', '$window'];

	function ProfileController(authService, UserProfile, $state, $http, $window) {

		var vm = this;
		vm.auth = authService;
		vm.slide = {
			image: null,
			caption: null,
			subcaption: null
		};
		console.log(vm.slide);
		vm.slide.image = '../images/yeoman.png';
		vm.slide.caption = (vm.slide.caption || '');
		vm.slide.subcaption = (vm.slide.subcaption || '');

		console.log('Welcome to your profile!');
		console.log(UserProfile);

		$(function () {
				$("img.scale").imageScale();
			});

		window.addEventListener('resize', function () {
			"use strict";
			$(function () {
				$("img.scale").imageScale();
			});
		});

	}
})();
