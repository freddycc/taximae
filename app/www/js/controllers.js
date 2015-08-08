angular.module('taximae.controllers', [])

.controller('AppCtrl', function($scope,$state,
                                $ionicModal, $ionicPopup, AuthService, 
                                AUTH_EVENTS, Rest,Loading,USER_ROLES) {
  $scope.username = AuthService.username();
  $scope.user = {service_type:'TXRJ', payment_method:'ALL', vehicle_type:'AUT'};
  //Evento para notificar acceso no autorizado
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'No autorizado!',
      template: 'No tienes acceso a este servicio.'
    });
  });
  
  //Evento para notificar sesion inactiva
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Inicie session!',
      template: 'Debes iniciar session para accesar.'
    });
  });
 //Se agrega el usuario actual
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
  
  // Se crea el modal login
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  //Cerrar modal login 
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  //abrir modal login
  $scope.login = function() {
    $scope.modal.show();
  };
  //Hacer login
  $scope.doLogin = function(data) {
    Loading.showText('Ingresando...');
    AuthService.login(data.username, data.password).then(function(authenticated) {
      $scope.closeLogin();

      $scope.isTaxi();
      $scope.isClient();
      $scope.setCurrentUsername(data.username);
      Loading.hide();
      
      window.location='#app/welcome';
      window.location.reload();
    }, function(err) {
      Loading.hide();
      var alertPopup = $ionicPopup.alert({
        title: '¡No se pudo iniciar!',
        template: 'Por favor verifique su usuario y contraseña.',
         buttons: [
          {text: 'Aceptar', 
          type: 'button-positive'}
          ]
      });
    });
  };
  //Cerrar sesion
  $scope.logout = function() {
    AuthService.logout();
    window.location='#app/welcome';
    window.location.reload();
  };
  //Muestra plantilla de Registro de usuario
  $scope.toRegister = function(){
    $scope.closeLogin();
    window.location = '#/app/register';
  };
  //Registrar
  $scope.register = function(){
    if (validateUsername($scope.user.username)){ 
      Loading.showText('Registrando...');
      if($scope.user.isTaxi){
        $scope.user.user_type = USER_ROLES.taxi;
      }else{
        $scope.user.user_type = USER_ROLES.client;
      }
      $scope.user.security = 'f';
      var UserService = Rest.getService('user');
      var post = new UserService($scope.user);
      post.$save(function(u, putResponseHeaders) {
        Loading.hide();
        console.log(u);
        console.log(putResponseHeaders);
        Loading.showText('Registrado. Inicie session!');
        $state.go('app.welcome');
        Loading.hideTimeout();
      }, function(err){
        Loading.hide();
        if (err.data.saved) {
          var alertPopup = $ionicPopup.alert({
            title: '¡Usuario existente!',
            template: 'Este nombre de usuario ya existe.',
             buttons: [
              {text: 'Aceptar', 
              type: 'button-positive'}
              ]
          });
        };
      });
      console.log('Registrando información...');
      console.log($scope.user);
    }else{
      var alertPopup = $ionicPopup.alert({
        title: '¡Nombre de usuario incorrecto!',
        template: 'El nombre de usuario debe ser sin espacios en blanco.',
         buttons: [
          {text: 'Aceptar', 
          type: 'button-positive'}
          ]
      });
      $scope.user.username = '';
    }
  };
  //Validador de rol taxista
  $scope.isTaxi = function(){
    if (AuthService.role()==USER_ROLES.taxi) {
      return true;
    }else{
      return false;
    }
  };
  //Validador de rol cliente
  $scope.isClient = function(){
    if (AuthService.role()==USER_ROLES.client) {
      return true;
    }else{
      return false;
    }
  };
  function validateUsername(username){
    if (username.indexOf(' ')<0) {
      return true;
    }else{
      return false;
    }
  }
})
//controlador para configuración de distancias de rango
.controller('ConfigCtrl', function($scope, $stateParams) {
})
//Controlador para la lista de solicitudes
.controller('RequestsCtrl', function($scope, Request, Rest, AuthService, Loading) {
  var RequestService = Rest.getService('request');
  
  $scope.requests = [];
  //Consultar lista de solicitudes
  function updateRequests(){
    Loading.showText('Cargando solicitudes.');
    result = RequestService.get({param: AuthService.getId()}, function(){
      Request.uploadRequests(result.request);
        $scope.requests = Request.updateRequests();
        Loading.hide();
      }, function(){
        Loading.hide();
        Loading.hideTimeout();
      });
  }
  //Leer solicitudes
  function loadRequests(){
    if (Request.updateRequests() == null) {
      updateRequests();
    }else{
      $scope.requests = Request.updateRequests();
    }
  }
  loadRequests();
  //Actualizar lista de solicitudes
  $scope.doRefresh = function() {
    updateRequests();

    $scope.$broadcast('scroll.refreshComplete');
    console.log('refreshing...');

  }
})
//Controlador para funciones de una solicitud seleccionada
.controller('RequestCtrl', function($scope, $state, $stateParams, $ionicPopup,Loading,$localstorage,AuthService,Rest) {
  var MessageService = Rest.getService('message');
  var ResponseService = Rest.getService('response');
  var ReportService = Rest.getService('report');
  var RequestService = Rest.getService('request');
  var user_id = AuthService.getId();
  var request_id = $stateParams.requestId;
  $scope.message = {};
  $scope.message.user_id = user_id;
  $scope.message.request_id = request_id;
  $scope.message.message_id = "0";

  $scope.request = {};
  $scope.messages = [];
  $scope.messageList = [];
  $scope.texts = [];
  $scope.report = {detail: '', user_id: user_id, request_id: request_id};

  $scope.time = 30;
  //cargar reportes
  function loadReport(){
    var result = ReportService.get({param:$scope.message.request_id}, function() {
      $scope.report = result;
    }, function(){
      Loading.showText('No se pudo cargar los mensajes.');
      Loading.hideTimeout();
    });
  }
  //cargar solicitud
  function loadRequest(){
    var result = RequestService.get({param:$scope.message.user_id, param2: $scope.message.request_id}, function() {
      $scope.request = result;
    }, function(){
      Loading.showText('No se pudo cargar los mensajes.');
      Loading.hideTimeout();
    });
  }
  //cargar mensajes
  function loadMessages(){

    var messages = MessageService.get({param:$scope.message.user_id, param2: $scope.message.request_id}, function() {
      $scope.messages = messages.conversation;
      $scope.messageList = messages.messages;
      $scope.texts = messages.texts;
    }, function(){
      Loading.showText('No se pudo cargar los mensajes.');
      Loading.hideTimeout();
    });
  }
  loadRequest();
  loadMessages();
  loadReport();
  //Atender solicitud
  $scope.doRequest = function(min){
    Loading.showText('Enviando sugerencia..');

    request = new RequestService({user_id: user_id, request_id: request_id, time: min});
    request.$save({param:user_id}, function(u, putResponseHeaders) {
      
      Loading.hide();
      window.location = '#/app/served';
      window.location.reload();
    }, function(err){
      Loading.hide();
      if(err.data.served){
        Loading.showText('Esta solicitud ya fue atendida. Refresque la lista.');
      }else{
        Loading.showText('No se pudo atender, intentelo luego.');
      }
      Loading.hideTimeout();
    });
  };
  //Agregar mensaje
  $scope.addMessage = function(){
    if ($scope.message.message_id!='0'){
      message = new MessageService($scope.message);
      message.$save(function(u, putResponseHeaders) {
        loadMessages();
      });
    }else{
      Loading.showText('Seleccione un mensage por favor.');
      Loading.hideTimeout();
    }
  };
  $scope.refreshMessages = function(){
    loadMessages();
  }
  //Obtener mensajes
  $scope.getTextMessage = function(id){
    var result = '';
    $scope.texts.forEach(function(message){
      if(id == message.id){
        result = message.message;
      }
    });
    return result;
  };
  //responder a solicitud
  $scope.response = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Responder',
       template: '¿Deseas aceptar el servicio?',
       buttons: [
        { text: 'Cancelar' },
        {text: 'Aceptar', 
        type: 'button-positive',
        onTap: function(e){return true;}}
        ]
     });
     confirmPopup.then(function(res) {
      if(res){
        Loading.showText('Respondiendo...');
        resp = new ResponseService({response: res});
        resp.$save({param:request_id}, function(u, putResponseHeaders) {
          loadRequest();
          Loading.hide();
        }, function(){
          Loading.hide();
          Loading.showText('No se pudo guardar la información, intentelo luego.');
          Loading.hideTimeout();
        });
      }
     });
  };
  //cancelar solicitud
  $scope.cancel = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Cancelar',
       template: '¿Esta seguro de cancelar?',
       buttons: [
        { text: 'No' },
        {text: 'Si', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
      if(res){
        Loading.showText('Cancelando...');
        resp = new ResponseService({cancel: res});
        resp.$save({param:request_id}, function(u, putResponseHeaders) {
          loadRequest();
          Loading.hide();
        }, function(){
          Loading.hide();
          Loading.showText('No se pudo guardar la información, intentelo luego.');
          Loading.hideTimeout();
        });
      }
     });
  };
  //Terminar solicitud
  $scope.finish = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Terminar solicitud',
       template: '¿Esta seguro de terminar la solicitud?',
       buttons: [
        { text: 'No' },
        {text: 'Si', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
      if(res){
        Loading.showText('Terminando...');
        resp = new ResponseService({finish: res});
        resp.$save({param:request_id}, function(u, putResponseHeaders) {
          loadRequest();
          Loading.hide();
        }, function(){
          Loading.hide();
          Loading.showText('No se pudo guardar la información, intentelo luego.');
          Loading.hideTimeout();
        });
      }
     });
  };
  //Enviar reporte a solicitud
  $scope.sendReport = function(){
    $scope.report.request_id = request_id;
    $scope.report.user_id = user_id;
    report = new ReportService($scope.report);
    report.$save(function(u, putResponseHeaders) {
      loadReport();
      console.log('Reporte agregado.');
    }, function(){
      Loading.showText('No se pudo guardar la información, intentelo luego.');
      Loading.hideTimeout();
    });
  }
})
//Controlador para la carga de mapas de google
.controller('MapDetailCtrl', function($scope, $state, $stateParams, Loading,$ionicPopup,Request) {
  Loading.show();
  document.addEventListener("deviceready", function(){
    $scope.request = Request.find($stateParams.request_id);
    $scope.request.distance = 'Calculando distancia...';
    var clientLat = $scope.request.latitud;
    var clientLng = $scope.request.longitud;

    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var map;
    var destination = new google.maps.LatLng(clientLat,clientLng);
    var origin;

    var mapOptions = {
        center: destination,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    var marker = new google.maps.Marker({
      position: destination,
      title:"Cliente",
      map: map,
      animation: google.maps.Animation.DROP
    });

    // Agrega marcador al mapa
    directionsDisplay = new google.maps.DirectionsRenderer();
    navigator.geolocation.watchPosition(function(pos) {
        console.log(pos.coords.latitude);console.log(pos.coords.longitude);
        $scope.request.distance = 'Calculando distancia...';
        origin = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        //map.setCenter(origin);
        var request = {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode["DRIVING"]
        };

        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            $scope.request.distance = response.routes[0].legs[0].distance.text;
            console.log($scope.request.distance);
            directionsDisplay.setDirections(response);
            marker.setMap(null);
          }
        });
      },function(err) {
        marker.setMap(map);
        console.log('ERROR(' + err.code + '): ' + err.message);
        $ionicPopup.alert({
          title: '¿Utilizar la ubicaci&oacute;n?',
          template: 'Esta funci&oacute;n requiere que actives la funci&oacute;n de GPS.',
          buttons: [{text: 'Aceptar', type: 'button-positive'}]
        });
      }, { maximumAge: 5000, enableHighAccuracy: true});
    
    directionsDisplay.setMap(map);

    $scope.map = map;
    Loading.hide();
  }, false);
})
//Controlador para configuración de servicio y rango de alcance
.controller('ServiceConfigCtrl', function($scope, $stateParams, AuthService, Rest, Loading) {
  Loading.showText('Espere por favor');
  $scope.rank = 15;
  $scope.service = {phone: AuthService.getPhone(),isPrivated:AuthService.isPrivated(),service_type:'TXRJ',payment_method:'ALL',vehicle_type:'AUT'};
  var UserService = Rest.getService('user');
  //carga la información del taxista
  var service = UserService.get({param:AuthService.getId()}, function() {
    console.log(service);
    $scope.service.service_type = service.service_type;
    $scope.service.payment_method= service.payment_method;
    $scope.service.vehicle_type= service.vehicle_type;
    Loading.hide();
  }, function(){
    Loading.hide();
    Loading.showText('No se pudo cargar la información, intentelo luego.');
    Loading.hideTimeout();
  });
  //actualiza la información del taxista
  $scope.updateInfo = function(){
    Loading.showText('Guardando');
    console.log($scope.service);
    if ($scope.service.isPrivated) {
      $scope.service.security = 't';
    }else{
      $scope.service.security = 'f';
    }
    var user = new UserService($scope.service);
    user.$save({param:AuthService.getId()}, function(u, putResponseHeaders) {
      Loading.hide();
    }, function(){
      Loading.hide();
      Loading.showText('No se pudo guardar la información, intentelo luego.');
      Loading.hideTimeout();
    });
  }
})
//Controlador de favoritos
.controller('FavoritesCtrl', function($scope,$ionicPopup,$state, $localstorage, Loading, AuthService, Rest, Utilities){
  var TaxisService = Rest.getService('taxis');
  var TaxiService = Rest.getService('taxi');
  var LocationsService = Rest.getService('locations');
  var RequestsService = Rest.getService('request_favorite');
  var user_id = AuthService.getId();
  $scope.newTaxi = {addTaxi: false, alias: '', username: '', user_id: user_id};
  $scope.taxis = [];
  $scope.locations = [];
  $scope.requests = [];
  
  //Carga la lista de taxistas
  function loadTaxistas(){
    var result = TaxisService.get({param:AuthService.getId()}, function() {
      $scope.taxis = result.taxis;
    }, function(){
      Loading.showText('No se pudo cargar los taxistas.');
      Loading.hideTimeout();
    });
  }
  loadTaxistas();

  //Carga la lista de ubicaciones
  function loadLocations(){
    var result = LocationsService.get({param:AuthService.getId()}, function() {
      $scope.locations = result.directions;
    }, function(){
      Loading.showText('No se pudo cargar los taxistas.');
      Loading.hideTimeout();
    });
  }
  loadLocations();

  //Carga la lista de solicitudes favoritas
  function loadRequests(){
    var result = RequestsService.get({param:AuthService.getId()}, function() {
      $scope.requests = result.requests;
    }, function(){
      Loading.showText('No se pudo cargar las solicitudes favoritas.');
      Loading.hideTimeout();
    });
  }
  loadRequests();

   //Guardar taxistas
   $scope.saveTaxi = function(){
      Loading.showText('Guardando');
      taxi = new TaxisService($scope.newTaxi);
      taxi.$save(function(u, putResponseHeaders) {
        Loading.hide();
        $scope.newTaxi.addTaxi = false;
        $scope.newTaxi.alias = '';
        $scope.newTaxi.username = '';
        loadTaxistas();
      }, function(err){
        Loading.hide();
        if(err.data.saved){
          Loading.showText('Este taxista ya existe.');
        }else{
          Loading.showText('No se ha guardado, verifique la informaci&oacute;n e intentelo luego.');
        }
        Loading.hideTimeout();
      });
   };
   //Guardar ubicacion
   $scope.saveLocation = function(){
    $localstorage.set('favoriteLocation', true);
    $state.go('app.location');
   };

   //Crear solicitud con favorito
   $scope.confirmCreateFav = function(request_id) {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Crear solicitud',
       template: '¿Est&aacute;s seguro de crear una solicitud con este favorito?',
       buttons: [
        { text: 'Cancelar' },
        {text: 'Aceptar', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
       if(res) {
         window.location = '#app/home/'+request_id;
         window.location.reload();
       } else {
         console.log('No estás seguro...');
       }
     });
   };

   //Obtiene lista de estrellas
   $scope.getNumber = function(num) {
        return Utilities.getTimes(num);   
   };
   //Refrescar lista de ubicaciones
   $scope.doLocationsRefresh = function(){
    loadLocations();
    $scope.$broadcast('scroll.refreshComplete');
   };
   //Refrescar lista de solicitudes
   $scope.doRequestsRefresh = function(){
    loadRequests();
    $scope.$broadcast('scroll.refreshComplete');
   };
   //Refrescar lista de taxistas
   $scope.doTaxisRefresh = function(){
    loadTaxistas();
    $scope.$broadcast('scroll.refreshComplete');
   };
   //Eliminar un taxista de favoritos
   $scope.confirmDelTaxi = function(id){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Borrar taxista',
       template: '¿Est&aacute;s seguro de borrar este taxista favorito?',
       buttons: [
        { text: 'Cancelar' },
        {text: 'Aceptar', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
       if(res) {
          Loading.showText('Borrando...');
          taxi = new TaxisService({id: id});
          taxi.$save({param:user_id}, function(u, putResponseHeaders) {
            Loading.hide();
            loadTaxistas();
          }, function(err){
            Loading.hide();
            if(!err.data.deleted){
              Loading.showText('Este taxista ya no existe.');
              Loading.hideTimeout();
            }
          });
       } else {
         console.log('No estás seguro...');
       }
     });
   };
   //eliminar una ubicación de favoritas
   $scope.confirmDelLocation = function(id){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Borrar ubicaci&oacute;n',
       template: '¿Est&aacute;s seguro de borrar esta ubicaci&acute;n de favoritos?',
       buttons: [
        { text: 'Cancelar' },
        {text: 'Aceptar', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
       if(res) {
          Loading.showText('Borrando...');
          taxi = new LocationsService({id: id});
          taxi.$save({param:user_id}, function(u, putResponseHeaders) {
            Loading.hide();
            loadLocations();
          }, function(err){
            Loading.hide();
            if(!err.data.deleted){
              Loading.showText('Esta ubicaci&oacute;n ya no existe.');
              Loading.hideTimeout();
            }
          });
       } else {
         console.log('No estás seguro...');
       }
     });
   };

   //eliminar una solicitud de favoritas
   $scope.confirmDelRequest = function(id){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Borrar solicitud',
       template: '¿Est&aacute;s seguro de borrar esta solicitud de favoritos?',
       buttons: [
        { text: 'Cancelar' },
        {text: 'Aceptar', 
        type: 'button-positive',
        onTap: function(e){return true;}}
      ]
     });
     confirmPopup.then(function(res) {
       if(res) {
          Loading.showText('Borrando...');
          taxi = new RequestsService({id: id});
          taxi.$save(function(u, putResponseHeaders) {
            Loading.hide();
            loadRequests();
          }, function(err){
            Loading.hide();
            if(!err.data.deleted){
              Loading.showText('Esta solicitudes ya no existe.');
              Loading.hideTimeout();
            }
          });
       } else {
         console.log('No estás seguro...');
       }
     });
   };
})
//Controlador de inicio
.controller('HomeCtrl', function($scope, $stateParams, $state, $localstorage, AuthService, Rest, Loading, Utilities, $ionicPopup) {
  var TaxisService = Rest.getService('taxis');
  var RequestService = Rest.getService('request');
  $scope.data = {};
  $scope.taxis = [];
  $scope.stars = new Array(5);
  $scope.public = {status: 'stable'};
  $scope.private = {status: 'positive'};
  $scope.request = {inputTaxi: '1', taxi: '', service_type: 'ALL', payment_method: 'ALL', vehicle_type: 'ALL', latitud:0, longitud:0, saveFavorite: false, user_id: AuthService.getId()};
  if ($stateParams.request_id) {
    loadRequest($stateParams.request_id);
  }

  $scope.activeButton = function(val){
    $scope.request.inputTaxi = val;
    if(val=='1'){
      $scope.private.status = 'positive';
      $scope.public.status = 'stable';
    }else{
      $scope.private.status = 'stable';
      $scope.public.status='positive';
      var hideMsgPublic = -1;
      hideList = $localstorage.get('hideMsgPublic', '');
      if (hideList) {
        hideMsgPublic = hideList.indexOf('/'+AuthService.getId()+'/');
      }

      if (hideMsgPublic<0) {
        var myPopup = $ionicPopup.show({
          template: 'Las solicitudes p&uacute;blicas pueden tardar m&aacute;s tiempo en ser atendidas.<ion-checkbox style="border-width: 0px;padding: 10px;padding-left: 60px;background-color: transparent; font-size: 12px;" ng-model="data.showMsg">No volver a mostrar.</ion-checkbox>',
          title: 'Solicitudes p&uacute;blicas',
          scope: $scope,
          buttons: [
            {
              text: 'Aceptar',
              type: 'button-positive',
              onTap: function(e) {
                return $scope.data.showMsg;
              }
            }
          ]
        });
        myPopup.then(function(res) {
          if (res) {
            hideList = $localstorage.get('hideMsgPublic', '');
            if (hideList) {
              $localstorage.set('hideMsgPublic', hideList+'/'+AuthService.getId()+'/');
            }else{
              $localstorage.set('hideMsgPublic', '/'+AuthService.getId()+'/');
            }
            
          };
          console.log('Tapped!', res);
        });
      }
    }
  }
  //Carga lista de taxistas
  function loadTaxistas(){
    var result = TaxisService.get({param:AuthService.getId()}, function() {
      $scope.taxis = result.taxis;
      if ($scope.taxis.length==0) {
        var hideMsgEmptyTaxis = -1;
        hideList = $localstorage.get('hideMsgEmptyTaxis', '');
        if (hideList) {
          hideMsgEmptyTaxis = hideList.indexOf('/'+AuthService.getId()+'/');
        }

        if (hideMsgEmptyTaxis<0) {
          var myPopup = $ionicPopup.show({
            template: 'No tienes taxistas guardados. ¿Desea agregar un nuevo taxista favorito?<ion-checkbox style="border-width: 0px;padding: 10px;padding-left: 60px;background-color: transparent; font-size: 12px;" ng-model="data.showMsgEmtTx">No volver a mostrar.</ion-checkbox>',
            title: 'No tienes taxistas',
            scope: $scope,
            buttons: [
              { text: 'Cancelar',
                onTap: function(e) {
                  return $scope.data.showMsgEmtTx;
                }
              },
              {
                text: 'Aceptar',
                type: 'button-positive',
                onTap: function(e) {
                  return $scope.data.showMsgEmtTx;
                }
              }
            ]
          });
          myPopup.then(function(res) {
            if (res) {
              hideList = $localstorage.get('hideMsgEmptyTaxis', '');
              if (hideList) {
                $localstorage.set('hideMsgEmptyTaxis', hideList+'/'+AuthService.getId()+'/');
              }else{
                $localstorage.set('hideMsgEmptyTaxis', '/'+AuthService.getId()+'/');
              }
              
            };
            console.log('Tapped!', res);
          });
        }
      };
    }, function(){
      Loading.showText('No se pudo cargar los taxistas.');
      Loading.hideTimeout();
    });
  }
  loadTaxistas();
  //cargar solicitud
  function loadRequest(request_id){
    Loading.showText('Cargando solicitud...')
    var result = RequestService.get({param:AuthService.getId(), param2: request_id}, function() {
      $scope.request.payment_method = result.payment_method;
      $scope.request.service_type = result.service_type;
      $scope.request.vehicle_type = result.vehicle_type;
      $scope.request.description = result.description;
      $scope.request.latitud = result.latitud;
      $scope.request.longitud = result.longitud;
      Loading.hide();
    }, function(){
      Loading.showText('No se pudo cargar los mensajes.');
      Loading.hideTimeout();
    });
  }
  //Crea solicitud
  $scope.create = function(){
    $localstorage.setObject('newRequest', $scope.request);
    $scope.request = {inputTaxi: '2', taxi: '', service_type: 'ALL', payment_method: 'ALL', vehicle_type: 'ALL', latitud:0, longitud:0, saveFavorite: false, user_id: AuthService.getId()};
    window.location = "#/app/location";
  }
  //Obtiene numero de estrellas
  $scope.getStarsNumber = function(){
    angular.forEach($scope.taxis, function (taxi) {
      if(taxi.service_id == $scope.request.taxi){
        $scope.stars = Utilities.getTimes(taxi.score);
      }
    });
  }
})
//Controlador de localizaciones
.controller('LocationCtrl', function($scope, $state, Loading, $localstorage, Rest, AuthService){
  var RequestService = Rest.getService('request');
  var LocationsService = Rest.getService('locations');
  var currentPosition = null;
  $scope.marker = null;
  var map = null;
  $scope.favorite = {user_id: AuthService.getId(), alias:'', latitud:0, longitud:0}
  $scope.locations = [];
  $scope.data = {favoriteId:''};

  //Lee las localizaciones favoritas
  function loadLocations(){
    var result = LocationsService.get({param:AuthService.getId()}, function() {
      $scope.locations = result.directions;
    }, function(){
      Loading.showText('No se pudo cargar los taxistas.');
      Loading.hideTimeout();
    });
  }
  loadLocations();

  //Validador de guardar favorito
  $scope.saveFavorite = function(){
    return $localstorage.get('favoriteLocation', false);
  }

  //Guardar localización
  $scope.saveLocation = function(){
      Loading.showText('Guardando');
      $scope.favorite.latitud = $scope.marker.getPosition().lat();
      $scope.favorite.longitud = $scope.marker.getPosition().lng();
      favorite = new LocationsService($scope.favorite);
      favorite.$save(function(u, putResponseHeaders) {
        Loading.hide();        
      }, function(err){
        console.log(err);
        Loading.hide();
        if (err.data.saved) {
          Loading.showText('Esta ubicaci&oacute;n ya existe.');
        }else{
          Loading.showText('No se pudo guardar, verifique la informaci&oacute;n e intentelo luego.');
        }
        Loading.hideTimeout();
      });
      $localstorage.delObject('favoriteLocation');
      $state.go('app.favorite-location');
   };

  //Solicitar
  $scope.request = function(){
    request = $localstorage.getObject('newRequest');
    request.latitud = $scope.marker.getPosition().lat();
    request.longitud = $scope.marker.getPosition().lng();
    request = new RequestService(request);
    request.$save(function(u, putResponseHeaders){
      Loading.showText('La solicitud se ha creado.');
      Loading.hideTimeout();
      window.location = '#app/home'
      window.location.reload();
    }, function(){
      Loading.showText('La solicitud no pudo ser creada. Revise su conexi&oacute;n');
      Loading.hideTimeout();
      window.location = '#app/home'
      window.location.reload();
    });
    console.log('marker');
    console.log($scope.marker.getPosition().lat());
    console.log($scope.marker.getPosition().lng());
    $localstorage.delObject('newRequest');
  }
  
  // Dispositivo listo
  function onDeviceReady() {
    currentPosition = new google.maps.LatLng(10.3324954,-84.42946099999999);;
    var mapOptions = {
        center: currentPosition,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl:false,
        navigationControlOptions:{style:google.maps.NavigationControlStyle.SMALL}
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.marker = new google.maps.Marker({
      position: currentPosition,
      draggable:true,
      title:"Cliente",
      map: map,
      animation: google.maps.Animation.DROP
    });
    
    if(!$scope.saveFavorite() && $localstorage.getObject('newRequest').latitud){
      setMark($localstorage.getObject('newRequest').latitud, $localstorage.getObject('newRequest').longitud);
    }else{
      $scope.findMe();
    }
  }

  //Burca cliente
  $scope.findMe = function(){
    $scope.data.favoriteId = '';
    Loading.showText('Buscando...');
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    Loading.hideSetTimeout(300000);
  }

  // onSuccess Geolocation
  function onSuccess(position) {
    console.log(position.coords.latitude);console.log(position.coords.longitude);
    setMark(position.coords.latitude, position.coords.longitude);
    Loading.hide();                    
  }

  // onError Geolocation
  function onError(error) {
      console.log('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
      Loading.hide();
  }

  //Agrega marcador a ubicación
  $scope.setLocationMark = function(id){
    var position;
    $scope.locations.forEach(function(location){
      if(id == location.id){
        setMark(location.latitud, location.longitud);
      }
    });
  }

  function setMark(latitud, longitud){
    position = new google.maps.LatLng(latitud, longitud);
    map.setCenter(position);
    $scope.marker.setPosition(position);
    console.log($scope.marker.getPosition().lat());
    console.log($scope.marker.getPosition().lng());
  }
  //onDeviceReady();
  document.addEventListener("deviceready", onDeviceReady, false);
});
