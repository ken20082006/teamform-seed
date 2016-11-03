var app = angular.module("teamforming", []); 
	app.controller("wrapperCtrl", 
		
		function($scope) {
		
			$scope.button_text="<";
			$scope.close_open_wrapper=function()
			{
				if($scope.button_text=="<")
					$scope.button_text=">";
				else
					$scope.button_text="<";
			
			}
			

		}
	);