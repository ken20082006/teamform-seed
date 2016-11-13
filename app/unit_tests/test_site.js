describe('global.js', function() {
	
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
	
	
	//createCoursesCtrl test
	
	//function redirect()
   describe('redirect', function() {

		var windowObj = {location: {href: ''}};
		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('createCoursesCtrl', {$scope: scope});
			});
		});


		it('if role !=1 should redirect to index', function() {
			scope.role=0;
			
			scope.redirect();	
			
			expect(windowObj.location.href).toEqual('/login.html');
		});

   });
	

});