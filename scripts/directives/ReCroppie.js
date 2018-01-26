angular
	.module('app')
	.directive('reCroppie', function() {
	 return {
    restrict: 'E',
    scope: {
      src: '=',
      ngModel: '='
    },
    link: function (scope, element, attrs) {
      if(!scope.src) { return; }

      var c = new Croppie(element[0], {
        viewport: {
          width: 200,
          height: 200
        },
        update: function () {
          c.result('canvas').then(function(img) {
            scope.$apply(function () {
              scope.ngModel = img;
            });
          });
        }
      });

      // bind an image to croppie
      c.bind({
        url: scope.src
      });
    }
  };
});