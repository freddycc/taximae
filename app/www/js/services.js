angular.module('taximae.services', [])
.service('AuthService', function($q, $http, $state, USER_ROLES, Rest) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var LOCAL_CONTACT_KEY = 'yourPhoneKey';
  var username = '';
  var isAuthenticated = false;
  var role = '';
  var user_id = '';
  var authToken;
  var phone = '';
  var privated = false;

  //Cargar credenciales del dispositivo 
  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    var contact = window.localStorage.getItem(LOCAL_CONTACT_KEY);
    if (!contact) {contact = ' .f'};
    if (token) {

      useCredentials(token,contact);
    }
    
  }
  //guardar las credenciales en el dispositivo
  function storeUserCredentials(token,contact) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    window.localStorage.setItem(LOCAL_CONTACT_KEY, contact);
    useCredentials(token,contact);
    
  }
  //Carga las credenciales
  function useCredentials(token,contact) {
    username = token.split('.')[0];
    user_id = token.split('.')[1];
    role = token.split('.')[2];
    phone = contact.split('.')[0];
    if(contact.split('.')[1]=='t'){
      privated = true;
    }
    isAuthenticated = true;
    authToken = token;
    // Agrega token al header
    $http.defaults.headers.common['X-Auth-Token'] = token;
  }
  //destruir credenciales de usaurio
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    window.localStorage.removeItem(LOCAL_CONTACT_KEY);
  }
  //Ejecuta login
  var login = function(username, pw) {
    return $q(function(resolve, reject) {
      var SessionService = Rest.getService('session');
      var session = new SessionService({username: username, password: pw});
      session.$save(function(u, putResponseHeaders) {
        storeUserCredentials(username + '.' + u.id + '.' + u.user_type, u.phone + '.' + u.security);
        resolve('Login success.');
      },function(){
        reject('Login Failed.');
      });
    });
  };
  //Ejecuta cierre de session
  var logout = function() {
    destroyUserCredentials();
  };
  //VErifica autorización
  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };
  //carga credenciales
  loadUserCredentials();
 
  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;},
    getId: function(){return user_id;},
    getPhone: function(){return phone;},
    isPrivated: function(){return privated;}
  };
});