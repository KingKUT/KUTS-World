var genLfObjId = function () {
	return 'lfobjyxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

angular
	.module('app')
	.directive('lfFile', function (SecurityFactory) {
		return {
			restrict: 'E',
			scope: {
				lfFileObj: '=',
				lfUnknowClass: '='
			},
			link: function (scope, element, attrs) {
				console.log(scope.lfFileObj);
				var src = scope.lfFileObj.url;
				var fileType = scope.lfFileObj.mimetype;
				var unKnowClass = scope.lfUnknowClass;
				var security = SecurityFactory.getSecurity();

				var makeURL = function (url, policy, signature) {
					var location = url + '?policy=' + policy + '&signature=' + signature;
					return location;
				}

				if (fileType.indexOf('image') !== -1) {
					element.replaceWith(
						'<img src="' + makeURL(src, security.policy, security.signature) + '" />'
					);
				} else if (fileType.indexOf('video') !== -1) {
					element.replaceWith('<video id=\'my-player\' autoplay loop class="video-js vjs-default-skin vjs-big-play-centered" preload="auto" style="z-index:2;cursor: pointer;">' +
						'<source src="' + makeURL(src, security.policy, security.signature) + '" type ="' + fileType + '"> </source>' +
						'<p class = "vjs-no-js" >' +
						'To view this video please enable JavaScript, and consider upgrading to a web browser that' +
						'<a href = "http://videojs.com/html5-video-support/" target = "_blank" >' +
						'supports HTML5 video </a> </p></video>');
				} else if (fileType.indexOf('audio') !== -1) {
					element.replaceWith(
						'<audio controls>' +
						'<source src="' + makeURL(src, security.policy, security.signature) + '"">' +
						'</audio>'
					);
				} else {
					console.log(scope.lfFileObj);
					if (scope.lfFileObj.lfFile == void 0) {
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
		$templateCache.put('lfNgMdFileinput-1.html', [
			'<div layout="column" class="lf-ng-md-file-input" ng-model="' + genLfObjId() + '">',
			'<div layout="column" class="lf-ng-md-file-input-preview-container" ng-class="{\'disabled\':isDisabled}" ng-show="isDrag || (isPreview && lfFiles.length)">',
			'<md-button aria-label="remove all files" class="close lf-ng-md-file-input-x" ng-click="removeAllFiles($event)" ng-hide="!lfFiles.length || !isPreview" >&times;</md-button>',
			'<div class="lf-ng-md-file-input-drag">',
			'<div layout="row" layout-align="center center" class="lf-ng-md-file-input-drag-text-container" ng-show="(!lfFiles.length || !isPreview) && isDrag">',
			'<div class="lf-ng-md-file-input-drag-text">{{strCaptionDragAndDrop}}</div>',
			'</div>',
			'<div class="lf-ng-md-file-input-thumbnails" ng-if="isPreview == true">',
			'<div class="lf-ng-md-file-input-frame" ng-repeat="lffile in lfFiles" ng-click="onFileDblClick(lffile)">',
			'<div class="lf-ng-md-file-input-x" aria-label="remove {{lffile.lFfileName}}" ng-click="removeFile(lffile,$event)"><md-icon md-svg-src="../images/icons/ic_delete_forever_black_24px.svg" aria-label="Delete file"></div>',
			'<lf-file lf-file-obj="lffile" lf-unknow-class="strUnknowIconCls"/>',
			// '<md-progress-linear md-mode="indeterminate"></md-progress-linear>',
			'<div class="lf-ng-md-file-input-frame-footer">',
			'<div class="lf-ng-md-file-input-frame-caption"><span md-truncate>{{lffile.filename}}<span></div>',
			'</div>',
			'</div>',
			'</div>',
			'<div class="clearfix" style="clear:both"></div>',
			'</div>',
			'</div>',
			'<div layout="row" class="lf-ng-md-file-input-container" >',
			'<div class="lf-ng-md-file-input-caption" layout="row" layout-align="start center" flex ng-class="{\'disabled\':isDisabled}" >',
			'<md-icon class="lf-icon" ng-class="strCaptionIconCls"></md-icon>',
			'<div flex class="lf-ng-md-file-input-caption-text-default" ng-show="!lfFiles.length">',
			'{{strCaptionPlaceholder}}',
			'</div>',
			'<div flex class="lf-ng-md-file-input-caption-text" ng-hide="!lfFiles.length">',
			'<span ng-if="isCustomCaption">{{strCaption}}</span>',
			'<span ng-if="!isCustomCaption">',
			'{{ lfFiles.length == 1 ? lfFiles[0].lfFileName : lfFiles.length+" files selected" }}',
			'</span>',
			'</div>',
			'<md-progress-linear md-mode="determinate" value="{{floatProgress}}" ng-show="intLoading && isProgress"></md-progress-linear>',
			'</div>',
			'<md-button aria-label="remove all files" ng-disabled="isDisabled" ng-click="removeAllFiles()" ng-hide="!lfFiles.length || intLoading" class="md-raised lf-ng-md-file-input-button lf-ng-md-file-input-button-remove" ng-class="strRemoveButtonCls">',
			'<md-icon class="lf-icon" ng-class="strRemoveIconCls"></md-icon> ',
			'{{strCaptionRemove}}',
			'</md-button>',
			'<md-button aria-label="submit" ng-disabled="isDisabled" ng-click="onSubmitClick()" class="md-raised md-warn lf-ng-md-file-input-button lf-ng-md-file-input-button-submit" ng-class="strSubmitButtonCls" ng-show="lfFiles.length && !intLoading && isSubmit">',
			'<md-icon class="lf-icon" ng-class="strSubmitIconCls"></md-icon> ',
			'{{strCaptionSubmit}}',
			'</md-button>',
			'<md-button aria-label="browse" ng-disabled="isDisabled" class="md-raised lf-ng-md-file-input-button lf-ng-md-file-input-button-browse" ng-class="strBrowseButtonCls">',
			'<md-icon class="lf-icon" ng-class="strBrowseIconCls"></md-icon> ',
			'{{strCaptionBrowse}}',
			'<input type="text" aria-label="{{strAriaLabel}}" accept="{{accept}}" ng-disabled="isDisabled" class="lf-ng-md-file-input-tag" />',
			'</md-button>',
			'</div>',
			'<div layout="row" class="lf-ng-md-file-submit-button-container">',
			'<md-button aria-label="browse" ng-show="lfFiles.length > 0" class="md-raised lf-ng-md-file-submit-button" ng-class="strSubmitButtonCls">',
			'</md-button>',
			'</div>',
			'</div>'
		].join(''));
	});

angular
	.module('app')
	.run(function ($templateCache) {
		$templateCache.put('lfNgMdFileinput-2.html', [
			'<div layout="column" class="lf-ng-md-file-input" ng-model="' + genLfObjId() + '">',
			'<div layout="column" class="lf-ng-md-file-input-preview-container" ng-class="{\'disabled\':isDisabled}" ng-show="isPreview && lfFiles.length > 0">',
			'<md-button aria-label="remove all files" class="close lf-ng-md-file-input-x" ng-click="removeAllFiles($event)" ng-hide="!lfFiles.length || !isPreview" >&times;</md-button>',
			'<div class="lf-ng-md-file-input-preview">',
			'<div class="lf-ng-md-file-input-thumbnails" ng-if="isPreview == true">',
			'<div class="lf-ng-md-file-input-frame-large" ng-repeat="lffile in lfFiles" ng-click="selectFile($index)" ng-dblclick="onFileDblClick(lffile, $event)" ng-class="isSelected($index)">',
			'<md-toolbar class="md-hue-2">',
			'<div class="md-toolbar-tools">',
			'<span flex></span>',
			'<md-button class="md-icon-button" aria-label="Edit info" ng-click="onEditButtonClick($index, $event)">',
			'<md-icon md-svg-icon="images/icons/ic_mode_edit_white_24px.svg"></md-icon></md-button>',
			'<md-button class="md-icon-button" aria-label="Delete file" ng-click="removeFile($index, $event, lffile)">',
			'<md-icon md-svg-icon="./images/icons/ic_delete_forever_white_24px.svg"></md-icon>',
			'</md-button></div></md-toolbar>',
			'<lf-file lf-file-obj="lffile" lf-unknow-class="strUnknowIconCls" />',
			// '<md-progress-linear md-mode="indeterminate"></md-progress-linear>',
			'<div class="lf-ng-md-file-input-frame-footer">',
			'<div class="lf-ng-md-file-input-frame-caption-large"><span md-truncate>{{lffile.filename}}<span></div>',
			'</div></div></div>',
			'<div class="clearfix" style="clear:both"></div></div></div>',
			'<div layout="row" class="lf-ng-md-file-input-container" >',
			'<div class="lf-ng-md-file-input-caption" layout="row" layout-align="start center" flex ng-class="{\'disabled\':isDisabled}" >',
			'<md-icon class="lf-icon" ng-class="strCaptionIconCls"></md-icon>',
			'<div flex class="lf-ng-md-file-input-caption-text-default" ng-show="!lfFiles.length">',
			'{{strCaptionPlaceholder}}',
			'</div>',
			'<div flex class="lf-ng-md-file-input-caption-text" ng-hide="!lfFiles.length">',
			'<span>{{strCaption}}</span>',
			'</div>',
			'<md-progress-linear md-mode="determinate" value="{{floatProgress}}" ng-show="isLoading && floatProgress > 0 && isProgress"></md-progress-linear>',
			'</div>',
			'<md-button aria-label="remove all files" ng-disabled="isDisabled" ng-click="removeAllFiles()" ng-hide="!lfFiles.length || intLoading" class="md-raised lf-ng-md-file-input-button lf-ng-md-file-input-button-remove" ng-class="strRemoveButtonCls">',
			'<md-icon class="lf-icon" ng-class="strRemoveIconCls"></md-icon> ',
			'{{strCaptionRemove}}',
			'</md-button>',
			'<md-button aria-label="submit" ng-disabled="isDisabled" ng-click="onSubmitClick()" class="md-raised md-warn lf-ng-md-file-input-button lf-ng-md-file-input-button-submit" ng-class="strSubmitButtonCls" ng-show="lfFiles.length && isSubmit">',
			'<md-icon class="lf-icon" ng-class="strSubmitIconCls"></md-icon> ',
			'{{strCaptionSubmit}}',
			'</md-button>',
			'<md-button aria-label="browse" ng-disabled="isDisabled" class="md-raised lf-ng-md-file-input-button lf-ng-md-file-input-button-browse" ng-class="strBrowseButtonCls">',
			'<md-icon class="lf-icon" ng-class="strBrowseIconCls"></md-icon> ',
			'{{strCaptionBrowse}}',
			'<input type="text" aria-label="{{strAriaLabel}}" accept="{{accept}}" ng-disabled="isDisabled" class="lf-ng-md-file-input-tag" />',
			'</md-button>',
			'</div>',
			'</div>'
		].join(''));
	});

angular
	.module('app')
	.directive("onBrowseClick", function ($parse) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				// here you can parse any attribute (so this could as well be,
				// myDirectiveCallback or multiple ones if you need them )
				var browseButton = angular.element(element[0].querySelector('.lf-ng-md-file-input-button-browse'));
				var expressionHandler = $parse(attrs.onBrowseClick);
				browseButton.on('click', function (e, args) {
					// HERE: call the parsed function correctly (with scope AND params object)
					expressionHandler(scope, {
						args: args
					});
				});
			}
		}
	});

angular
	.module('app')
	.directive("onSubmitClick", function ($parse) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				// here you can parse any attribute (so this could as well be,
				// myDirectiveCallback or multiple ones if you need them )
				var submitButton = angular.element(element[0].querySelector('.lf-ng-md-file-input-button-submit'));
				var expressionHandler = $parse(attrs.onSubmitClick);
				submitButton.on('click', function (e, args) {
					// HERE: call the parsed function correctly (with scope AND params object)
					expressionHandler(scope, {
						args: args
					});
				});
			}
		}
	});

