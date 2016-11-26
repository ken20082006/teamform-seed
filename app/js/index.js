app.controller("indexCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {

		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		var userAccount = firebase.database().ref("UserAccount");
	
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
			$scope.course=user.course;
			$scope.team=user.team;
		}
		$scope.courseArray=[];
	
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   $scope.loadcourses();
		});
		
		$scope.loadcourses=function ()
		{
			if(typeof($scope.course)!="undefined")
			{
				var tmpCourse=[];
				for(i=0;i<$scope.course.length;i++)
				{
					firebase.database().ref("courses/"+$scope.course[i]).once('value', function(data) {
						tmpCourse.push({"key":data.getKey(),"data":data.val()});	
						
					});
				}
				$scope.courseArray=tmpCourse;
			}
		}	
		
		/*****page access control*****/
		
		//redirect the page when user click on "view detail"
		//student without team -> teamsearch
		//others -> teampannel
		
		$scope.teamChecking=function (key)
		{
			if(typeof($scope.team)=="undefined")
			{
				console.log("not hv any team yet");
				return true;
			}
			else
			{
			
				if($scope.team.hasOwnProperty(key) )
				{
					console.log("has team in this course");
					return false;
				}
				else
				{
					console.log("no team in this course");
					return true;
				}
			}
			
		}
		
		$scope.dashBoardChangePage=function(key)
		{

			if(user.role=="0" && $scope.teamChecking(key))
			{
				$scope.doRedirect("teamSearch.html?c="+key);
				
			}else
			{
				$scope.doRedirect("teamPanel.html?c="+key);
			}
			
		}
		
		$scope.doRedirect=function(href)
		{
			$window.location.href=href;
		}
		
	
});

