
app.controller("teamInfoCtrl", function($scope,$rootScope,user, $firebaseArray,$window) {
			
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		
		$scope.type;
		$scope.ikey;
		$scope.teamData;
		$scope.courseData;
		$scope.userData=[];
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
		
		$scope.loadRequiredData=function()
		{
			firebase.database().ref("courses/"+$scope.teamData.courseID).once('value', function(data) {
				$scope.courseData=data.val();
				$scope.$apply();
			});
			for(i=0;i<$scope.teamData.member.length;i++)
			{
				$scope.userObjectArrayPush($scope.teamData.member[i],$scope.userData)
				
			}
		
		}
		
		$scope.userObjectArrayPush=function(email,array)
		{
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				var tmp=data.val();
				if(typeof(tmp.icon)=="undefined")
				{
					tmp.icon="image/usericon.png";
				}

				array.push({"key":data.getKey(),"data":tmp});
			});
				
		}
		
		
		
		$scope.accessValidCheck=function()
		{
		
			$scope.ikey=$scope.gup('t', window.location.href);

			if($scope.ikey==null||$scope.ikey==""||$scope.pathStringCheck())
			{
				$scope.doRedirect("index.html");			
			}
			else
			{

				firebase.database().ref("Team/"+$scope.ikey).once('value', function(data) {

					if(data.val()==null)
					{
						$scope.doRedirect("index.html");		
					}
					else
					{
						$scope.teamData=data.val();
						$scope.loadRequiredData();
					}
				});
			}
			
		}
			
});
