angular
	.module('app')
	.filter('AgeFilter', function AgeFilter() {

		return function calculateAge(birthday) { // birthday is a date
			if (birthday) {
			var ageDifMs = Date.now() - birthday.getTime();
			var ageDate = new Date(ageDifMs); // miliseconds from epoch
			return Math.abs(ageDate.getUTCFullYear() - 1970);
			}
			else return null;
		}
	});
