(function () {

  'use strict';

  angular
    .module('app')
    .controller('CallbackController', callbackController);

  callbackController.$inject = ['authService', '$state', '$scope'];
	
  function callbackController(authService, $state, $scope) {
	  
  }
})();