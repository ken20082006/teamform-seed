// inject firebase service
var app = angular.module("teamforming", ["firebase"]); 

app.value('user', {
    email: '',
	role:'',
	userName:'',
	key:'',
	course:[]
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
			message:""
		}
		$scope.fileName;
		
		$scope.removeImg=function(){
		
			$('#removeURL').hide();
			$('#base64Name').html('');
			$scope.courseInfo.image='';
			$scope.fileName='';
			$('#base64PicURL').attr('src','');
		}
		
		$scope.createCourse = function() {
			var isError=false;
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

	});
	
	
	app.controller("indexCtrl", function($scope,$rootScope,user,$firebaseArray) {
		
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
		}
		$scope.courseArray=[];
	
		$rootScope.$on("updateRole", function(){
			   $scope.updateRole();
			   loadcourses();
		});
		
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


