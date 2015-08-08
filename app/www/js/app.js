// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('taximae', ['ionic', 'taximae.factories', 'taximae.services', 'taximae.controllers','taximae.directives'])
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.constant('USER_ROLES', {
  taxi: 'taxi_role',
  client: 'client_role'
})
.run(function($ionicPlatform,$localstorage, $rootScope, $state, AuthService, AUTH_EVENTS,USER_ROLES) {

  $ionicPlatform.ready(function() {
    /*if(window.plugins && window.plugins.AdMob) {
      var admob_key = device.platform == "Android" ? "ca-app-pub-2293539674825533/6533346007" : "ca-app-pub-2293539674825533/6533346007";
      var admob = window.plugins.AdMob;
      admob.createBannerView( 
          {
              'publisherId': admob_key,
              'adSize': admob.AD_SIZE.BANNER,
              'bannerAtTop': false
          }, 
          function() {
              admob.requestAd(
                  { 'isTesting': false }, 
                  function() {
                      admob.showAd(true);
                  }, 
                  function() { console.log('failed to request ad'); }
              );
          }, 
          function() { console.log('failed to create banner view'); }
      );
    }*/
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    
    if(next.name !== 'app.location'){
      $localstorage.delObject('favoriteLocation');
    }

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login'&&next.name !== 'app.about'
        &&next.name !== 'app.register'&&next.name !== 'app.welcome') {
        event.preventDefault();
        $state.go('app.welcome');
      }
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, USER_ROLES) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })
  .state('app.welcome', {
    url: "/welcome",
    views: {
      'menuContent': {
        templateUrl: "templates/welcome.html",
        controller: 'AppCtrl'
      }
    }
  })
  .state('app.register', {
    url: "/register",
    views: {
      'menuContent': {
        templateUrl: "templates/register.html",
        controller: 'AppCtrl'
      }
    }
  })
  // RUTA A LA LISTA DE SOLICITUDES
  .state('app.requests', {
      url: "/requests",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/private-requests.html",
          controller: 'RequestsCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  // RUTA A UNA SOLICITUD
  .state('app.request', {
    url: "/requests/:requestId",
    views: {
      'menuContent': {
        templateUrl: "templates/taxis/request.html",
        controller: 'RequestCtrl'
      }
    },
    data: {
      authorizedRoles: [USER_ROLES.taxi]
    }
  })
  // RUTA A LA LISTA DE SOLICITUDES POR HACER
  .state('app.public-requests', {
      url: "/public",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/public-requests.html",
          controller: 'RequestsCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  .state('app.public-request', {
      url: "/public/:requestId",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/request.html",
          controller: 'RequestCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  .state('app.requests-served', {
      url: "/served",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/requests-served.html",
          controller: 'RequestsCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  .state('app.request-served', {
      url: "/served/:requestId",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/request-served.html",
          controller: 'RequestCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  // 
  .state('app.config-range', {
      url: "/config-range",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/config-range.html",
          controller: 'ConfigCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  .state('app.map-detail', {
      url: "/map-detail/:request_id",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/map-detail.html",
          controller: 'MapDetailCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  .state('app.edit-service', {
      url: "/edit-service",
      views: {
        'menuContent': {
          templateUrl: "templates/taxis/edit-service-information.html",
          controller: 'ServiceConfigCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.taxi]
      }
    })
  /******************* Rutas para usuarios regulares ****************************/
  .state('app.home', {
      cache: false,
      url: "/home",
      views: {
        'menuContent': {
          templateUrl: "templates/client/home.html",
          controller: 'HomeCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.home-favorite', {
      cache: false,
      url: "/home/:request_id",
      views: {
        'menuContent': {
          templateUrl: "templates/client/home.html",
          controller: 'HomeCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.client-requests', {
      url: "/client-request",
      views: {
        'menuContent': {
          templateUrl: "templates/client/requests.html",
          controller: 'RequestsCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.client-request', {
      url: "/client-request/:requestId",
      views: {
        'menuContent': {
          templateUrl: "templates/client/request.html",
          controller: 'RequestCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.location', {
      url: "/location",
      views: {
        'menuContent': {
          templateUrl: "templates/client/location.html",
          controller: 'LocationCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.about', {
      url: "/about",
      views: {
        'menuContent': {
          templateUrl: "templates/about.html",
          controller: 'AppCtrl'
        }
      }
    })
  .state('app.favorite-taxi', {
      url: "/favorite-taxi",
      views: {
        'menuContent': {
          templateUrl: "templates/client/favorite-taxi.html",
          controller: 'FavoritesCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.favorite-location', {
      cache: false,
      url: "/favorite-location",
      views: {
        'menuContent': {
          templateUrl: "templates/client/favorite-location.html",
          controller: 'FavoritesCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    })
  .state('app.favorite-requests', {
      url: "/favorite-requests",
      views: {
        'menuContent': {
          templateUrl: "templates/client/favorite-requests.html",
          controller: 'FavoritesCtrl'
        }
      },
      data: {
        authorizedRoles: [USER_ROLES.client]
      }
    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/welcome');
});
