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
				
				/*if(typeof(sessionStorage.User)=="undefined")
				{
					sessionStorage.setItem('User',JSON.stringify(user));
					console.log("no user data");
				}
				else
				{
					console.log("has user data");
					console.log(sessionStorage.User);
			
				}*/
				
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
			file.convertToBase64(function(base64){
				$scope.courseInfo.image=base64;
				$scope.fileName=file.name;
				$('#base64PicURL').attr('src',base64);
				$('#base64Name').html(file.name);
				$('#removeURL').show();
				$('#profilePic').val('');
			}); 
		}
		
		$scope.courseInfo=
		{
			title:"",
			image:"image/grey.png",
			owner:"",
			message:"",
			max:"",
			min:""
		}
		$scope.fileName;
		
		$scope.removeImg=function(){
		
			$('#removeURL').hide();
			$('#base64Name').html('');
			$scope.courseInfo.image='';
			$scope.fileName='';
			$('#base64PicURL').attr('src','');
		}
		
		function validInput()
		{
			if($scope.courseInfo.title==""||$scope.courseInfo.message==""||$scope.courseInfo.min==""||$scope.courseInfo.max=="")
			{
				console.log("some missing data");
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
						var newUserData=
						{
							email:$scope.email,
							role:$scope.role,
							userName:$scope.userName,
							course:courseArray
						};
						firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
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
			//sessionStorage.setItem('currentCourse',key);
			//sessionStorage.setItem('flag',true);
			if(user.role=="0" && teamChecking(key))
			{
				//return false;
				$window.location.href="teamSearch.html?c="+key;
				//$window.location.href="teamSearch.html";
				
			}else
			{
				//return false;
				$window.location.href="teamPanel.html?c="+key;
				//$window.location.href="teamPanel.html";
			}
			
		}
		
		function loadcourses()
		{
			if(typeof($scope.course)!="undefined")
			{
				$scope.courseArray=[];
				for(i=0;i<$scope.course.length;i++)
				{
					firebase.database().ref("courses/"+$scope.course[i]).once('value', function(data) {
						$scope.courseArray.push({"key":data.getKey(),"data":data.val()});	
						
					});
				}
			}
		}
		
		
});



