(function () {

	'use strict';

	angular
		.module('app')
		.factory('socket', socket);

	socket.$inject = ['socketFactory'];

	function socket(socketFactory) {
		var myIoSocket = io.connect('http://localhost:9000/presence');

		socket = socketFactory({
			prefix: '',
			ioSocket: myIoSocket
		});

		return socket;
	}
})();
