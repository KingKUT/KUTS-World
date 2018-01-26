var genLfObjId = function(){
    	return 	'lfobjyxxxxxxxx'.replace(/[xy]/g, function(c) {
	    			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    			return v.toString(16);
				});
    };

angular
	.module('app')
	.directive('myButton', function () { 
	return {
			restrict: 'E',
			//templateUrl: 'lfNgMdFileinput.html',
			replace: true,
			require: "ngModel",
			template: ['<div layout="column" class="lf-ng-md-file-input" ng-model="' + genLfObjId() + '">',
			'<div layout="column" class="lf-ng-md-file-input-preview-container" ng-class="{\'disabled\':isDisabled}" ng-show="isDrag || (isPreview && lfFiles.length)">',
			'<md-button aria-label="remove all files" class="close lf-ng-md-file-input-x" ng-click="removeAllFiles($event)" ng-hide="!lfFiles.length || !isPreview" >&times;</md-button>',
			'<div class="lf-ng-md-file-input-drag">',
			'<div layout="row" layout-align="center center" class="lf-ng-md-file-input-drag-text-container" ng-show="(!lfFiles.length || !isPreview) && isDrag">',
			'<div class="lf-ng-md-file-input-drag-text">{{strCaptionDragAndDrop}}</div>',
			'</div>',
			'<div class="lf-ng-md-file-input-thumbnails" ng-if="isPreview == true">',
			'<div class="lf-ng-md-file-input-frame" ng-repeat="lffile in lfFiles" ng-click="onFileClick(lffile)">',
			'<div class="lf-ng-md-file-input-x" aria-label="remove {{lffile.lFfileName}}" ng-click="removeFile(lffile,$event)">&times;</div>',
			'<lf-file lf-file-obj="lffile" lf-unknow-class="strUnknowIconCls"/>',
			// '<md-progress-linear md-mode="indeterminate"></md-progress-linear>',
			'<div class="lf-ng-md-file-input-frame-footer">',
			'<div class="lf-ng-md-file-input-frame-caption">{{lffile.lfFileName}}</div>',
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
			'<md-button aria-label="browse" ng-disabled="isDisabled" ng-click="openDialog($event, this)" class="md-raised lf-ng-md-file-input-button lf-ng-md-file-input-button-browse" ng-class="strBrowseButtonCls">',
			'<md-icon class="lf-icon" ng-class="strBrowseIconCls"></md-icon> ',
			'{{strCaptionBrowse}}',
			'<input type="file" aria-label="{{strAriaLabel}}" accept="{{accept}}" ng-disabled="isDisabled" class="lf-ng-md-file-input-tag" />',
			'</md-button>',
			'</div>',
			'</div>'].join(),
			scope: {
				lfFiles: '=?',
				//lfPlaceholder: '@?',
				ngDisabled: '=?',
			},
			link: function (scope, element, attrs, ctrl) {
			}
	}
});