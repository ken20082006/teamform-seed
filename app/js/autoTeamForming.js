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
		
		//function to call the autoTeamForming
		$scope.runAutoTeamForming=function(ckey)
		{
			$scope.ckey=ckey;
			//load studentList to $scope
			$scope.loadCourseData(key);
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
				for(i=0;i<courseData.student.length;i++)
				{
					$scope.userObjectArrayPush(courseData.student[i],tmp);
				}
				$scope.studentList=tmp;	

				$scope.maxTeamMember=courseData.max;
				$scope.minTeamMember=courseData.min;

				var teamList = courseData.team;
				
				for(var i=0;teamList.length;i++)
				{
					firebase.database().ref("Team/"+teamList[i]).once('value', function(data) {
						var teamData=data.val();
						
						if(teamData.member.length<$scope.minTeamMember)
						{
							var tempTeam=[];
							tempTeam.name=teamData.name;
							tempTeam.key=teamList[i];
							tempTeam.member=teamData.member;
							$scope.existedTeam.push();
						}
					})
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
		$scope.autoTeamForming=function(studentList,existedTeam,maxTeamMember,minTeamMember)
		{
			
			var formingResult = [];
			var tempTeamList = [];
			//avg number of the member
			var avgTeamMemberNumber = Math.ceil((maxTeamMember+minTeamMember)/2);
			
			//existedTeam case
			if(existedTeam.length>0)
			{
				
				//push the existed team to the temp list
				for(var i=0;existedTeam>0;i++)
				{
					var tempTeam =[];
					tempTeam.name = existedTeam[i].name;
					tempTeam.key = existedTeam[i].key;
					tempTeam.memberNumber = existedTeam[i].member.length;
					tempTeam.newTeamMember = [];
					tempTeamList.push(tempTeam);
				}
				
				
				//random assign students to team
				for(;studentList.length>0 && tempTeamList.length>0;)
				{
					
					//random between temp team
					console.log(tempTeamList);
					var assignTeam = Math.floor((Math.random() * numberOfTeam) + 1);
					console.log(assignTeam);
					tempTeamList[assignTeam-1].newTeamMember.push(studentList.pop().key);
					tempTeamList[assignTeam-1].memberNumber++;
					
					//take out the team if meet the expected team member number
					if(tempTeamList[assignTeam-1].memberNumber>=avgTeamMemberNumber)
					{
						
						formingResult.push( tempTeamList.splice(assignTeam-1, 1));
						
						/*
						//swap the team to last one
						var temp = tempTeamList[assignTeam-1];
						tempTeamList[assignTeam-1] = tempTeamList[tempTeamList.length-1];
						tempTeamList = temp;
						
						//push the finished team to the result
						formingResult.push(tempTeamList.pop());
						
						*/
						numberOfTeam--;
						
					}
					
					
				}
				
				
			}
			
				
			var numberOfTeam = Math.ceil(studentList.length/avgTeamMemberNumber);
			
			//creat team
			for(var i=0;i<numberOfTeam;i++)
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
				console.log(tempTeamList);
				var assignTeam = Math.floor((Math.random() * numberOfTeam) + 1);
				console.log(assignTeam);
				tempTeamList[assignTeam-1].teamMember.push(studentList.pop().key);
				tempTeamList[assignTeam-1].memberNumber++;
				
				//take out the team if meet the expected team member number
				if(tempTeamList[assignTeam-1].memberNumber>=avgTeamMemberNumber)
				{
					
					formingResult.push( tempTeamList.splice(assignTeam-1, 1));
					
					/*
					//swap the team to last one
					var temp = tempTeamList[assignTeam-1];
					tempTeamList[assignTeam-1] = tempTeamList[tempTeamList.length-1];
					tempTeamList = temp;
					
					//push the finished team to the result
					formingResult.push(tempTeamList.pop());
					
					*/
					numberOfTeam--;
					
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
			}else //if student remain assign all of them to the team
			{
				for(var i=0;studentList.length>0;i++)
				{
					tempTeamList[i].teamMember.push(studentList.pop().key);
				}
			}
			
			
			
				console.log(formingResult);
			
			
			
			
		}
	
			
		
});