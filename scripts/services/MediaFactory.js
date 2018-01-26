angular
	.module('app')
	.factory('MediaFactory', function ($http, $q) {

		var security = {};
		var resizeImageAndSave = function (imageUrl, imageCategory, mimeType) {
			return $http({
				url: '/resize-image-and-save',
				method: 'POST',
				data: {
					'imageUrl': imageUrl,
					'imageCategory': imageCategory,
					'mimeType': mimeType
				}
			}).then(function success(response) {
				// this function will be called when the request is success
				console.log("Image resized ok.");
				return response.data;
			}, function error(response) {
				// this function will be called when the request returned error status
				console.log("Error resizing image.");
				console.log(response);
				return response;
			});
		}

		return {
			resizeImageAndSave: resizeImageAndSave
		}
	});