var app = angular.module("routeApp", ['ngRoute']);

app.config(function($routeProvider){
   $routeProvider
       .when('/', {
           templateUrl: 'landing.html',
           controller: 'landingCtrl'
       })
       .when('/index',{
           templateUrl: 'landing.html',
           controller: 'landingCtrl'
       })
       .when('/results', {
           templateUrl: 'results.html',
           controller: 'resultsCtrl'
       })
       .when('/about', {
           templateUrl: 'about.html',
           controller: 'aboutCtrl'
       })
       .when('/contact', {
           templateUrl: 'contact.html',
           controller: 'contactCtrl'
       })
       .otherwise({
           redirectTo: '/'
       });
});


app.controller('mainCtrl', function($scope){
});

app.controller('landingCtrl', function($scope){
    click_circle();
});

app.controller('resultsCtrl', function($scope){
    
});

app.controller('aboutCtrl', function($scope){

});

app.controller('contactCtrl', function($scope){

});