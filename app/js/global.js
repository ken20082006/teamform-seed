// inject firebase service
var app = angular.module("teamforming", ["firebase"]); 


app.value('user', {
    email: '',
	role:'',
	userName:'',
	key:'',
	course:[],
	team:[]
});

app.controller("wrapperCtrl", function($scope,$rootScope,user) {
		
			$rootScope.$on("updataEmailCall", function(){
			   $scope.updataEmail();
				$rootScope.$emit("updateRole", {});
			});
						
			$rootScope.$on("updateUserName", function()
			{
				$scope.userName=user.userName;
				$scope.$apply();

			});
			
			$scope.updataEmail=function()
			{
				$scope.email=user.email;
				$scope.userName=user.userName;
				$scope.role=user.role;
				
			}
			$scope.logout = function() {
				firebase.auth().signOut().then(function() {
				  console.log('Signed Out');
				}, function(error) {
				  console.error('Sign Out Error', error);
				});
			window.location = "login.html";
			}
			
});
app.controller("dashBoardCtrl", function($scope,$rootScope,user, $firebaseArray) {

		// sync with firebaseArray
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);

		function getUserInfo(email)
		{	

			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{

				//set user email to global
				user.email=data.val().email;
				user.role=data.val().role;
				user.userName=data.val().userName;
				user.key=data.getKey();
				user.course=data.val().course;
				user.team=data.val().team;
				
				$rootScope.$emit("updataEmailCall", {});	
				
				if(user.role=="0")
				{
					console.log("you are logined as studnet");
				}
				else
				{
					console.log("you are logined as teacher");	
				}
			});

		}
	
		function isLogined()
		{	
			firebase.auth().onAuthStateChanged(function(user) {
			  if (user) 
			  {
				// User is signed in.
				getUserInfo(user.email);

			  }
			  else
			  {
				  window.location = "login.html";
			  }
			});
		}
		
		var init=function()
		{
			isLogined();
		};
		init();
		
	});
	
