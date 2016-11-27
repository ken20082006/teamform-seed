app.controller("autoTeamFormingCtrl", function($scope,$rootScope,user,$firebaseArray) {
		
		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		$scope.ckey="";
		$scope.studentList=[];
		$scope.maxTeamMember;
		$scope.minTeamMember;
		$scope.existedTeam =[];
		$scope.pageList=[];
		
		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}

		
		$scope.autoTrigger=function()
		{
			setTimeout(function()
			{
				
				var date1 = new Date();	
				var oneWeekAgo=date1;
				oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
				var dd = oneWeekAgo.getDate();
				var mm = oneWeekAgo.getMonth()+1; //January is 0!
				var yyyy = oneWeekAgo.getFullYear();
				if(dd<10) {
					dd='0'+dd
				} 
				if(mm<10) {
					mm='0'+mm
				} 
				oneWeekAgo = dd+'/'+mm+'/'+yyyy;
				console.log("oneWeekAgo",oneWeekAgo);
				
				var date2 = new Date();
				var oneDayAgo=date2;
				oneDayAgo.setDate(oneDayAgo.getDate() - 1);
				var dd = oneDayAgo.getDate();
				var mm = oneDayAgo.getMonth()+1; //January is 0!
				var yyyy = oneDayAgo.getFullYear();
				if(dd<10) {
					dd='0'+dd
				} 
				if(mm<10) {
					mm='0'+mm
				} 
				oneDayAgo = dd+'/'+mm+'/'+yyyy;
				console.log("oneDayAgo",oneDayAgo);

				for(i=0;i<$scope.courseFB.length;i++)
				{

						console.log("data",$scope.courseFB[i].date);
						if($scope.courseFB[i].date==oneDayAgo||$scope.courseFB[i].date==oneWeekAgo)
						{
							//$scope.runAutoTeamForming(1,$scope.courseFB[i].$id)
							//window.open("autoTeamFrom.html?c="+$scope.courseFB[i].$id);
								$scope.pageList.push("autoTeamFrom.html?c="+$scope.courseFB[i].$id);
						}

					//console.log($scope.courseFB[i].date);
					//console.log($scope.courseFB[i].$id);
				}
				$scope.loadPageHandler(0);


			},5000);		



		}
		
		$scope.loadPageHandler=function(i)
		{
			setTimeout(function()
			{
				if(i<$scope.pageList.length)
				{
					window.open($scope.pageList[i]);
					$scope.loadPageHandler(i+1);
				}
			},5000*i);
	
		}
		
		$scope.setCourseToAuto=function()
		{
			var tmpKey=$('#courseKey').val();
			setTimeout(function()
			{
				$scope.runAutoTeamForming(1);
			},5000);
			
		}
		
		//function to call the autoTeamForming
		$scope.runAutoTeamForming=function(operation)//0 is random
		{
			//if(typeof(key)=="undefined")
			//{
				$scope.ckey=$scope.gup('c', window.location.href);
			//}
			//else
			//{
				//$scope.ckey=key;
		//	}
			//load studentList to $scope
			$scope.loadCourseData($scope.ckey,operation);

		}
		
		//load studentList
		$scope.userObjectArrayPush=function(email,array,operation)
		{
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				//console.log(data.val());
				if(operation==0)
				{
					array.push({"key":data.getKey(),"data":data.val()});
				}
				else
				{
					if(typeof(data.val().team)=="undefined"||typeof(data.val().team)!="undefined"&&!data.val().team.hasOwnProperty($scope.ckey))
					{
						array.push({"key":data.getKey(),"data":data.val()});
					}
					if(typeof(data.val().team)!="undefined"&&data.val().team.hasOwnProperty($scope.ckey))
					{
						var pos=$scope.teamFB.$indexFor(data.val().team[$scope.ckey]);
						var tmpData=$scope.teamFB[pos];
						var userKey=data.getKey();
						var userData=data.val();
						firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
							var courseData=data.val();
							if(tmpData.member.length<courseData.min)
							{
								array.push({"key":userKey,"data":userData});
							}
							
						});		
					}
				}
			});
				
		}
		
		$scope.loadCourseData=function(key,operation)
		{
			firebase.database().ref("courses/"+key).once('value', function(data) {
				var tmp=[];
				var courseData=data.val();
				//console.log("courseData",courseData);
				
				for(i=0;i<courseData.student.length;i++)
				{
					//get the std without team
					$scope.userObjectArrayPush(courseData.student[i],tmp,operation);
					
				}

				$scope.studentList=tmp;	
				
				
				$scope.maxTeamMember=courseData.max;
				$scope.minTeamMember=courseData.min;

				var teamList = courseData.team;
				if(typeof(teamList)!="undefined")
				{
					for(var i=0;i<teamList.length;i++)
					{
						firebase.database().ref("Team/"+teamList[i]).once('value', function(data) {
							var teamData=data.val();
							if(teamData.member.length<$scope.minTeamMember)
							{
								var tempTeam=[];
								tempTeam.name=teamData.name;
								tempTeam.key=data.getKey();
								tempTeam.member=teamData.member;
								$scope.existedTeam.push(tempTeam);
							}
						})
					}
				}

				
			}).then(function(){
											
				//start teamforming
				$scope.autoTeamForming($scope.studentList,$scope.existedTeam,$scope.maxTeamMember,$scope.minTeamMember,operation);
			});	
		}
		
		
		//studentList:unteam students of the course
		//existedTeam:existedTeam that not fulfill the min requirement
		//all new team if empty 
		//format:{
		//  "key" : "-xxxxxxxxxxxxx",
		//  "member" : [ "std2@test.com", "std3@test.com" ],
		//  "name" : "team2"
		//	}
		//
		//
		//maxTeamMember,minTeamMember: max min team member of the course
		$scope.autoTeamForming=function(studentList,existedTeam,maxTeamMember,minTeamMember,operation)
		{
			for(i=0;i<studentList.length;i++)
			{
				console.log(studentList[i].data.email);
			}
			var formingResult = [];
			var unteamedStudent	= [];
			var tempTeamList = [];
			//avg number of the member
			var avgTeamMemberNumber = Math.ceil((maxTeamMember+minTeamMember)/2);

		
			//existedTeam case
			//console.log("existedTeam.length",existedTeam.length);
			//console.log(existedTeam);
			if(existedTeam.length>0)
			{
				
				//push the existed team to the temp list
				for(var i=0;i<existedTeam.length;i++)
				{
					var tempTeam =[];
					tempTeam.name = existedTeam[i].name;
					tempTeam.key = existedTeam[i].key;
					tempTeam.existedMemberNumber = existedTeam[i].member;
					tempTeam.memberNumber = existedTeam[i].member.length;
					tempTeam.teamMember = [];
					tempTeamList.push(tempTeam);
					for(j=0;j<existedTeam[i].member.length;j++)
					{
						for(k=0;k<studentList.length;k++)
						{
							if(studentList[k].data.email==existedTeam[i].member[j])
							{
								studentList.splice(k, 1);
							}
						}
						
					}
				}
				

				
				var existedTeamNumber=existedTeam.length;
				
				//random assign students to team
				for(;studentList.length>0 && tempTeamList.length>0;)
				{
					
					//random between temp team
					var assignTeam = Math.floor((Math.random() * existedTeamNumber) + 1);
					tempTeamList[assignTeam-1].teamMember.push(studentList.pop().key);
					tempTeamList[assignTeam-1].memberNumber++;
					
					//take out the team if meet the expected team member number
					if(tempTeamList[assignTeam-1].memberNumber>=avgTeamMemberNumber)
					{
						
						formingResult.push( tempTeamList.splice(assignTeam-1, 1));
						
						existedTeamNumber--;
						
					}
					
					
				}
				
			}
			
			//console.log(studentList.length);
			//if reminding student can form one more team
			if(studentList.length>=minTeamMember)
			{
				var numberOfTeam = Math.ceil(studentList.length/avgTeamMemberNumber);
			
				//create team
				for(var i=0;i<numberOfTeam>0;i++)
				{
					var tempTeam =[];
					tempTeam.name = "random team "+(i+1);
					tempTeam.memberNumber = 0;
					tempTeam.teamMember = [];
					tempTeamList.push(tempTeam);
				}
				
				
				//random assign students to team
				for(;studentList.length>0 && tempTeamList.length>0;)
				{
					
					//random between temp team
					var assignTeam = Math.floor((Math.random() * numberOfTeam) + 1);
					tempTeamList[assignTeam-1].teamMember.push(studentList.pop().key);
					tempTeamList[assignTeam-1].memberNumber++;
					
					//take out the team if meet the expected team member number
					if(tempTeamList[assignTeam-1].memberNumber>=avgTeamMemberNumber)
					{
						
						formingResult.push( tempTeamList.splice(assignTeam-1, 1));
						
						numberOfTeam--;
						
					}
					
					
				}
				
			}
			
			
			
			//if no student remain
			if(studentList.length==0)
			{
				//push all team to the result
				for(;tempTeamList.length>0;)
				{
					formingResult.push( tempTeamList.splice(0, 1));
				}
			}
			else //if student remain assign all of them to the team
			{
				var emptyCounter = 0;
				for(var i=0;studentList.length>0 && emptyCounter<formingResult.length;i++)
				{
					if(formingResult[i%formingResult.length][0].memberNumber<maxTeamMember)
					{
						emptyCounter = 0;
						formingResult[i%formingResult.length][0].teamMember.push(studentList.pop().key);
						formingResult[i%formingResult.length][0].memberNumber++;
					}
					else
					{
						emptyCounter++;
					}
					
				}
				
				for(;studentList.length>0;)
				{
					unteamedStudent.push(studentList.pop().key);
				}
					
			}
			
				if(operation==0)
				{
					$scope.randomTeamResultProcess(formingResult);
					$('#randomBtn').hide();
				}
				else
				{
					$scope.autoTeamResultProcess(formingResult);
				}
				
			
		}
		
		
		$scope.autoTeamResultProcess=function(formingResult)
		{
			$scope.convertkeyToEmail(formingResult);
		//	console.log("formingResult",formingResult);
			var randomTeams=[];
			var existTeams=[];
			//console.log(formingResult[1][0].name);

			for(i=0;i<formingResult.length;i++)
			{
				if(typeof(formingResult[i][0].key)=="undefined")
				{
					randomTeams.push(formingResult[i]);
				}
				else
				{
					existTeams.push(formingResult[i])
				}
			}
		//	console.log("randomTeams",randomTeams);
			//console.log("existTeams",existTeams);
			if(randomTeams.length>0)
			{
				$scope.createTeams(randomTeams);	
			}
			if(existTeams.length>0)
			{
				$scope.updateExistedTeam(existTeams);
			}
			setTimeout(function()
			{
				firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
					
					var courseData=data.val();
					for(i=0;i<courseData.team.length;i++)
					{
						$scope.deleteInviteRequestInTeam(courseData.team[i]);
					}
					for(i=0;i<courseData.student.length;i++)
					{
						$scope.deleteInviteRequestInUser(courseData.student[i]);
					}
				});
							setTimeout(function(){close();},10000);
			},8000);

		}
		
		$scope.deleteInviteRequestInTeam=function(key)
		{
			
			firebase.database().ref("Team/"+key).once('value', function(data) {
				var teamData=data.val();
				if(typeof(teamData.request)!="undefined")
				{
					delete teamData['request'];
				}
				if(typeof(teamData.invite)!="undefined")
				{
					delete teamData['invite'];
				}
				firebase.database().ref("Team/"+data.getKey()).set(teamData);
			});
			
		}
		$scope.deleteInviteRequestInUser=function(key)
		{
			userAccount.orderByChild("email").equalTo(key).on("child_added", function(data){
				var userData=data.val();
				if(typeof(userData.request)!="undefined"&&userData.request.hasOwnProperty($scope.ckey))
				{
					delete userData.request[$scope.ckey];
					if(jQuery.isEmptyObject(userData.request))
					{
						delete userData["request"];
					}
				}
				if(typeof(userData.invite)!="undefined"&&userData.invite.hasOwnProperty($scope.ckey))
				{
					delete userData.invite[$scope.ckey];
					if(jQuery.isEmptyObject(userData.invite))
					{
						delete userData["invite"];
					}
				}
				firebase.database().ref("UserAccount/"+data.getKey()).set(userData);
			});
			
			
		}
									
		$scope.updateExistedTeam=function(formingResult)
		{
			for(i=0;i<formingResult.length;i++)
			{
				var teamKey=formingResult[i][0].key;
				firebase.database().ref("Team/"+teamKey).once('value', function(data) {
					var teamData=data.val();
					var key=data.getKey();
					for(j=0;j<formingResult[i][0].teamMember.length;j++)
					{
						teamData.member.push(formingResult[i][0].teamMember[j]);

					}
					firebase.database().ref("Team/"+data.getKey()).set(teamData).then(function()
					{	
						firebase.database().ref("Team/"+data.getKey()).once('value', function(data) {
							var teamData=data.val();
							//console.log("teamData.member",teamData.member);
							for(j=0;j<teamData.member.length;j++)
							{
								if(teamData.member[j]!=teamData.leaderID)
								{
									userAccount.orderByChild("email").equalTo(teamData.member[j]).on("child_added", function(data){
										var userData=data.val();
										if(typeof(userData.team)=="undefined")
										{
											userData.team={};
										}
										userData.team[$scope.ckey]=key;
										firebase.database().ref("UserAccount/"+data.getKey()).set(userData);	
									});
								}							
							}
						});

				

					});	
				});
			}
		}
		
		$scope.convertkeyToEmail=function(formingResult)
		{
			for(i=0;i<formingResult.length;i++)
			{
				for(j=0;j<formingResult[i][0].teamMember.length;j++)
				{
					firebase.database().ref("UserAccount/"+formingResult[i][0].teamMember[j]).once('value', function(data) {
						formingResult[i][0].teamMember[j]=data.val().email;
						
					});
					
				}
			}

	
		}
		
		$scope.assignTeamKey=function(obj)
		{
			firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
				var courseData=data.val();
				if(typeof(courseData.team)=="undefined")
				{
					courseData.team=[];
				}
				courseData.team.push(obj.key);
				courseData.isFormed=true;
				firebase.database().ref("courses/"+$scope.ckey).set(courseData).then(function(){
					
					for(j=0;j<obj.data.member.length;j++)
					{
						userAccount.orderByChild("email").equalTo(obj.data.member[j]).on("child_added", function(data){
							var userData=data.val();
							if(typeof(userData.team)=="undefined")
							{
								userData.team={};
							}
							userData.team[$scope.ckey]=obj.key;
							firebase.database().ref("UserAccount/"+data.getKey()).set(userData);
							
						});
					}
				});
			});
			
			
		}
		
		$scope.createTeams=function(formingResult)
		{
			for(i=0;i<formingResult.length;i++)
			{
				var teamData={"courseID":$scope.ckey,"description":"This is "+formingResult[i][0].name,"member":formingResult[i][0].teamMember,"name":formingResult[i][0].name,"leaderID":formingResult[i][0].teamMember[0]};
				$scope.teamFB.$add(teamData).then(function(data){
					var teamKey=data.getKey();
					var pos=$scope.teamFB.$indexFor(teamKey)
					var tmpData=$scope.teamFB[pos];
					var obj={"data":tmpData,"key":teamKey};
					$scope.assignTeamKey(obj);
					
				});
			}
		}
	

	
		$scope.randomTeamResultProcess=function(formingResult)
		{
			$.when($scope.convertkeyToEmail(formingResult)).done(function() {
				$scope.createTeams(formingResult);
				
			});

		}
		
		
		

		
		
});
