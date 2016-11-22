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
						
			
			$scope.updataEmail=function()
			{
				$scope.email=user.email;
				$scope.userName=user.userName;
				$scope.role=user.role;
				$scope.$apply();
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

		$scope.getUserInfo=function (email)
		{	
			console.log("test");
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
			
			return false;

		}
	
		$scope.isLogined=function ()
		{	
		
			firebase.auth().onAuthStateChanged(function(user) {
			  if (user) 
			  {
				// User is signed in.
				$scope.getUserInfo(user.email);

			  }
			  else
			  {
				  window.location = "login.html";//redirect to login page if the user is not logined
			  }
			});
		}
		
		$scope.init=function()
		{
			$scope.isLogined();
		};
		$scope.init();
		
	});
	
app.controller("createCoursesCtrl", function($scope,$rootScope,user, $firebaseArray) {
	
		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courses = $firebaseArray(courses);
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		$scope.doRedirect=function (href) {
			window.location = href;
		}
		
		$scope.redirect=function()
		{
			if($scope.role!="1")
			{
				 $scope.doRedirect("index.html");// only the teacher role can enter create course page
			}
			
		}
		
		$scope.initDatePicker= function ()
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
				$scope.redirect();
				$scope.initDatePicker();
		});
		

		/*create course functions*/
		
		File.prototype.convertToBase64 = function(callback){		//function of  convert uploaded image to base64 image
			var reader = new FileReader();
			reader.onload = function(e) {
				 callback(e.target.result)
			};
			reader.onerror = function(e) {
				 callback(null);
			};        
			reader.readAsDataURL(this);
		};
		
		$scope.fileNameChanged = function (ele) // trigger when user upload a file
		{
		  var file = ele.files[0];
		  if(file.type.length>0&&file.type.substr(0,5)=="image")  // check for the format type of the chose file
		  {
				file.convertToBase64(function(base64)
				{
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
			date:"",
			random:false
		}
		$scope.fileName;
		
		$scope.removeImg=function(){ //function for remove the uploaded image
		
			$('#removeURL').hide();
			$('#base64Name').html('');
			$scope.courseInfo.image='image/grey.png';
			$scope.fileName='';
			$('#base64PicURL').attr('src','');

		}
		
		$scope.validInput=function ()// check if any empty input of essential data or invalid input
		{
			if($scope.courseInfo.title==""||$scope.courseInfo.message==""||$scope.courseInfo.min==""||$scope.courseInfo.max==""||$scope.courseInfo.date=="")
			{
				alert("some missing data");
				return false;
			}
			if($scope.courseInfo.min>=$scope.courseInfo.max)
			{
				alert("min should be small than max");
				return false;
			}
			return true;	
		}
		
		/*create course flow*/
		/*
			add an entry in courses table
			add the course id to the course array in the  course's owner user
		*/
		
		$scope.createCourse = function() {

			var isError=false;
			if($scope.validInput())
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
							$scope.loadExistedTeam();		
							$scope.loadInviteRequest();					
						}
					});
				}

			}

		}
		
		$scope.deleteAllInviteRequest=function(userData)
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
								delete userData.request[$scope.ckey];
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
			for(i=0;i<newUserData.request[$scope.ckey].length;i++)
			{
				firebase.database().ref("Team/"+newUserData.request[$scope.ckey][i]).once('value', function(data) {
					var newTeamData=data.val();
					$scope.removeElementFromArrayByValue($scope.email,newTeamData.request);
					firebase.database().ref("Team/"+data.getKey()).set(newTeamData);
				});
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
						var newUserData=data.val();
						if(typeof(newUserData.team)=="undefined")
						{
							newUserData.team={};
						}
						newUserData.team[$scope.ckey]=teamKey;
						if(typeof(newUserData.request)!="undefined"&&typeof(newUserData.request[$scope.ckey])!="undefined")
						{
							$.when($scope.deleteAllJoinRequestFromTeam(newUserData)).done(function() 
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
							firebase.database().ref("courses/"+$scope.ckey).set(newCourseData).then(function(){
								$window.location.href="teamPanel.html?c="+$scope.ckey;
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



app.controller("teamPanelCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {

		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		
		var userAccount = firebase.database().ref("UserAccount");
		$scope.userAccount = $firebaseArray(userAccount);
		
		$scope.existedTeam=[];
		$scope.existedTeamData=[];
		$scope.ckey="";
		$scope.studentList=[];
		

		$scope.doRedirect=function(href)
		{
			$window.location.href=href;
		}
		
		
		//load the team ID
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
		
		//load team data
		$scope.accessValidCheck=function(key)
		{
		
			$scope.ikey=key;

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
						$scope.existedTeamData.push(data.val());
					}
				});
			}
			
		}
		
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
		
		//true = random
		//false = recommend forming	
		$scope.autoTeamForming=function(random)
		{
			
			if(random)
			{
				$scope.ckey=$scope.gup('c', window.location.href);
				$scope.loadStudentList($scope.ckey);
				
				var formingResult = [];
				var tempTeamList = [];
				var studentList = $scope.studentList;
				
				//the max and min number of the member
				var avgTeamMemberNumber = Math.ceil((3+2)/2);
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
					
					
					//take out the team if meet the expected team member number
					if(tempTeamList[assignTeam-1].teamMember.length>=numberOfTeam)
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
				console.log(studentList.length );
				console.log(tempTeamList.length );
				
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
				
				
			}else
			{
				$scope.ckey=$scope.gup('c', window.location.href);
				$scope.loadExistedTeam();
				for(var i=0;i<$scope.existedTeam.length;i++)
				{
					$scope.accessValidCheck($scope.existedTeam[i].key);
				}
				
				console.log($scope.existedTeamData);
			}
			
			
			
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
	
		$scope.currCourse={};		
		$scope.teamMember=[];
		$scope.waitingList=[];
		$scope.inviteList=[];
		$scope.studentList=[];
		$scope.ckey;
		$scope.tkey;
		$scope.tLeaderID;
		
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   $scope.loadcoursesInfo();
			   
		});
		
		$scope.deleteInviteRequest=function(email,uKey)
		{
			firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) {
				var teamData=data.val();
				$scope.removeElementFromArrayByValue(email,teamData.invite);
				firebase.database().ref("Team/"+$scope.tkey).set(teamData).then(function(){
					userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
					{
						var userData=data.val();
						$scope.removeElementFromArrayByValue(email,userData.invite[$scope.ckey]);
						if(jQuery.isEmptyObject(userData.invite))
						{
							delete userData["invite"];
						}
						firebase.database().ref("UserAccount/"+uKey).set(userData).then(function(){
							
							$scope.loadInviteList(teamData);
						});
						
					});
					
					
					
				});
			});
		}

		$scope.addInviteRequest=function(userData,key)
		{
			if(typeof(userData.invite)=="undefined")
			{
				userData.invite=[];
			}
			if(typeof(userData.invite[$scope.ckey])=="undefined")
			{
				userData.invite[$scope.ckey]=[];
			}
			userData.invite[$scope.ckey].push($scope.tkey);
			firebase.database().ref("UserAccount/"+key).set(userData).then(function(){
				
				firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) {
					
					var teamData=data.val();
					if(typeof(teamData.invite)=="undefined")
					{
						teamData.invite=[];
					}
					teamData.invite.push(userData.email);
					firebase.database().ref("Team/"+$scope.tkey).set(teamData).then(function(){
						
						//handle ...
						$scope.loadInviteList(teamData);
						 $.fancybox.close();
					});
					
				});
				
			});
			
		}
		
		$scope.inviteValidCheck=function(key,email)
		{
			if($scope.email==email)
			{
				alert("you can't invite yourself");
				return;
			}
			else
			{
				firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) {
					
					var teamData=data.val();
					if(typeof(teamData.invite)!="undefined"&&teamData.invite.indexOf(email)>-1)
					{
						alert("you have invited this student  alredy");
					}
					else
					{
						firebase.database().ref("UserAccount/"+key).once('value', function(data) {
							var userData=data.val();
							if(typeof(userData.team)!="undefined")
							{
								if(userData.team.hasOwnProperty($scope.ckey))
								{
									alert("this student has a team already");
									return;
								}
								else
								{
									$scope.addInviteRequest(userData,key);
								}
							}
							else
							{
								$scope.addInviteRequest(userData,key)
							}
						});
						
					}
					
					
				});
				

			}
		}
		
		$scope.inviteHandler=function(operation,key,email)//0 is invite,1 is delete invite
		{
			if(operation==0)
			{
				$scope.inviteValidCheck(key,email);
			}
			else
			{
				$scope.deleteInviteRequest(email,key);
			}
			
		}

		/*quit team flow*/
		/*
			1.delete the user email for the team array in Team table
			2.delete the entry with the course id (key) in team object in UserAccount table
		*/
		$scope.quitTeam=function()
		{
			firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) 
			{
				var newTeamData=data.val();		
				$scope.removeElementFromArrayByValue($scope.email,newTeamData.member);
				firebase.database().ref("Team/"+$scope.tkey).set(newTeamData);
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
		//delete all the data that related to the team waiting request
		$scope.deleteAllWaitingList=function(teamData)
		{
			
			if(typeof(teamData.request)!="undefined")
			{
				
				for(i=0;i<teamData.request.length;i++)
				{
					var email=teamData.request[i];
					userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
					{
						$scope.requestHandler(1,1,email,data.getKey());
					});
				}
			}
		
		}
		
		 $scope.deleteAllTeamMember=function(teamData)
		{
			for(i=0;i<teamData.member.length;i++)
			{
				var email=teamData.member[i];
				userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
				{
					$scope.deleteMember(1,email,data.getKey());
				});
			}
		}
		$scope.deleteAllInviteList=function(teamData)
		{
			if(typeof(teamData.invite)!="undefined")
			{
				for(i=0;i<teamData.invite.length;i++)
				{
					var email=teamData.invite[i];
					userAccount.orderByChild("email").equalTo(email).on("child_added", function(data)
					{
						$scope.deleteInviteRequest(data.val().email,data.getKey());
					});
				}
				
			}
			
		}
		
		$scope.deleteTeam=function()
		{

			firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) {

				var teamData=data.val();				
				
				$.when($scope.deleteAllTeamMember(teamData)).done(function(){
					$.when($scope.deleteAllWaitingList(teamData)).done(function() 
					{
						$.when($scope.deleteAllInviteList(teamData)).done(function()
						{
							firebase.database().ref("Team/"+$scope.tkey).remove();
							firebase.database().ref("courses/"+$scope.ckey).once('value', function(data) 
							{
								var newCourseData=data.val();		
								$scope.removeElementFromArrayByValue($scope.tkey,newCourseData.team);
								firebase.database().ref("courses/"+$scope.ckey).set(newCourseData).then(function(){
									$window.location.href="index.html";		
								});
							});
							
						});
						
					});

				});
				
		
			});
			
		}
		
		$scope.deleteMember=function(operation,email,memberID)
		{

			if(operation==0&&$scope.tLeaderID==email)
			{
				alert("you can't delete the owner")
			}
			else
			{
				if(operation==0)
				{
					firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) 
					{
						var newTeamData=data.val();		
						$scope.removeElementFromArrayByValue(email,newTeamData.member);
						firebase.database().ref("Team/"+$scope.tkey).set(newTeamData);
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
					$scope.removeUserList($scope.teamMember,memberID);
				}
				
			}

		}
		
		$scope.requestHandler=function(operation,type,email,waitingID)
		{
				
			firebase.database().ref("Team/"+$scope.tkey).once('value', function(data) 
			{
				var newTeamData=data.val();		
				if(operation==0)//0 is accept
				{								
					var maxSize=$scope.currCourse.max;
					var memberNumber=newTeamData.member.length;
					if(memberNumber+1<=maxSize)
					{
						var isInvited=false;
						$scope.removeElementFromArrayByValue(email,newTeamData.request);
						newTeamData.member.push(email);
						console.log("newTeamData",newTeamData);
						if(typeof(newTeamData.invite)!="undefined")
						{
							console.log("email",email);
							if(newTeamData.invite.indexOf(email)>-1)
							{
								$scope.removeElementFromArrayByValue(email,newTeamData.invite);
								isInvited=true;
							}
						}
						firebase.database().ref("Team/"+$scope.tkey).set(newTeamData);


						firebase.database().ref("UserAccount/"+waitingID).once('value', function(data) 
						{
							var newUserData=data.val();
							$scope.removeElementFromArrayByValue($scope.tkey,newUserData.request[$scope.ckey]);
							if(typeof(newUserData.team)=="undefined")
							{
								newUserData.team={};
							}
							newUserData.team[$scope.ckey]=$scope.tkey
							
							
							if(typeof(newUserData.request!="undefined"))
							{
								for(i=0;i<newUserData.request[$scope.ckey].length;i++)
								{
									firebase.database().ref("Team/"+newUserData.request[$scope.ckey][i]).once('value', function(data) {

										var newTeamData=data.val();
										$scope.removeElementFromArrayByValue(newUserData.email,newTeamData.request);
										firebase.database().ref("Team/"+data.getKey()).set(newTeamData);
										
									});
								}
								delete newUserData.request[$scope.ckey];
								if(jQuery.isEmptyObject(newUserData.request))
								{
									delete newUserData["request"];
								}
								if(isInvited)
								{
									delete newUserData.invite[$scope.ckey];
									if(jQuery.isEmptyObject(newUserData.request))
									{
										delete newUserData["request"];
									}
								}
								firebase.database().ref("UserAccount/"+waitingID).set(newUserData);
							}
							else
							{
								firebase.database().ref("UserAccount/"+waitingID).set(newUserData);
							}
							
						}).then(function(){
							$scope.renderTeamInfo(1);		
						});				

					}
					else
					{
						alert("exceed max limitation");
					}
					
				}
				else
				{

					$scope.removeElementFromArrayByValue(email,newTeamData.request);
					firebase.database().ref("Team/"+$scope.tkey).set(newTeamData);				
					
					firebase.database().ref("UserAccount/"+waitingID).once('value', function(data) 
					{
						var newUserData=data.val();		
						$scope.removeElementFromArrayByValue($scope.tkey,newUserData.request[$scope.ckey]);
						firebase.database().ref("UserAccount/"+waitingID).set(newUserData);
					});

					if(type==0)
					{
						$scope.updateUserList(newTeamData);
					}
				}
		
			});
		}
		

		$scope.updateUserList=function(newTeamData)
		{
			var tmpMember=[];
			var tmpWaiting=[];
			for(i=0;i<newTeamData.member.length;i++)
			{
				$scope.userObjectArrayPush(newTeamData.member[i],tmpMember);
			}
			$scope.teamMember=tmpMember;
			if(typeof(newTeamData.request.length)!="undefined")
			{
				for(i=0;i<newTeamData.request.length;i++)
				{
					$scope.userObjectArrayPush(newTeamData.request[i],tmpWaiting);
				}
			}

			$scope.waitingList=tmpWaiting;
		}
		
		 $scope.removeUserList=function(array,userID)
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
		
		 $scope.removeElementFromArrayByValue=function(value,array)
		{
			array.splice(array.indexOf(value), 1);
		}
		
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
		
		$scope.loadInviteList=function(teamData)
		{
			var tmp=[];
			if(typeof(teamData.invite)!="undefined")
			{
				for(i=0;i<teamData.invite.length;i++)
				{
					$scope.userObjectArrayPush(teamData.invite[i],tmp);
				}
			}
			$scope.inviteList=tmp;
			$scope.$apply();
		}
		
		$scope.loadWaitingList=function(teamData)
		{
			var tmp=[];
			if(typeof(teamData.request)!="undefined")
			{
				for(i=0;i<teamData.request.length;i++)
				{

					$scope.userObjectArrayPush(teamData.request[i],tmp);
				}
			}
			$scope.waitingList=tmp;
			$scope.$apply();
		}
		
		$scope.loadTeamMember=function(teamData)
		{
			var tmp=[];
			for(i=0;i<teamData.member.length;i++)
			{
				
				$scope.userObjectArrayPush(teamData.member[i],tmp);
			}
			$scope.teamMember=tmp;
			$scope.$apply();
		}
		
		$scope.renderTeamInfo=function(flag)
		{
			firebase.database().ref("Team/"+$scope.team[$scope.ckey]).once('value', function(data) {
	

				var teamData=data.val();
				if(flag==0)
				{
					$scope.tkey=data.getKey();
					$scope.tLeaderID=data.val().leaderID;
					if($scope.tLeaderID==$scope.email)
					{
						$scope.isOwner=true;
					}
					else
					{
						$scope.isOwner=false;
					}
				}
		
				$scope.loadTeamMember(teamData);
				$scope.loadWaitingList(teamData);
				$scope.loadInviteList(teamData);
				//$scope.loadStudentList($scope.ckey);
			});
			
		}
		
		$scope.roleAccessCheck=function()
		{
			if($scope.role=="0")
			{
				if(typeof($scope.team)=="undefined"||!$scope.team.hasOwnProperty($scope.currCourse.key) )
				{
					console.log("no team in this course");
					$window.location.href="index.html";
				}
				$scope.renderTeamInfo(0);
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

		$scope.inviteForm=function()
		{
			$scope.loadStudentList($scope.ckey);
			$.fancybox.open("#studentList");	
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
				if($scope.ckey.indexOf(invalidSet[i])>-1)
				{
					return true;
				}
			}
			return false;
		}
		
		$scope.loadcoursesInfo=function()
		{
			$scope.ckey=$scope.gup('c', window.location.href);
			
			if($scope.ckey==null||$scope.ckey==""||$scope.pathStringCheck())
			{
				$scope.doRedirect("index.html");		
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
						$scope.courseInfo.image=$scope.currCourse.image;
						$scope.roleAccessCheck();						
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
		
		$scope.validInput=function ()
		{
			$scope.courseInfo.title=$scope.currCourse.title;
			$scope.courseInfo.message=$scope.currCourse.message;
			$scope.courseInfo.max=$scope.currCourse.max;
			$scope.courseInfo.min=$scope.currCourse.min;
			$scope.courseInfo.date=$scope.currCourse.date;
			$scope.courseInfo.random=$scope.currCourse.random;
			$scope.courseInfo.owner=$scope.email;
			if(typeof($scope.courseInfo.image)=="undefined"||$scope.courseInfo.image=="")
			{
				$scope.courseInfo.image='image/grey.png';
			}
			
			if(typeof($scope.courseInfo.title)=="undefined"||typeof($scope.courseInfo.message)=="undefined")
			{
				//alert("some missing data");
				return false;
			}
			return true;	
		}
		
		$scope.editCourse = function() {

			if($scope.validInput())
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
		    $scope.initTagList();
		    $scope.initAutoComplete();
		});
		
		$scope.currUser;
		$scope.password;

		$scope.defaultTags=[];
		$scope.addedTags;

		
		 $scope.removeElementFromArrayByValue=function(value,array)
		{
			array.splice(array.indexOf(value), 1);
		}
		
		$scope.removeTag=function(tag)
		{
			$scope.removeElementFromArrayByValue(tag,$scope.addedTags);
		}

		
		$scope.addTag=function()
		{
			
			var tmpTag=$('#autoComplete').val();
			
			if(typeof(tmpTag)=="undefined"||tmpTag.trim()=="")
			{
				alert("you should enter a valid tag");
				return;
			}
			
			if(typeof($scope.addedTags)=="undefined")
			{
				$scope.addedTags=[];
				$scope.addedTags.push(tmpTag);
			}
			else
			{
				if($scope.addedTags.indexOf(tmpTag.trim())>-1)
				{
					alert("you have adde this tag already");
						return;
				}
				else
				{
					$scope.addedTags.push(tmpTag);
				}		
			}
			$('#autoComplete').val('');
			$('#autoComplete').focus();
		}
		
		$scope.initTagList=function ()
		{
			$.getJSON('tags.json', function(data) {
				
				$scope.defaultTags=data.data;
				for(var i=0;i<$scope.defaultTags.length;i++)
				{
					
					$scope.defaultTags[i]=$scope.defaultTags[i]+" ";
				}	
			});

			
		}
		$scope.initAutoComplete=function ()
		{
			$( "#autoComplete" ).autocomplete({

				source: function(request, response) {
					var results = $.ui.autocomplete.filter($scope.defaultTags, request.term);
					for(var i=0;i<results.length;i++)
					{
						results[i]=results[i].trim();
					}
					response(results.slice(0, 10));
				}  
				
			}).focus(function() {

				$(this).autocomplete("search"," ");
				$(this).autocomplete( "option", "minLength", 0 );
			});;
		}
		
		$scope.loadUserData=function()
		{
			firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) 
			{
				$scope.currUser=data.val();	
				$scope.addedTags=data.val().tags;	
			});
			
		}

		$scope.validInputForEditProfile=function()
		{
			
			if(typeof($scope.currUser.userName)=="undefined"||$scope.currUser.userName.trim()=="")
			{
				alert("some data missed");

			}
			if(typeof($scope.password)!="undefined"&&$scope.password!="")
			{
				var user = firebase.auth().currentUser;
				user.updatePassword($scope.password).then(function()
				{
					$scope.updateProfileData();
				}, 
				function(error) 
				{
					alert(error);

				});
			}
			else
			{
				$scope.updateProfileData();
			}
			
		}

		
		$scope.updateProfileData=function()
		{
			firebase.database().ref("UserAccount/"+$scope.key).once('value', function(data) 
			{
				var newUserData=data.val(); 
				newUserData.userName=$scope.currUser.userName; 
				if(typeof($scope.addedTags)!="undefined")
				{
					newUserData.tags=$scope.addedTags;
				}
				else
				{
					if(newUserData.hasOwnProperty['tags'])
					{
						delete newUserData['tags'];
					}
				}
				firebase.database().ref("UserAccount/"+$scope.key).set(newUserData).then(function(){
					user.userName=$scope.currUser.userName;
					
					$rootScope.$emit("updataEmailCall", {});		
					alert("success");
					
				});
			});
			
		}
		
	});
	
	
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

app.controller("teamInfoCtrl", function($scope,$rootScope,user, $firebaseArray,$window) {
			
		var team = firebase.database().ref("Team");
		$scope.teamFB=$firebaseArray(team);
		
		$scope.type;
		$scope.ikey;
		$scope.teamData;
		
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
					}
				});
			}
			
		}
			
});

app.controller("memberSearchCtrl", function($scope,$rootScope,user) {
			
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
});
