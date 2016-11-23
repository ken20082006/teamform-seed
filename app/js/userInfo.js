	
	
app.controller("userInfoCtrl", function($scope,$rootScope,user, $firebaseArray,$window) {
			
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		//var team = firebase.database().ref("Team");
		//$scope.teamFB=$firebaseArray(team);
		
		$scope.type;
		$scope.ikey;
		$scope.userData;
		
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
		}
	
		$rootScope.$on("updateRole", function(){
			$scope.updateRole();
			$scope.accessValidCheck();
		});
		
		$scope.doRedirect=function(href)
		{
			$window.location.href=href;
		}
		
		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}
		
		$scope.pathStringCheck=function()
		{
			var invalidSet=['.','#','$','[',']'];
			for(i=0;i<invalidSet.length;i++)
			{
				if($scope.ikey.indexOf(invalidSet[i])>-1)
				{
					return true;
				}
			}
			return false;
		}
		
		$scope.accessValidCheck=function()
		{
		
			$scope.ikey=$scope.gup('u', window.location.href);

			if($scope.ikey==null||$scope.ikey==""||$scope.pathStringCheck())
			{
				$scope.doRedirect("index.html");			
			}
			else
			{

				firebase.database().ref("UserAccount/"+$scope.ikey).once('value', function(data) {

					if(data.val()==null)
					{
						$scope.doRedirect("index.html");		
					}
					else
					{
						$scope.userData=data.val();
					}
				});
			}
			
		}
			
});
