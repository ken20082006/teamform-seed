// inject firebase service
var app = angular.module("regApp", ["firebase"]); 

app.controller("regCtrl", function($scope, $firebaseArray) {

		$scope.password="";
		
		$scope.input = {
			email: "",
			userName: "",
			role:""
		}
		// sync with firebaseArray
		var ref = firebase.database().ref("UserAccount");
		$scope.accInfo = $firebaseArray(ref);
		
		var auth= $firebaseArray(ref);
		
		$scope.chooseRole=function(type)
		{
			if(type==0)
			{
				$scope.input.role="0";
			}
			else
			{
				$scope.input.role="1";
			}
			
		}
		
		$scope.createUser = function() {
		var isError=false;
		firebase.auth().createUserWithEmailAndPassword($scope.input.email,$scope.password).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		alert(errorMessage);
		  isError=true;
		  // ...
		}).then(function(){
			if(!isError)
			{
				$scope.accInfo.$add($scope.input);
			}
			
		});
		}

	}
);



