angular
	.module('app')
	.run(function ($templateCache) {
		$templateCache.put('mdTextArea.html', [

		].join(''));
	});

angular.module('app')
	.directive('mdTextArea', function ($timeout) {
		return {
			require: "ngModel",
			link: function (scope, element, attrs, ngModel) {

				function read() {
					ngModel.$setViewValue(element.html());
				}

				ngModel.$render = function () {
					element.html(ngModel.$viewValue || "");
				};

				element.bind("blur keyup change", function () {
					scope.$apply(read);
				});
			}
		}
	});
