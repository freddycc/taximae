angular.module('taximae.directives', [])
.directive('paymentMethod', function(){
	return {
		templateUrl: 'templates/directives/payment-methods.html'
	};
})
.directive('vehicleType', function(){
	return {
		templateUrl: 'templates/directives/vehicle-type.html'
	}
})
.directive('requestStatusIcon', function(){
	return {
		templateUrl: 'templates/directives/request-icon.html'
	}
})
.directive('requestStatus', function(){
	return {
		templateUrl: 'templates/directives/status.html'
	}
})
.directive('messages', function(){
	return {
		templateUrl: 'templates/directives/messages.html'
	}
});