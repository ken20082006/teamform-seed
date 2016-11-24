// inject firebase service
var app = angular.module("teamforming", ["firebase"]); 


app.value('user', {
    email: '',
	role:'',
	userName:'',
	key:'',
	course:[],
	team:[],
	tags:[]
});


app.controller("wrapperCtrl", function($scope,$rootScope,user) {
			
			$rootScope.$on("updataEmailCall", function(){
			   $scope.updataEmail();
				$rootScope.$emit("updateRole", {});
			});
						
			
			$scope.updataEmail=function()
			{
				$scope.email=user.email;
				$scope.userName=user.userName;
				$scope.role=user.role;
				$scope.$apply();
			}
			$scope.logout = function() {
				firebase.auth().signOut().then(function() {
				  console.log('Signed Out');
				}, function(error) {
				  console.error('Sign Out Error', error);
				});
			window.location = "login.html";
			}
			
});
app.controller("dashBoardCtrl", function($scope,$rootScope,user, $firebaseArray) {
		// sync with firebaseArray

		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);

		$scope.getUserInfo=function (email)
		{	
			console.log("test");
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{

				//set user email to global
				user.email=data.val().email;
				user.role=data.val().role;
				user.userName=data.val().userName;
				user.key=data.getKey();
				user.course=data.val().course;
				user.team=data.val().team;
				user.tags=data.val().tags;
				
				$rootScope.$emit("updataEmailCall", {});	
				
				if(user.role=="0")
				{
					console.log("you are logined as studnet");
				}
				else
				{
					console.log("you are logined as teacher");	
				}
			});
			
			return false;

		}
	
		$scope.isLogined=function ()
		{	
		
			firebase.auth().onAuthStateChanged(function(user) {
			  if (user) 
			  {
				// User is signed in.
				$scope.getUserInfo(user.email);

			  }
			  else
			  {
				  window.location = "login.html";//redirect to login page if the user is not logined
			  }
			});
		}
		
		$scope.init=function()
		{
			$scope.isLogined();
		};
		$scope.init();
		
	});
	
	
