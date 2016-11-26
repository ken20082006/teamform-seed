

app.controller("teamSearchCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {

		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		var team = firebase.database().ref("Team");
		$scope.teamInfo = $firebaseArray(team);
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		
		//team filter variables
		$scope.query = {}
		$scope.searchBy = '$'
		$scope.orderProp="name";   
		
		$scope.doRedirect=function(href)
		{
			$window.location.href=href;
		}
	
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
			$scope.course=user.course;
			$scope.team=user.team;
		}
		
		$scope.ckey="";
	
		$scope.currCourse={};
		
		$scope.newTeam=
		{
			name:"",
			description:"",
			leaderID:"",
			member:[],
			courseID:""
		};

		$scope.existedTeam=[];

		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   $scope.loadcoursesInfo();
		});
		
		$scope.requestValid=true;
		
		$scope.inviteRequest=[]
		
		
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
								$scope.loadExistedTeam();
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
								$scope.loadExistedTeam();
								$scope.requestValid=false;
							}
						}
						else
						{
							alert("you are not in the waiting list");
							$scope.loadExistedTeam();
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
					$scope.existedTeam[i].joined=!$scope.existedTeam[i].joined;	
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
						$scope.existedTeam[index].joined=!$scope.existedTeam[index].joined;
					});
			
				}
				$scope.requestValid=true;
			});
			
		}
		
		//function for cutting the parameter from url
		//eg. gup( 'c', 'www.123.com?c=aaa'  ) will return 'aaa'

		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}

		//redirect the page if the course key on url is invalid
		//redirect the page if the user has a team in this course already
		//load the basic info of this course
		$scope.pathStringCheck=function()
		{
			var invalidSet=['.','#','$','[',']'];
			for(i=0;i<invalidSet.length;i++)
			{
				if($scope.ckey.indexOf(invalidSet[i])>-1)
				{
					return true;
				}
			}
			return false;
		}
		
		$scope.loadcoursesInfo=function ()
		{
			
			$scope.ckey=$scope.gup('c', window.location.href);
			
			if($scope.ckey==null||$scope.ckey==""||$scope.pathStringCheck())
			{
				$scope.doRedirect("index.html");		
			}
			else
			{
				if(typeof($scope.team)!="undefined"&&$scope.team.hasOwnProperty($scope.ckey))
				{
					$scope.doRedirect("teamPanel.html?c="+$scope.ckey);			
				}
				else
				{
					firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
						if(data.val()==null)
						{
							console.log("invalid input of course id");
							$scope.doRedirect("index.html");
						}
						else
						{
							$scope.currCourse=data.val();
							$scope.currCourse.key=data.getKey();
							if(data.val().random)
							{
							//	alert("This course will do random team form!");
								$scope.doRedirect("index.html");
							}
							$scope.loadExistedTeam();		
							$scope.loadInviteRequest();					
						}
					});
				}

			}

		}
		
		$scope.deleteAllInviteRequest=function(userData)
		{
			if(typeof(userData.invite)!="undefined"&&typeof(userData.invite[$scope.ckey])!="undefined")
			{
				for(i=0;i<userData.invite[$scope.ckey].length;i++)
				{
					firebase.database().ref("Team/"+userData.invite[$scope.ckey][i]).once('value', function(data) {
						
						var teamData=data.val();
						$scope.removeElementFromArrayByValue($scope.email,teamData.invite);
						firebase.database().ref("Team/"+data.getKey()).set(teamData);		
					});				
				}
			}
		}
		
		$scope.accpetInviteValidCheck=function(teamData,key)
		{
			var maxSize=$scope.currCourse.max;
			var currSize=teamData.member.length;
			if(currSize+1>maxSize)
			{
				alert("The team is full");
			}
			else
			{
				
				teamData.member.push($scope.email);
				firebase.database().ref("Team/"+key).set(teamData).then(function(){
					
					userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data){
						
						var userData=data.val(); 
						$.when($scope.deleteAllInviteRequest(userData)).done(function() 
						{
							$.when($scope.deleteAllJoinRequestFromTeam(userData)).done(function(){
								
								delete userData.invite[$scope.ckey];
								if(jQuery.isEmptyObject(userData.invite))
								{
									delete userData["invite"];
								}
								if(typeof(userData.request)!="undefined"&&typeof(userData.request[$scope.ckey])!="undefined")
								{
									delete userData.request[$scope.ckey];
								}		
								if(jQuery.isEmptyObject(userData.request))
								{
									delete userData["request"];
								}
								if(typeof(userData.team)=="undefined")
								{
									userData.team={};
								}
								userData.team[$scope.ckey]=key;
								firebase.database().ref("UserAccount/"+$scope.key).set(userData).then(function(){
										
									$scope.doRedirect("teamPanel.html?c="+$scope.ckey);	
									
								});
							});						
							
						});
						
						
					});
					
					
				});
			}
			
		}
		
		$scope.inviteHandler=function(operation,key)
		{
			firebase.database().ref("Team/"+key).once('value', function(data) {
				var teamData=data.val();
				if(typeof(teamData.invite)!="undefined")
				{
					if(teamData.invite.indexOf($scope.email)>-1)
					{
						if(operation==0)
						{
							$scope.accpetInviteValidCheck(teamData,key);
						}
						else
						{
							$scope.removeElementFromArrayByValue($scope.email,teamData.invite);
							firebase.database().ref("Team/"+key).set(teamData).then(function(){
								
								userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data){
								
									var userData=data.val();
									$scope.removeElementFromArrayByValue($scope.email,userData.invite[$scope.ckey]);
									if(jQuery.isEmptyObject(userData.invite))
									{
										delete userData["invite"];
									}
									firebase.database().ref("UserAccount/"+$scope.key).set(userData).then(function(){
										
										$scope.loadInviteRequest();	
									});
								
								});
							})
			
						}
					}
					else
					{
						alert("you are not in the invite list");
						$scope.loadInviteRequest();					
					}

				}
				else
				{
					alert("you are not in the invite list");
					$scope.loadInviteRequest();	
				}

			});
			
		}
		
		$scope.teamObjectPushToArray=function(key,arr)
		{
			firebase.database().ref("Team/"+key).once('value', function(data) {
				arr.push({"key":data.getKey(),"data":data.val()});
			});
			
		}
		
		$scope.loadInviteRequest=function()
		{
			var tmpTeam=[];
				userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data){
					
					var userData=data.val();
					if(typeof(userData.invite)!="undefined")
					{
						if(userData.invite.hasOwnProperty($scope.ckey))
						{
							for(i=0;i<userData.invite[$scope.ckey].length;i++)
							{
								$scope.teamObjectPushToArray(userData.invite[$scope.ckey][i],tmpTeam);
							}
						}
					}
					
				});
				$scope.inviteRequest=tmpTeam;
		}
		
		//load the created team
		 $scope.loadExistedTeam=function()
		{
			var tmpTeam=[];
			
			firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
				
				if(typeof(data.val().team)!="undefined")
				{
					
					for(i=0;i<data.val().team.length;i++)
					{			
						
						firebase.database().ref("Team/"+data.val().team[i]).once('value', function(data) {
							if(typeof(data.val().request)!="undefined")
							{
								if(data.val().request.indexOf($scope.email)>-1)//if current user's email is in team request array, mark it as joined
								{		
									tmpTeam.push({"key":data.getKey(),"data":data.val(),"joined":true});		
								}
								else
								{
									tmpTeam.push({"key":data.getKey(),"data":data.val(),"joined":false});	
								}
							}
							else
							{
								tmpTeam.push({"key":data.getKey(),"data":data.val(),"joined":false});	
							}							
						});
	
					}
					$scope.existedTeam=tmpTeam;
				}
	
			});
	
		}
		//call out the team create form
		$scope.createTeamForm=function()
		{
			$("#teamForm").find('input[type="text"]').val('');
			$("#teamForm").find('textarea').val('');
			$.fancybox.open("#teamForm");	
		}
		
		//check if any essentail input is missed on the team create form
		 $scope.validCheck=function()
		{
			
			if($scope.newTeam.name.trim()!=""&&$scope.newTeam.description.trim()!="")
			{
				return true;
			}
			return false;
		}
		
		 $scope.removeElementFromArrayByValue=function(value,array)
		{
			array.splice(array.indexOf(value), 1);
		}
		
		//delete all the join requests of a course of a user
		 $scope.deleteAllJoinRequestFromTeam=function(newUserData)
		{
			if(typeof(newUserData.request)!="undefined"&&typeof(newUserData.request[$scope.ckey])!="undefined")
			{
				for(i=0;i<newUserData.request[$scope.ckey].length;i++)
				{
					firebase.database().ref("Team/"+newUserData.request[$scope.ckey][i]).once('value', function(data) {
						var newTeamData=data.val();
						$scope.removeElementFromArrayByValue($scope.email,newTeamData.request);
						firebase.database().ref("Team/"+data.getKey()).set(newTeamData);
					});
				}
			}		
		}
		/*crate team flow */
		/*
			1.add a new entry in the Team table
			2.add the team key in the specific course array of team object in UserAccount Table
			3.delete all the team id in specific course array of request object in UserAccount Table ie. the waiting join request
			4.add the key id in team array in courses table
		*/
		$scope.createTeam=function()
		{

			if($scope.validCheck())
			{

				$scope.newTeam.leaderID=$scope.email;
				$scope.newTeam.member.push($scope.email);
				$scope.newTeam.courseID=$scope.currCourse.key;

				$scope.teamInfo.$add($scope.newTeam).then(function(data)
				{
					var teamKey=data.getKey();
					
					userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data)
					{
						//var newUserData=data.val();
						var userData=data.val();				
						
						//insert pt
						
						$.when($scope.deleteAllInviteRequest(userData)).done(function() 
						{
							$.when($scope.deleteAllJoinRequestFromTeam(userData)).done(function(){
								
								if(typeof(userData.invite)!="undefined"&&typeof(userData.invite[$scope.ckey])!="undefined")
								{
									delete userData.invite[$scope.ckey];
								}
								if(jQuery.isEmptyObject(userData.invite))
								{
									delete userData["invite"];
								}
								if(typeof(userData.request)!="undefined"&&typeof(userData.request[$scope.ckey])!="undefined")
								{
									delete userData.request[$scope.ckey];
								}		
								if(jQuery.isEmptyObject(userData.request))
								{
									delete userData["request"];
								}
								if(typeof(userData.team)=="undefined")
								{
									userData.team={};
								}
								userData.team[$scope.ckey]=teamKey;
								firebase.database().ref("UserAccount/"+$scope.key).set(userData).then(function(){
										
									firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
									
										var newCourseData=data.val();
										if(typeof(newCourseData.team)=="undefined")
										{
											newCourseData.team=[];
										}
										newCourseData.team.push(teamKey);
										firebase.database().ref("courses/"+$scope.ckey).set(newCourseData).then(function(){
											$window.location.href="teamPanel.html?c="+$scope.ckey;
										});
									});
									
								});
							});						
							
						});
						
					});
				});
			}
			else
			{
				alert("some data missed");
			}
			
		}
				
});
