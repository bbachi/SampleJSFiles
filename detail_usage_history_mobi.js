$("#usagehistcaselid").change(function() {
	$("#primarycallsubmitform").submit();
});

var onLoadWeekUsageCall = false;
var fahrenheit = '&deg;';
var kWOnProgressBar = " kWh";
var weekDays = 7;
var numberOfMonths = 12;
var monthDays = 31;
var totalCost = 0.0;
var totalUsage = 0.0;
var windowResizeData = {};
var NA = " ";

var graphType = 'week';
var viewType = 'G'; //G = graph and T = Table
var prevBtnClicked = false;
var effHomeBtnClicked = false;
var avgHomeBtnClicked = false;
var currentDataTable = {};
var currentDrawnData;
var singleGraphData;
var compareGrpahData;
var avgOrEffDataAvailable = false;
var avgOrEffData;
var costAndUsageTab = false;
var homeEnergyUseTab = false;

var previousWeekNumber = '';
var nextWeekNumber = '';
var currentYearWeekNumber = '';
var previousDay = '';
var nextDay = '';
var actualDay = '';
var previousYear = '';
var nextYear = '';
var currentYear = '';
var currYearMonthNum = '';
var prevYearMonthNum = '';
var nextYearMonthNum = '';

/* START TABLE LOGIC */

function drawGraph(){
	viewType = 'G';
	$("#chart_div").fadeIn();
	$("#table_div").hide();
	$(".temppointstbl").show();
	$("#weeklytotal").show();
	$("#comparebtnsarea").show();
	$("#graphtabid").addClass("selected");
	$("#tabletid").removeClass("selected");
	$("#selecttocomparediv a:first-child").removeClass("comparedivhighlight").addClass("comparednotselected");
	$("#selecttocomparediv a:nth-child(2)").removeClass("averagedivhighlight").addClass("averagenotselected");
	$("#selecttocomparediv a:nth-child(3)").removeClass("efficientdivhighlight").addClass("efficientnotselected");
	callFuntionBasedOnGraphType();
}

function drawTable(){
	prevBtnClicked = false;effHomeBtnClicked = false;avgHomeBtnClicked = false;
	viewType = 'T';
	$("#chart_div").hide();
	$("#table_div").fadeIn();
	$(".temppointstbl").hide();
	$("#weeklytotal").hide();
	$("#comparebtnsarea").hide();
	$("#tabletid").addClass("selected");
	$("#graphtabid").removeClass("selected");
	callFuntionBasedOnGraphType();
}

function callFuntionBasedOnGraphType(){
	var type = getGraphTypeBasedOnPreviousBtnClass();
	if(type == 'W'){drawWeekChartForWeek(currentYearWeekNumber);}
	if(type == 'M'){getMonthlyUsageDataAndDraw(actualDay);}
	if(type == 'D'){getDailyUsageDataAndDraw(actualDay);}
	if(type == 'Y'){getYearlyUsageDataAndDraw(currentYear);}
}

/* END TABLE LOGIC */

/* CHECKING PC DATA AVAILABLE */

function checkForPCDataAvailableOrNot(inData){
	if(!effHomeBtnClicked && !avgHomeBtnClicked){
		$.when( isPCDataAvailable(inData) ).done(function(data){
			enableOrDisableButtons(data);
		});
	}
}


function enableOrDisableButtons(pcData){
	
	if(pcData.dataAvailable){
		$("#selecttocomparediv a:nth-child(2)").removeClass("nodatadisabled").addClass("averagenotselected");
		$("#selecttocomparediv a:nth-child(3)").removeClass("nodatadisabled").addClass("efficientnotselected");
	}else{
		$("#selecttocomparediv a:nth-child(2)").removeClass("averagenotselected").addClass("nodatadisabled");
		$("#selecttocomparediv a:nth-child(3)").removeClass("efficientnotselected").addClass("nodatadisabled");
	}
}

/* CHECKING PC DATA AVAILABLE */

/*START WEEKLY USAGE CHART  */

