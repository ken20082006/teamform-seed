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
		$scope.teamList={};
		$scope.requestValid=true;
		
		//recommend team
		//wait for user key
		$(document).ready(function waitForElement(){
					if($scope.user.key != ""){
						$scope.loadTeamData();
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
				$scope.existedTeam=[];
				var courseData=data.val();
				var teamList = courseData.team;
				if(typeof(teamList)!="undefined")
				{
					for(var i=0;i<teamList.length;i++)
					{
						
						var tempTeamList=teamList[i];
						firebase.database().ref("Team/"+tempTeamList).once('value', function(data) {
							var teamData=data.val();
							
							if(typeof(teamData.tags)!="undefined")
							{
								teamData.keys=tempTeamList;
								//console.log(tempTeamList);
								//$scope.existedTeam.push(teamData);
								$scope.existedTeam.push(teamData);
								
							}
						})
					}
						console.log($scope.existedTeam);
						waitForExistedTeam();
				}
	
			});	
		}
		
		function waitForExistedTeam(){
			if($scope.existedTeam != 0){
				
				$scope.recommendList($scope.user,$scope.existedTeam);
			}
			else{
				setTimeout(function(){
					waitForExistedTeam();
				},500);
			}
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
		//	console.log(recommendList);
			
			for(i=0;i<recommendList.length;i++)
			{
				var key=recommendList[i].keys;
				var name=recommendList[i].name;
				var sameTags=recommendList[i].sameTags;
				firebase.database().ref("UserAccount/"+$scope.user.key).once('value', function(data) {
					var userData=data.val();
					//console.log(userData);
					if(typeof(userData.request)!="undefined"&&typeof(userData.request[$scope.ikey])!="undefined")
					{

						if(userData.request[$scope.ikey].indexOf(key)>-1)
						{
								$scope.teamList[key]={"key":key,"name":name,"sameTags":sameTags,"joined":true};
									$scope.$apply();
						}
						else
						{
								$scope.teamList[key]={"key":key,"name":name,"sameTags":sameTags,"joined":false};
									$scope.$apply();
						}
					}
					else
					{
						$scope.teamList[key]={"key":key,"name":name,"sameTags":sameTags,"joined":false};
							$scope.$apply();
					}
				
				});
				
			}
			//console.log("$scope.teamList",$scope.teamList);
			//$scope.$apply();
		}
		
		
		
		
			/*checking list*/
		/*
			join request&&delete request
			1. if has team in that course, redirect to the team panel
			delete request
			2.if not in the request list in that team, update the interface by loading team data again
		*/
		
		$scope.requestValidCheck = function(operation,key)//1 is delete request, 0 is join request
		{
			firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) 
			{
				if(typeof(data.val().team)!="undefined")
				{
					if(data.val().team.hasOwnProperty($scope.ckey))
					{
						alert("You have joined a group alreay");
						$window.location.href="teamPanel.html?c="+$scope.ckey;	
						$scope.requestValid=false;
					}
				}
				if(operation==0&&$scope.requestValid)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) {
						if(typeof(data.val().request)!="undefined")
						{
							if(data.val().request.indexOf($scope.email)>-1)
							{
								alert("you are  in the waiting list already");
								//$scope.loadExistedTeam();
								$scope.loadTeamData();
								$scope.recommendList($scope.user,$scope.existedTeam);
								$scope.requestValid=false;
							}
						}
					});
					
				}
				if(operation==1&&$scope.requestValid)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) {
						if(typeof(data.val().request)!="undefined")
						{
							if(data.val().request.indexOf($scope.email)==-1)
							{
								alert("you are not in the waiting list");
								//$scope.loadExistedTeam();
								$scope.loadTeamData();
								$scope.recommendList($scope.user,$scope.existedTeam);
								$scope.requestValid=false;
							}
						}
						else
						{
							alert("you are not in the waiting list");
						//	$scope.loadExistedTeam();
							$scope.loadTeamData();
							$scope.recommendList($scope.user,$scope.existedTeam);
							$scope.requestValid=false;
						}
					});
				}

			});
		}
		
		/*remove request flow*/
		/*
			1. delete the user email in the  request array in the Team table
			2. delete the team id in specific course array of request object in UserAccount table
			3. set the joined variable be false
		*/
		
		$scope.removeRequest=function(i,key)
		{
			$.when($scope.requestValidCheck(1,key)).done(function() 
			{
				if($scope.requestValid)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) {
						var newTeamData=data.val();
						$scope.removeElementFromArrayByValue($scope.email,newTeamData.request);
						firebase.database().ref("Team/"+key).set(newTeamData);
					});
					firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) {
						var newUserData=data.val();
						$scope.removeElementFromArrayByValue(key,newUserData.request[$scope.ckey]);
						if(typeof(newUserData.request[$scope.ckey])=="undefined")
						{
							if(jQuery.isEmptyObject(newUserData.request))
							{
								delete newUserData["request"];
							}
						}

						firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
					});
					$scope.teamList[key].joined=!$scope.teamList[key].joined;	
				}
				$scope.requestValid=true;
			});

		}
		
		/*join request flow*/
		/*
			1. add the user email in the  request array in the Team table
			2. add the team id in specific course array of request object in UserAccount table
			3. set the joined variable be true
		*/
		
		$scope.joinRequest=function(index,key)
		{

			$.when($scope.requestValidCheck(0,key)).done(function() 
			{
				if($scope.requestValid)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) 
					{
					
						var newTeamData=data.val();
						
						if(typeof(data.val().request)=="undefined")
						{
							var request=[];
							request.push($scope.email);
							newTeamData.request=request;
						}
						else
						{
							newTeamData.request.push($scope.email);
						}
						firebase.database().ref("Team/"+key).set(newTeamData);
					});

					firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data)
					{
						var newUserData=data.val();

						if(typeof(data.val().request)=="undefined")
						{
							var request={};
							var teamArray=[];
							teamArray.push(key);
							request[$scope.currCourse.key]=teamArray;
							newUserData.request=request;
						
						}else
						{					
							if(typeof(newUserData.request[$scope.ckey])=="undefined")
							{
								newUserData.request[$scope.ckey]=[];
							}
							newUserData.request[$scope.ckey].push(key);
						}

						firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
						console.log($scope.teamList);
						$scope.teamList[key].joined=!$scope.teamList[key].joined;
						
					});
			
				}
				$scope.requestValid=true;
			});
			
		}
		
});