app.controller("createCoursesCtrl", function($scope,$rootScope,user, $firebaseArray) {
		
		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courses = $firebaseArray(courses);
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		function redirect()
		{
			if($scope.role!="1")
			{
				 window.location = "index.html";
			}
			
		}
		
		function initDatePicker()
		{
			$('#datepicker').datepicker({
				format: 'dd/mm/yyyy',
				startDate: '-0d'
			});
		}
		
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
		}
	
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
				redirect();
				initDatePicker();
		});
		

		/*create course functions*/
		
		File.prototype.convertToBase64 = function(callback){
			var reader = new FileReader();
			reader.onload = function(e) {
				 callback(e.target.result)
			};
			reader.onerror = function(e) {
				 callback(null);
			};        
			reader.readAsDataURL(this);
		};
		
		$scope.fileNameChanged = function (ele) 
		{
		  var file = ele.files[0];
		  if(file.type.length>0&&file.type.substr(0,5)=="image")
		  {
				file.convertToBase64(function(base64){
				$scope.courseInfo.image=base64;
				$scope.fileName=file.name;
				$('#base64PicURL').attr('src',base64);
				$('#base64Name').html(file.name);
				$('#removeURL').show();
				$('#profilePic').val('');
			}); 
			  	  
		  }
		  else
		  {
			  alert("invliad file format");
			  $scope.removeImg();
			  $('#profilePic').val('');
		  }


		}
		
		$scope.courseInfo=
		{
			title:"",
			image:"image/grey.png",
			owner:"",
			message:"",
			max:"",
			min:"",
			date:""
		}
		$scope.fileName;
		
		$scope.removeImg=function(){
		
			$('#removeURL').hide();
			$('#base64Name').html('');
			$scope.courseInfo.image='image/grey.png';
			$scope.fileName='';
			$('#base64PicURL').attr('src','');

		}
		
		function validInput()
		{
			if($scope.courseInfo.title==""||$scope.courseInfo.message==""||$scope.courseInfo.min==""||$scope.courseInfo.max==""||$scope.courseInfo.date=="")
			{
				alert("some missing data");
				return false;
			}
			if($scope.courseInfo.min>$scope.courseInfo.max)
			{
				alert("min should be small than max");
				return false;
			}
			return true;	
		}
		
		$scope.createCourse = function() {
			var isError=false;
			if(validInput())
			{
				$scope.courseInfo.owner=$scope.email;
			
				$scope.courses.$add($scope.courseInfo).then(function(){
					var courseArray=[];
					courses.orderByChild("owner").equalTo($scope.email).on("child_added", function(data)
					{
						courseArray.push(data.getKey());

						firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) {
				
							var newUserData=data.val();
							newUserData.course=courseArray;
							firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
						});						
						isError=false;
					});

				}, function(error) {
				  isError=true;
				  alert("some error occur");
				  console.error(error);
				}).then(function(){
					
					if(!isError)
					{
						 window.location = "index.html";
					}			
				});		
				
			}

		}

	});
	
	
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
			   loadcourses();
		});
		
		
		//redirect the page when user click on "view detail"
		//student without team -> teamsearch
		//others -> teampannel
		
		function teamChecking(key)
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

			if(user.role=="0" && teamChecking(key))
			{
				$window.location.href="teamSearch.html?c="+key;
				
			}else
			{
				$window.location.href="teamPanel.html?c="+key;
			}
			
		}
		
		function loadcourses()
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
});



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
			   loadcoursesInfo();
		});
		
		$scope.requestValid=true;
		
		function requestValidCheck(operation,key)//1 is delete request, 0 is join request
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
				if(operation==1)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) {
						if(typeof(data.val().request)!="undefined")
						{
							if(data.val().request.indexOf($scope.email)==-1)
							{
								alert("you are not in the waiting list");
								loadExistedTeam();
								$scope.requestValid=false;
							}
						}
						else
						{
							alert("you are not in the waiting list");
							loadExistedTeam();
							$scope.requestValid=false;
						}
					});
				}

			});
		}
		
		
		$scope.removeRequest=function(i,key)
		{
			$.when(requestValidCheck(1,key)).done(function() 
			{
				if($scope.requestValid)
				{
					firebase.database().ref("Team/"+key).once('value', function(data) {
						var newTeamData=data.val();
						removeElementFromArrayByValue($scope.email,newTeamData.request);
						firebase.database().ref("Team/"+key).set(newTeamData);
					});
					firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) {
						var newUserData=data.val();
						removeElementFromArrayByValue(key,newUserData.request[$scope.ckey]);
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
		
		
		$scope.joinRequest=function(index,key)
		{

			$.when(requestValidCheck(0,key)).done(function() 
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

		function gup( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}

		
		function loadcoursesInfo()
		{
			
			$scope.ckey=gup('c', window.location.href);
			
			if($scope.ckey==null||$scope.ckey=="")
			{
				$window.location.href="index.html";		
			}
			else
			{
				if(typeof($scope.team)!="undefined"&&$scope.team.hasOwnProperty($scope.ckey))
				{
					$window.location.href="teamPanel.html?c="+$scope.ckey;			
				}
				else
				{
					firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
						if(data.val()==null)
						{
							console.log("invalid input of course id");
							$window.location.href="index.html";
						}
						else
						{
							$scope.currCourse=data.val();
							$scope.currCourse.key=data.getKey();
							loadExistedTeam();							
						}
					});
				}

			}

		}
		
		
		function loadExistedTeam()
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
								if(data.val().request.indexOf($scope.email)>-1)
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
		
		$scope.createTeamForm=function()
		{
			$("#teamForm").find('input[type="text"]').val('');
			$("#teamForm").find('textarea').val('');
			$.fancybox.open("#teamForm");	
		}
		
		function validCheck()
		{
			
			if($scope.newTeam.name.trim()!=""&&$scope.newTeam.description.trim()!="")
			{
				return true;
			}
			return false;
		}
		function removeElementFromArrayByValue(value,array)
		{
			array.splice(array.indexOf(value), 1);
		}
		
		function deleteAllJoinRequestFromTeam(newUserData)
		{
			for(i=0;i<newUserData.request[$scope.ckey].length;i++)
			{
				firebase.database().ref("Team/"+newUserData.request[$scope.ckey][i]).once('value', function(data) {
		
					var newTeamData=data.val();
					removeElementFromArrayByValue($scope.email,newTeamData.request);
					console.log("newTeamData ",newTeamData)
					firebase.database().ref("Team/"+data.getKey()).set(newTeamData);
				});
			}
			
		}
		
		$scope.createTeam=function()
		{
			if(validCheck())
			{

				$scope.newTeam.leaderID=$scope.email;
				$scope.newTeam.member.push($scope.email);
				$scope.newTeam.courseID=$scope.currCourse.key;

				$scope.teamInfo.$add($scope.newTeam).then(function(data)
				{
					var teamKey=data.getKey();
					
					userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data)
					{
						var newUserData=data.val();
						if(typeof(newUserData.team)=="undefined")
						{
							newUserData.team={};
						}
						newUserData.team[$scope.ckey]=teamKey;
						if(typeof(newUserData.request)!="undefined"&&typeof(newUserData.request[$scope.ckey])!="undefined")
						{
							$.when(deleteAllJoinRequestFromTeam(newUserData)).done(function() 
							{
								delete newUserData.request[$scope.ckey]
								if(jQuery.isEmptyObject(newUserData.request))
								{
									delete newUserData["request"];
								}
								firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
							});
						}
						else
						{
							firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
						}
	
						
						firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
						
							var newCourseData=data.val();
							if(typeof(newCourseData.team)=="undefined")
							{
								newCourseData.team=[];
							}
							newCourseData.team.push(teamKey);
							firebase.database().ref("courses/"+$scope.ckey).set(newCourseData);
						}).then(function(){
						
						$window.location.href="teamPanel.html?c="+$scope.ckey;
					});

					});

	
				});
			}
			else
			{
				console.log("some data missed");
			}
			
		}
				
});



