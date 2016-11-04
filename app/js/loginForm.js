// inject firebase service
var app = angular.module("loginApp", ["firebase"]); 

app.controller("loginCtrl", function($scope, $firebaseArray) {

	
	function isLogined()
		{
			firebase.auth().onAuthStateChanged(function(user) {
			  if (user) {
				// User is signed in.
			//	alert("login successed");
				  window.location = "usr/index.html";
			  }
			  else
			  {
				//  alert("not logined")
			  }
			});
		}
		
		var init=function()
		{
			isLogined();
		};
		init();
		
		$scope.input = {
			email: "",
			password: "",
		}
		// sync with firebaseArray
		var ref = firebase.database().ref("loginApp");
		$scope.accInfo = $firebaseArray(ref);
		
		var auth= $firebaseArray(ref);
		
		$scope.login = function() {
			firebase.auth().signInWithEmailAndPassword($scope.input.email,$scope.input.password).catch(function(error) {
				
			  // Handle Errors here.
			  var errorCode = error.code;
			  var errorMessage = error.message;
			  if (errorCode === 'auth/wrong-password') {
				alert('Wrong password.');
			  } else {
				alert(errorMessage);
			  }
			  return false;
			  // ...
			}).then(function(){
				
				isLogined();
				
			});
			
		}

	}
);


