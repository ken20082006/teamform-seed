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
		
		//$scope.updataEmail=function()
		it('should get email for global value', function() {
			scope.updataEmail();
			
			expect(scope.email).toEqual("");
			expect(scope.userName).toEqual("");
			expect(scope.role).toEqual("");
			
		});
		
		//logout()
		it('logout()', function() {
			scope.logout();
			
		});

   });
   
	
	
   //dashBoardCtrl
   describe('dashBoardCtrl', function() {

		var ctrl, scope,firebaseArray;
		var email="std@test.com";
		var user;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('dashBoardCtrl', {$scope: scope,user:user});
			});
		});
		
		//isLogined()
		it('getUserInfo(email)', function() {
			
			expect(ctrl.getUserInfo("std@test.com")).toEqual("std@test.com");
		});

		//isLogined()
		it('isLogined()', function() {
			
			expect(scope.isLogined()).toEqual("");
		});

   });
   
      //createCoursesCtrl
   describe('createCoursesCtrl', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('createCoursesCtrl', {$scope: scope});
			});
		});

		//redirect()
		it('redirect()', function() {
			scope.role=1;
			expect(ctrl.redirect()).toEqual(null);
		});

   });
   
      //indexCtrl
   describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('indexCtrl', {$scope: scope});
			});
		});


		it('should call updateEmail()', function() {
		});

   });
   
   //teamSearchCtrl
   describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('teamSearchCtrl', {$scope: scope});
			});
		});


		it('should call updateEmail()', function() {
		});

   });
   
   
   //teamPanelCtrl
   describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('teamPanelCtrl', {$scope: scope});
			});
		});


		it('should call updateEmail()', function() {
		});

   });
   
   //myProfileCtrl
   describe('updataEmailCall from global to local test', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('myProfileCtrl', {$scope: scope});
			});
		});


		it('should call updateEmail()', function() {
		});

   });
   