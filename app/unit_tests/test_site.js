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
		/*it('logout()', function() {
			scope.logout();
			
		});*/

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
		/*it('getUserInfo(email)', function() {
			
			expect(ctrl.getUserInfo("std@test.com")).toEqual("std@test.com");
		});*/

		//isLogined()
		/*it('isLogined()', function() {
			
			expect(scope.isLogined()).toEqual("");
		});*/

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
	/*	it('redirect()', function() {
			scope.role=1;
			expect(ctrl.redirect()).toEqual(null);
		});*/
		it('updateRole()', function() {
			scope.updateRole();
		});
		
		it('fileNameChanged ()', function() {
		
			var ele={files:[{"type":"abcdef"}]};;
			scope.fileNameChanged(ele);
			ele={files:[{"type":"image/"}]};
			scope.fileNameChanged(ele);
		});
		it('createCourse  ()', function() {
			scope.createCourse ();
			scope.courseInfo.title="aa";
			scope.courseInfo.message="aa";
			scope.courseInfo.date="aa";
			scope.courseInfo.max=3;
			scope.courseInfo.min=1;
			scope.createCourse ();
		});
		
		it('validInput()', function() {
			scope.courseInfo.title="";
			expect(ctrl.validInput()).toEqual(false);
			scope.courseInfo.title="aa";
			scope.courseInfo.message="aa";
			scope.courseInfo.date="aa";
			scope.courseInfo.max=3;
			scope.courseInfo.min=4;
			expect(ctrl.validInput()).toEqual(false);
			scope.courseInfo.min=1;
			expect(ctrl.validInput()).toEqual(true);
		});

		it('initDatePicker()', function() {
			ctrl.initDatePicker();

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
		
		it('should call loadcourses()', function() {
			ctrl.loadcourses();
			scope.course=["a"];
			ctrl.loadcourses();
			expect(scope.courseArray).toBeDefined();
		});
		it('should call teamChecking()', function() {

			var key="data";
			expect(ctrl.teamChecking(key)).toEqual(true);
			scope.team={"abc":"123"};
			expect(ctrl.teamChecking(key)).toEqual(true);
			scope.team={"data":"123"};
			expect(ctrl.teamChecking(key)).toEqual(false);
		});
		
		it('should call updateRole()', function() {
			scope.updateRole();
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
		
		it('should call createTeam ()', function() {
			scope.createTeam();
			scope.newTeam.name="1";
			scope.newTeam.description="ff";
			scope.createTeam();
		});
		
		
		it('should call createTeamForm ()', function() {
			scope.createTeamForm();
		});
		
		it('should call loadExistedTeam ()', function() {
			ctrl.loadExistedTeam();
		});
		
		it('should call joinRequest ()', function() {
			scope.joinRequest (1,"abc");
		});

		it('should call removeRequest ()', function() {
			scope.removeRequest (1,"abc");
		});
		
		it('should call requestValidCheck ()', function() {
			ctrl.requestValidCheck (1,"abc");
		});
		
		it('should call updateRole()', function() {
			scope.updateRole();
		});
		

		it('should call gup()', function() {
			expect(ctrl.gup("c","www.123.com?c=234")).toEqual("234");
			ctrl.gup("c");
		});
		
		it('should call validCheck()', function() {
			scope.newTeam.name="";
			expect(ctrl.validCheck()).toEqual(false);
			scope.newTeam.name="1";
			scope.newTeam.description="ff";
			expect(ctrl.validCheck()).toEqual(true);
		});
		
		it('should call removeElementFromArrayByValue()', function() {
				var arr=["key","abc"];
				ctrl.removeElementFromArrayByValue("key",arr);
				expect(arr.length).toEqual(1);
		});
		
				
		it('should call deleteAllJoinRequestFromTeam()', function() {
				scope.ckey="aa";
				var newUserData={"request":{"aa":["a"]}};
				ctrl.deleteAllJoinRequestFromTeam(newUserData);

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
		it('removeImg ()', function() {
			scope.removeImg();
	
		});
		it('fileNameChanged ()', function() {
		
			var ele={files:[{"type":"abcdef"}]};;
			scope.fileNameChanged(ele);
			ele={files:[{"type":"image/"}]};
			scope.fileNameChanged(ele);
		});
		it('should call updateUserList()', function() {
			var newTeamData={};
			newTeamData.member=["a","b"];
			newTeamData.request=["a","b"];
			ctrl.updateUserList(newTeamData);
		});
		
		it('should call requestHandler()', function() {
			
			scope.joinedTeam.key="a";
			scope.requestHandler(0,0,"a","a");
			scope.requestHandler(1,1,"a","a");
		});
		
		
		
		it('should call deleteMember()', function() {
			
			scope.joinedTeam.leaderID="a";
			scope.deleteMember(0,"a","b");
			scope.deleteMember(0,"c","b");
			scope.deleteMember(1,"c","b");

		});
		
		it('should call deleteTeam()', function() {
			scope.joinedTeam.key="abc";
			scope.deleteTeam();
		});
		
		it('should call quitTeam()', function() {
			scope.joinedTeam.key="abc";
			scope.email="asd";
			scope.quitTeam();
		});
		
		
		it('should call updateRole()', function() {
			scope.updateRole();
		});
		
		it('should call deleteAllWaitingList()', function() {
			ctrl.deleteAllWaitingList();
			scope.lastestWaitingList=["abc"];
			ctrl.deleteAllWaitingList();
		});
		it('should call deleteAllTeamMember()', function() {
			scope.lastestTeamMember=["abc"];
			ctrl.deleteAllTeamMember();
		});
	
		it('should call removeElementFromArrayByValue()', function() {
			var arr=["key","abc"];
			ctrl.removeElementFromArrayByValue("key",arr);
			expect(arr.length).toEqual(1);
		});

		it('should call removeUserList()', function() {
			var arr=[{"key":"abc"},{"abc":"key"}];
			ctrl.removeUserList(arr,"abc");
			expect(arr.length).toEqual(1);
			var arr2=[{"key":"1"}];
			ctrl.removeUserList(arr2,"abc");
		});

		it('should call userObjectArrayPush()', function() {
			
			ctrl.userObjectArrayPush("abc",[]);
		});
		it('should call renderTeamInfo()', function() {
			
			scope.team={"a":"f"};
			scope.ckey="a";
			ctrl.renderTeamInfo();
		});
		it('should call roleAccessCheck()', function() {
			scope.role="0";
			scope.currCourse.key="a";
			scope.team={"a":"b"};
			ctrl.roleAccessCheck();
			scope.role="1";
			scope.currCourse.owner="a";
			scope.email="a";
			ctrl.roleAccessCheck();
		});
		
		it('should call gup()', function() {
			expect(ctrl.gup("c","www.123.com?c=234")).toEqual("234");
			ctrl.gup("c");
		});
		it('should call validInput()', function() {
			expect(ctrl.validInput()).toEqual(false);
			scope.currCourse.title="123";
			scope.currCourse.message="123";
			expect(ctrl.validInput()).toEqual(true);
		});
		it('should call editCourse ()', function() {
			scope.editCourse(); 
			scope.currCourse.title="123";
			scope.currCourse.message="123";
			scope.editCourse(); 
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
		it('should call removeElementFromArrayByValue()', function() {
			var arr=["key","abc"];
			ctrl.removeElementFromArrayByValue("key",arr);
			expect(arr.length).toEqual(1);
		});
		it('should call initTagList()', function() {

			ctrl.initTagList();

		});	
		
		it('should call updateRole()', function() {

			scope.updateRole();

		});	

				
		it('should call removeTag()', function() {

			scope.addedTags=["a","b"];
			scope.removeTag("a");

		});	
		
		it('should call addTag()', function() {
			scope.addTag();
		});	
		
		it('should call initAutoComplete()', function() {
			ctrl.initAutoComplete();
		});	

		it('should call loadUserData()', function() {
			scope.key="a";
			scope.loadUserData();
		});	
		
		it('should call validInput()', function() {
			scope["currUser"]={"a":"a"};
			ctrl.validInput();
			scope["currUser"]={"userName":"123"};
			ctrl.validInput();
			scope.password="a";
			ctrl.validInput();
		});	
		
		it('should call editProfile()', function() {
			scope["currUser"]={"userName":"123"};
			scope.editProfile();
			scope["currUser"]={"a":"a"};
			scope.editProfile();
		});	
   });
   