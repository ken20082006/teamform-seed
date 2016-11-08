// inject firebase service
var app = angular.module("panelApp", ["firebase"]); 

app.controller("panelCtrl", function($scope, $firebaseArray) {

		// sync with firebaseArray
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
	
		var courses = firebase.database().ref("courses");
		$scope.courses = $firebaseArray(courses);
	
		$scope.accountInfo=
		{
			name:"",
			email:"",
			role:""
		
		};
		
		$scope.coursesArray=[];
		
		function loadCreatedCourses(email){

			courses.orderByChild("owner").equalTo(email).on("child_added", function(data){
				
				//$scope.coursesArray.push(JSON.stringify({"key":i,"data":data.val()}));
				$scope.coursesArray.push({"key":data.getKey(),"data":data.val()});

			});

		}
		
		
		function getUserInfo(email)
		{	
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				
				$scope.accountInfo.role=data.val().role;
				$scope.accountInfo.email=data.val().email;
				console.log($scope.accountInfo);
				if($scope.accountInfo.role=="0")
				{
					alert("you are logined as studnet");
				}
				else
				{
					alert("you are logined as teacher");
					loadCreatedCourses($scope.accountInfo.email);
					
				}
			});

		}
	
		function isLogined()
		{
				firebase.auth().onAuthStateChanged(function(user) {
				  if (user) 
				  {
					// User is signed in.
					//alert("login successed");
					getUserInfo(user.email);

				  }
				  else
				  {
					//  alert("not logined");
					  window.location = "../login.html";
				  }
				});
		}
		
		var init=function()
		{
			isLogined();
		};
		init();
		
		
		$scope.logout = function() {
			firebase.auth().signOut().then(function() {
			  console.log('Signed Out');
			}, function(error) {
			  console.error('Sign Out Error', error);
			});
			 isLogined();
		}
		
		
		


		



	}
);


