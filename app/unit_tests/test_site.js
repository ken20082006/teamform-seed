'use restrict';
var config = {
apiKey: "AIzaSyB6bC90FN323tYhfGdeesZodkj3jEymAMU",
authDomain: "comp3111teamform.firebaseapp.com",
databaseURL: "https://comp3111teamform.firebaseio.com",
storageBucket: "comp3111teamform.appspot.com",
messagingSenderId: "990477328608"
};
firebase.initializeApp(config);


   //wrapperCtrl test
   
   //$rootScope.$on("updataEmailCall", function()
   describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('wrapperCtrl', {$scope: scope});
			});
		});


		it('should call updateEmail()', function() {
			spyOn(scope, 'updataEmail');
			scope.$emit("updataEmailCall", {});	
			
			
			expect(scope.updataEmail).toHaveBeenCalled();
		});

   });
   
	
	//$scope.updataEmail=function()
	describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('wrapperCtrl', {$scope: scope});
			});
		});


		it('should get email for global value', function() {
			scope.updataEmail();
			
			expect(scope.email).toEqual("");
			expect(scope.userName).toEqual("");
			expect(scope.role).toEqual("");
			
		});

   });
   
   //$scope.logout = function()
	describe('updataEmailCall from global to local test', function() {
   });
      
   
   //dashBoardCtrl
   describe('dashBoardCtrl', function(){
	
	var email= "stu@test.com";
	
	beforeEach(function() {
		module('teamforming', 'firebase'); 
		inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			ctrl = $controller('dashBoardCtrl', {$scope: scope});
		});
	});
	
	it('some test desc ...', inject(function ($scope,$rootScope,user, $firebaseArray) {
	
		firebase.initializeApp(config);
		getUserInfo(email);

	}));
	
	
});

   //createCoursesCtrl
   describe('createCoursesCtrl', function(){
	
	beforeEach(function() {
		module('teamforming', 'firebase'); 
		inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			ctrl = $controller('createCoursesCtrl', {$scope: scope});
		});
	});
	
	it('some test desc ...', inject(function ($scope,$rootScope,user, $firebaseArray) {
	
		firebase.initializeApp(config);
		

	}));
	
	
});


   //indexCtrl
   describe('indexCtrl', function(){
	
	beforeEach(function() {
		module('teamforming', 'firebase'); 
		inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			ctrl = $controller('indexCtrl', {$scope: scope});
		});
	});
	
	it('some test desc ...', inject(function ($scope,$rootScope,user, $firebaseArray,$window) {
	
		firebase.initializeApp(config);
		

	}));
	
	
});

   //teamSearchCtrl
   describe('teamSearchCtrl', function(){
	
	beforeEach(function() {
		module('teamforming', 'firebase'); 
		inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			ctrl = $controller('teamSearchCtrl', {$scope: scope});
		});
	});
	
	it('some test desc ...', inject(function ($scope,$rootScope,user, $firebaseArray,$window) {
	
		firebase.initializeApp(config);
		

	}));
	
	
});

   //teamPanelCtrl
   describe('teamPanelCtrl', function(){
	
	beforeEach(function() {
		module('teamforming', 'firebase'); 
		inject(function($rootScope, $controller) {
			scope = $rootScope.$new();
			ctrl = $controller('teamPanelCtrl', {$scope: scope});
		});
	});
	
	it('some test desc ...', inject(function ($scope,$rootScope,user, $firebaseArray,$window) {
	
		firebase.initializeApp(config);
		

	}));
	
	
});
	