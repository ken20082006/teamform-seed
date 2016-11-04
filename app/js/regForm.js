// inject firebase service
var app = angular.module("regApp", ["firebase"]); 

app.controller("regCtrl", function($scope, $firebaseArray) {


		$scope.input = {
			email: "",
			password: "",
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
			
		firebase.auth().createUserWithEmailAndPassword($scope.input.email,$scope.input.password).catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;

		  return false;
		  // ...
		}).then(function(){
			
			$scope.accInfo.$add($scope.input);
		});
		}

	}
);


