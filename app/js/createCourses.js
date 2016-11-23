	
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
