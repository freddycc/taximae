angular.module('taximae.factories', ['ngResource'])
.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
})
//Cargador de conectores a servicios REST
.factory('Rest', function($resource) {
  return {
    getService: function(service){
      //return $resource('http://192.168.43.249:3000/app/'+service+'/:param/:param2');
      return $resource('http://taximae.herokuapp.com/app/'+service+'/:param/:param2');
      //return $resource('http://192.168.0.104:3000/app/'+service+'/:param/:param2');
      //return $resource('http://192.168.1.208:3000/app/'+service+'/:param/:param2');
    }
  };
})
//Utilidades
.factory('Utilities', function() {  
  
  return {
    getTimes: function(num) {
      return new Array(parseInt(num));
    }
  }
})
//almacena en memoria las solicitudes
.factory('Request', function() {
  var requests = null;
  
  //loadRequests();
  return {
    uploadRequests: function(reqs){requests = reqs;},
    updateRequests: function(){return requests;},
    find: function(id){
      result = {};
      angular.forEach(requests, function (request) {
        if (request.id == id) {
          result = request;
        };
      });
      return result;
    }
  }
})
//Servicio para guardar objetos en el local storage
.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    delObject: function(key){
      $window.localStorage.removeItem(key);
    }
  }
}])
//Servicio para mostrar mensajes en pantalla
.factory('Loading', function($ionicLoading,$timeout) {
  return {
  	show: function() {
	    $ionicLoading.show({
	      template: 'Loading...'
	    });
	  },
	  hide: function(){
	    $ionicLoading.hide();
	  },
	  showText: function(text){
		  $ionicLoading.show({
	      template: text
	    });
	  },
    hideTimeout: function(){
      $timeout(function() {
        $ionicLoading.hide();
      }, 2000);
    },
    hideSetTimeout: function(time){
      $timeout(function() {
        $ionicLoading.hide();
      }, time);
    }   
	};
});