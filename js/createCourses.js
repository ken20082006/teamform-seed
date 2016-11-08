// inject firebase service
//var app = angular.module("createCoursesApp", ["firebase"]); 

app.controller("createCoursesCtrl", function($scope,$rootScope,user, $firebaseArray) {

		// sync with firebaseArray
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		var courses = firebase.database().ref("courses");
		$scope.courses = $firebaseArray(courses);
	
	/*	$scope.accountInfo=
		{
			name:"",
			email:"",
			role:""
		
		};*/
		
		$scope.courseInfo=
		{
			title:"",
			image:"",
			owner:"",
			message:""
		}
		
		/*function getUserInfo(email)
		{	
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				
				$scope.accountInfo.role=data.val().role;
				$scope.accountInfo.email=data.val().email;
				console.log($scope.accountInfo);
				if($scope.accountInfo.role=="0")
				{
					alert("you are logined as studnet");
					 window.location = "index.html";
				}
				else
				{
					alert("you are logined as teacher");
					
				}
			});

		}*/
		alert(12);
	
		/*function isLogined()
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
		init();*/
		
		
		$scope.createCourse = function() {
	
			$scope.courseInfo.owner=$scope.accountInfo.email;
			console.log($scope.accountInfo.email);
			console.log($scope.courseInfo);
			$scope.courses.$add($scope.courseInfo);
		
		}
		

	});