angular
	.module('app')
	.directive('umdButton', function (SecurityFactory, $q, $compile, $timeout) {
		return {
			restrict: 'E',
			templateUrl: function (element, attrs) {
				if (attrs) {
					if (attrs.type === 'small' || !attrs.type) {
						return 'lfNgMdFileinput-1.html';
					}
					if (attrs.type === 'large') {
						return 'lfNgMdFileinput-2.html';
					}
				} else {
					return 'lfNgMdFileinput-1.html';
				}
			},
			replace: true,
			require: "ngModel",
			scope: {
				lfFiles: '=?',
				lfProgress: '=?',
				lfOption: '=?',
				lfCaption: '@?',
				lfPlaceholder: '@?',
				lfOnFileDblClick: '=?',
				lfOnEditBtnClick: '=?',
				lfOnAllFilesRemoved: '=?',
				lfOnFileRemoved: '=?',
				ngDisabled: '=?',
				policy: '@?',
				signature: '@?'
			},
			link: function (scope, element, attrs, ctrl) {

				var elFileinput = angular.element(element[0].querySelector('.lf-ng-md-file-input-tag'));
				var elThumbnails = angular.element(element[0].querySelector('.lf-ng-md-file-input-thumbnails'));
				var browseButton = angular.element(element[0].querySelector('.lf-ng-md-file-input-button-browse'));

				var intFilesCount = 0;

				scope.floatProgress = 0;

				scope.isPreview = false;
				scope.isMutiple = false;
				scope.isLoading = false;
				scope.isProgress = false;
				scope.hasSecurity = false;
				scope.isCustomCaption = false;
				scope.isSubmit = false;
				scope.selected = 0;

				if (angular.isDefined(attrs.preview)) {
					scope.isPreview = true;
				}

				if (angular.isDefined(attrs.multiple)) {
					elFileinput.attr('multiple', 'multiple');
					scope.isMutiple = true;
				} else {
					elFileinput.removeAttr('multiple');
				}

				if (angular.isDefined(attrs.lfProgress)) {
					scope.isProgress = true;
					scope.$watch('lfProgress', function (newValue, oldValue) {
						console.log(newValue);
						scope.floatProgress = newValue;
						if (newValue < 100)
							scope.isLoading = true;
						else {
							scope.isLoading = false;
							scope.floatProgress = 0;
						}
					});
				}


				if (angular.isDefined(attrs.policy) && angular.isDefined(attrs.signature)) {
					scope.hasSecurity = true;
				}

				if (angular.isDefined(attrs.submit)) {
					scope.isSubmit = true;
				}

				scope.isDisabled = false;

				if (angular.isDefined(attrs.ngDisabled)) {
					scope.$watch('ngDisabled', function (isDisabled) {
						scope.isDisabled = isDisabled;
					});
				}

				scope.strBrowseIconCls = "lf-browse";
				scope.strRemoveIconCls = "lf-remove";
				scope.strCaptionIconCls = "lf-caption";
				scope.strSubmitIconCls = "lf-submit";
				scope.strUnknowIconCls = "lf-unknow";

				scope.strBrowseButtonCls = "md-primary";
				scope.strRemoveButtonCls = "";
				scope.strSubmitButtonCls = "md-accent";

				if (angular.isDefined(attrs.lfOption)) {
					if (angular.isObject(scope.lfOption)) {
						if (scope.lfOption.hasOwnProperty('browseIconCls')) {
							scope.strBrowseIconCls = scope.lfOption.browseIconCls;
						}
						if (scope.lfOption.hasOwnProperty('removeIconCls')) {
							scope.strRemoveIconCls = scope.lfOption.removeIconCls;
						}
						if (scope.lfOption.hasOwnProperty('captionIconCls')) {
							scope.strCaptionIconCls = scope.lfOption.captionIconCls;
						}
						if (scope.lfOption.hasOwnProperty('unknowIconCls')) {
							scope.strUnknowIconCls = scope.lfOption.unknowIconCls;
						}
						if (scope.lfOption.hasOwnProperty('submitIconCls')) {
							scope.strSubmitIconCls = scope.lfOption.submitIconCls;
						}
						if (scope.lfOption.hasOwnProperty('strBrowseButtonCls')) {
							scope.strBrowseButtonCls = scope.lfOption.strBrowseButtonCls;
						}
						if (scope.lfOption.hasOwnProperty('strRemoveButtonCls')) {
							scope.strRemoveButtonCls = scope.lfOption.strRemoveButtonCls;
						}
						if (scope.lfOption.hasOwnProperty('strSubmitButtonCls')) {
							scope.strSubmitButtonCls = scope.lfOption.strSubmitButtonCls;
						}
					}
				}

				scope.accept = scope.accept || '';

				scope.lfFiles = [];
				scope.$watchCollection('lfFiles', function (newValue, oldValue) {
					if (newValue.length > 1) {
						scope.strCaptionPlaceholder = 'You have ' + newValue + ' files chosen';
					} else if (newValue.length == 1) {
						scope.strCaption = 'You have 1 file chosen';
					} else {
						scope.strCaption = 'Select file';
					}
				});


				scope[attrs.ngModel] = scope.lfFiles;

				scope.strCaption = '';

				scope.strCaptionPlaceholder = 'Select file';

				scope.strCaptionBrowse = 'Browse';

				scope.strCaptionRemove = 'Remove';

				scope.strCaptionSubmit = 'Submit';

				scope.strAriaLabel = "";

				if (angular.isDefined(attrs.ariaLabel)) {
					scope.strAriaLabel = attrs.ariaLabel;
				}

				if (angular.isDefined(attrs.lfPlaceholder)) {
					scope.$watch('lfPlaceholder', function (newVal) {
						scope.strCaptionPlaceholder = newVal;
					});
				}

				if (angular.isDefined(attrs.lfCaption)) {
					scope.isCustomCaption = true;
					scope.$watch('lfCaption', function (newVal) {
						scope.strCaption = newVal;
					});
				}

				if (scope.lfBrowseLabel) {
					scope.strCaptionBrowse = scope.lfBrowseLabel;
				}

				if (scope.lfRemoveLabel) {
					scope.strCaptionRemove = scope.lfRemoveLabel;
				}

				if (scope.lfSubmitLabel) {
					scope.strCaptionSubmit = scope.lfSubmitLabel;
				}

				scope.removeAllFilesWithoutVaildate = function () {
					if (scope.isDisabled) {
						return;
					}
					scope.lfFiles.length = 0;
					elThumbnails.empty();
				}

				scope.removeAllFiles = function (event) {
					scope.onAllFilesRemoved(event, scope.lfFiles);
					scope.removeAllFilesWithoutVaildate();
					executeValidate();
				};

				//call back function
				scope.onAllFilesRemoved = function (ev, files) {
					console.log('All files removed...');
					if (angular.isFunction(scope.lfOnAllFilesRemoved)) {
						scope.lfOnAllFilesRemoved(ev, files);
					}
				};

				scope.removeFile = function (idx, ev, lfFile) {
					scope.lfFiles.splice(idx, 1);
					executeValidate();
					scope.onFileRemoved(lfFile, idx, ev);
				};

				//call back function
				scope.onFileRemoved = function (lfFile, idx, ev) {
					console.log('File removed...');
					if (angular.isFunction(scope.lfOnFileRemoved)) {
						scope.lfOnFileRemoved(lfFile, idx, ev);
					}
				};

				scope.selectFile = function (index) {
					console.log('clicked on file with index %i...', index);
					scope.selected = index;
				}

				scope.isSelected = function (index) {
					console.log('selected index is ' + index + '....');
					return {
						'media-selected': scope.selected == index
					};
				}

				scope.onEditButtonClick = function (idx, ev) {
					console.log('edit button clicked...');
					if (angular.isFunction(scope.lfOnEditBtnClick)) {
						scope.lfOnEditBtnClick(scope.lfFiles[idx], idx, ev);
					}
				};

				//call back function
				scope.onFileDblClick = function (lfFile, ev) {
					console.log('double clicked on file...');
					if (angular.isFunction(scope.lfOnFileDblClick)) {
						scope.lfFiles.every(function (obj, idx) {
							if (obj.key == lfFile.key) {
								scope.lfOnFileDblClick(obj, idx, ev);
								return false;
							} else {
								return true;
							}
						});
					}
				};

				/*scope.onBrowseClick = function(){
					if(angular.isFunction(scope.lfOnBrowseClick)){
                        scope.lfOnBrowseClick();
                    }
				};*/

				scope.onSubmitClick = function () {
					if (angular.isFunction(scope.lfOnSubmitClick)) {
						scope.lfOnSubmitClick(scope.lfFiles);
					}
				};

				var executeValidate = function () {
					ctrl.$validate();
				}
			}
		};
	});
