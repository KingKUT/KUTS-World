var genReObjId = function () {
	return 'reObjyxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};


angular
	.module('app')
	.directive('reFile', function (SecurityFactory) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				reFileObj: '=',
				lfUnknowClass: '=',
				security: '@?'
			},
			link: function (scope, element, attrs) {
				var src = scope.reFileObj.url;
				var fileType = scope.reFileObj.mimetype;
				var unKnowClass = scope.lfUnknowClass;
				var security = null;
				console.log(scope.reFileObj);
				console.log(fileType);
				console.log(src);

				if (attrs.security) {
					console.log("Security defined.");
				security = SecurityFactory.getSecurity();
				}
				/*if (!src || !fileType) {
					src = "https://svgshare.com/i/4yo.svg";
					fileType = "image/svg"
				}*/

				var makeURL = function (url, policy, signature) {
					var location = url + '?policy=' + policy + '&signature=' + signature;
					return location;
				}

				if (fileType.indexOf('image') !== -1) {
					element.replaceWith(
						'<img src="' + (security ? makeURL(src, security.policy, security.signature) : src) + '" />'
					);
				} else if (fileType.indexOf('video') !== -1) {
					element.replaceWith('<video id=\'my-player\' autoplay loop class="video-js vjs-default-skin vjs-big-play-centered" preload="auto" style="z-index:2;cursor: pointer;">' +
						'<source src="' + (security ? makeURL(src, security.policy, security.signature) : src) + '" type ="' + fileType + '"> </source>' +
						'<p class = "vjs-no-js" >' +
						'To view this video please enable JavaScript, and consider upgrading to a web browser that' +
						'<a href = "http://videojs.com/html5-video-support/" target = "_blank" >' +
						'supports HTML5 video </a> </p></video>');

				} else if (fileType.indexOf('audio') !== -1) {
					element.replaceWith(
						'<audio controls>' +
						'<source src="' + (security ? makeURL(src, security.policy, security.signature) : src) + '"">' +
						'</audio>'
					);
				} else {
					console.log(scope.reFileObj);
					if (scope.reFileObj.reFile == void 0) {
						fileType = 'unknown/unknown';
					}
					element.replaceWith(
						'<object type="' + fileType + '" data="' + makeURL(src, security.policy, security.signature) + '">' +
						'<div class="lf-ng-md-file-input-preview-default">' +
						'<md-icon class="lf-ng-md-file-input-preview-icon ' + unKnowClass + '"></md-icon>' +
						'</div>' +
						'</object>'
					);
				}
			}
		};
	});

angular
	.module('app')
	.run(function ($templateCache) {
		$templateCache.put('rePreviewBox-1.html', [
			'<div layout="column" class="re-pmd-container" ng-model="' + genReObjId() + '" ng-show="isVisible">',
			'<div class="re-preview-container">',
			'<div class="re-pmd-preview">',
			'<div class="re-pmd-preview-frame" ng-repeat="refile in reFiles">',
			'<re-file re-file-obj="refile" lf-unknow-class="strUnknowIconCls" security="true"/>',
			'<div class="lf-ng-md-file-input-frame-footer">',
			'<div class="lf-ng-md-file-input-frame-caption-large"><span md-truncate>{{refile.caption}}<span></div>',
			'</div></div></div><div class="clearfix" style="clear:both"></div></div></div>'
		].join(''));
	});

angular
	.module('app')
	.directive('pmBox', function (SecurityFactory, $q, $compile, $timeout) {
		return {
			restrict: 'E',
			templateUrl: function (element, attrs) {
				return 'rePreviewBox-1.html';
			},
			replace: true,
			require: "ngModel",
			scope: {
				reFiles: '=?',
				reVisibility: '=?'
			},
			link: function (scope, element, attrs, ctrl) {

				scope.isVisible = true;

				scope.reFiles = [];

				scope[attrs.ngModel] = scope.reFiles;

				if (angular.isDefined(attrs.reVisibility)) {
					scope.$watch('reVisibility', function (newVal) {
						scope.isVisible = newVal;
						console.log('toggling pm-Box visibility to ' + newVal + '.');
					});
				}
			}
		};
	});
