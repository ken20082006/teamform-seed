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

		
		$scope.gup=function( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}

		
		//function to call the autoTeamForming
		$scope.runAutoTeamForming=function(operation)//0 is random
		{
			$scope.ckey=$scope.gup('c', window.location.href);
			//load studentList to $scope
			$scope.loadCourseData($scope.ckey);
			
			//start teamforming
			$scope.autoTeamForming($scope.studentList,$scope.existedTeam,$scope.maxTeamMember,$scope.minTeamMember,operation);
		}
		
		//load studentList
		$scope.userObjectArrayPush=function(email,array)
		{
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				array.push({"key":data.getKey(),"data":data.val()});
			});
				
		}
		
		$scope.loadCourseData=function(key)
		{
			firebase.database().ref("courses/"+key).once('value', function(data) {
				var tmp=[];
				var courseData=data.val();
				console.log("courseData",courseData);
				
				for(i=0;i<courseData.student.length;i++)
				{
					$scope.userObjectArrayPush(courseData.student[i],tmp);
				}
				$scope.studentList=tmp;	

				$scope.maxTeamMember=courseData.max;
				$scope.minTeamMember=courseData.min;

				var teamList = courseData.team;
				console.log("teamList",teamList);
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
								tempTeam.key=teamList[i];
								tempTeam.member=teamData.member;
								$scope.existedTeam.push(tempTeam);
								console.log("$scope.existedTeam",$scope.existedTeam);
							}
						})
					}
				}

				
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
			
			var formingResult = [];
			var unteamedStudent	= [];
			var tempTeamList = [];
			//avg number of the member
			var avgTeamMemberNumber = Math.ceil((maxTeamMember+minTeamMember)/2);
			
			
			//existedTeam case
			console.log("existedTeam.length",existedTeam.length);
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
				}
				console.log(tempTeamList);
				
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
			
			console.log(studentList.length);
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
			
				
				console.log(formingResult);
				console.log(unteamedStudent);
		
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
			console.log(formingResult);
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