app.controller("teamPanelCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {
		
		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);

	
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
			$scope.course=user.course;
			$scope.team=user.team;
		}
	
		$scope.currCourse={};		
		$scope.joinedTeam={};
		$scope.teamMember=[];
		$scope.waitingList=[];
		$scope.lastestTeamMember=[];
		$scope.lastestWaitingList=[];
		$scope.ckey;
		
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   loadcoursesInfo();
			   
		});
		

		
		$scope.quitTeam=function()
		{
			firebase.database().ref("Team/"+$scope.joinedTeam.key).once('value', function(data) 
			{
				var newTeamData=data.val();		
				removeElementFromArrayByValue($scope.email,newTeamData.member);
				firebase.database().ref("Team/"+$scope.joinedTeam.key).set(newTeamData);
			});
			userAccount.orderByChild("email").equalTo($scope.email).on("child_added", function(data)
			{
				var newUserData=data.val();	
				delete newUserData.team[$scope.ckey];
				if(jQuery.isEmptyObject(newUserData.team))
				{
					delete newUserData["team"];
				}
				firebase.database().ref("UserAccount/"+data.getKey()).set(newUserData).then(function()
				{		
					$window.location.href="index.html";		
				});
			});
			
		}
		
		function deleteAllWaitingList()
		{
			
			if(typeof($scope.lastestWaitingList)!="undefined")
			{
				
				for(i=0;i<$scope.lastestWaitingList.length;i++)
				{
					var email=$scope.lastestWaitingList[i];
					userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
					{
						$scope.requestHandler(1,1,email,data.getKey());
					});
				}
			}
		
		}
		
		function deleteAllTeamMember()
		{
			for(i=0;i<$scope.lastestTeamMember.length;i++)
			{
				var email=$scope.lastestTeamMember[i];
				userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
				{
					$scope.deleteMember(1,email,data.getKey());
				});
			}
		}
		
		$scope.deleteTeam=function()
		{

			firebase.database().ref("Team/"+$scope.joinedTeam.key).once('value', function(data) {


				for(i=0;i<data.val().member.length;i++)
				{
					$scope.lastestTeamMember.push(data.val().member[i]);
				}
				if(typeof(data.val().request)!="undefined")
				{
					for(i=0;i<data.val().request.length;i++)
					{
						$scope.lastestWaitingList.push(data.val().request[i]);
					}
				}

			}).then(function(){
				
				
				$.when(deleteAllTeamMember()).done(function(){
					$.when(deleteAllWaitingList()).done(function() 
					{
						firebase.database().ref("Team/"+$scope.joinedTeam.key).remove();
						firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) 
						{
							var newCourseData=data.val();		
							removeElementFromArrayByValue($scope.joinedTeam.key,newCourseData.team);
							firebase.database().ref("courses/"+$scope.ckey).set(newCourseData);
						}).then(function(){
							$window.location.href="index.html";		
						}); 
					});

				});
				
		
			});
			
		}
		
		$scope.deleteMember=function(operation,email,memberID)
		{

			if(operation==0&&$scope.joinedTeam.leaderID==email)
			{
				alert("you can't delete the owner")
			}
			else
			{
				if(operation==0)
				{
					firebase.database().ref("Team/"+$scope.joinedTeam.key).once('value', function(data) 
					{
						var newTeamData=data.val();		
						removeElementFromArrayByValue(email,newTeamData.member);
						firebase.database().ref("Team/"+$scope.joinedTeam.key).set(newTeamData);
					});
				}

				firebase.database().ref("UserAccount/"+memberID).once('value', function(data) 
				{
					var newUserData=data.val();
					delete newUserData.team[$scope.ckey];
											
					if(jQuery.isEmptyObject(newUserData.team))
					{
						delete newUserData["team"];
					}
					
					firebase.database().ref("UserAccount/"+memberID).set(newUserData);
					
				});	
				if(operation==0)
				{
					removeUserList($scope.teamMember,memberID);
				}
				
			}

		}
		
		$scope.requestHandler=function(operation,type,email,waitingID)
		{
				
			firebase.database().ref("Team/"+$scope.joinedTeam.key).once('value', function(data) 
			{
				var newTeamData=data.val();		
				console.log("newTeamData ",newTeamData);
				firebase.database().ref("courses/"+$scope.ckey).once('value', function(data)
				{
				
					if(operation==0)
					{
						console.log("accept");									
						var maxSize=data.val().max;
						$scope.currCourse.max=maxSize;
						var memberNumber=newTeamData.member.length;
						if(memberNumber+1<=maxSize)
						{
	
							newTeamData.request.splice(newTeamData.request.indexOf(email), 1);
							newTeamData.member.push(email);
							firebase.database().ref("Team/"+$scope.joinedTeam.key).set(newTeamData);


							firebase.database().ref("UserAccount/"+waitingID).once('value', function(data) 
							{
								var newUserData=data.val();
								removeElementFromArrayByValue($scope.joinedTeam.key,newUserData.request[$scope.ckey]);
								if(typeof(newUserData.team)=="undefined")
								{
									newUserData.team={};
								}
								newUserData.team[$scope.ckey]=$scope.joinedTeam.key
								
								
								if(typeof(newUserData.request!="undefined"))
								{
									console.log(newUserData.request);
									for(i=0;i<newUserData.request[$scope.ckey].length;i++)
									{
										firebase.database().ref("Team/"+newUserData.request[$scope.ckey][i]).once('value', function(data) {

											var newTeamData=data.val();
											removeElementFromArrayByValue(newUserData.email,newTeamData.request);
											firebase.database().ref("Team/"+data.getKey()).set(newTeamData);
											
										});
									}
								}
								delete newUserData.request[$scope.ckey];
								if(jQuery.isEmptyObject(newUserData.request))
								{
									delete newUserData["request"];
								}
								firebase.database().ref("UserAccount/"+waitingID).set(newUserData);
							});				

						}
						else
						{
							alert("exceed max limitation");
						}

						
						updateUserList(newTeamData);
							
					}
					else
					{
						console.log("Decline");

						removeElementFromArrayByValue(email,newTeamData.request);
						firebase.database().ref("Team/"+$scope.joinedTeam.key).set(newTeamData);				
						
						firebase.database().ref("UserAccount/"+waitingID).once('value', function(data) 
						{
							var newUserData=data.val();		
							removeElementFromArrayByValue($scope.joinedTeam.key,newUserData.request[$scope.ckey]);
							firebase.database().ref("UserAccount/"+waitingID).set(newUserData);
						});

						if(type==0)
						{
							updateUserList(newTeamData);
						}

					}
				});
			});
		}
		

		function updateUserList(newTeamData)
		{
			var tmpMember=[];
			var tmpWaiting=[];
			for(i=0;i<newTeamData.member.length;i++)
			{
				userObjectArrayPush(newTeamData.member[i],tmpMember);
			}
			$scope.teamMember=tmpMember;
			if(typeof(newTeamData.request.length)!="undefined")
			{
				for(i=0;i<newTeamData.request.length;i++)
				{
					userObjectArrayPush(newTeamData.request[i],tmpWaiting);
				}
			}

			$scope.waitingList=tmpWaiting;
		}
		
		function removeUserList(array,userID)
		{
			for(i=0;i<array.length;i++)
			{
				if(array[i].key==userID)
				{
					array.splice(i, 1);
					break;
				}
			}
		}
		
		
		function removeElementFromArrayByValue(value,array)
		{
			array.splice(array.indexOf(value), 1);
		}
		
		function userObjectArrayPush(email,array)
		{
			userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
			{
				array.push({"key":data.getKey(),"data":data.val()});
			});
				
		}
		
		
		function renderTeamInfo()
		{
			firebase.database().ref("Team/"+$scope.team[$scope.ckey]).once('value', function(data) {
	
				$scope.joinedTeam=data.val();
				$scope.joinedTeam.key=data.getKey();
				if($scope.joinedTeam.leaderID==$scope.email)
				{
					$scope.isOwner=true;
				}
				else
				{
					$scope.isOwner=false;
				}
				
				console.log("$scope.isOwner",$scope.isOwner);
				
				for(i=0;i<$scope.joinedTeam.member.length;i++)
				{
					
					userObjectArrayPush($scope.joinedTeam.member[i],$scope.teamMember);
				}
				if(typeof($scope.joinedTeam.request)!="undefined")
				{
					for(i=0;i<$scope.joinedTeam.request.length;i++)
					{

						userObjectArrayPush($scope.joinedTeam.request[i],$scope.waitingList);
					}
				}

				
			});
			
		}
		
		function roleAccessCheck()
		{
			if($scope.role=="0")
			{
				if(typeof($scope.team)=="undefined"||!$scope.team.hasOwnProperty($scope.currCourse.key) )
				{
					console.log("no team in this course");
					$window.location.href="index.html";
				}
				renderTeamInfo();
			}
			else
			{
				if($scope.currCourse.owner!=$scope.email)
				{
					console.log("you are teacher but not the course owner");
					$window.location.href="index.html";
				}
			}
		
		}

		function gup( name, url ) {
			if (!url) url = location.href;
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( url );
			return results == null ? null : results[1];
		}

		
		function loadcoursesInfo()
		{
			$scope.ckey=gup('c', window.location.href);
			
			if($scope.ckey==null||$scope.ckey=="")
			{
				$window.location.href="index.html";		
			}
			else
			{
				firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) {
					if(data.val()==null)
					{
						console.log("invalid input of course id");
						$window.location.href="index.html";
					}
					else
					{
						$scope.currCourse=data.val();
						$scope.currCourse.key=data.getKey();
						roleAccessCheck();						
					}
				});

			}

		}
		
		/**********************************teacher update info********************************************************/
		
				
		File.prototype.convertToBase64 = function(callback){
			var reader = new FileReader();
			reader.onload = function(e) {
				 callback(e.target.result)
			};
			reader.onerror = function(e) {
				 callback(null);
			};        
			reader.readAsDataURL(this);
		};
		
		$scope.fileNameChanged = function (ele) 
		{
		  var file = ele.files[0];
		  if(file.type.length>0&&file.type.substr(0,5)=="image")
		  {
				file.convertToBase64(function(base64){
				$scope.courseInfo.image=base64;
				$scope.fileName=file.name;
				$('#base64PicURL').attr('src',base64);
				$('#base64Name').html(file.name);
				$('#removeURL').show();
				$('#profilePic').val('');
			}); 
			  	  
		  }
		  else
		  {
			  alert("invliad file format");
			//  $scope.removeImg();
			  $('#profilePic').val('');
		  }


		}
		
		$scope.courseInfo=
		{
			title:"",
			image:"",
			owner:"",
			message:"",
			max:"",
			min:"",
			date:""
		}
		$scope.fileName;
		
		$scope.removeImg=function(){
		
			$('#removeURL').hide();
			$('#base64Name').html('');
			$scope.courseInfo.image='image/grey.png';
			$scope.fileName='';
			$('#base64PicURL').attr('src','');

		}
		
		function validInput()
		{
			$scope.courseInfo.title=$scope.currCourse.title;
			$scope.courseInfo.message=$scope.currCourse.message;
			$scope.courseInfo.max=$scope.currCourse.max;
			$scope.courseInfo.min=$scope.currCourse.min;
			$scope.courseInfo.date=$scope.currCourse.date;
			$scope.courseInfo.owner=$scope.email;
			if(typeof($scope.courseInfo.image)=="undefined"||$scope.courseInfo.image=="")
			{
				$scope.courseInfo.image='image/grey.png';
			}
			
			if(typeof($scope.courseInfo.title)=="undefined"||typeof($scope.courseInfo.message)=="undefined")
			{
				alert("some missing data");
				return false;
			}
			return true;	
		}
		
		$scope.editCourse = function() {

			if(validInput())
			{
				firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) 
				{
					if(typeof(data.val().team)!="undefined")
					{
						$scope.courseInfo.team=data.val().team;
					}
					
					firebase.database().ref("courses/"+$scope.ckey).set($scope.courseInfo).then(function(){
						
						$window.location.href="index.html";		
						
					});
				});
			
			}else
			{
				alert("some missing data");
			}

		}
		
});


app.controller("myProfileCtrl", function($scope,$rootScope,user, $firebaseArray) {
		
		/*initialzation and checking*/
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
		}
	
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   $scope.loadUserData();
		});
		
		$scope.currUser;
		$scope.password;

		$scope.loadUserData=function()
		{
			firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) 
			{
				$scope.currUser=data.val();				
			});
			
		}

		function validInput()
		{
			if(typeof($scope.currUser.userName)=="undefined"||$scope.currUser.userName.trim()=="")
			{
				alert("some data missed");
				return false;
			}
			if(typeof($scope.password)!="undefined"&&$scope.password!="")
			{
				var user = firebase.auth().currentUser;
				user.updatePassword($scope.password).then(function() {
				}, function(error) 
				{
					alert(error);
					return false;
				});
			}
			return true;
		}

		$scope.editProfile=function()
		{
			if(validInput())
			{
				firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) 
				{
					var newUserData=data.val(); 
					newUserData.userName=$scope.currUser.userName; 
					firebase.database().ref("UserAccount/"+$scope.key).set(newUserData).then(function(){
						user.userName=$scope.currUser.userName;
						
						$rootScope.$emit("updateUserName", function(){});	
						alert("success");
						
					});
				});
			}
		}
		
		
	});