function drawWeekChartAndHandleErrors(weeklyUsageData){
	   
   try{
	   populateHeadingMessage(weeklyUsageData);
	   populatePrevAndNextNumbers(weeklyUsageData);
	   hideArrowsBasedOnData(weeklyUsageData);
	   if(viewType == 'G'){
		   populateTemperaturePoints(weeklyUsageData);
		   populateWeekTotalCostAndUsage(weeklyUsageData,false);
		   checkForPCDataAvailableOrNot(weeklyUsageData);
		   if(weeklyUsageData.dataAvailable){
			   showErrorMessageBasedOnResponse(false);
			   singleGraphData = weeklyUsageData;
			   currentDrawnData = weeklyUsageData;
			   var data = getDataArrayForWeekGraph(weeklyUsageData);
			   drawUsageChart(data);
		   }else{showErrorMessageBasedOnResponse(true);}
	   }else{
		   drawTableForWeekGraph(weeklyUsageData);
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawWeekChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawTableForWeekGraph(weeklyUsageData){
	
	try{
		if(weeklyUsageData.dataAvailable){
			var weekAry = weeklyUsageData.dailyDataList;
			var completeHTML;
			var htmlBegin = '<tr><td>';
			var htmlmiddle = '</td><td>';
			var htmlEnd = '</td></tr>';
			for(i=0; i<weekDays; i++){
				completeHTML += htmlBegin+dayLiteralArray[i]+htmlmiddle+((null != weekAry[i] && null != weekAry[i].usage)?weekAry[i].usage:'')+
					htmlmiddle+((null != weekAry[i] && null != weekAry[i].cost)?getFixedDecimalVal(weekAry[i].cost,2):'')+htmlmiddle+getTempValueForTable(weekAry[i])+ htmlEnd;
			}
			$("#transTbody").html(completeHTML);
		}else{
			console.log("NO DATA AVILABLE");
			$("#transTbody").html("");
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE drawTableForWeekGraph:::"+err.message);
	}
}

function getTempValueForTable(day){
	
	if(null != day && (null != day.tempHigh || null != day.tempLow)){
		return day.tempHigh+" / "+day.tempLow;
	}else{
		return "";
	}
}


function showErrorMessageBasedOnResponse(showErrMsg){
	
	if(showErrMsg){
		$("#chart_div").removeClass("loadingimgusghistory");
		$("#chart_div").hide();
		$("#homeenergydataavailarea").hide();
	   	$("#datanotavailablearea").show();
	}else{
		$("#chart_div").show();
		$("#datanotavailablearea").hide();
	}
}


function drawWeekChartForWeek(yearWeekNumber){
	$.when( getWeeklyUsageAjaxCall(yearWeekNumber) ).done(function(data){
		drawWeekChartAndHandleErrors(data);
	});
}


function getDataArrayForWeekGraph(weeklyUsageData){
	
	try{
		var dataArray = new Array(weekDays);
		var displayWeekAry = weeklyUsageData.dailyDataList;
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


function populateWeekTotalCostAndUsage(weeklyUsageData,forTwoWeeks){
    
   try{
	   var data = {};
	   if(forTwoWeeks){data = weeklyUsageData.currentWeekUsage;}else{data = weeklyUsageData;}
	   $("#energyusedttlid").text("$"+((weeklyUsageData.dataAvailable)?data.weekTotalCost:NA)+" / "+((weeklyUsageData.dataAvailable)?data.weekTotalUsage:NA)+" kWh");
   }catch(err){
	   console.log("ERROR OCCURED WHILE populateWeekTotalCostAndUsage:::"+err.message);
	   throw new TotalCostAndUsageException("Calculating Total cost usage Exception");
   }
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
	
	try{
		if(null != usage && '' != usage){
			$("#messgaetxt").html(weekOf+" "+monthFullLiteralArray[(usage.month)-1]+" "+usage.dayAndYear);
	   	}else{
	   		throw new HeaderMessageException("Populate Header Exception");
	   	}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateHeadingMessage:::"+err.message);
	}
}


function populateTemperaturePoints(weeklyUsageData){
	
	try{
		var tempAry = weeklyUsageData.dailyDataList
		var completeHTML = "";
		var htmlBegin = '<tr><td>';
		var htmlmiddle = '</td><td>';
		var htmlEnd = '</td></tr>';
		completeHTML += htmlBegin;
		for(i=0; i<weekDays; i++){
			if(i != weekDays-1){
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperatureHighTempValue(tempAry[i]):NA) + htmlmiddle;
			}else{
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperatureHighTempValue(tempAry[i]):NA) + htmlEnd;
			}
		}
		completeHTML += htmlBegin;
		for(i=0; i<weekDays; i++){
			if(i != weekDays-1){
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperaturelowTempValue(tempAry[i]):NA)+htmlmiddle;
			}else{
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperaturelowTempValue(tempAry[i]):NA)+htmlEnd;
			}
		}
		$("#temppoints").html(completeHTML).removeClass("temppointcenter").addClass("temppointnormal");
		$("#temppoints td").removeClass("width9").addClass("width17");
	 }catch(err){
		  console.log("ERROR OCCURED WHILE populateTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	  }
}

function getWeeklyUsageAjaxCall(yearWeekNum){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"yearWeekNumber" : yearWeekNum};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/getweekusgforweeknumber.htm",
       data: inpValues,
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


google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
	costAndUsageTab = true;
	$("#chart_div").removeClass("chartdetail").addClass("loadingimgusghistory");
	changeColorsForViewButtons('W');
	drawWeekChartForWeek("");
});


/*END WEEKLY USAGE CHART  */


/*START DAY USAGE CHART  */
function drawDayChartAndHandleErrors(dailyUsageData){
	  
   try{
	   populateDayHeadingMessage(dailyUsageData);
	   populatePrevAndNextNumbers(dailyUsageData);
	   hideArrowsBasedOnData(dailyUsageData);
	   if(viewType == 'G'){
		   populateDayTotalCostAndUsage(dailyUsageData);
		   populateDayTemperaturePoints(dailyUsageData);
		   checkForPCDataAvailableOrNot(dailyUsageData);
		   if(dailyUsageData.dataAvailable){
			   showErrorMessageBasedOnResponse(false);
			   singleGraphData = dailyUsageData;
			   currentDrawnData = dailyUsageData;
			   var data = getDataArrayForDayGraph(dailyUsageData);
			   drawUsageChart(data);
		   }else{showErrorMessageBasedOnResponse(true);}
	   }else{
		   drawTableForDayGraph(dailyUsageData);
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawDayChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawTableForDayGraph(dailyUsageData){
	
	try{
		if(dailyUsageData.dataAvailable){
			var hourAry = dailyUsageData.hourlyData;
			var dataArray = new Array(24);
			var hourLables = getHourLabels();
			var completeHTML;
			var htmlBegin = '<tr><td>';
			var htmlmiddle = '</td><td>';
			var htmlEnd = '</td></tr>';
			completeHTML += htmlBegin+hourLables[0]+htmlmiddle+((null != hourAry)?hourAry.usage1:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost1,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[1]+htmlmiddle+((null != hourAry)?hourAry.usage2:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost2,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[2]+htmlmiddle+((null != hourAry)?hourAry.usage3:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost3,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[3]+htmlmiddle+((null != hourAry)?hourAry.usage4:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost4,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[4]+htmlmiddle+((null != hourAry)?hourAry.usage5:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost5,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[5]+htmlmiddle+((null != hourAry)?hourAry.usage6:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost6,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[6]+htmlmiddle+((null != hourAry)?hourAry.usage7:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost7,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[7]+htmlmiddle+((null != hourAry)?hourAry.usage8:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost8,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[8]+htmlmiddle+((null != hourAry)?hourAry.usage9:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost9,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[9]+htmlmiddle+((null != hourAry)?hourAry.usage10:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost10,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[10]+htmlmiddle+((null != hourAry)?hourAry.usage11:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost11,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[11]+htmlmiddle+((null != hourAry)?hourAry.usage12:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost12,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[12]+htmlmiddle+((null != hourAry)?hourAry.usage13:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost13,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[13]+htmlmiddle+((null != hourAry)?hourAry.usage14:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost14,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[14]+htmlmiddle+((null != hourAry)?hourAry.usage15:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost15,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[15]+htmlmiddle+((null != hourAry)?hourAry.usage16:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost16,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[16]+htmlmiddle+((null != hourAry)?hourAry.usage17:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost17,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[17]+htmlmiddle+((null != hourAry)?hourAry.usage18:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost18,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[18]+htmlmiddle+((null != hourAry)?hourAry.usage19:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost19,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[19]+htmlmiddle+((null != hourAry)?hourAry.usage20:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost20,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[20]+htmlmiddle+((null != hourAry)?hourAry.usage21:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost21,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[21]+htmlmiddle+((null != hourAry)?hourAry.usage22:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost22,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[22]+htmlmiddle+((null != hourAry)?hourAry.usage23:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost23,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			completeHTML += htmlBegin+hourLables[23]+htmlmiddle+((null != hourAry)?hourAry.usage24:null)+htmlmiddle+((null != hourAry)?getFixedDecimalVal(hourAry.cost24,2):null)+htmlmiddle+getTempValueForTable(hourAry)+ htmlEnd;
			$("#transTbody").html(completeHTML);
		}else{
			console.log("NO DATA AVILABLE");
			$("#transTbody").html("");
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE drawTableForWeekGraph:::"+err.message);
	}
}

function getHourLabels(){
	var hourLbl = (viewType == 'T')?'':'<br/>' + 'Usage';
	return ['12am'+hourLbl, '1am'+hourLbl, '2am'+hourLbl ,'3am'+hourLbl,'4am'+hourLbl,'5am'+hourLbl,
            '6am'+hourLbl,'7am'+hourLbl,'8am'+hourLbl,'9am'+hourLbl,'10am'+hourLbl,'11am'+hourLbl,
            '12pm'+hourLbl,'1pm'+hourLbl,'2pm'+hourLbl,'3pm'+hourLbl,'4pm'+hourLbl,'5pm'+hourLbl,
            '6pm'+hourLbl,'7pm'+ hourLbl,'8pm'+hourLbl,'9pm'+hourLbl,'10pm'+hourLbl,'11pm'+hourLbl];
}


function populateDayTotalCostAndUsage(dailyUsageData,forTwoDays){
    
   try{
	   var data = {};
	   if(forTwoDays){data = dailyUsageData.currentDayUsage;}else{data = dailyUsageData;}
	   var dayTotalCost = (dailyUsageData.dataAvailable)?data.hourlyData.totalCost:NA;
	   var dayTotalUsage = (dailyUsageData.dataAvailable)?data.hourlyData.totalUsage:NA;
	   $("#energyusedttlid").text("$"+dayTotalCost+" / "+dayTotalUsage+" kWh");
   }catch(err){
	   console.log("ERROR OCCURED WHILE populateDayTotalCostAndUsage:::"+err.message);
	   throw new TotalCostAndUsageException("Calculating Total Day cost usage Exception");
   }
}

function populateDayHeadingMessage(usage){
	
	try{
		if(null != usage && '' != usage){
			$("#messgaetxt").html(monthFullLiteralArray[(usage.month)-1]+" "+usage.dayAndYear);
	   	}else{
	   		throw new HeaderMessageException("Populate Header Exception");
	   	}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateDayHeadingMessage:::"+err.message);
	}
}


function populateDayTemperaturePoints(dailyUsageData){
	
	try{
		var completeHTML = "";
		var htmlBegin = '<tr><td>';
		var htmlEnd = '</td></tr>';
		completeHTML += htmlBegin;
		completeHTML += getTemperatureHighTempValue(dailyUsageData.hourlyData)  + htmlEnd;
		completeHTML += htmlBegin;
		completeHTML += getTemperaturelowTempValue(dailyUsageData.hourlyData)  + htmlEnd;
		$("#temppoints").html(completeHTML).removeClass("temppointnormal").addClass("temppointcenter");
	 }catch(err){
		  console.log("ERROR OCCURED WHILE populateTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	 }
}


/* function populatePrevAndNextDayNumbers(dailyUsageData){
	
	previousDay = dailyUsageData.prevDay;
	nextDay = dailyUsageData.nextDay;
	if(previousDay === undefined || nextDay === undefined){
		console.log("EITHER PREVIOUS WEEK NUMBER OR NEXT WEEK NUMBER UNDEFINED");
	}
} */


function drawDailyUsageChart(){
	
	replacePreviousBtnText("D");
	changeColorsForViewButtons('D');
	if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
			(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
		getPrevAvgEffCurrDayDataAndPlot(actualDay);
	}else{
		if(isPreviousButtonOnlyClicked()){
			getCompareTwoDaysUsage(actualDay);
		}else if(avgHomeBtnClicked || effHomeBtnClicked){
			getAvgEffCurrDayDataAndPlot(actualDay);
		}else{
			getDailyUsageDataAndDraw(actualDay);
		}
	}
}


function drawWeeklyUsageChart(){
	
	replacePreviousBtnText("W");
	changeColorsForViewButtons('W');
	getWeeklyDataBasedOnButtons();
}


function getWeeklyDataBasedOnButtons(){
	
	if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
			(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
		getPrevAvgEffCurrWeekDataAndPlot(currentYearWeekNumber);
	}else{
		if(isPreviousButtonOnlyClicked()){
			getCompareTwoWeeksUsage(currentYearWeekNumber);
		}else if(avgHomeBtnClicked || effHomeBtnClicked){
			getAvgEffCurrWeekDataAndPlot(currentYearWeekNumber);
		}else{
			drawWeekChartForWeek(currentYearWeekNumber);
		}
	}
}


function getDailyUsageDataAndDraw(actualDay){
	
	$.when( getDailyUsageAjaxCall(actualDay) ).done(function(data){
		drawDayChartAndHandleErrors(data);
	});
}

function getDataArrayForDayGraph(dailyUsageData){
	
	try{
		var dayHours = 24;
		var dataArray = new Array(dayHours);
		var hourlyData = dailyUsageData.hourlyData;
		dataArray[0] = [dayNumLiteralArray[0],parseFloat(hourlyData.usage1),parseFloat(hourlyData.usage1)];
		dataArray[1] = [dayNumLiteralArray[1],parseFloat(hourlyData.usage2),parseFloat(hourlyData.usage2)];
		dataArray[2] = [dayNumLiteralArray[2],parseFloat(hourlyData.usage3),parseFloat(hourlyData.usage3)];
		dataArray[3] = [dayNumLiteralArray[3],parseFloat(hourlyData.usage4),parseFloat(hourlyData.usage4)];
		dataArray[4] = [dayNumLiteralArray[4],parseFloat(hourlyData.usage5),parseFloat(hourlyData.usage5)];
		dataArray[5] = [dayNumLiteralArray[5],parseFloat(hourlyData.usage6),parseFloat(hourlyData.usage6)];
		dataArray[6] = [dayNumLiteralArray[6],parseFloat(hourlyData.usage7),parseFloat(hourlyData.usage7)];
		dataArray[7] = [dayNumLiteralArray[7],parseFloat(hourlyData.usage8),parseFloat(hourlyData.usage8)];
		dataArray[8] = [dayNumLiteralArray[8],parseFloat(hourlyData.usage9),parseFloat(hourlyData.usage9)];
		dataArray[9] = [dayNumLiteralArray[9],parseFloat(hourlyData.usage10),parseFloat(hourlyData.usage10)];
		dataArray[10] = [dayNumLiteralArray[10],parseFloat(hourlyData.usage11),parseFloat(hourlyData.usage11)];
		dataArray[11] = [dayNumLiteralArray[11],parseFloat(hourlyData.usage12),parseFloat(hourlyData.usage12)];
		dataArray[12] = [dayNumLiteralArray[12],parseFloat(hourlyData.usage13),parseFloat(hourlyData.usage13)];
		dataArray[13] = [dayNumLiteralArray[13],parseFloat(hourlyData.usage14),parseFloat(hourlyData.usage14)];
		dataArray[14] = [dayNumLiteralArray[14],parseFloat(hourlyData.usage15),parseFloat(hourlyData.usage15)];
		dataArray[15] = [dayNumLiteralArray[15],parseFloat(hourlyData.usage16),parseFloat(hourlyData.usage16)];
		dataArray[16] = [dayNumLiteralArray[16],parseFloat(hourlyData.usage17),parseFloat(hourlyData.usage17)];
		dataArray[17] = [dayNumLiteralArray[17],parseFloat(hourlyData.usage18),parseFloat(hourlyData.usage18)];
		dataArray[18] = [dayNumLiteralArray[18],parseFloat(hourlyData.usage19),parseFloat(hourlyData.usage19)];
		dataArray[19] = [dayNumLiteralArray[19],parseFloat(hourlyData.usage20),parseFloat(hourlyData.usage20)];
		dataArray[20] = [dayNumLiteralArray[20],parseFloat(hourlyData.usage21),parseFloat(hourlyData.usage21)];
		dataArray[21] = [dayNumLiteralArray[21],parseFloat(hourlyData.usage22),parseFloat(hourlyData.usage22)];
		dataArray[22] = [dayNumLiteralArray[22],parseFloat(hourlyData.usage23),parseFloat(hourlyData.usage23)];
		dataArray[23] = [dayNumLiteralArray[23],parseFloat(hourlyData.usage24),parseFloat(hourlyData.usage24)];
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForDayGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}



function getDailyUsageAjaxCall(actualDay){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"actualDay" : actualDay};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/getdayusgforactualday.htm",
       data: inpValues,
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

/*END DAY USAGE CHART  */


/*START MONTH USAGE CHART  */

function drawMonthlyUsageChart(){
	
	replacePreviousBtnText("M");
	changeColorsForViewButtons('M');
	if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
			(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
		getPrevAvgEffCurrMonthDataAndPlot(actualDay);
	}else{
		if(isPreviousButtonOnlyClicked()){
			getCompareTwoMonthsUsage(actualDay);
		}else if(avgHomeBtnClicked || effHomeBtnClicked){
			getAvgEffCurrMonthDataAndPlot(actualDay);
		}else{
			getMonthlyUsageDataAndDraw(actualDay);
		}
	}
}


function getMonthlyUsageDataAndDraw(day){
	
	$.when( getMonthlyUsageAjaxCall(day) ).done(function(data){
		drawMonthChartAndHandleErrors(data);
	});
}


function drawMonthChartAndHandleErrors(monthlyUsageData){
   
	try{
	   populateMonthHeadingMessage(monthlyUsageData);
	   populatePrevAndNextNumbers(monthlyUsageData);
	   hideArrowsBasedOnData(monthlyUsageData);
	   if(viewType == 'G'){
		   populateMonthTotalCostAndUsage(monthlyUsageData);
		   populateMonthTemperaturePoints(monthlyUsageData);
		   checkForPCDataAvailableOrNot(monthlyUsageData);
		   if(monthlyUsageData.dataAvailable){
			   showErrorMessageBasedOnResponse(false);
			   singleGraphData = monthlyUsageData;
			   currentDrawnData = monthlyUsageData;
			   var data = getDataArrayForMonthGraph(monthlyUsageData);
			   drawUsageChart(data);
		   }else{showErrorMessageBasedOnResponse(true);}
	   }else{
		   drawTableForMonthGraph(monthlyUsageData);
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawDayChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawTableForMonthGraph(monthlyUsageData){
	
	try{
		if(monthlyUsageData.dataAvailable){
			var monthAry = monthlyUsageData.dailyDataList;
			var completeHTML;
			var htmlBegin = '<tr><td>';
			var htmlmiddle = '</td><td>';
			var htmlEnd = '</td></tr>';
			for(i=0; i<monthDays; i++){
				completeHTML += htmlBegin+monthNumLiteralFullArray[i]+htmlmiddle+((null != monthAry[i] && null != monthAry[i].usage)?monthAry[i].usage:'')+
					htmlmiddle+((null != monthAry[i] && null != monthAry[i].cost)?getFixedDecimalVal(monthAry[i].cost,2):'')+htmlmiddle+getTempValueForTable(monthAry[i])+ htmlEnd;
			}
			$("#transTbody").html(completeHTML);
		}else{
			console.log("NO DATA AVILABLE");
			$("#transTbody").html("");
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE drawTableForWeekGraph:::"+err.message);
	}
}


function populateMonthTotalCostAndUsage(monthlyUsageData){
    
   try{
    	var monthTotalCost = monthlyUsageData.totalCost;
		var monthTotalUsage = monthlyUsageData.totalUsage;
    	$("#energyusedttlid").text("$"+monthTotalCost+" / "+monthTotalUsage+" kWh");
   }catch(err){
	   console.log("ERROR OCCURED WHILE populateMonthTotalCostAndUsage:::"+err.message);
	   throw new TotalCostAndUsageException("Calculating Total Year cost usage Exception");
   }
}


function populateMonthHeadingMessage(usage){
	
	try{
		if(null != usage && '' != usage){
			$("#messgaetxt").html(monthFullLiteralArray[(usage.monthNum)-1]+" "+usage.year);
	   	}else{
	   		throw new HeaderMessageException("Populate Header Exception");
	   	}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateMonthHeadingMessage:::"+err.message);
	}
}


function populateMonthTemperaturePoints(monthlyUsageData){
	
	try{
		var completeHTML = "";
		var htmlBegin = '<tr><td>';
		var htmlEnd = '</td></tr>';
		completeHTML += htmlBegin;
		completeHTML += getTemperatureHighTempAvgValue(monthlyUsageData)  + htmlEnd;
		completeHTML += htmlBegin;
		completeHTML += getTemperaturelowTempAvgValue(monthlyUsageData)  + htmlEnd;
		$("#temppoints").html(completeHTML).removeClass("temppointnormal").addClass("temppointcenter");
	 }catch(err){
		  console.log("ERROR OCCURED WHILE populateTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	 }
}


function getDataArrayForMonthGraph(monthlyUsageData){
	
	try{
		var dataArray = new Array(monthDays);
		var displayWeekAry = monthlyUsageData.dailyDataList;
		for(i=0; i<monthDays; i++){
			var dataRow = CreateDataArrayForMonthChart(displayWeekAry[i],i);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function CreateDataArrayForMonthChart(weekInDisplay,i){
	
	try{
		return [monthLiteralArray[i], (null != weekInDisplay && null != weekInDisplay.usage)?getCostOrUsageValue(weekInDisplay.usage):null,
				(null != weekInDisplay && null != weekInDisplay.usage)?getCostOrUsageValue(weekInDisplay.usage):null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}


function getMonthlyUsageAjaxCall(day){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"actualDay" : day};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/getmonthlyusageforday.htm",
       data: inpValues,
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

/*END MONTH USAGE CHART  */

/*START YEAR USAGE CHART  */
 
function drawYearlyUsageChart(){
	
	replacePreviousBtnText("Y");
	changeColorsForViewButtons('Y');
	if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
			(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
		getPrevAvgEffCurrYearDataAndPlot(currentYear);
	}else{
		if(isPreviousButtonOnlyClicked()){
			getCompareTwoYearsUsage(currentYearWeekNumber);
		}else if(avgHomeBtnClicked || effHomeBtnClicked){
			getAvgEffCurrYearDataAndPlot(currentYear);
		}else{
			getYearlyUsageDataAndDraw(currentYear);
		}
	}
}

function getYearlyUsageDataAndDraw(year){
	
	$.when( getYearlyUsageAjaxCall(year) ).done(function(data){
		drawYearChartAndHandleErrors(data);
	});
}


function drawYearChartAndHandleErrors(yearlyUsageData){
	
  try{
	   populateYearHeadingMessage(yearlyUsageData);
	   populatePrevAndNextNumbers(yearlyUsageData);
	   hideArrowsBasedOnData(yearlyUsageData);
	   if(viewType == 'G'){
		   populateYearTemperaturePoints(yearlyUsageData);
		   populateYearTotalCostAndUsage(yearlyUsageData);
		   checkForPCDataAvailableOrNot(yearlyUsageData);
		   if(yearlyUsageData.dataAvailable){
			   showErrorMessageBasedOnResponse(false);
			   singleGraphData = yearlyUsageData;
			   currentDrawnData = yearlyUsageData;
			   var data = getDataArrayForYearGraph(yearlyUsageData);
			   drawUsageChart(data);
		   }else{showErrorMessageBasedOnResponse(true);}
	   }else{
		   drawTableForYearGraph(yearlyUsageData);
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawDayChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}

function drawTableForYearGraph(yearlyUsageData){
	
	try{
		if(yearlyUsageData.dataAvailable){
			var monthAry = yearlyUsageData.monthlyDataList;
			var completeHTML;
			var htmlBegin = '<tr><td>';
			var htmlmiddle = '</td><td>';
			var htmlEnd = '</td></tr>';
			for(i=0; i<numberOfMonths; i++){
				completeHTML += htmlBegin+monthFullLiteralArray[i]+htmlmiddle+((null != monthAry[i] && null != monthAry[i].usage)?monthAry[i].usage:'')+
					htmlmiddle+((null != monthAry[i] && null != monthAry[i].cost)?getFixedDecimalVal(monthAry[i].cost,2):'')+htmlmiddle+getTempValueForTable(monthAry[i])+ htmlEnd;
			}
			$("#transTbody").html(completeHTML);
		}else{
			console.log("NO DATA AVILABLE");
			$("#transTbody").html("");
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE drawTableForWeekGraph:::"+err.message);
	}
}


function populateYearTotalCostAndUsage(yearlyUsageData){
    
   try{
    	var yearTotalCost = yearlyUsageData.totalCost;
		var yearTotalUsage = yearlyUsageData.totalUsage;
    	$("#energyusedttlid").text("$"+yearTotalCost+" / "+yearTotalUsage+" kWh");
   }catch(err){
	   console.log("ERROR OCCURED WHILE populateYearTotalCostAndUsage:::"+err.message);
	   throw new TotalCostAndUsageException("Calculating Total Year cost usage Exception");
   }
}

function populateYearHeadingMessage(yearlyUsageData){
	
	try{
		if(null != yearlyUsageData && '' != yearlyUsageData){
	   		$(".messgaetxt").text(yearlyUsageData.year);
	   	}else{
	   		throw new HeaderMessageException("Populate Header Exception");
	   	}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateYearHeadingMessage:::"+err.message);
	}
}

function populateYearTemperaturePoints(yearlyUsageData){
	
	try{
		var tempAry = yearlyUsageData.monthlyDataList;
		var completeHTML = "";
		var htmlBegin = '<tr><td>';
		var htmlmiddle = '</td><td>';
		var htmlEnd = '</td></tr>';
		completeHTML += htmlBegin;
		for(i=0; i<numberOfMonths; i++){
			if(i != numberOfMonths-1){
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperatureHighTempValue(tempAry[i]):NA) + htmlmiddle;
			}else{
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperatureHighTempValue(tempAry[i]):NA) + htmlEnd;
			}
		}
		completeHTML += htmlBegin;
		for(i=0; i<numberOfMonths; i++){
			if(i != numberOfMonths-1){
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperaturelowTempValue(tempAry[i]):NA)+htmlmiddle;
			}else{
				completeHTML += ((null != tempAry && null != tempAry[i])?getTemperaturelowTempValue(tempAry[i]):NA)+htmlEnd;
			}
		}
		$("#temppoints").html(completeHTML).removeClass("temppointcenter").addClass("temppointnormal");
		$("#temppoints td").removeClass("width17").addClass("width9");
	 }catch(err){
		  console.log("ERROR OCCURED WHILE populateYearTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	  }
}


/* function populatePrevAndNextYearNumbers(yearlyUsageData){
	
	previousYear = yearlyUsageData.previousYear;
	nextYear = yearlyUsageData.nextYear;
	if(previousYear === undefined || nextYear === undefined){
		console.log("EITHER PREVIOUS YEAR NUMBER OR NEXT YEAR NUMBER UNDEFINED");
	}
} */


function getDataArrayForYearGraph(yearlyUsageData){
	
	try{
		var dataArray = new Array(numberOfMonths);
		var displayMonthAry = yearlyUsageData.monthlyDataList;
		for(i=0; i<numberOfMonths; i++){
			var dataRow = CreateDataArrayForYearChart(displayMonthAry[i],i);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function CreateDataArrayForYearChart(yearInDisplay,i){
	
	monthLblLiteralArray
	try{
		return [monthLblLiteralArray[i], (null != yearInDisplay && null != yearInDisplay.usage)?getCostOrUsageValue(yearInDisplay.usage):null,
				(null != yearInDisplay && null != yearInDisplay.usage)?getCostOrUsageValue(yearInDisplay.usage):null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForYearChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}


function getYearlyUsageAjaxCall(year){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"yearMonthNum" : year};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/getyearlyusageforyear.htm",
       data: inpValues,
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


/*END YEAR USAGE CHART  */


/*PREVIOUS CHARTs START  */

function getGraphTypeBasedOnPreviousBtnClass(){
	
	var previousBtn = $("#selecttocomparediv a:first-child");
	if(previousBtn.hasClass("prevW")){
		return "W";
	}else if(previousBtn.hasClass("prevD")){
		return "D";
	}else if(previousBtn.hasClass("prevM")){
		return "M";
	}else if(previousBtn.hasClass("prevY")){
		return "Y";
	}
}

function isPreviousButtonDisabled(){
	if($("#selecttocomparediv a:first-child").hasClass("comparednotselected")){
		return false;
	}
	return true;
}

function drawPreviousDataChart(){
	
	disableOrHighlightCompButtons('PREVGRAPH');
	var graphContext = getGraphTypeBasedOnPreviousBtnClass();
	console.log("graphContext::::"+graphContext);
	if(graphContext == 'W' && isPreviousButtonDisabled()){
		getCompareTwoWeeksUsage(currentYearWeekNumber);
	}else if(graphContext == 'D' && isPreviousButtonDisabled()){
		getCompareTwoDaysUsage(actualDay);
	}else if(graphContext == 'M' && isPreviousButtonDisabled()){
		getCompareTwoMonthsUsage(actualDay);
	}else if(graphContext == 'Y' && isPreviousButtonDisabled()){
		getCompareTwoYearsUsage(currentYearWeekNumber);
	}
}


function getCompareTwoWeeksUsage(currentYearWeekNumber){
	
	$.when( getTwoWeeksCompUsageAjaxCall(currentYearWeekNumber) ).done(function(data){
		drawCompareTwoWeeksChartAndHandleErrors(data);
	});
}


function getCompareTwoDaysUsage(actualDay){
	
	$.when( getTwoDaysCompUsageAjaxCall(actualDay) ).done(function(data){
		drawCompareTwoDaysChartAndHandleErrors(data);
	});
}


function getCompareTwoMonthsUsage(actualDay){
	
	$.when( getTwoMonthsCompUsageAjaxCall(actualDay) ).done(function(data){
		drawCompareTwoMonthsChartAndHandleErrors(data);
	});
}


function getCompareTwoYearsUsage(yearNum){
	
	yearNum = yearNum.substring(0,4);
	$.when( getTwoYearsCompUsageAjaxCall(yearNum) ).done(function(data){
		drawTwoYearsChartAndHandleErrors(data);
	});
}



function drawCompareTwoWeeksChartAndHandleErrors(twoWeeksData){
	
	try{
	   populateTwoWeeksHeadingMessage(twoWeeksData);
	   populatePrevAndNextNumbers(twoWeeksData);
	   hideArrowsBasedOnData(twoWeeksData);
	   populateCompWeekTotalCostAndUsage(twoWeeksData);
	   populateTwoWeeksTemperaturePoints(twoWeeksData);
	   checkForPCDataAvailableOrNot(twoWeeksData);
	   if(twoWeeksData.dataAvailable){
		   showErrorMessageBasedOnResponse(false);
		   currentDrawnData = twoWeeksData;
		   compareGrpahData = twoWeeksData;
		   var data = getDataArrayForWeeklyGraph();
		   drawUsageChart(data);
	   }else{showErrorMessageBasedOnResponse(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawCompareTwoWeeksChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawCompareTwoDaysChartAndHandleErrors(twoDaysData){
	
	try{
	   populateTwoDaysHeadingMessage(twoDaysData);
	   populatePrevAndNextNumbers(twoDaysData);
	   hideArrowsBasedOnData(twoDaysData);
	   populateCompDayTotalCostAndUsage(twoDaysData);
	   populateTwoDaysTemperaturePoints(twoDaysData);
	   checkForPCDataAvailableOrNot(twoDaysData);
	   if(twoDaysData.dataAvailable){
		   showErrorMessageBasedOnResponse(false);
		   currentDrawnData = twoDaysData;
		   compareGrpahData = twoDaysData;
		   var data = getDataArrayForDailyGraph();
		   drawUsageChart(data);
	   }else{showErrorMessageBasedOnResponse(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawCompareTwoDaysChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawCompareTwoMonthsChartAndHandleErrors(twoMonthsData){
	
	try{
	   populatePrevAndNextNumbers(twoMonthsData);
	   hideArrowsBasedOnData(twoMonthsData);
	   populateTwoMonthsHeadingMessage(twoMonthsData);
	   populateTwoMonthsTemperaturePoints(twoMonthsData);
	   populateTwoMonthsTotalCostAndUsage(twoMonthsData);
	   checkForPCDataAvailableOrNot(twoMonthsData);
	   if(twoMonthsData.dataAvailable){
		   showErrorMessageBasedOnResponse(false);
		   currentDrawnData = twoMonthsData;
		   compareGrpahData = twoMonthsData;
		   var data = getDataArrayForMonthlyGraph();
		   drawUsageChart(data);
	   }else{showErrorMessageBasedOnResponse(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawCompareTwoMonthsChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function drawTwoYearsChartAndHandleErrors(twoYearsData){
 
	try{
	   populateTwoYearsHeadingMessage(twoYearsData);
	   populatePrevAndNextNumbers(twoYearsData);
	   hideArrowsBasedOnData(twoYearsData);
	   populateTwoYearsTemperaturePoints(twoYearsData);
	   populateTwoYearsTotalCostAndUsage(twoYearsData);
	   checkForPCDataAvailableOrNot(twoYearsData);
	   if(twoYearsData.dataAvailable){
		   showErrorMessageBasedOnResponse(false);
		   currentDrawnData = twoYearsData;
		   compareGrpahData = twoYearsData;
		   var data = getDataArrayForYearlyGraph();
		   drawUsageChart(data);
	   }else{showErrorMessageBasedOnResponse(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawTwoYearsChartAndHandleErrors:::"+err.message);
	   showErrorMessageBasedOnResponse(true);
   }
}


function populateCompWeekTotalCostAndUsage(twoWeeksData){
    populateWeekTotalCostAndUsage(twoWeeksData,true);
}
 

function populateCompDayTotalCostAndUsage(twoDaysData){
    populateDayTotalCostAndUsage(twoDaysData,true);
}


function populateTwoMonthsTotalCostAndUsage(twoMonthsData){
    
	var currentMonth = twoMonthsData.currentMonthUsage;
	populateMonthTotalCostAndUsage(currentMonth);
}


function populateTwoYearsTotalCostAndUsage(twoYearsData){
    
   var currentYear = twoYearsData.currentYearUsage;
   populateYearTotalCostAndUsage(currentYear);
}


function populateTwoWeeksHeadingMessage(twoWeeksData){
		
	var currentWeek = twoWeeksData.currentWeekUsage;
	populateHeadingMessage(currentWeek);
}

function populateTwoDaysHeadingMessage(twoDaysData){
	
	var currentDay = twoDaysData.currentDayUsage;
	populateDayHeadingMessage(currentDay);
}


function populateTwoMonthsHeadingMessage(twoMonthsData){
	
	var currentMonth = twoMonthsData.currentMonthUsage;
	populateMonthHeadingMessage(currentMonth);
}

function populateTwoYearsHeadingMessage(twoYearsData){
	
	var currentYear = twoYearsData.currentYearUsage;
	populateYearHeadingMessage(currentYear);
}

function populateTwoWeeksTemperaturePoints(twoWeeksData){
	
	var currentWeek = twoWeeksData.currentWeekUsage;
	populateTemperaturePoints(currentWeek);
}


function populateTwoDaysTemperaturePoints(twoDaysData){
	
	var currentDay = twoDaysData.currentDayUsage;
	populateDayTemperaturePoints(currentDay);
}

function populateTwoMonthsTemperaturePoints(twoMonthsData){
	
	var currentMonth = twoMonthsData.currentMonthUsage;
	populateMonthTemperaturePoints(currentMonth);
}


function populateTwoYearsTemperaturePoints(twoYearsData){
	
	var currentYear = twoYearsData.currentYearUsage;
	populateYearTemperaturePoints(currentYear);
}


function getTwoWeeksCompUsageAjaxCall(yearWeekNum){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"yearWeekNumber" : yearWeekNum};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/gettwoweekscompare.htm",
       data: inpValues,
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


function getTwoDaysCompUsageAjaxCall(actualDay){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"actualDay" : actualDay};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/gettwodayscompare.htm",
       data: inpValues,
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


function getTwoMonthsCompUsageAjaxCall(actualDay){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"actualDay" : actualDay};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/gettwomonthscompare.htm",
       data: inpValues,
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


function getTwoYearsCompUsageAjaxCall(year){
	
	var dfd = jQuery.Deferred();
	var inpValues = {"yearMonthNum" : year};
    $.ajax({  
       type: "POST", 
       url: "/protected/usageHistory/esense/gettwoyearscompare.htm",
       data: inpValues,
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


/* PREVIOUS CHARTs END */


/*AVERAGE HOME CHART START  */

function drawAverageHomeChart(){
	
	disableOrHighlightCompButtons('AVGHOME');
	var graphContext = getGraphTypeBasedOnPreviousBtnClass();
	if(graphContext == 'W' && avgHomeBtnClicked){
		drawPCWeeklyAverageUsage(currentYearWeekNumber);
	}else if(graphContext == 'D' && avgHomeBtnClicked){
		drawPCDailyAverageUsage(actualDay);
	}else if(graphContext == 'M' && avgHomeBtnClicked){
		drawPCMonthlyAverageUsage(actualDay);
	}else if(graphContext == 'Y' && avgHomeBtnClicked){
		drawPCYearlyAverageUsage(currentYear);
	}
}


function drawPCWeeklyAverageUsage(currentYearWeekNumber){
	
	if(avgOrEffDataAvailable){
		drawPCWeeklyAvgChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(currentYearWeekNumber) ).done(function(data){
			disableOrEnableAvgCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCWeeklyAvgChartAndHandleErrors(data);
			}else{
				console.log("no data for weekly average");
				graphType = 'week-avg';
			}
		});
	}
}

function drawPCDailyAverageUsage(actualDay){
	
	if(avgOrEffDataAvailable){
		drawPCDailyAvgChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
			disableOrEnableAvgCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCDailyAvgChartAndHandleErrors(data);
			}else{
				console.log("no data for daily average");
				graphType = 'day-avg';
			}
		});
	}
}

function drawPCMonthlyAverageUsage(actualDay){
	
	if(avgOrEffDataAvailable){
		drawPCMonthlyAvgChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
			disableOrEnableAvgCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCMonthlyAvgChartAndHandleErrors(data);
			}else{
				console.log("no data for monthly average");
				graphType = 'month-avg';
			}
		});
	}
}

function drawPCYearlyAverageUsage(currentYear){
	
	if(avgOrEffDataAvailable){
		drawPCYearlyAvgChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(currentYear) ).done(function(data){
			disableOrEnableAvgCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCYearlyAvgChartAndHandleErrors(data);
			}else{
				console.log("no data for yearly average");
				graphType = 'year-avg';
			}
		});
	}
}


function drawPCWeeklyAvgChartAndHandleErrors(pcWeeklyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcWeeklyUsage;
	   var data = getDataArrayForWeeklyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCWeeklyAvgChartAndHandleErrors:::"+err.message);
   }
}


function drawPCDailyAvgChartAndHandleErrors(pcDailyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcDailyUsage;
	   var data = getDataArrayForDailyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCDailyAvgChartAndHandleErrors:::"+err.message);
   }
}


function drawPCMonthlyAvgChartAndHandleErrors(pcMonthlyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcMonthlyUsage;
	   var data = getDataArrayForMonthlyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCMonthlyAvgChartAndHandleErrors:::"+err.message);
   }
}


function drawPCYearlyAvgChartAndHandleErrors(pcYearlyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcYearlyUsage;
	   var data = getDataArrayForYearlyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCYearlyAvgChartAndHandleErrors:::"+err.message);
   }
}



function getDataArrayForWeeklyGraph(){
	
	try{
		var dataArray = new Array(weekDays);
		var avgUsageWeekAry;
		var effUsageWeekAry;
		var currentWeekAry;
		var previousWeekAry
		
		if(avgHomeBtnClicked && avgOrEffDataAvailable){
			avgUsageWeekAry = avgOrEffData.avgWeekUsage.dailyDataList;
		}
		if(effHomeBtnClicked && avgOrEffDataAvailable){
			effUsageWeekAry = avgOrEffData.effWeekUsage.dailyDataList;
		}
		if(prevBtnClicked){
			currentWeekAry = compareGrpahData.currentWeekUsage.dailyDataList;
			previousWeekAry = compareGrpahData.previousWeekUsage.dailyDataList;
		}else{
			currentWeekAry = singleGraphData.dailyDataList;
		}
		
		
		for(i=0; i<weekDays; i++){
			var	dataRow = CreateDataArrayForWeekAvgAndEffChart(currentWeekAry[i],(prevBtnClicked)?previousWeekAry[i]:null,
						(avgHomeBtnClicked && avgOrEffDataAvailable)?avgUsageWeekAry[i]:null,(effHomeBtnClicked && avgOrEffDataAvailable)?effUsageWeekAry[i]:null,i,true);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}



function getDataArrayForDailyGraph(){
	
	try{
		var dayHours = 24;
		var dataArray = new Array(dayHours);
		var avgUsageHourData;
		var effUsageHourData;
		var currUsgHourData;
		var prevUsgHourData;
		
		if(avgHomeBtnClicked && avgOrEffDataAvailable){
			avgUsageHourData = avgOrEffData.avgHourlyData;
		}
		if(effHomeBtnClicked && avgOrEffDataAvailable){
			effUsageHourData = avgOrEffData.effHourlyData;
		}
		if(prevBtnClicked){
			currUsgHourData = compareGrpahData.currentDayUsage.hourlyData;
			prevUsgHourData = compareGrpahData.previousDayUsage.hourlyData;
		}else{
			currUsgHourData = singleGraphData.hourlyData;
		}
		dataArray[0] = [dayNumLiteralArray[0],parseFloat(currUsgHourData.usage1),parseFloat(currUsgHourData.usage1),(prevBtnClicked)?parseFloat(prevUsgHourData.usage1):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage1):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage1):null];
		dataArray[1] = [dayNumLiteralArray[1],parseFloat(currUsgHourData.usage2),parseFloat(currUsgHourData.usage2),(prevBtnClicked)?parseFloat(prevUsgHourData.usage2):null,
				(avgHomeBtnClicked  && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage2):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage2):null];
		dataArray[2] = [dayNumLiteralArray[2],parseFloat(currUsgHourData.usage3),parseFloat(currUsgHourData.usage3),(prevBtnClicked)?parseFloat(prevUsgHourData.usage3):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage3):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage3):null];
		dataArray[3] = [dayNumLiteralArray[3],parseFloat(currUsgHourData.usage4),parseFloat(currUsgHourData.usage4),(prevBtnClicked)?parseFloat(prevUsgHourData.usage4):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage4):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage4):null];
		dataArray[4] = [dayNumLiteralArray[4],parseFloat(currUsgHourData.usage5),parseFloat(currUsgHourData.usage5),(prevBtnClicked)?parseFloat(prevUsgHourData.usage5):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage5):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage5):null];
		dataArray[5] = [dayNumLiteralArray[5],parseFloat(currUsgHourData.usage6),parseFloat(currUsgHourData.usage6),(prevBtnClicked)?parseFloat(prevUsgHourData.usage6):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage6):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage6):null];
		dataArray[6] = [dayNumLiteralArray[6],parseFloat(currUsgHourData.usage7),parseFloat(currUsgHourData.usage7),(prevBtnClicked)?parseFloat(prevUsgHourData.usage7):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage7):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage7):null];
		dataArray[7] = [dayNumLiteralArray[7],parseFloat(currUsgHourData.usage8),parseFloat(currUsgHourData.usage8),(prevBtnClicked)?parseFloat(prevUsgHourData.usage8):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage8):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage8):null];
		dataArray[8] = [dayNumLiteralArray[8],parseFloat(currUsgHourData.usage9),parseFloat(currUsgHourData.usage9),(prevBtnClicked)?parseFloat(prevUsgHourData.usage9):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage9):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage9):null];
		dataArray[9] = [dayNumLiteralArray[9],parseFloat(currUsgHourData.usage10),parseFloat(currUsgHourData.usage10),(prevBtnClicked)?parseFloat(prevUsgHourData.usage10):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage10):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage10):null];
		dataArray[10] = [dayNumLiteralArray[10],parseFloat(currUsgHourData.usage11),parseFloat(currUsgHourData.usage11),(prevBtnClicked)?parseFloat(prevUsgHourData.usage11):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage11):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage11):null];
		dataArray[11] = [dayNumLiteralArray[11],parseFloat(currUsgHourData.usage12),parseFloat(currUsgHourData.usage12),(prevBtnClicked)?parseFloat(prevUsgHourData.usage12):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage12):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage12):null];
		dataArray[12] = [dayNumLiteralArray[12],parseFloat(currUsgHourData.usage13),parseFloat(currUsgHourData.usage13),(prevBtnClicked)?parseFloat(prevUsgHourData.usage13):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage13):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage13):null];
		dataArray[13] = [dayNumLiteralArray[13],parseFloat(currUsgHourData.usage14),parseFloat(currUsgHourData.usage14),(prevBtnClicked)?parseFloat(prevUsgHourData.usage14):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage14):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage14):null];
		dataArray[14] = [dayNumLiteralArray[14],parseFloat(currUsgHourData.usage15),parseFloat(currUsgHourData.usage15),(prevBtnClicked)?parseFloat(prevUsgHourData.usage15):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage15):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage15):null];
		dataArray[15] = [dayNumLiteralArray[15],parseFloat(currUsgHourData.usage16),parseFloat(currUsgHourData.usage16),(prevBtnClicked)?parseFloat(prevUsgHourData.usage16):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage16):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage16):null];
		dataArray[16] = [dayNumLiteralArray[16],parseFloat(currUsgHourData.usage17),parseFloat(currUsgHourData.usage17),(prevBtnClicked)?parseFloat(prevUsgHourData.usage17):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage17):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage17):null];
		dataArray[17] = [dayNumLiteralArray[17],parseFloat(currUsgHourData.usage18),parseFloat(currUsgHourData.usage18),(prevBtnClicked)?parseFloat(prevUsgHourData.usage18):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage18):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage18):null];
		dataArray[18] = [dayNumLiteralArray[18],parseFloat(currUsgHourData.usage19),parseFloat(currUsgHourData.usage19),(prevBtnClicked)?parseFloat(prevUsgHourData.usage19):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage19):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage19):null];
		dataArray[19] = [dayNumLiteralArray[19],parseFloat(currUsgHourData.usage20),parseFloat(currUsgHourData.usage20),(prevBtnClicked)?parseFloat(prevUsgHourData.usage20):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage20):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage20):null];
		dataArray[20] = [dayNumLiteralArray[20],parseFloat(currUsgHourData.usage21),parseFloat(currUsgHourData.usage21),(prevBtnClicked)?parseFloat(prevUsgHourData.usage21):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage21):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage21):null];
		dataArray[21] = [dayNumLiteralArray[21],parseFloat(currUsgHourData.usage22),parseFloat(currUsgHourData.usage22),(prevBtnClicked)?parseFloat(prevUsgHourData.usage22):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage22):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage22):null];
		dataArray[22] = [dayNumLiteralArray[22],parseFloat(currUsgHourData.usage23),parseFloat(currUsgHourData.usage23),(prevBtnClicked)?parseFloat(prevUsgHourData.usage23):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage23):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage23):null];
		dataArray[23] = [dayNumLiteralArray[23],parseFloat(currUsgHourData.usage24),parseFloat(currUsgHourData.usage24),(prevBtnClicked)?parseFloat(prevUsgHourData.usage24):null,
				(avgHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(avgUsageHourData.usage24):null,(effHomeBtnClicked && avgOrEffDataAvailable)?parseFloat(effUsageHourData.usage24):null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForDailyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function getDataArrayForMonthlyGraph(){
	
	try{
		var dataArray = new Array(monthDays);
		var avgUsageMonthAry;
		var effUsageMonthAry;
		var currentMonthAry;
		var previousMonthAry;
		
		if(avgHomeBtnClicked && avgOrEffDataAvailable){
			avgUsageMonthAry = avgOrEffData.avgMonthUsage.dailyDataList;
		}
		if(effHomeBtnClicked && avgOrEffDataAvailable){
			effUsageMonthAry = avgOrEffData.effMonthUsage.dailyDataList;
		}
		if(prevBtnClicked){
			currentMonthAry = compareGrpahData.currentMonthUsage.dailyDataList;
			previousMonthAry = compareGrpahData.previousMonthUsage.dailyDataList;
		}else{
			currentMonthAry = singleGraphData.dailyDataList;
		}
		for(i=0; i<monthDays; i++){
			
			var	dataRow = CreateDataArrayForWeekAvgAndEffChart(currentMonthAry[i],(prevBtnClicked)?previousMonthAry[i]:null,
					(avgHomeBtnClicked && avgOrEffDataAvailable)?avgUsageMonthAry[i]:null,(effHomeBtnClicked && avgOrEffDataAvailable)?effUsageMonthAry[i]:null,i,false);
			dataArray[i] = dataRow;
		}
			
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForMonthlyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function getDataArrayForYearlyGraph(){
	
	try{
		var dataArray = new Array(numberOfMonths);
		var avgUsageYearAry;
		var effUsageYearAry;
		var currentYearAry;
		var previousYearAry;
		
		if(avgHomeBtnClicked && avgOrEffDataAvailable){
			avgUsageYearAry = avgOrEffData.avgYearUsage.monthlyDataList;
		}
		if(effHomeBtnClicked && avgOrEffDataAvailable){
			effUsageYearAry = avgOrEffData.effYearUsage.monthlyDataList;
		}
		if(prevBtnClicked){
			currentYearAry = compareGrpahData.currentYearUsage.monthlyDataList;
			previousYearAry = compareGrpahData.previousYearUsage.monthlyDataList;
		}else{
			currentYearAry = singleGraphData.monthlyDataList;
		}
		for(i=0; i<numberOfMonths; i++){
			
			var	dataRow = CreateDataArrayForYearAvgAndEffChart(currentYearAry[i],(prevBtnClicked)?previousYearAry[i]:null,
					(avgHomeBtnClicked && avgOrEffDataAvailable)?avgUsageYearAry[i]:null,(effHomeBtnClicked && avgOrEffDataAvailable)?effUsageYearAry[i]:null,i);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForYearlyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
	
}


function CreateDataArrayForWeekAvgAndEffChart(currWeek,prevWeek,avgWeek,effWeek,i,forWeek){
	
	try{
		return [forWeek?dayLiteralArray[i]:monthLiteralArray[i],(null != currWeek && null != currWeek.usage)?getCostOrUsageValue(currWeek.usage):null,
				(null != currWeek && null != currWeek.usage)?getCostOrUsageValue(currWeek.usage):null,(null != prevWeek && null != prevWeek.usage)?getCostOrUsageValue(prevWeek.usage):null,
						(null != avgWeek && null != avgWeek.usage)?getCostOrUsageValue(avgWeek.usage):null,(null != effWeek && null != effWeek.usage)?getCostOrUsageValue(effWeek.usage):null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForWeekAvgAndEffChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}


function CreateDataArrayForYearAvgAndEffChart(currMonth,prevMonth,avgMonth,effMonth,i){
	
	try{
		return dataRow = [monthLblLiteralArray[i],(null != currMonth && null != currMonth.usage)?getCostOrUsageValue(currMonth.usage):null,(null != currMonth && null != currMonth.usage)?getCostOrUsageValue(currMonth.usage):null,
				(null != prevMonth && null != prevMonth.usage)?getCostOrUsageValue(prevMonth.usage):null,(null != avgMonth && null != avgMonth.usage)?getCostOrUsageValue(avgMonth.usage):null,
						(null != effMonth && null != effMonth.usage)?getCostOrUsageValue(effMonth.usage):null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForYearAvgAndEffChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}


function getPCUsageAjaxCallBasedOnGraphType(inputVal){
	
	var inpValues = {};
	var postURL = '';
	var graphType = getGraphTypeBasedOnPreviousBtnClass();
	if(graphType == 'W'){
		inpValues = {"yearWeekNumber" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcweeklyusage.htm";
	}else if(graphType == 'D'){
		inpValues = {"actualDay" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcdailyusage.htm";
	}else if(graphType == 'M'){
		inpValues = {"actualDay" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcmonthlyusage.htm";
	}else if(graphType == 'Y'){
		inpValues = {"yearMonthNum" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcyearlyusage.htm";
	}
	var dfd = jQuery.Deferred();
	$.ajax({  
       type: "POST", 
       url: postURL,
       data: inpValues,
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


function isPCDataAvailable(inData){
	
	var inpValues = {};
	var postURL = '/protected/usageHistory/esense/ispcdataavailable.htm';
	var graphType = getGraphTypeBasedOnPreviousBtnClass();
	if(graphType == 'W'){inpValues = {"yearWeekNumber" : inData.currentYearWeekNum};
	}else if(graphType == 'D' || graphType == 'M'){inpValues = {"actualDay" : inData.actualDay};
	}else if(graphType == 'Y'){inpValues = {"yearMonthNum" : inData.currentYear};}
	var dfd = jQuery.Deferred();
	$.ajax({  
       type: "POST", 
       url: postURL,
       data: inpValues,
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

/* AVERAGE HOME CHART END */


/*EFFICIENT HOME CHART START  */

function drawEfficientChart(){
	
	disableOrHighlightCompButtons('EFFHOME');
	var graphContext = getGraphTypeBasedOnPreviousBtnClass();
	if(graphContext == 'W' && effHomeBtnClicked){
		drawPCWeeklyEfficientUsage(currentYearWeekNumber);
	}else if(graphContext == 'D' && effHomeBtnClicked){
		drawPCDailyEfficientUsage(actualDay);
	}else if(graphContext == 'M' && effHomeBtnClicked){
		drawPCMonthlyEfficientUsage(actualDay);
	}else if(graphContext == 'Y' && effHomeBtnClicked){
		drawPCYearlyEfficientUsage(currentYear);
	}
}


function drawPCWeeklyEffChartAndHandleErrors(pcWeeklyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcWeeklyUsage;
	   var data = getDataArrayForWeeklyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCWeeklyEffChartAndHandleErrors:::"+err.message);
   }
}

function drawPCDailyEffChartAndHandleErrors(pcDailyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcDailyUsage;
	   var data = getDataArrayForDailyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCDailyEffChartAndHandleErrors:::"+err.message);
   }
}


function drawPCMonthlyEffChartAndHandleErrors(pcMonthlyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcMonthlyUsage;
	   var data = getDataArrayForMonthlyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCMonthlyEffChartAndHandleErrors:::"+err.message);
   }
}


function drawPCYearlyEffChartAndHandleErrors(pcYearlyUsage){
	
   try{
	   avgOrEffDataAvailable = true;
	   avgOrEffData = pcYearlyUsage;
	   var data = getDataArrayForYearlyGraph();
	   drawUsageChart(data);
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCYearlyEffChartAndHandleErrors:::"+err.message);
   }
}


function drawPCWeeklyEfficientUsage(currentYearWeekNumber){
	
	if(avgOrEffDataAvailable){
		drawPCWeeklyEffChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(currentYearWeekNumber) ).done(function(data){
			disableOrEnableEffCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCWeeklyEffChartAndHandleErrors(data);
			}else{
				console.log("no data for weekly efficient");
				graphType = 'week-eff';
			}
		});
	}
}

function drawPCDailyEfficientUsage(actualDay){
	
	if(avgOrEffDataAvailable){
		drawPCDailyEffChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
			disableOrEnableEffCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCDailyEffChartAndHandleErrors(data);
			}else{
				console.log("no data for daily efficient");
				graphType = 'day-eff';
			}
		});
	}
}

function drawPCMonthlyEfficientUsage(actualDay){
	
	if(avgOrEffDataAvailable){
		drawPCMonthlyEffChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
			disableOrEnableEffCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCMonthlyEffChartAndHandleErrors(data);
			}else{
				console.log("no data for monthly efficient");
				graphType = 'month-eff';
			}
		});
	}
}

function drawPCYearlyEfficientUsage(currentYear){
	
	if(avgOrEffDataAvailable){
		drawPCYearlyEffChartAndHandleErrors(avgOrEffData);
	}else{
		$.when( getPCUsageAjaxCallBasedOnGraphType(currentYear) ).done(function(data){
			disableOrEnableEffCompareBtn(data.dataAvailable);
			if(data.dataAvailable){
				drawPCYearlyEffChartAndHandleErrors(data);
			}else{
				console.log("no data for yearly efficient");
				graphType = 'year-eff';
			}
		});
	}
}


/* EFFICIENT HOME CHART END */
 
function disableOrHighlightCompButtons(buttonType){
	
	if(buttonType == 'PREVGRAPH'){
		if($("#selecttocomparediv a:first-child").hasClass("comparednotselected")){
			prevBtnClicked = true;
			$("#selecttocomparediv a:first-child").removeClass("comparednotselected").addClass("comparedivhighlight");
		}else{
			prevBtnClicked = false;
			$("#selecttocomparediv a:first-child").removeClass("comparedivhighlight").addClass("comparednotselected");
			removePreviousLineFromGraph();
		}
	}else if(buttonType == 'AVGHOME'){
		if($("#selecttocomparediv a:nth-child(2)").hasClass("averagenotselected")){
			avgHomeBtnClicked = true;
			$("#selecttocomparediv a:nth-child(2)").removeClass("averagenotselected").addClass("averagedivhighlight");
		}else{
			avgHomeBtnClicked = false;
			$("#selecttocomparediv a:nth-child(2)").removeClass("averagedivhighlight").addClass("averagenotselected");
			removeAverageLineFromGraph();
		}
	}else if(buttonType == 'EFFHOME'){
		if($("#selecttocomparediv a:nth-child(3)").hasClass("efficientnotselected")){
			effHomeBtnClicked = true;
			$("#selecttocomparediv a:nth-child(3)").removeClass("efficientnotselected").addClass("efficientdivhighlight");
		}else{
			effHomeBtnClicked = false;
			$("#selecttocomparediv a:nth-child(3)").removeClass("efficientdivhighlight").addClass("efficientnotselected");
			removeEfficientLineFromGraph();
		}
	}
}


function disableOrEnablePrevCompareBtn(dataAvailable){
	
	if(!dataAvailable){
		$("#selecttocomparediv a:nth-child(1)").removeClass("comparednotselected comparedivhighlight").addClass("nodatadisabled");
	}else{
		$("#selecttocomparediv a:nth-child(1)").removeClass("comparednotselected nodatadisabled").addClass("comparedivhighlight");
	}
}


function disableOrEnableAvgCompareBtn(dataAvailable){
	
	if(avgHomeBtnClicked){
		if(!dataAvailable){
			$("#selecttocomparediv a:nth-child(2)").removeClass("averagenotselected averagedivhighlight").addClass("nodatadisabled");
		}else{
			$("#selecttocomparediv a:nth-child(2)").removeClass("averagenotselected nodatadisabled").addClass("averagedivhighlight");
		}
	}
}


function disableOrEnableEffCompareBtn(dataAvailable){
	
	if(effHomeBtnClicked){
		if(!dataAvailable){
			$("#selecttocomparediv a:nth-child(3)").removeClass("efficientnotselected efficientdivhighlight").addClass("nodatadisabled");
		}else{
			$("#selecttocomparediv a:nth-child(3)").removeClass("efficientnotselected nodatadisabled").addClass("efficientdivhighlight");
		}
	}
}


function replacePreviousBtnText(text){
	var prevButtonText = '';
	if(text == 'D'){prevButtonText = previousDayLbl;}
	if(text == 'W'){prevButtonText = previousWeekLbl;}
	if(text == 'Y'){prevButtonText = previousYearLbl;}
	if(text == 'M'){prevButtonText = previousMonthLbl;}
	$("#selecttocomparediv a:first-child").text(prevButtonText);
	$("#selecttocomparediv a:first-child").removeClass("prevW prevD prevY prevM");
	$("#selecttocomparediv a:first-child").addClass("prev"+text);
}


function getPreviousData(){
	
	if(costAndUsageTab){
		var viewType = getGraphTypeForPrevOrNextButtons();
		var isComboCht = isComboChart();
		if(!isComboCht && viewType == 'W'){
			drawWeekChartForWeek(previousWeekNumber);
		}else if(!isComboCht && viewType == 'D'){
			getDailyUsageDataAndDraw(previousDay);
		}else if(!isComboCht && viewType == 'Y'){
			getYearlyUsageDataAndDraw(previousYear);
		}else if(!isComboCht && viewType == 'M'){
			getMonthlyUsageDataAndDraw(previousDay);
		}else{
			if(isPreviousButtonOnlyClicked()){
				if(viewType == 'W'){
					getCompareTwoWeeksUsage(previousWeekNumber);
				}else if(viewType == 'D'){
					getCompareTwoDaysUsage(previousDay);
				}else if(viewType == 'M'){
					getCompareTwoMonthsUsage(previousDay);
				}else if(viewType == 'Y'){
					getCompareTwoYearsUsage(previousYear);
				}
			}else{
				if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
						(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
					plotDataForPrevCurrAvgAndEffData(true);
				}else if(avgHomeBtnClicked || effHomeBtnClicked){
					plotDataForCurrAvgAndEffData(true);
				}
			}
		}
	}else{
		if(graphType == 'week-bd'){
			drawBDWeekChartForWeek(previousWeekNumber);
		}else if(graphType == 'month-bd'){
			drawBDMonthChartForWeek(prevYearMonthNum);
		}
	}
}


function getGraphTypeForPrevOrNextButtons(){
	return getGraphTypeBasedOnPreviousBtnClass();
}


function isPreviousButtonOnlyClicked(){
	
	if(prevBtnClicked && !avgHomeBtnClicked && !effHomeBtnClicked){
		return true;
	}
	return false;
}


function isComboChart(){
	
	if(prevBtnClicked || effHomeBtnClicked || avgHomeBtnClicked){
		return true;
	}
	return false;
}


function getNextData(){
	
	if(costAndUsageTab){
		var viewType = getGraphTypeForPrevOrNextButtons();
		var isComboCht = isComboChart();
		if(!isComboCht && viewType == 'W'){
			drawWeekChartForWeek(nextWeekNumber);
		}else if(!isComboCht && viewType == 'D'){
			getDailyUsageDataAndDraw(nextDay);
		}else if(!isComboCht && viewType == 'Y'){
			getYearlyUsageDataAndDraw(nextYear);
		}else if(!isComboCht && viewType == 'M'){
			getMonthlyUsageDataAndDraw(nextDay);
		}else{
			if(isPreviousButtonOnlyClicked()){
				if(viewType == 'W'){
					getCompareTwoWeeksUsage(nextWeekNumber);
				}else if(viewType == 'D'){
					getCompareTwoDaysUsage(nextDay);
				}else if(viewType == 'M'){
					getCompareTwoMonthsUsage(nextDay);
				}else if(viewType == 'Y'){
					getCompareTwoYearsUsage(nextYear);
				}
			}else{
				if((prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked) || 
						(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked))){
					plotDataForPrevCurrAvgAndEffData(false);
				}else if(avgHomeBtnClicked || effHomeBtnClicked){
					plotDataForCurrAvgAndEffData(false);
				}
			}
		}
	}else{
		if(graphType == 'week-bd'){
			drawBDWeekChartForWeek(nextWeekNumber);
		}else if(graphType == 'month-bd'){
			drawBDMonthChartForWeek(nextYearMonthNum);
		}
	}
}


function plotDataForPrevCurrAvgAndEffData(forPrev){
	
	var chartDrawnType = getGraphTypeBasedOnPreviousBtnClass();
	if(chartDrawnType == 'W'){
		getPrevAvgEffCurrWeekDataAndPlot(forPrev?previousWeekNumber:nextWeekNumber);
	}else if(chartDrawnType == 'D'){
		getPrevAvgEffCurrDayDataAndPlot(forPrev?previousDay:nextDay);
	}else if(chartDrawnType == 'M'){
		getPrevAvgEffCurrMonthDataAndPlot(forPrev?previousDay:nextDay);
	}else if(chartDrawnType == 'Y'){
		getPrevAvgEffCurrYearDataAndPlot(forPrev?previousYear:nextYear);
	}
}


function plotDataForCurrAvgAndEffData(forPrev){
	
	var chartDrawnType = getGraphTypeBasedOnPreviousBtnClass();
	if(chartDrawnType == 'W'){
		getAvgEffCurrWeekDataAndPlot(forPrev?previousWeekNumber:nextWeekNumber);
	}else if(chartDrawnType == 'D'){
		getAvgEffCurrDayDataAndPlot(forPrev?previousDay:nextDay);
	}else if(chartDrawnType == 'M'){
		getAvgEffCurrMonthDataAndPlot(forPrev?previousDay:nextDay);
	}else if(chartDrawnType == 'Y'){
		getAvgEffCurrYearDataAndPlot(forPrev?previousYear:nextYear);
	}
}



function getPrevAvgEffCurrWeekDataAndPlot(yearWeekNum){
	
	try{
		$.when( 
			getTwoWeeksCompUsageAjaxCall(yearWeekNum),
			getPCUsageAjaxCallBasedOnGraphType(yearWeekNum)
		).then(function(twoWeeksData, avgAndEffData){
			showErrorMessageBasedOnResponse(false);
			populateCompWeekTotalCostAndUsage(twoWeeksData);
			populateTwoWeeksHeadingMessage(twoWeeksData);
			populateTwoWeeksTemperaturePoints(twoWeeksData);
			populatePrevAndNextNumbers(twoWeeksData);
			hideArrowsBasedOnData(twoWeeksData);
			compareGrpahData = twoWeeksData;
			avgOrEffData = avgAndEffData;
			disableOrEnableAvgCompareBtn(avgAndEffData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffData.dataAvailable;
			var data = getDataArrayForWeeklyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getPrevAvgEffCurrWeekDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getPrevAvgEffCurrDayDataAndPlot(day){
	
	try{
		$.when( 
			getTwoDaysCompUsageAjaxCall(day),
			getPCUsageAjaxCallBasedOnGraphType(day)
		).then(function(twoDaysData, avgAndEffDayData){
			showErrorMessageBasedOnResponse(false);
			populateCompDayTotalCostAndUsage(twoDaysData);
			populateTwoDaysHeadingMessage(twoDaysData);
			populateTwoDaysTemperaturePoints(twoDaysData);
			populatePrevAndNextNumbers(twoDaysData);
			hideArrowsBasedOnData(twoDaysData);
			compareGrpahData = twoDaysData;
			avgOrEffData = avgAndEffDayData;
			disableOrEnableAvgCompareBtn(avgAndEffDayData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffDayData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffDayData.dataAvailable;
			var data = getDataArrayForDailyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getPrevAvgEffCurrDayDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getPrevAvgEffCurrMonthDataAndPlot(day){
	
	try{
		$.when( 
			getTwoMonthsCompUsageAjaxCall(day),
			getPCUsageAjaxCallBasedOnGraphType(day)
		).then(function(twoMonthsData, avgAndEffMonthData){
			showErrorMessageBasedOnResponse(false);
			populateTwoMonthsTotalCostAndUsage(twoMonthsData);
			populateTwoMonthsHeadingMessage(twoMonthsData);
			populateTwoMonthsTemperaturePoints(twoMonthsData);
			populatePrevAndNextNumbers(twoMonthsData);
			hideArrowsBasedOnData(twoMonthsData);
			compareGrpahData = twoMonthsData;
			avgOrEffData = avgAndEffMonthData;
			disableOrEnableAvgCompareBtn(avgAndEffMonthData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffMonthData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffMonthData.dataAvailable;
			var data = getDataArrayForMonthlyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getPrevAvgEffCurrMonthDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getPrevAvgEffCurrYearDataAndPlot(yearMonthNum){
	
	try{
		$.when( 
			getTwoYearsCompUsageAjaxCall(yearMonthNum),
			getPCUsageAjaxCallBasedOnGraphType(yearMonthNum)
		).then(function(twoYearsData, avgAndEffYearData){
			showErrorMessageBasedOnResponse(false);
			populateTwoYearsTotalCostAndUsage(twoYearsData);
		    populateTwoYearsHeadingMessage(twoYearsData);
		    populateTwoYearsTemperaturePoints(twoYearsData);
		    populatePrevAndNextNumbers(twoYearsData);
		    hideArrowsBasedOnData(twoYearsData);
		    compareGrpahData = twoYearsData;
		    avgOrEffData = avgAndEffYearData;
			disableOrEnableAvgCompareBtn(avgAndEffYearData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffYearData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffYearData.dataAvailable;
			var data = getDataArrayForYearlyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getPrevAvgEffCurrYearDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getAvgEffCurrWeekDataAndPlot(yearWeekNum){
	
	try{
		$.when( 
			getWeeklyUsageAjaxCall(yearWeekNum),
			getPCUsageAjaxCallBasedOnGraphType(yearWeekNum)
		).then(function(weeklyUsageData, avgAndEffData){
			showErrorMessageBasedOnResponse(false);
			populateWeekTotalCostAndUsage(weeklyUsageData,false);
			populateHeadingMessage(weeklyUsageData);
			populateTemperaturePoints(weeklyUsageData);
			populatePrevAndNextNumbers(weeklyUsageData);
			hideArrowsBasedOnData(weeklyUsageData);
			disableOrEnableAvgCompareBtn(avgAndEffData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffData.dataAvailable;
			singleGraphData = weeklyUsageData;
			avgOrEffData = avgAndEffData;
			var data = getDataArrayForWeeklyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getAvgEffCurrWeekDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getAvgEffCurrDayDataAndPlot(day){
	
	try{
		$.when( 
			getDailyUsageAjaxCall(day),
			getPCUsageAjaxCallBasedOnGraphType(day)
		).then(function(dailyUsageData, avgAndEffDayData){
			showErrorMessageBasedOnResponse(false);
			populateDayTotalCostAndUsage(dailyUsageData);
			populateDayHeadingMessage(dailyUsageData);
			populateDayTemperaturePoints(dailyUsageData);
			populatePrevAndNextNumbers(dailyUsageData);
			hideArrowsBasedOnData(dailyUsageData);
			singleGraphData = dailyUsageData;
			avgOrEffData = avgAndEffDayData;
			disableOrEnableAvgCompareBtn(avgAndEffDayData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffDayData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffDayData.dataAvailable;
			var data = getDataArrayForDailyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getAvgEffCurrDayDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getAvgEffCurrMonthDataAndPlot(day){
	
	try{
		$.when( 
			getMonthlyUsageAjaxCall(day),
			getPCUsageAjaxCallBasedOnGraphType(day)
		).then(function(monthlyUsageData, avgAndEffMonthData){
			showErrorMessageBasedOnResponse(false);
			populateMonthTotalCostAndUsage(monthlyUsageData);
			populateMonthHeadingMessage(monthlyUsageData);
			populateMonthTemperaturePoints(monthlyUsageData);
			populatePrevAndNextNumbers(monthlyUsageData);
			hideArrowsBasedOnData(monthlyUsageData);
			singleGraphData = monthlyUsageData;
			avgOrEffData = avgAndEffMonthData;
			disableOrEnableAvgCompareBtn(avgAndEffMonthData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffMonthData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffMonthData.dataAvailable;
			var data = getDataArrayForMonthlyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getAvgEffCurrMonthDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}


function getAvgEffCurrYearDataAndPlot(yearMonthNum){
	
	try{
		$.when( 
			getYearlyUsageAjaxCall(yearMonthNum),
			getPCUsageAjaxCallBasedOnGraphType(yearMonthNum)
		).then(function(yearlyUsageData, avgAndEffYearData){
			showErrorMessageBasedOnResponse(false);
			populateYearTotalCostAndUsage(yearlyUsageData);
			populateYearHeadingMessage(yearlyUsageData);
			populateYearTemperaturePoints(yearlyUsageData);
		    populatePrevAndNextNumbers(yearlyUsageData);
		    hideArrowsBasedOnData(yearlyUsageData);
		    singleGraphData = yearlyUsageData;
		    avgOrEffData = avgAndEffYearData;
			disableOrEnableAvgCompareBtn(avgAndEffYearData.dataAvailable);
			disableOrEnableEffCompareBtn(avgAndEffYearData.dataAvailable);
			avgOrEffDataAvailable = avgAndEffYearData.dataAvailable;
			var data = getDataArrayForYearlyGraph();
			drawUsageChart(data);
		});
	}catch(err){
		console.log("ERROR OCCURED WHILE PARALLEL getAvgEffCurrYearDataAndPlot:::::"+err.message)
		showErrorMessageBasedOnResponse(true);
	}
}



function populatePrevAndNextNumbers(usageData){
	
	previousWeekNumber = usageData.prevYearWeekNumber;
	nextWeekNumber = usageData.nextYearWeekNumber;
	currentYearWeekNumber = usageData.currentYearWeekNum;
	previousDay = usageData.prevDay;
	nextDay = usageData.nextDay;
	actualDay = usageData.actualDay;
	previousYear = usageData.previousYear;
	nextYear = usageData.nextYear;
	currentYear = usageData.currentYear;
	currYearMonthNum = usageData.currentMonthNum;
	prevYearMonthNum = usageData.previousMonthNum;
	nextYearMonthNum = usageData.nextMonthNum;
	
	if(null == previousWeekNumber){console.log("previousWeekNumber is::"+previousWeekNumber)};
	if(null == nextWeekNumber){console.log("nextWeekNumber is::"+nextWeekNumber)};
	if(null == currentYearWeekNumber){console.log("currentYearWeekNumber is::"+currentYearWeekNumber)};
	if(null == previousDay){console.log("previousDay is::"+previousDay)};
	if(null == nextDay){console.log("nextDay is::"+nextDay)};
	if(null == actualDay){console.log("actualDay is::"+actualDay)};
	if(null == previousYear){console.log("previousYear is::"+previousYear)};
	if(null == nextYear){console.log("nextYear is::"+nextYear)};
	if(null == currentYear){console.log("currentYear is::"+currentYear)};
	
}


function drawUsageChart(data){	
	
	try{
		$("#chart_div").removeClass("loadingimgusghistory").addClass("chartdetail");
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string',getColumnNameBasedOnButton());
		dataTable.addColumn('number','Usage');
		dataTable.addColumn('number','Usage');
		if(isComboChart()){
			console.log("THIS IS COMBO CHART ADDING MORE COLUMNS");
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
		}
		options =getOptionsBasedOnChartType(false);
		dataTable.addRows(data); 
		chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
		windowResizeData = data;
		currentDataTable = dataTable;
		chart.draw(dataTable, options);
	}catch(err){
		   console.log("ERROR OCCURED WHILE drawUsageChart:::"+err.message);
		   throw new DrawChartException(err.message);
	}
}


function getColumnNameBasedOnButton(){
	
	var currentView = getGraphTypeBasedOnPreviousBtnClass();
	if(currentView == 'W'){return 'Day';}
	if(currentView == 'D'){return 'Hour';}
	if(currentView == 'M'){return 'Day';}
	if(currentView == 'Y'){return 'Month';}
}


function removePreviousLineFromGraph(){
	if(!$.isEmptyObject(currentDataTable)){
		var dataView = new google.visualization.DataView(currentDataTable);
		hideColumnsBasedOnDataView(dataView);
		var modifyChart = new google.visualization.ComboChart(document.getElementById('chart_div'));
		modifyChart.draw(dataView, getOptionsBasedOnChartType(true));
	}
	if(!effHomeBtnClicked && !avgHomeBtnClicked){
		avgOrEffDataAvailable = false;
	}
}


function removeAverageLineFromGraph(){
	var dataView = new google.visualization.DataView(currentDataTable);
	hideColumnsBasedOnDataView(dataView);
	var modifyChart = new google.visualization.ComboChart(document.getElementById('chart_div'));
	modifyChart.draw(dataView, getOptionsBasedOnChartType(true));
	if(!effHomeBtnClicked && !avgHomeBtnClicked){
		avgOrEffDataAvailable = false;
	}
}

function removeEfficientLineFromGraph(){
	var dataView = new google.visualization.DataView(currentDataTable);
	hideColumnsBasedOnDataView(dataView);
	var modifyChart = new google.visualization.ComboChart(document.getElementById('chart_div'));
	modifyChart.draw(dataView, getOptionsBasedOnChartType(true));
	if(!effHomeBtnClicked && !avgHomeBtnClicked){
		avgOrEffDataAvailable = false;
	}
}


function hideColumnsBasedOnDataView(dataView){
	
	if(!prevBtnClicked){
		dataView.hideColumns([3]);
	}
	if(!avgHomeBtnClicked){
		dataView.hideColumns([4]);
	}
	if(!effHomeBtnClicked){
		dataView.hideColumns([5]);
	}
}


function getOptionsBasedOnChartType(fromRemoved){
	
	var chartDimensions = {left:'10%',right:'5%',top:10,width:'90%',height:'75%'};
	var options = {};
	if(!isComboChart()){
	    options = {
			title: '',
	        hAxis: {titleTextStyle: {color: '#333'}},
	        vAxis: {title: 'kWh', minValue: 0},
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
	}else{
		options = {
			title: '',
	        hAxis: {title:'',textPosition :'out',titleTextStyle: {color: '#333'}},
	        vAxis: {title: 'kWh', minValue: 0},
	        colors	:['#AEDFF6'],
	        pointSize: 5,
	        pointShape: 'circle',
	        showAxisLines :false,
            legend:'none',
            valueLabelsInterval:10,
            chartArea: chartDimensions,
            areaOpacity:1.0,
            seriesType: 'area',
            series: getGraphSeriesBasedOnCompareBtns(fromRemoved)
		};
	}
	return options;
}


function getGraphSeriesBasedOnCompareBtns(fromRemoved){
	
	var series = {};
	var currentLineObj = {type: 'line', color:'#00AEEF'}; //for darker line
	var previousLineObj = {type: 'line', color:'#EC008C',pointSize: 2};
	var averageLineObj = {type: 'line', color:'#333092',pointSize: 2};
	var efficientLineObj = {type: 'line', color:'#439539',pointSize: 2};
	if(fromRemoved){
		if(prevBtnClicked && avgHomeBtnClicked && effHomeBtnClicked){
			series[1] = currentLineObj;
			series[2] = previousLineObj;
			series[3] = averageLineObj;
			series[4] = efficientLineObj;
		}else if(prevBtnClicked && !avgHomeBtnClicked  && !effHomeBtnClicked){
			series[1] = currentLineObj;
			series[2] = previousLineObj;
		}else if(prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked)){
			series[1] = currentLineObj;
			series[2] = previousLineObj;
			series[3] = (avgHomeBtnClicked)?averageLineObj:efficientLineObj;
		}else if(!prevBtnClicked && (avgHomeBtnClicked && effHomeBtnClicked)){
			series[1] = currentLineObj;
			series[2] = averageLineObj;
			series[3] = efficientLineObj;
		}else if(!prevBtnClicked && (avgHomeBtnClicked || effHomeBtnClicked)){
			series[1] = currentLineObj;
			series[2] = (avgHomeBtnClicked)?averageLineObj:efficientLineObj;
		}
	}else{
		series[1] = currentLineObj;
		series[2] = (prevBtnClicked)?previousLineObj:{};
		series[3] = (avgHomeBtnClicked)?averageLineObj:{};
		series[4] = (effHomeBtnClicked)?efficientLineObj:{};
	}
	return series;
}


$(window).resize(function(){
	drawUsageChart(windowResizeData);
});


$("#costandusagedivid").click(function(){
	
	costAndUsageTab = true;
	homeEnergyUseTab = false;
	$("#graphandyabletabid").show();
	getWeeklyDataBasedOnButtons(currentYearWeekNumber);
	$("#homeenergyusedivid").removeClass("selectedclassictab");
	$("#costandusagedivid").addClass("selectedclassictab");
	$(".homeenergyusedivarea").hide();
	$("#datanotavailablearea").hide();
	$(".buttonsareahomeenergyusage").hide();
	$(".costandusagedivarea, .buttonsareacostandusage").fadeIn();
	$("#delaymsgCont").show();
});

//this function is used when switching views
function changeColorsForViewButtons(view){
	$("#selectusgviewdiv a").removeClass("selectedbtngraph");
	$("#weekbtnid").removeClass("weeklyusagewht").addClass("weeklyusageblk");
	$("#monthbtnid").removeClass("monthlyusagewht").addClass("monthlyusageblk");
	$("#yearbtnid").removeClass("yearlyusagewht").addClass("yearlyusageblk");
	$("#daybtnid").removeClass("dailyusagewht").addClass("dailyusageblk");
	if(view == 'D'){
		$("#daybtnid").removeClass("dailyusageblk").addClass("dailyusagewht selectedbtngraph");
	}else if(view == 'W'){
		$("#weekbtnid").removeClass("weeklyusageblk").addClass("weeklyusagewht selectedbtngraph");
	}else if(view == 'M'){
		$("#monthbtnid").removeClass("monthlyusageblk").addClass("monthlyusagewht selectedbtngraph");
	}else if(view == 'Y'){
		$("#yearbtnid").removeClass("yearlyusageblk").addClass("yearlyusagewht selectedbtngraph");
	}
}


/* HOME ENERGY CHART START*/

$("#homeenergyusedivid").click(function(){
	
	homeEnergyUseTab = true;
	costAndUsageTab = false;
	$("#graphandyabletabid").hide();
	drawBDWeekChartForWeek(currentYearWeekNumber);
	$("#homeenergyusedivid").addClass("selectedclassictab");
	$("#costandusagedivid").removeClass("selectedclassictab");
	$("#weekbdbtnid").addClass("selectedbtngraph");
	$("#weekbdbtnid").removeClass("weeklyusageblk").addClass("weeklyusagewht");
	$(".costandusagedivarea").hide();
	$("#datanotavailablearea").hide();
	$(".buttonsareacostandusage").hide();
	$(".homeenergyusedivarea, .buttonsareahomeenergyusage").fadeIn();
	$("#delaymsgCont").hide();
	
})


function drawBDWeeklyUsageChart(){
	
	$("#datanotavailablearea").hide();
	$("#dataavialblearea").hide();
	$("#selectusgviewpiediv a").removeClass("selectedbtngraph");
	$("#weekbdbtnid").addClass("selectedbtngraph");
	$("#monthbdbtnid").addClass("monthlyusageblk").removeClass("monthlyusagewht");
	$("#weekbdbtnid").removeClass("weeklyusageblk").addClass("weeklyusagewht");
	drawBDWeekChartForWeek(currentYearWeekNumber);
}

function drawBDMonthlyUsageChart(){
	
	$("#datanotavailablearea").hide();
	$("#dataavialblearea").hide();
	$("#selectusgviewpiediv a").removeClass("selectedbtngraph");
	$("#monthbdbtnid").addClass("selectedbtngraph");
	$("#monthbdbtnid").removeClass("monthlyusageblk").addClass("monthlyusagewht");
	$("#weekbdbtnid").addClass("weeklyusageblk").removeClass("weeklyusagewht");
	drawBDMonthChartForWeek(currYearMonthNum);
}

function drawBDWeekChartAndHandleErrors(bdWeeklyUsageData){
	   
   try{
	   showBDErrorMessage(false);
	   populatePrevAndNextNumbers(bdWeeklyUsageData);
	   hideArrowsBasedOnData(bdWeeklyUsageData);
	   populateBDWeekHeaderMessage(bdWeeklyUsageData);
	   if(bdWeeklyUsageData.dataAvailable){
		   animateProgressBars(bdWeeklyUsageData,true);
	   }else{showBDErrorMessage(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawBDWeekChartAndHandleErrors:::"+err.message);
	   showBDErrorMessage(true);
   }
}


function drawBDMonthChartAndHandleErrors(bdMonthlyUsageData){
	   
   try{
	   showBDErrorMessage(false)
	   populateBDMonthHeaderMessage(bdMonthlyUsageData);
	   populatePrevAndNextNumbers(bdMonthlyUsageData);
	   hideArrowsBasedOnData(bdMonthlyUsageData);
	   if(bdMonthlyUsageData.dataAvailable){
		   animateProgressBars(bdMonthlyUsageData,false);
	   }else{showBDErrorMessage(true);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawBDMonthChartAndHandleErrors:::"+err.message);
	   showBDErrorMessage(true);
   }
}


function populateBDWeekHeaderMessage(usage){
	try{
		$(".messgaebdtxt").text(weekOf+" "+monthFullLiteralArray[(usage.month)-1]+" "+usage.dayAndYear);
	}catch(err){
		console.log("ERROR OCCURED WHILE populateBDWeekHeaderMessage:::"+err.message)
	}
}

function populateBDMonthHeaderMessage(usage){
	try{
		$(".messgaebdtxt").text(monthFullLiteralArray[(usage.monthNum)-1]+" "+usage.year);
	}catch(err){
		console.log("ERROR OCCURED WHILE populateBDWeekHeaderMessage:::"+err.message)
	}
}


function showBDErrorMessage(showErrMsg){
	
	if(showErrMsg){
		$("#progressbardiv").hide();
		$("#homeenergydataavailarea").hide();
	   	$("#noprogressbaravailable").show();
	   	$("#dataavailtext").hide();
	   	$("#datanotavailtext").show();
	   	$("#energyusedttl").removeClass("marginbottom13percent").addClass("marginbottom3percent");
	}else{
		$("#dataavailtext").show();
		$("#noprogressbaravailable").hide();
		$("#progressbardiv").show();
		$("#energyusedttl").removeClass("marginbottom3percent").addClass("marginbottom13percent");
		$("#datanotavailtext").hide();
	}
}


function drawBDWeekChartForWeek(yearWeekNumber){
	graphType = "week-bd";
	$.when( getBDUsageAjaxCallBasedOnGraphType(yearWeekNumber) ).done(function(data){
		drawBDWeekChartAndHandleErrors(data);
	});
}

function drawBDMonthChartForWeek(yearMonthNum){
	graphType = "month-bd";
	$.when( getBDUsageAjaxCallBasedOnGraphType(yearMonthNum) ).done(function(data){
		drawBDMonthChartAndHandleErrors(data);
	});
}


function getBDUsageAjaxCallBasedOnGraphType(inputVal){
	
	var dfd = jQuery.Deferred();
	var postURL = '';
	var inpValues = {};
	if(graphType == 'week-bd'){
		postURL = "/protected/usageHistory/esense/getbdweeklyusage.htm";
		inpValues = {"yearWeekNumber" : inputVal};
	}else{
		postURL = "/protected/usageHistory/esense/getbdmonthlyusage.htm";
		inpValues = {"yearMonthNum" : inputVal};
	}
	$.ajax({  
       type: "POST", 
       url: postURL,
       data: inpValues,
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


function animateProgressBars(bdWeeklyUsageData,forWeek){
	
	var sliceListAry = bdWeeklyUsageData.bdUsage.sliceList;
	
	var heatingAndCoolingVal = 0;
	var baseChargeVal = 0;
	var refrigeratorVal = 0;
	var othersVal = 0;
	
	var heatingAndCoolingValPercent = 0;
	var baseChargeValPercent = 0;
	var refrigeratorValPercent = 0;
	var othersValPercent = 0;
	
	for(i=0; i<sliceListAry.length; i++){
		var id = sliceListAry[i].id;
		if(id == '1'){baseChargeVal = parseFloat(sliceListAry[i].usage);baseChargeValPercent = parseFloat(sliceListAry[i].usagePercentage);}
		if(id == '2'){refrigeratorVal = parseFloat(sliceListAry[i].usage);refrigeratorValPercent = parseFloat(sliceListAry[i].usagePercentage);}
		if(id == '4'){heatingAndCoolingVal = parseFloat(sliceListAry[i].usage);heatingAndCoolingValPercent = parseFloat(sliceListAry[i].usagePercentage);}
		if(id == '5'){othersVal = parseFloat(sliceListAry[i].usage);othersValPercent = parseFloat(sliceListAry[i].usagePercentage);}
	}
	
	$("#hhacspanid").css("width",getPercentageForSlice(heatingAndCoolingValPercent));
	$("#havcid").text(heatingAndCoolingVal+kWOnProgressBar);
	$("#usageinmsgid").text(" "+heatingAndCoolingVal+" "+(forWeek?amtOfElecThisWeek:amtOfElecThisMonth));
	
	$("#alwaysonspanid").css("width",getPercentageForSlice(baseChargeValPercent));
	$("#basechrgid").text(baseChargeVal+kWOnProgressBar);
	
	$("#refspanid").css("width",getPercentageForSlice(refrigeratorValPercent));
	$("#refgid").text(refrigeratorVal+kWOnProgressBar);
	
	$("#otherspanid").css("width",getPercentageForSlice(othersValPercent));
	$("#otherid").text(othersVal+kWOnProgressBar);
}

//keeping the minimum value 5 for the progress bar to avoid very less values
function getPercentageForSlice(percentVal){
	
	var returnVal = percentVal;
	if(percentVal >0 && percentVal <=5){
		returnVal =  "5";
	}
	return returnVal+"%";
}

/* HOME ENERGY CHART END*/