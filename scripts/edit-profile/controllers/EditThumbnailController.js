(function () {

	'use strict';

	angular
		.module('app')
		.controller('EditThumbnailController', EditThumbnailController);

	EditThumbnailController.$inject = ['authService', 'UserProfile', 'ProfileFactory', 'SecurityFactory', 'MediaFactory', 'filePermissions', 'filepickerService', '$scope', '$document', '$timeout', '$mdDialog', '$mdToast', '$log'];

	function EditThumbnailController(authService, UserProfile, ProfileFactory, SecurityFactory, MediaFactory, filePermissions, filepickerService, $scope, $document, $timeout, $mdDialog, $mdToast, $log) {

		var vm = this;

		vm.file = [];

		console.log(SecurityFactory);

		ProfileFactory.getApiToken().then(function (token) {
				ProfileFactory.getCurrentThumbnail(UserProfile._id, token).then(function (result) {
					console.log(result.thumbnail[0]);
					console.log(result.thumbnail[0].filestack);
					vm.loadedFile = [result.thumbnail[0].filestack];
					vm.currentPreviewVisible = true;
				}, function (err) {
					vm.loadedFile = [{
						url: '../images/icons/blank_user.svg',
						mimetype: 'image/svg'
					}];
					if (err.status && err.status == 404) {
						$log.log('No thumbnail found.');
					} else {
						$log.error('Unable to retrieve your current thumbnail.');
						$mdToast.show(
							$mdToast.simple()
							.textContent('Unable to retrieve your current thumbnail.')
							.theme('error-toast')
							.hideDelay(3000)
							.position('top right')
						);
					}
				});
			},
			function (err) {
				$log.error('Unable to retrieve API token.');
			});

		$scope.customFullscreen = false;

		//filepickerService.setKey('A2XKEtTmQmaTqiEevny2wz'); // TODO: Must protect api key later on....
		let options = [];
		filepickerService.setResponsiveOptions({
			onResize: 'down',
			pixelRound: 50
		});

		$scope.pickFile = pickFile;
		var policy = null;
		var signature = null;

		function pickFile() {

			filepickerService.pickMultiple({
					mimetype: ['image/jpeg', 'image/png', 'image/webp'],
					maxSize: 90 * 1024 * 1024,
					maxFiles: 1,
					minFiles: 1,
					imageQuality: 100,
					imageDim: [800, 600],
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

		$scope.$watchCollection('vm.file', function (newVal, oldVal, ) {
			if (newVal.length > 0)
				vm.currentPreviewVisible = false;
			else vm.currentPreviewVisible = true;
		})

		$scope.submitMedia = function () {
			if (vm.file.length > 0) {
				MediaFactory.resizeImageAndSave(vm.file[0].url, 'Thumbnails', vm.file[0].mimetype).then(function (result) {
					console.log(result);
					var gStorageInfo = result;

					ProfileFactory.getApiToken().then(function (token) {
						ProfileFactory.updateThumbnail(UserProfile._id, vm.file[0], gStorageInfo, token).then(function (result) {
							console.log(result.data.message);
							vm.loadedFile = vm.file[0];
							ProfileFactory.addThumbnailToAlbum(UserProfile._id, vm.file[0], gStorageInfo, token).then(function (result) {
								if (result.status == 200) {
									$log.log('Display saved to album');
								} else {
									$log.error('Error: Display not saved to album.');
								}
							})
							vm.file = [];
							$mdToast.show(
								$mdToast.simple()
								.textContent('Thumbnail successfully updated!')
								.theme('success-toast')
								.hideDelay(3000)
								.position('bottom right')
							);
						}, function (err) {
							$log.error('Unable to update thumbnail.');

							$mdToast.show(
								$mdToast.simple()
								.textContent('Unable to update your thumbnail.')
								.theme('error-toast')
								.hideDelay(3000)
								.position('top right')
							);
						});
					}, function (err) {
						$log.error('Unable to retrieve API token.');
					});
				}, function (error) {
					console.log(error);
					$log.error('Unable to resize and save your photo.');
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
					vm.file = [];
					console.log("All files removed");
					$mdToast.show(
						$mdToast.simple()
						.textContent('All files successfully deleted.')
						.position('bottom right')
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
					vm.file.splice(idx, 1);
					console.log("File removed");
					$mdToast.show(
						$mdToast.simple()
						.textContent('File deleted.')
						.position('bottom right')
						.hideDelay(3000)
					);
				},
				function (err) {
					$log.error('Unable to delete file...')
				});
		}
	}
})();
