var fahrenheit = '&deg;';
var currentDrawnChart = "C";
var weekDays = 7; 
var usageAndCostData = {};

google.load("visualization", "1", {packages:["corechart"]});
   google.setOnLoadCallback(function(){
	   getUsageAndCostOnLaod();
});
   
   
function showDataAvailableArea(){
		
	$("#dataavialblearea").show();
	$("#datanotavailablearea").hide();
	$(".temppointstbl").show();
	$("#weeklytotal").show();
}
   

function getUsageAndCostOnLaod(){
	$.when( getDashBoardUsageAndCostAjaxCall() ).done(function(data){
		if($.isEmptyObject(data)){
			console.log("DATA FROM THE SERVICE IS EMPTY");
			$("#dataavialblearea").hide();
		   	$("#datanotavailablearea").show();
		}else{
			usageAndCostData = data;
			drawChartAndHandleErrors("C");
		}
	});
}

   
function drawChartAndHandleErrors(direction){   //direction = C/P C = current P = previous
	   
   try{
	   showDataAvailableArea();
	   var displayWeekData = popuateUsageAndCostData(usageAndCostData,direction);
	   populateTotalCostAndUsage(displayWeekData);
	   populateHeadingMessage(displayWeekData);
	   populateTemperaturePoints(displayWeekData);
	  // populateMonthLabel(displayWeekData);
	   var data = getDataArrayForChart(displayWeekData);
	   drawUsageChart(data);
	   hideArrowsBasedOnDirection(direction);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawChartAndHandleErrors:::"+err.message);
	   $("#dataavialblearea").hide();
   	   $("#datanotavailablearea").show();
   }
} 
   
   
   
function getDataArrayForChart(displayWeekData){
	   
   var dataArray = new Array(weekDays);
   try{
	   var displayWeekAry = displayWeekData.dailyDataList;
	   for(i=0; i<weekDays; i++){
	  		var dataRow = CreateDataArrayForChart(displayWeekAry[i],i);
	  		dataArray[i] = dataRow;
	  	}
   }catch(err){
	   console.log("ERROR OCCURED WHILE getDataArrayForChart:::"+err.message);
   	   throw new CreateDataArrayForChartException(err.message);
   }
   return dataArray;
}
   
   
function getPreviousData(){
   currentDrawnChart = "P";
   drawChartAndHandleErrors(currentDrawnChart);
}
   
   
function getCurrentData(){
   currentDrawnChart = "C";
   drawChartAndHandleErrors(currentDrawnChart);
}
   
   
function populateTotalCostAndUsage(displayWeekData){
	    
   try{
    	var weekTotalCost = displayWeekData.weekTotalCost;
		var weekTotalUsage = displayWeekData.weekTotalUsage;
    	$("#weektotalVal").text("$"+weekTotalCost+" / "+weekTotalUsage+" kWh");
   }catch(err){
	   throw new TotalCostAndUsageException("Calculating Total cost usage Exception");
   }
}
   
function getDashBoardUsageAndCostAjaxCall(){
	
	var dfd = jQuery.Deferred();
	$.ajax({  
       type: "GET", 
       url: "/protected/usageHistory/esense/getusageandcost.htm",
       success: function(response){
    	  var jsonResponse = $.parseJSON(response);
    	  dfd.resolve(jsonResponse);
       },  
       error: function(e){  
          return null;
       }
       	      }); 
	return dfd.promise();
}
   
function popuateUsageAndCostData(parsedJSONFromService,direction){
   	
	var usageAndCostRestRes = parsedJSONFromService;
	var displayWeekData = {};
   	try{
	  	if(direction == 'C'){
	   		displayWeekData = usageAndCostRestRes.currentWeekUsage;
	   	}else{
	   		displayWeekData = usageAndCostRestRes.previousWeekUsage;
	   	}
	 }catch(err) {
   		 console.log("ERROR OCCURED WHILE popuateUsageAndCostData:::"+err.message);
   		 throw new DataParsingException(err.message);
   	 }
	 return displayWeekData;
	
}


