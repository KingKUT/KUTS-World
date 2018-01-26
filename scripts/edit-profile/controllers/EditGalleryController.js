(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditGalleryController', EditGalleryController);

	EditGalleryController.$inject = ['authService', 'UserProfile', 'ProfileFactory', 'SecurityFactory', 'filePermissions', 'filepickerService', '$scope', '$q', '$timeout', '$document', '$mdDialog', '$mdToast', '$log'];

	function EditGalleryController(authService, UserProfile, ProfileFactory, SecurityFactory, filePermissions, filepickerService, $scope, $q, $timeout, $document, $mdDialog, $mdToast, $log) {

		var vm = this;

		vm.file = [];
		vm.albums = [];
		$scope.currentIndex = 0;

		console.log(SecurityFactory);

		ProfileFactory.getApiToken().then(function (token) {
			ProfileFactory.getAlbums(UserProfile._id, token).then(function (retrievedAlbums) {
				console.log(retrievedAlbums);
				var promises = []
				for (var i = 0; i < retrievedAlbums.length; i++) {
					promises.push(ProfileFactory.getMedia(retrievedAlbums[i]._id, token).then(function (media) {
						return media;
					}));
					/*ProfileFactory.getMedia(retrievedAlbums[i]._id, token).then(function (media) {
						console.log(media);
						vm.albums.push({
							album: retrievedAlbums[count++],
							media: media,
							current: 0
						});*/
				}
				$q.all(promises).then(function (media) {
					console.log(media);
					for (var i = 0; i < retrievedAlbums.length; i++) {
						vm.albums.push({
							album: retrievedAlbums[i],
							media: media[i]
						});
					}
					console.log(vm.albums);
				});
				/*, function (err) {
						if (err.status && err.status == 404) {
							$log.log('Album is empty.');
						} else {
							$log.error('Unable to retrieve items from album ' + media[i].name +'.');
							$mdToast.show(
								$mdToast.simple()
								.textContent('Unable to retrieve media from album ' + media[i].name +'.')
								.theme('error-toast')
								.hideDelay(3000)
								.position('top right')
							);
						}*/
			}, function (err) {
				if (err.status == 404) {
					$log.log('No albums found');
				} else {
					console.log('Error occurred while searching for albums.');
					$log.log('Error occurred while searching for albums.');
				}
			});
			/*}, function (err) {
				if (err.status && err.status == 404) {
					$log.log('No albums found.');
				} else {
					$log.error('Unable to retrieve your albums.');
					$mdToast.show(
						$mdToast.simple()
						.textContent('Unable to retrieve your albums.')
						.theme('error-toast')
						.hideDelay(3000)
						.position('top right')
					);
				}
			});*/
		}, function (err) {
			$log.error('Unable to retrieve API token.');
		});

		$scope.customFullscreen = false;
		
		vm.isCurrent = function (idx) {
			return idx == $scope.currentIndex;
		}
		
		$scope.prevStackItem = function (idx, albumLength) {
			if ($scope.currentIndex > 0) {
				$scope.currentIndex -= 1;
			}
			console.log(idx);
		}
		
		$scope.nextStackItem = function (idx, albumLength) {
			if ($scope.currentIndex < albumLength) {
				$scope.currentIndex += 1;
			}
			console.log(idx);
		}


		//filepickerService.setKey('A2XKEtTmQmaTqiEevny2wz'); // TODO: Must protect api key later on....
		/*let options = [];
		filepickerService.setResponsiveOptions({
			onResize: 'down',
			pixelRound: 50
		});

		$scope.pickFile = pickFile;
		var policy = null;
		var signature = null;

		function pickFile() {

			filepickerService.pickMultiple({
					mimetype: ['image/*', 'video/*'],
					maxSize: 90 * 1024 * 1024,
					maxFiles: 1,
					minFiles: 1,
					imageQuality: 100,
					backgroundUpload: false,
					container: 'modal',
					hide: true,
					policy: filePermissions.policy,
					signature: filePermissions.signature
				},
				onSuccess,
				function (FPError) {
					console.log(FPError.toString());
				},
				function (FPProgress) {
					console.log(parseInt(FPProgress.progress));
					vm.progressPercentage = parseInt(FPProgress.progress);
					$scope.$digest();
				});
		}
		

		function onSuccess(Blob) {

			console.log(JSON.stringify(Blob));
			$timeout(function () {
				vm.progressPercentage = 0;
			}, 2000);

			vm.file = Blob;
			$scope.$apply();
		};

		$scope.gotoMessages = function (x) {
			var newHash = 'post-messages';
			if ($location.hash() !== newHash) {
				$location.hash('post-messages');
			} else {
				$anchorScroll();
			}
		}

		$scope.submitMedia = function () {
			if (vm.file.length > 0) {
				ProfileFactory.getApiToken().then(function (token) {
					ProfileFactory.updateThumbnail(UserProfile._id, vm.file[0], token).then(function (result) {
						console.log(result.data.message);
						vm.file = [];
						$mdToast.show({
							hideDelay: 3000,
							position: 'bottom right',
							template: '<md-toast>' +
								'<div class="md-toast-content success-toast">' +
								'Thumbnail successfully updated!' +
								'</div>' +
								'</md-toast>',
							parent: $document[0].querySelector('#thumbnail-container')
						});
					}, function (err) {
						$log.error('Unable to update thumbnail.');

						$mdToast.show({
							hideDelay: 3000,
							position: 'bottom right',
							template: '<md-toast>' +
								'<div class="md-toast-content error-toast">' +
								'Unable to update your thumbnail.' +
								'</div>' +
								'</md-toast>',
							parent: $document[0].querySelector('#thumbnail-container')
						});
					});
				}, function (err) {
					$log.error('Unable to retrieve API token.');
				});
			}
		}

		$scope.showDialog = function (object, index, event) {
			console.log('click called');
			object.caption = (object.caption || '');
			$mdDialog.show({
					locals: {
						parent: $scope,
						mediaObj: object,
						caption: object.caption
					},
					controller: 'EditMediaDialogController as vm',
					templateUrl: 'scripts/views/edit-media-preview.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose: true,
					fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
				})
				.then(function (caption) {
					console.log(caption);
					vm.file[index].caption = caption;
				}, function () {
					console.log('You cancelled the dialog.');
				});
		};

		$scope.onAllFilesRemoved = function (ev, files) {
			filepicker.remove(
				files[0], {
					policy: filePermissions.policy,
					signature: filePermissions.signature
				},
				function (files) {
					console.log("All files removed");
					$mdToast.show(
						$mdToast.simple()
						.textContent('All files successfully deleted.')
						.position('top right')
						.parent('#thumbnail-container')
						.hideDelay(3000)
					);
				},
				function (err) {
					$log.error('Unable to delete files...')
				});
		}

		$scope.onFileRemoved = function (lfFile, idx, ev) {
			filepicker.remove(
				lfFile.url, {
					policy: filePermissions.policy,
					signature: filePermissions.signature
				},
				function (lfFile) {
					console.log("File removed");
					$mdToast.show(
						$mdToast.simple()
						.textContent('File deleted.')
						.position('top right')
						.parent('#thumbnail-container')
						.hideDelay(3000)
					);
				},
				function (err) {
					$log.error('Unable to delete file...')
				});
		} */
	}
})();