app.controller("teamSearchCtrl", function($scope,$rootScope,user,$firebaseArray,$window) {
		
		/*initialzation and checking*/
		var courses = firebase.database().ref("courses");
		$scope.courseFB=$firebaseArray(courses);
		var team = firebase.database().ref("Team");
		$scope.teamInfo = $firebaseArray(team);
		
		
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
	
		$scope.currCourse={
			key:"",
			image:"",
			message:"",
			owner:"",
			title:"",
			team:[],
			max:"",
			min:""
		};
		
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
			//console.log(sessionStorage);
			
			$scope.currCourse.key=gup('c', window.location.href);
			
			if($scope.currCourse.key==null||$scope.currCourse.key=="")
			{
				$window.location.href="index.html";		
			}
			else
			{
				if(typeof($scope.team)!="undefined"&&$scope.team.hasOwnProperty($scope.currCourse.key))
				{
					$window.location.href="teamPanel.html?c="+$scope.currCourse.key;
					
				}
				else
				{
					firebase.database().ref("courses/"+$scope.currCourse.key).once('value', function(data) {
						if(data.val()==null)
						{
							console.log("invalid input of course id");
							$window.location.href="index.html";
						}
						else
						{
							$scope.currCourse.message=data.val().message;
							$scope.currCourse.image=data.val().image;
							$scope.currCourse.owner=data.val().owner;
							$scope.currCourse.title=data.val().title;						
							$scope.currCourse.team=data.val().team;						
							$scope.currCourse.max=data.val().max;						
							$scope.currCourse.min=data.val().min;	
							loadExistedTeam();							
						}
					});
				}

			}

		}
		
		
		function loadExistedTeam()
		{
			for(i=0;i<$scope.currCourse.team.length;i++)
			{
				
				firebase.database().ref("Team/"+$scope.currCourse.team[i]).once('value', function(data) {
					$scope.existedTeam.push(data.val());					
				});
			}
			
			
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
		
		$scope.createTeam=function()
		{
			if(validCheck())
			{

				$scope.newTeam.leaderID=$scope.email;
				$scope.newTeam.member.push($scope.email);
				$scope.newTeam.courseID=$scope.currCourse.key;

				$scope.teamInfo.$add($scope.newTeam).then(function(data)
				{
					
					if(typeof($scope.team)=="undefined")
					{
						$scope.team={};
						$scope.team[$scope.currCourse.key]=data.getKey();
					}
					else
					{
						$scope.team[$scope.currCourse.key]=data.getKey();
					}
					var newUserData=
					{
						course:$scope.course,
						email:$scope.email,
						role:$scope.role,
						userName:$scope.userName,
						team:$scope.team
					}
						firebase.database().ref("UserAccount/"+$scope.key).set(newUserData);
					
					if(typeof($scope.currCourse.team)=="undefined")
					{
						$scope.currCourse.team=[];
						$scope.currCourse.team.push(data.getKey());
					}
					else
					{
						$scope.currCourse.team.push(data.getKey());
					}
					var newCourseData=
					{
						image:$scope.currCourse.image,
						max:$scope.currCourse.max,
						message:$scope.currCourse.message,
						min:$scope.currCourse.min,
						owner:$scope.currCourse.owner,
						title:$scope.currCourse.title,
						team:$scope.currCourse.team
						
					}
					firebase.database().ref("courses/"+$scope.currCourse.key).set(newCourseData);
					$window.location.href="teamPanel.html?c="+$scope.currCourse.key;
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

	
		$scope.updateRole=function()
		{
			$scope.email=user.email;
			$scope.role=user.role;
			$scope.userName=user.userName;
			$scope.key=user.key;
			$scope.course=user.course;
			$scope.team=user.team;
		}
	
		$scope.currCourse={
			key:"",
			image:"",
			message:"",
			owner:"",
			title:""
		};

		
		$scope.joinedTeam=
		{
			key:"",
			name:"",
			description:"",
			leaderID:"",
			member:[],
			courseID:""
		};
		
		
	
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   loadcoursesInfo();
			   
		});
		
		function getTeamInfo()
		{
			$scope.joinedTeam.key=$scope.team[$scope.currCourse.key];
			firebase.database().ref("Team/"+$scope.joinedTeam.key).once('value', function(data) {
				$scope.joinedTeam.name=data.val().name;
				$scope.joinedTeam.description=data.val().description;
				$scope.joinedTeam.leaderID=data.val().leaderID;
				$scope.joinedTeam.member=data.val().member;						
				$scope.joinedTeam.courseID=data.val().courseID;							
			});
			
		}
		
		function roleAccessCheck()
		{
			if($scope.role=="0")
			{
				if(typeof($scope.team)=="undefined"||!$scope.team.hasOwnProperty($scope.currCourse.key) )
				{
					console.log("no team in this course");
					//return;
					$window.location.href="index.html";
				}
			}
			else
			{
				if($scope.currCourse.owner!=$scope.email)
				{
					console.log("you are teacher but not the course owner");
					//return;
					$window.location.href="index.html";
				}
			}
			getTeamInfo();
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
			//console.log(sessionStorage);
			
			$scope.currCourse.key=gup('c', window.location.href);
			
			if($scope.currCourse.key==null||$scope.currCourse.key=="")
			{
				$window.location.href="index.html";		
			}
			else
			{
				firebase.database().ref("courses/"+$scope.currCourse.key).once('value', function(data) {
					if(data.val()==null)
					{
						console.log("invalid input of course id");
						$window.location.href="index.html";
					}
					else
					{
						$scope.currCourse.message=data.val().message;
						$scope.currCourse.image=data.val().image;
						$scope.currCourse.owner=data.val().owner;
						$scope.currCourse.title=data.val().title;	
						roleAccessCheck();						
					}
				});

			}

		}
				
});