function CreateDataArrayForChart(weekInDisplay,i){
   	
   try{
	   return [dayLiteralArray[i], (null != weekInDisplay && null != weekInDisplay.usage)?getCostOrUsageValue(weekInDisplay.usage):null,
			   (null != weekInDisplay && null != weekInDisplay.usage)?getCostOrUsageValue(weekInDisplay.usage):null];
   }catch(err){
	   console.log("ERROR OCCURED WHILE CreateDataArrayForChart:::"+err.message);
	   throw new CreateDataArrayForChartException(err.message);
   }
}


function populateHeadingMessage(usage){
   	
   	if(null != usage && '' != usage){
   		$("#messgaetxt").html(weekOf+" "+monthFullLiteralArray[(usage.month)-1]+" "+usage.dayAndYear);
   	}else{
   		throw new HeaderMessageException("Populate Header Exception");
   	}
}
   
   
function populateTemperaturePoints(displayWeekData){
   	
	try{   
		var tempAry = displayWeekData.dailyDataList;
	   	var completeHTML = "";
	   	var htmlBegin = '<tr><td>';
	   	var htmlmiddle = '</td><td>';
	   	var htmlEnd = '</td></tr>';
	   	completeHTML += htmlBegin;
	   	for(i=0; i<weekDays; i++){
	   		if(i != weekDays-1){
	   			completeHTML += getTemperatureHighTempValue(tempAry[i]) + htmlmiddle;
	   		}else{
	   			completeHTML += getTemperatureHighTempValue(tempAry[i]) + htmlEnd;
	   		}
	   	}
	   	completeHTML += htmlBegin;
	   	for(i=0; i<weekDays; i++){
	   		if(i != weekDays-1){
	   			completeHTML += getTemperaturelowTempValue(tempAry[i])+htmlmiddle;
	   		}else{
	   			completeHTML += getTemperaturelowTempValue(tempAry[i])+htmlEnd;
	   		}
	   	}
	   	$("#temppoints").html(completeHTML);
	   	$("#temppoints td").removeClass("width9").addClass("width17");
  }catch(err){
	  console.log("ERROR OCCURED WHILE populateTemperaturePoints:::"+err.message);
	   	  throw new TemperaturePointsException(err.message);
  }
}
   
   	
/*function populateMonthLabel(displayWeekData){
	var month = displayWeekData.month;
	$("#dayLabelsid").text(monthLiteralArray[month-1]);
}	*/
  

function drawUsageChart(data){	
   	
	try{
		$("#chart_div").removeClass("loadingimgusghistory").addClass("chartdashboard");
		var chartDimensions = {left:'10%',right:'2%',top:10,width:'100%',height:'75%'};
		var dataTable = new google.visualization.DataTable();
	  		dataTable.addColumn('string','Day');
	  		dataTable.addColumn('number','Usage');
	  		dataTable.addColumn('number','Usage');
	  	    options = {
	  				title: '',
	  		        hAxis: {titleTextStyle: {color: '#333'}},
	  		        vAxis: {title:'kWh',minValue: 0},
	  		        colors	:['#AEDFF6'],
					pointSize: 5,
					pointShape: 'circle',
	  		        showAxisLines :false,
	  	            legend:'none',
	  	            valueLabelsInterval:10,
	  	            chartArea: chartDimensions,
	  	            areaOpacity:1.0,
	  	            seriesType: 'area',
	  	            series:  {1:{type: 'line', color:'#00AEEF'}}
	  	        };			
	  		dataTable.addRows(data); 
	  		chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
	  		chart.draw(dataTable, options);
	   }catch(err){
		   console.log("ERROR OCCURED WHILE drawUsageChart:::"+err.message);
	   	   throw new DrawChartException(err.message);
	   }
   }


$(window).resize(function(){
 	drawUsageChart(drawChartAndHandleErrors(currentDrawnChart));
});
   