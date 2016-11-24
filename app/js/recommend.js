app.controller("recommendCtrl", function($scope,$rootScope,user,$firebaseArray) {
		
		/*initialzation and checking*/
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		$scope.ikey=$scope.gup('c', window.location.href);
		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}
		
		$scope.user=user;
		$scope.existedTeam = [];
		$scope.studentList = [];
		
		//recommend team
		//wait for user key
		$(document).ready(function waitForElement(){
					if($scope.user.key != ""){
						$scope.loadTeamData();
						
						$scope.recommendList($scope.user,$scope.existedTeam);
					}
					else{
						setTimeout(function(){
							waitForElement();
						},500);
					}
				}
			
		)
	
	
		$scope.userObjectArrayPush=function(email,array)
		{
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				array.push({"key":data.getKey(),"data":data.val()});
			});
				
		}
		
		$scope.loadStudentList=function(key)
		{
			firebase.database().ref("courses/"+key).once('value', function(data) {
				var tmp=[];
				var courseData=data.val();
				for(i=0;i<courseData.student.length;i++)
				{
					$scope.userObjectArrayPush(courseData.student[i],tmp);
				}
				$scope.studentList=tmp;		
			});	
		}
		
		$scope.loadTeamData=function()
		{
			firebase.database().ref("courses/"+$scope.ikey).once('value', function(data) {
				var tmp=[];
				var courseData=data.val();
				
				var teamList = courseData.team;
				for(var i=0;i<teamList.length;i++)
				{
					firebase.database().ref("Team/"+teamList[i]).once('value', function(data) {
						var teamData=data.val();
						
						if(typeof(teamData.tags)!="undefined")
						{
							teamData.keys=teamList[i];
							$scope.existedTeam.push(teamData);
						}
					})
				}
				
			});	
		}
		
		
		//user should be 1 to many in list
		$scope.recommendList = function(user,list)
		{
			
			//cant generate recommendList
			if(typeof(user.tags)=="undefined" || list.length==0)
			{
				return false;
			}
			
			var recommendList = [];
			for(var i=0;i<list.length;i++)
			{
				list[i].sameTags = [];
			}
			
			
			//compare the tags, save the same tags to sameTags to list array 
			for(var i=0;i<user.tags.length;i++)
			{
				for(var j=0;j<list.length;j++)
				{
					for(var k=0;k<list[j].tags.length;k++)
					{
						if(user.tags[i]==list[j].tags[k])
						{
							list[j].sameTags.push(list[j].tags[k]);
						}
					}
				}
			}
			
			for(var i=0;i<list.length;i++)
			{
				if(list[i].sameTags.length>0)
				{
					var temp = [];
					temp.keys=list[i].keys;
					temp.name=list[i].name;
					temp.sameTags=list[i].sameTags;
					recommendList.push(temp);
				}
			}
			recommendList.sort(function(a, b) {
				return parseFloat(b.sameTags.length) - parseFloat(a.sameTags.length);
			});  
			console.log(recommendList);
			
		}
		
});