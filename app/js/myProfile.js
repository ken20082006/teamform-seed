

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
		});
		
		$scope.currUser;
		$scope.password;
		$scope.userIcon;
		$scope.defaultTags=[];
		$scope.addedTags;

		
		
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
					$scope.userIcon=base64;
					$scope.$apply();
				//	$('#removeURL').show();
					$('#profilePic').val('');
				}); 		  	  
		  }
		  else
		  {
			  alert("invliad file format");
			  $('#profilePic').val('');
		  }

		}
		
		$scope.removeImg=function()
		{
			//$('#removeURL').hide();
			$scope.userIcon='image/usericon.png';
			$scope.$apply();
		
		}
		
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
			//$('#autoComplete').focus();
		}
		
		$scope.initTagList=function ()
		{
			$.getJSON('tags.json', function(data) {
				
				$scope.defaultTags=data.data;
				for(var i=0;i<$scope.defaultTags.length;i++)
				{
					
					$scope.defaultTags[i]=$scope.defaultTags[i]+" ";
				}	
				$scope.initAutoComplete();
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
				if(typeof(data.val().icon)!="undefined")
				{
					$scope.userIcon=data.val().icon;
				}
				else
				{
					$scope.userIcon='image/usericon.png';
				}
			
			});
			
		}

		$scope.validInputForEditProfile=function()
		{
		
			if(typeof($scope.currUser.userName)=="undefined"||$scope.currUser.userName.trim()=="")
			{
				alert("some data missed");
				return;

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
		
		$scope.contactInfoHandler=function(inputData,userData,key)
		{

			if(typeof(inputData)=="undefined"||inputData.trim()=="")
			{
				if(typeof(userData[key])!="undefined")
				{
					delete userData[key];
				}
			}
			else
			{
				userData[key]=inputData;
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
					console.log($scope.addedTags);
				}
				else
				{
					if(newUserData.hasOwnProperty['tags'])
					{
						delete newUserData['tags'];
					}
				}

			$scope.contactInfoHandler($scope.currUser.contactEmail,newUserData,'contactEmail');	
			$scope.contactInfoHandler($scope.currUser.contactSkype,newUserData,'contactSkype');	
			$scope.contactInfoHandler($scope.currUser.contactPhone,newUserData,'contactPhone');	
			$scope.contactInfoHandler($scope.currUser.contactFb,newUserData,'contactFb');	
			$scope.contactInfoHandler($scope.currUser.contactTwitter,newUserData,'contactTwitter');	
			$scope.contactInfoHandler($scope.currUser.contactGoogle,newUserData,'contactGoogle');
			newUserData.icon=$scope.userIcon;	
			
				
				firebase.database().ref("UserAccount/"+$scope.key).set(newUserData).then(function(){
					user.userName=$scope.currUser.userName;
					
					$rootScope.$emit("updataEmailCall", {});		
					alert("success");
					
				});
			});
			
		}
		

		
	});
