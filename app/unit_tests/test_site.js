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
   describe('wrapperCtrl', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('wrapperCtrl', {$scope: scope});
			});
		});

		//$rootScope.$on("updataEmailCall", function()
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
		

   });
   
	
	
   //dashBoardCtrl
   describe('dashBoardCtrl', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('dashBoardCtrl', {$scope: scope});
			});
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
		
		//$rootScope.$on("updateRole", function()
		it('should call updateEmail()', function() {
			
			spyOn(scope, 'updateRole');
			spyOn(scope, 'redirect');
			spyOn(scope, 'initDatePicker');
			scope.$emit("updateRole", {});	
			
			
			expect(scope.updateRole).toHaveBeenCalled();
			expect(scope.redirect).toHaveBeenCalled();
			expect(scope.initDatePicker).toHaveBeenCalled();
		});
		
		//redirect()
		it('redirect()', function() {
			scope.role=1;
			expect(scope.redirect()).toEqual(null);
			scope.role=0;
			spyOn(scope, 'doRedirect');
			scope.redirect();
			expect(scope.doRedirect).toHaveBeenCalled();
		});
		
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
			expect(scope.validInput()).toEqual(false);
			scope.courseInfo.title="aa";
			scope.courseInfo.message="aa";
			scope.courseInfo.date="aa";
			scope.courseInfo.max=3;
			scope.courseInfo.min=4;
			expect(scope.validInput()).toEqual(false);
			scope.courseInfo.min=1;
			expect(scope.validInput()).toEqual(true);
		});

		it('initDatePicker()', function() {
			scope.initDatePicker();

		});
		
		//File.prototype.convertToBase64 = function(callback) function of  convert uploaded image to base64 image
		it('convertToBase64', function() {
			scope.initDatePicker();

		});
		
	});
   
      //indexCtrl
   describe('indexCtrl', function() {

		var ctrl, scope,user;

		beforeEach(function() {
			user={
				email: '',
				role:'',
				userName:'',
				key:'',
				course:[],
				team:[]
			}
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('indexCtrl', {$scope: scope});
			});
		});


		
		//$scope.dashBoardChangePage=function(key)
		it('should do redirect to teamSearch or teamPanel', function() {
			user.role=1;
			spyOn(scope, 'doRedirect');
			scope.dashBoardChangePage("");
			
			expect(scope.doRedirect).toHaveBeenCalled();
			
		});
		
		//$rootScope.$on("updateRole", function()
		it('should call loadcourses() updateRole()', function() {
			
			spyOn(scope, 'updateRole');
			spyOn(scope, 'loadcourses');
			scope.$emit("updateRole", {});	
			
			
			expect(scope.updateRole).toHaveBeenCalled();
			expect(scope.loadcourses).toHaveBeenCalled();
		});
		
		it('should call loadcourses()', function() {
			scope.loadcourses();
			scope.course=["a"];
			scope.loadcourses();
			expect(scope.courseArray).toBeDefined();
		});
		it('should call teamChecking()', function() {

			var key="data";
			expect(scope.teamChecking(key)).toEqual(true);
			scope.team={"abc":"123"};
			expect(scope.teamChecking(key)).toEqual(true);
			scope.team={"data":"123"};
			expect(scope.teamChecking(key)).toEqual(false);
		});
		
		it('should call updateRole()', function() {
			scope.updateRole();
		});

   });
   
   //teamSearchCtrl
   describe('teamSearchCtrl', function() {

		var ctrl, scope;

		beforeEach(function() {
			module('teamforming'); 
			inject(function($rootScope, $controller) {
				scope = $rootScope.$new();
				ctrl = $controller('teamSearchCtrl', {$scope: scope});
			});
		});
		
		//redirect the page if the course key on url is invalid
		//redirect the page if the user has a team in this course already
		//load the basic info of this course
		//$this.loadcoursesInfo=function ()
		it('$this.loadcoursesInfo=function', function() {
			
			scope.ckey="";
			spyOn(scope, 'doRedirect');
			scope.loadcoursesInfo();
			expect(scope.doRedirect).toHaveBeenCalled();
		});
		
		
		//$rootScope.$on("updateRole", function()
		it('should call loadcoursesInfo() updateRole()', function() {
			
			spyOn(scope, 'updateRole');
			spyOn(scope, 'loadcoursesInfo');
			scope.$emit("updateRole", {});	
			
			
			expect(scope.updateRole).toHaveBeenCalled();
			expect(scope.loadcoursesInfo).toHaveBeenCalled();
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
			scope.loadExistedTeam();
		});
		
		it('should call joinRequest ()', function() {
			scope.joinRequest (1,"abc");
		});

		it('should call removeRequest ()', function() {
			scope.removeRequest (1,"abc");
		});
		
		it('should call requestValidCheck ()', function() {
			scope.requestValidCheck (1,"abc");
		});
		
		it('should call updateRole()', function() {
			scope.updateRole();
		});
		

		it('should call gup()', function() {
			expect(scope.gup("c","www.123.com?c=234")).toEqual("234");
			scope.gup("c");
		});
		
		it('should call validCheck()', function() {
			scope.newTeam.name="";
			expect(scope.validCheck()).toEqual(false);
			scope.newTeam.name="1";
			scope.newTeam.description="ff";
			expect(scope.validCheck()).toEqual(true);
		});
		
		it('should call removeElementFromArrayByValue()', function() {
				var arr=["key","abc"];
				scope.removeElementFromArrayByValue("key",arr);
				expect(arr.length).toEqual(1);
		});
		
				
		it('should call deleteAllJoinRequestFromTeam()', function() {
				scope.ckey="aa";
				var newUserData={"request":{"aa":["a"]}};
				scope.deleteAllJoinRequestFromTeam(newUserData);

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


		//redirect the page if the course key on url is invalid
		//redirect the page if the user has a team in this course already
		//load the basic info of this course
		//$this.loadcoursesInfo=function ()
		it('$this.loadcoursesInfo=function', function() {
			
			scope.ckey="";
			spyOn(scope, 'doRedirect');
			scope.loadcoursesInfo();
			expect(scope.doRedirect).toHaveBeenCalled();
		});
		
		//$rootScope.$on("updateRole", function()
		it('should call loadcoursesInfo() updateRole()', function() {
			
			spyOn(scope, 'updateRole');
			spyOn(scope, 'loadcoursesInfo');
			scope.$emit("updateRole", {});	
			
			
			expect(scope.updateRole).toHaveBeenCalled();
			expect(scope.loadcoursesInfo).toHaveBeenCalled();
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
			scope.updateUserList(newTeamData);
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
			scope.deleteAllWaitingList();
			scope.lastestWaitingList=["abc"];
			scope.deleteAllWaitingList();
		});
		it('should call deleteAllTeamMember()', function() {
			scope.lastestTeamMember=["abc"];
			scope.deleteAllTeamMember();
		});
	
		it('should call removeElementFromArrayByValue()', function() {
			var arr=["key","abc"];
			scope.removeElementFromArrayByValue("key",arr);
			expect(arr.length).toEqual(1);
		});

		it('should call removeUserList()', function() {
			var arr=[{"key":"abc"},{"abc":"key"}];
			scope.removeUserList(arr,"abc");
			expect(arr.length).toEqual(1);
			var arr2=[{"key":"1"}];
			scope.removeUserList(arr2,"abc");
		});

		it('should call userObjectArrayPush()', function() {
			
			scope.userObjectArrayPush("abc",[]);
		});
		it('should call renderTeamInfo()', function() {
			
			scope.team={"a":"f"};
			scope.ckey="a";
			scope.renderTeamInfo();
		});
		it('should call roleAccessCheck()', function() {
			scope.role="0";
			scope.currCourse.key="a";
			scope.team={"a":"b"};
			scope.roleAccessCheck();
			scope.role="1";
			scope.currCourse.owner="a";
			scope.email="a";
			scope.roleAccessCheck();
		});
		
		it('should call gup()', function() {
			expect(scope.gup("c","www.123.com?c=234")).toEqual("234");
			scope.gup("c");
		});
		it('should call validInput()', function() {
			expect(scope.validInput()).toEqual(false);
			scope.currCourse.title="123";
			scope.currCourse.message="123";
			expect(scope.validInput()).toEqual(true);
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
			scope.removeElementFromArrayByValue("key",arr);
			expect(arr.length).toEqual(1);
		});
		it('should call initTagList()', function() {

			scope.initTagList();

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
			scope.initAutoComplete();
		});	

		it('should call loadUserData()', function() {
			scope.key="a";
			scope.loadUserData();
		});	
		
		it('should call validInput()', function() {
			scope["currUser"]={"a":"a"};
			scope.validInput();
			scope["currUser"]={"userName":"123"};
			scope.validInput();
			scope.password="a";
			scope.validInput();
		});	
		
		it('should call editProfile()', function() {
			scope["currUser"]={"userName":"123"};
			scope.editProfile();
			scope["currUser"]={"a":"a"};
			scope.editProfile();
		});	
   });
   