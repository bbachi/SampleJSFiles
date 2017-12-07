var weekDays = 7;
var numberOfMonths = 12;
var totalCost = 0.0;
var totalUsage = 0.0;
var fahrenheit = '&deg;';
var graphType = '';
var NA = " ";

var csPreviousWeekNumber = '';
var csNextWeekNumber = '';
var csCurrentYearWeekNumber = '';
var csPreviousDay = '';
var csNextDay = '';
var csActualDay = '';
var csPreviousYear = '';
var csNextYear = '';
var csCurrentYear = '';

var graphType = 'week';
var viewType = 'G'; //G=graph view, T=Table View
var compareToPrevWeekSelected = false;
var compareToPrevYearSelected = false;
var noComparitionSelected = false;
var singleGraphData;
var compareGrpahData;


google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
	compareToPrevWeekSelected = true;
	graphType = 'W';
	hideAnsShowGraphLables(graphType);
	drawCompareWithPreviousWeekGraph(csCurrentYearWeekNumber);
});

//do not manipulate the dates in the front end. it should always com from the back end
function populatePrevAndNextNumbers(usageData){
	csPreviousWeekNumber = usageData.prevYearWeekNumber;
	csNextWeekNumber = usageData.nextYearWeekNumber;
	csCurrentYearWeekNumber = usageData.currentYearWeekNum;
	csPreviousDay = usageData.prevDay;
	csNextDay = usageData.nextDay;
	csActualDay = usageData.actualDay;
	csPreviousYear = usageData.previousYear;
	csNextYear = usageData.nextYear;
	csCurrentYear = usageData.currentYear;
}

function hideAndShowCostAndUsageArrows(usageData){
	
	if(viewType == 'G'){$("#prevtblid").addClass("novisibility");$("#nexttblid").addClass("novisibility");}
	if(usageData.prevDataAvailable){$("#cost_and_usage_prev").removeClass("novisibility");if(viewType == 'T'){$("#prevtblid").removeClass("novisibility");}
	}else{$("#cost_and_usage_prev").addClass("novisibility");if(viewType == 'T'){$("#prevtblid").addClass("novisibility");}}
	if(usageData.nextDataAvailable){$("#cost_and_usage_next").removeClass("novisibility");if(viewType == 'T'){$("#nexttblid").removeClass("novisibility");}
	}else{$("#cost_and_usage_next").addClass("novisibility");if(viewType == 'T'){$("#nexttblid").addClass("novisibility");}}
}



function hideAnsShowGraphLables(graphType){
	
	$("#usageCompareDateSec1").show();
	if(noComparitionSelected){
		$("#lasticonid").fadeOut();
		$("#lasticontext").fadeOut();
		$("#hightempiconid").fadeOut();
		$("#lowtempiconid").fadeOut();
		$("#hightempicontext").fadeOut();
		$("#lowtempicontext").fadeOut();
		$("#cost_and_usage_prev").removeClass("novisibility");
		$("#cost_and_usage_next").removeClass("novisibility");
		$("#downloadcsvid").removeClass("novisibility");
		$(".classictabsec").show();
		$("#displayWeek").removeClass("mrgnleftctrcmp").addClass("mrgnleftctrsig");
	}else{
		$("#lasticonid").fadeIn();
		if(graphType != 'D'){
			$("#hightempiconid").fadeIn();
			$("#lowtempiconid").fadeIn();
			$("#hightempicontext").fadeIn();
			$("#lowtempicontext").fadeIn();
		}else{
			$("#hightempiconid").fadeOut();
			$("#lowtempiconid").fadeOut();
			$("#hightempicontext").fadeOut();
			$("#lowtempicontext").fadeOut();
		}
		$("#lasticontext").fadeIn();
		$("#cost_and_usage_prev").addClass("novisibility");
		$("#cost_and_usage_next").addClass("novisibility");
		$("#downloadcsvid").addClass("novisibility");
		$(".classictabsec").hide();
		$("#chartareaid").fadeIn();
		$("#charttableid").hide();
		$("#displayWeek").removeClass("mrgnleftctrsig").addClass("mrgnleftctrcmp");
	}
	if(graphType == 'D'){
		$("#monthtomonthtempid").hide();
		$("#compmonthtomonthdates").hide();
		$("#monthToMonthComparison").hide();
		$("#weekdates").hide();
		$("#daydates").show();
		$("#yeardates").hide();
		$("#weeklytempdivid").hide();
		$("#yearlytempdivid").hide();
		$("#dailytempdivid").show();
		$(".chart_dates").show();
		$("#viewoption option:eq(0)").text(byHour);
		$("#viewoption option:eq(1)").text(compareToPrevDay);
		$("#viewoption option:eq(2)").text(compareToPrevYear);
		$("#tblHdrview").text(tblHdrHour);
	}else if(graphType == 'W'){
		$("#monthtomonthtempid").hide();
		$("#compmonthtomonthdates").hide();
		$("#monthToMonthComparison").hide();
		$("#weekdates").show();
		$("#daydates").hide();
		$("#yeardates").hide();
		$("#weeklytempdivid").show();
		$("#yearlytempdivid").hide();
		$("#dailytempdivid").hide();
		$(".chart_dates").show();
		$("#viewoption option:eq(0)").text(byDay);
		$("#viewoption option:eq(1)").text(compareToPrevWeek);
		$("#viewoption option:eq(2)").text(compareToPrevYear);
		$("#tblHdrview").text(tblHdrDay);
	}else if(graphType == 'Y'){
		$(".chart_dates").hide();
		$("#weekdates").hide();
		$("#daydates").hide();
		$("#weeklytempdivid").hide();
		$("#dailytempdivid").hide();
		$("#tblHdrview").text(tblHdrMonth);
		if(!compareToPrevYearSelected){
			$(".chart_dates").show();
			$("#monthtomonthtempid").hide();
			$("#compmonthtomonthdates").hide();
			$("#yeardates").show();
			$("#yearlytempdivid").show();
		}
		
		showForMonthToMonth();
	}
}


function showForMonthToMonth(){
	$("#viewoption option:eq(0)").text(byMonth);
	$("#viewoption option:eq(1)").text(compareToPrevYear);
	$("#viewoption option:eq(2)").text(compareMonthToMonth);
}



function changeSideLabelsBasedOnGraph(usageData){
	
	var currentText = '';
	var previousText = '';
	if(graphType == 'D'){
		if(noComparitionSelected){currentText = usageData.dayOfMessage;}
		if(compareToPrevWeekSelected || compareToPrevYearSelected){currentText = usageData.currentDayUsage.dayOfMessage;
				previousText = usageData.previousDayUsage.dayOfMessage}
	}else if(graphType == 'W'){
		currentText = thisWeek;
		previousText = lastWeek;
	}else if(graphType == 'Y'){
		if(noComparitionSelected){currentText = usageData.currentYear;}
		if(compareToPrevWeekSelected || compareToPrevYearSelected){currentText = usageData.currentYearUsage.year;
				previousText = usageData.previousYearUsage.year}
	}
	$("#currenticontext").text(currentText);
	$("#lasticontext").text(previousText);
}



function drawDayChart(){
	graphType = 'D';
	hideAnsShowGraphLables(graphType);
	if(noComparitionSelected){drawOneDayGraph(csActualDay);}
	if(compareToPrevWeekSelected || compareToPrevYearSelected){drawCompareWithPreviousDayGraph(csActualDay);}
}

function drawWeekChart(){
	graphType = 'W';
	hideAnsShowGraphLables(graphType);
	if(noComparitionSelected){drawOneWeekGraph(csCurrentYearWeekNumber);}
	if(compareToPrevWeekSelected || compareToPrevYearSelected){drawCompareWithPreviousWeekGraph(csCurrentYearWeekNumber);}
}

function drawYearChart(){
	graphType = 'Y';
	hideAnsShowGraphLables(graphType);
	if(noComparitionSelected){drawOneYearGraph(csCurrentYear);}
	if(compareToPrevWeekSelected){drawCompareWithPreviousYearGraph(csCurrentYear);}
	if(compareToPrevYearSelected){drawMonthToMonthGraph();}
}


$("#viewoption").change(function () {
	$("#monthToMonthComparison").hide();
	$("#usageCompareDateSec1").show();
	noComparitionSelected = ($('#viewoption').val() == 1);
	compareToPrevWeekSelected = ($('#viewoption').val() == 2);
	compareToPrevYearSelected = ($('#viewoption').val() == 3);
	hideAnsShowGraphLables(graphType);
	console.log("noComparitionSelected::"+noComparitionSelected+"::compareToPrevWeekSelected::"+compareToPrevWeekSelected
			+"::compareToPrevYearSelected::"+compareToPrevYearSelected+"::AND::GRAPH TYPE:::"+graphType);
	
	if(noComparitionSelected){
		if(graphType == 'D'){drawOneDayGraph(csActualDay)};
		if(graphType == 'W'){drawOneWeekGraph(csCurrentYearWeekNumber)};
		if(graphType == 'Y'){drawOneYearGraph(csCurrentYear)};
	}else if(compareToPrevWeekSelected || compareToPrevYearSelected){
		if(graphType == 'D'){drawCompareWithPreviousDayGraph(csActualDay)};
		if(graphType == 'W'){drawCompareWithPreviousWeekGraph(csCurrentYearWeekNumber)};
		if(graphType == 'Y'){compareToPrevWeekSelected?drawCompareWithPreviousYearGraph(csCurrentYear)
				:drawMonthToMonthGraph();};
	}
});

$("#viewtype").change(function () {
	if($("#viewtype").val() == 'day'){drawDayChart();}
	if($("#viewtype").val() == 'week'){drawWeekChart();}
	if($("#viewtype").val() == 'year'){drawYearChart();}
});

function drawMonthToMonthGraph(){
	
	$("#usageCompareDateSec1").hide();
	$("#monthToMonthComparison").fadeIn();
	var date = new Date();
	var currMonth = date.getMonth().length >1?date.getMonth():'0'+date.getMonth();
	var prevMonth = (date.getMonth()-1).length >1?(date.getMonth()-1):'0'+(date.getMonth()-1);
	var currYear = date.getFullYear();
	$("#yearStart").val(currYear);$("#yearEnd").val(currYear);
	$("#monthStart").val(prevMonth);$("#monthEnd").val(currMonth);
	var dateRange = currYear+prevMonth+":"+currYear+currMonth;
	console.log("dateRange::"+dateRange);
	getMonthToMonthData(dateRange);
}


/* WEEK GRAPH  FUNCTIONS*/
function drawCompareWithPreviousWeekGraph(yearWeekNumber){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(yearWeekNumber) ).done(function(data){
		if(null != data){drawTwoWeeksDataAndHandleErrors (data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}

function drawOneWeekGraph(yearWeekNumber){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(yearWeekNumber) ).done(function(data){
		if(null != data){drawOneWeekDataAndHandleErrors(data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}

function drawTwoWeeksDataAndHandleErrors (twoWeeksData){  

	try{
		changeSideLabelsBasedOnGraph(twoWeeksData);
		compareGrpahData = twoWeeksData;
		populateHeaderMessage(twoWeeksData);
		populatePrevAndNextNumbers(twoWeeksData);
		populateUCWeekDates(twoWeeksData);
		populateTemperaturePoints();
		populateCostAndUsageAnalysisMessage(twoWeeksData);
	    if(twoWeeksData.dataAvailable){
		   hideAndShowGraphAndErrorMsg(true);
		   var data = getDataArrayForWeeklyGraph();
		   drawUsageChart('comp-prev-week',data);
	    }else{
		   hideAndShowGraphAndErrorMsg(false);
	    }
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawTwoWeeksDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
	}
} 


function hideAndShowGraphAndErrorMsg(hideErrMsg){
	
	if(viewType == 'G'){
		$("#ColumnChart_div").removeClass("usagehisLoading marginleftloading");
		if(hideErrMsg){$("#costNUsageNoDataAvail").hide();$("#ColumnChart_div").fadeIn();
		}else{$("#ColumnChart_div").hide();$("#downloadcsvid").addClass("novisibility");$("#costNUsageNoDataAvail").fadeIn();}
	}else{
		if(hideErrMsg){$("#costNUsageNoTblDataAvail").hide();$("#txnTable").fadeIn();
		}else{$("#txnTable").hide();$("#downloadcsvid").addClass("novisibility");$("#costNUsageNoTblDataAvail").fadeIn();}
	}
}


function drawOneWeekDataAndHandleErrors(oneWeekData){  
	
	try{
		hideAndShowBasedOnViewType(viewType);
		hideAndShowCostAndUsageArrows(oneWeekData);
		populatePrevAndNextNumbers(oneWeekData);
		populateHeaderMessage(oneWeekData);
		populateCostAndUsageAnalysisMessage(oneWeekData);
		if(viewType == 'G'){
		   changeSideLabelsBasedOnGraph(oneWeekData);
		   singleGraphData = oneWeekData;
		   populateUCWeekDates(oneWeekData);
		   populateTemperaturePoints();
		   if(oneWeekData.dataAvailable){
			   hideAndShowGraphAndErrorMsg(true);
			   var data = getDataArrayForWeeklyGraph();
			   drawUsageChart('comp-prev-week',data);
		   }
		}else{hideAndShowGraphAndErrorMsg(true);drawTableForWeekGraph(oneWeekData);}
		if(!oneWeekData.dataAvailable){hideAndShowGraphAndErrorMsg(false);}
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawTwoWeeksDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
	}
}


function drawTableForWeekGraph(weeklyUsageData){
	
	try{
		if(weeklyUsageData.dataAvailable){
			var weekAry = weeklyUsageData.dailyDataList;
			var dateList = weeklyUsageData.strDateList;
			var completeHTML;
			var htmlBegin = '<tr><td>';
			var htmlmiddle = '</td><td>';
			var htmlEnd = '</td></tr>';
			for(i=0; i<weekDays; i++){
				completeHTML += htmlBegin+(dayLiteralArray[i]+"<br/>"+dateList[i])+htmlmiddle+((null != weekAry[i] && null != weekAry[i].usage)?weekAry[i].usage:'')+
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

function populateHeaderMessage(dataUsage){
	
	try{
		var displayHeaderMsg  = '';
		if(graphType == 'W'){
			if(noComparitionSelected){
				displayHeaderMsg = dataUsage.dateRange;
			}else{
				displayHeaderMsg = dataUsage.currentWeekUsage.dateRange+" & "+
					dataUsage.previousWeekUsage.dateRange;
			}
		}else if(graphType == 'D'){
			if(noComparitionSelected){
				displayHeaderMsg = dataUsage.dayOfMessage;
			}else{
				displayHeaderMsg = dataUsage.currentDayUsage.dayOfMessage+" & "+
				dataUsage.previousDayUsage.dayOfMessage;
			}
		}else if(graphType == 'Y'){
			if(noComparitionSelected){
				displayHeaderMsg = dataUsage.year;
			}else if(compareToPrevWeekSelected){
				displayHeaderMsg = dataUsage.currentYearUsage.year+" & "+
					dataUsage.previousYearUsage.year;
			}else if(compareToPrevYearSelected){
				var currMonth = dataUsage.currentMonth.month+" "+dataUsage.currentMonth.year;
				var compMonth = dataUsage.comparedMonth.month+" "+dataUsage.comparedMonth.year;
				displayHeaderMsg = compMonth+' & '+currMonth;
			}
		}
		$("#displayWeek").text(displayHeaderMsg);
	}catch(err){
		console.log("ERROR OCCURED WHILE populateHeaderMessage:::"+err.getMessage);
	}
}

function getDataArrayForWeeklyGraph(){
	
	var weekDays = 7;
	try{
		var dataArray = new Array(weekDays);
		var currentWeekAry;
		var previousWeekAry;
		if(noComparitionSelected){
			currentWeekAry = singleGraphData.dailyDataList;
		}else{
			currentWeekAry = compareGrpahData.currentWeekUsage.dailyDataList;
			previousWeekAry = compareGrpahData.previousWeekUsage.dailyDataList;
		}
		
		for(i=0; i<weekDays; i++){
			var	dataRow = CreateDataArrayForUsageAndCostChart(currentWeekAry[i],(noComparitionSelected)?null:previousWeekAry[i],dayLiteralArray[i]);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function CreateDataArrayForUsageAndCostChart(currWeek,prevWeek,dayLabel){
	
	try{
		var currUsage = 0.0;
		var currCost = 0.0;
		var prevUsage = 0.0;
		var prevCost = 0.0;
		var currentTempHi = 0;
		var currentTempLo = 0;
		var currentUsagetooltip;
		var previousUsagetooltip;
		
		if(currWeek != null){
			currUsage = getCostOrUsageValue(currWeek.usage);
			currCost = getCostOrUsageValue(currWeek.cost);
			currentTempHi = getTemperatureHighTempValueNum(currWeek);
			currentTempLo = getTemperaturelowTempValueNum(currWeek);
		}else{
			currUsage = null;
			currCost = null;
			currentTempHi = null;
			currentTempLo = null;
		}
		if(prevWeek != null){
			prevUsage = getCostOrUsageValue(prevWeek.usage);
			prevCost = getCostOrUsageValue(prevWeek.cost);
		}else{
			prevUsage = null;
			prevCost = null;
		}
		currentUsagetooltip= currUsage+' kWh' + '<br/>' + '$' + currCost;
		if(compareToPrevWeekSelected || compareToPrevYearSelected){
			previousUsagetooltip= prevUsage+' kWh' + '<br/>' + '$' + prevCost;
		}else{
			previousUsagetooltip = null;
			prevUsage = null;
			previousUsagetooltip = null;
			currentTempHi = null;
			currentTempLo = null;
		}
		return dataRow = [dayLabel,currUsage,currentUsagetooltip,prevUsage,previousUsagetooltip,currentTempHi,currentTempLo];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForWeekAvgAndEffChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}

/* WEEK GRAPH  FUNCTIONS*/


/* DAY GRAPH  FUNCTIONS*/

function drawCompareWithPreviousDayGraph(actualDay){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(actualDay) ).done(function(data){
		if(null != data){drawTwoDaysDataAndHandleErrors (data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}

function drawOneDayGraph(actualDay){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(actualDay) ).done(function(data){
		if(null != data){drawOneDayDataAndHandleErrors(data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}


function drawOneDayDataAndHandleErrors(oneDayData){

	try{
	   hideAndShowBasedOnViewType(viewType);
	   hideAndShowCostAndUsageArrows(oneDayData);
	   populatePrevAndNextNumbers(oneDayData);
	   populateHeaderMessage(oneDayData);
	   populateCostAndUsageAnalysisMessage(oneDayData);
	   if(viewType == 'G'){
		   singleGraphData = oneDayData;
		   changeSideLabelsBasedOnGraph(oneDayData);
		   populateDayTemperaturePoints();
		   if(oneDayData.dataAvailable){
			   hideAndShowGraphAndErrorMsg(true);
			   var data = getDataArrayForDailyGraph();
			   drawUsageChart('comp-prev-week',data);
		   }
	   }else{hideAndShowGraphAndErrorMsg(true);drawTableForDayGraph(oneDayData);}
	   if(!oneDayData.dataAvailable){hideAndShowGraphAndErrorMsg(false);}
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawOneDayDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
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


function drawTwoDaysDataAndHandleErrors (twoDaysData){  

	try{
	   compareGrpahData = twoDaysData;
	   changeSideLabelsBasedOnGraph(twoDaysData);
	   populatePrevAndNextNumbers(twoDaysData);
	   populateHeaderMessage(twoDaysData);
	   populateCostAndUsageAnalysisMessage(twoDaysData);
	   populateDayTemperaturePoints();
	   if(twoDaysData.dataAvailable){
		   hideAndShowGraphAndErrorMsg(true);
		   var data = getDataArrayForDailyGraph();
		   drawUsageChart('comp-prev-week',data);
	   }else{
		   hideAndShowGraphAndErrorMsg(false);
	   }
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawTwoDaysDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
	}
} 


function populateDayTemperaturePoints(){
	
	if(noComparitionSelected){
		currUsgHourData = singleGraphData.hourlyData;
	}else{
		currUsgHourData = compareGrpahData.currentDayUsage.hourlyData;
		prevUsgHourData = compareGrpahData.previousDayUsage.hourlyData;
	}
	$("#dayusageTempHi").html(null != currUsgHourData?getTemperatureValue(currUsgHourData.tempHigh):'');
	$("#dayusageTempLo").html(null != currUsgHourData?getTemperatureValue(currUsgHourData.tempLow):'');
	if(noComparitionSelected){
		$("#dayusageTempLoprev").hide();
		$("#dayusageTempHiprev").hide();
	}else{
		$("#dayusageTempHiprev").show().html(null != prevUsgHourData?getTemperatureValue(prevUsgHourData.tempHigh):'');
		$("#dayusageTempLoprev").show().html(null != prevUsgHourData?getTemperatureValue(prevUsgHourData.tempLow):'');
	}
}


function getDataArrayForDailyGraph(){
	
	try{
		var dayHours = 24;
		var dataArray = new Array(dayHours);
		var currUsgHourData;
		var prevUsgHourData;
		
		if(noComparitionSelected){
			currUsgHourData = singleGraphData.hourlyData;
		}else{
			currUsgHourData = compareGrpahData.currentDayUsage.hourlyData;
			prevUsgHourData = compareGrpahData.previousDayUsage.hourlyData;
		}
		
		var hourLables = getHourLabels();
		
		dataArray[0] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage1):null,hourLables[0]+(null != currUsgHourData)?currUsgHourData.usage1:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage1),
				(noComparitionSelected)?null:hourLables[0]+prevUsgHourData.usage1,null,null];
		dataArray[1] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage2):null,hourLables[1]+(null != currUsgHourData)?currUsgHourData.usage2:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage2),
				(noComparitionSelected)?null:hourLables[1]+prevUsgHourData.usage2,null,null];
		dataArray[2] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage3):null,hourLables[2]+(null != currUsgHourData)?currUsgHourData.usage3:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage3),
				(noComparitionSelected)?null:hourLables[2]+prevUsgHourData.usage3,null,null];
		dataArray[3] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage4):null,hourLables[3]+(null != currUsgHourData)?currUsgHourData.usage4:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage4),
				(noComparitionSelected)?null:hourLables[3]+prevUsgHourData.usage4,null,null];
		dataArray[4] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage5):null,hourLables[4]+(null != currUsgHourData)?currUsgHourData.usage5:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage5),
				(noComparitionSelected)?null:hourLables[4]+prevUsgHourData.usage5,null,null];
		dataArray[5] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage6):null,hourLables[5]+(null != currUsgHourData)?currUsgHourData.usage6:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage6),
				(noComparitionSelected)?null:hourLables[5]+prevUsgHourData.usage6,null,null];
		dataArray[6] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage7):null,hourLables[6]+(null != currUsgHourData)?currUsgHourData.usage7:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage7),
				(noComparitionSelected)?null:hourLables[6]+prevUsgHourData.usage7,null,null];
		dataArray[7] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage8):null,hourLables[7]+(null != currUsgHourData)?currUsgHourData.usage8:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage8),
				(noComparitionSelected)?null:hourLables[7]+prevUsgHourData.usage8,null,null];
		dataArray[8] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage9):null,hourLables[8]+(null != currUsgHourData)?currUsgHourData.usage9:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage9),
				(noComparitionSelected)?null:hourLables[8]+prevUsgHourData.usage9,null,null];
		dataArray[9] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage10):null,hourLables[9]+(null != currUsgHourData)?currUsgHourData.usage10:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage10),
				(noComparitionSelected)?null:hourLables[9]+prevUsgHourData.usage10,null,null];
		dataArray[10] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage11):null,hourLables[10]+(null != currUsgHourData)?currUsgHourData.usage11:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage11),
				(noComparitionSelected)?null:hourLables[10]+prevUsgHourData.usage11,null,null];
		dataArray[11] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage12):null,hourLables[11]+(null != currUsgHourData)?currUsgHourData.usage12:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage12),
				(noComparitionSelected)?null:hourLables[11]+prevUsgHourData.usage12,null,null];
		dataArray[12] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage13):null,hourLables[12]+(null != currUsgHourData)?currUsgHourData.usage13:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage13),
				(noComparitionSelected)?null:hourLables[12]+prevUsgHourData.usage13,null,null];
		dataArray[13] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage14):null,hourLables[13]+(null != currUsgHourData)?currUsgHourData.usage14:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage14),
				(noComparitionSelected)?null:hourLables[13]+prevUsgHourData.usage14,null,null];
		dataArray[14] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage15):null,hourLables[14]+(null != currUsgHourData)?currUsgHourData.usage15:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage15),
				(noComparitionSelected)?null:hourLables[14]+prevUsgHourData.usage15,null,null];
		dataArray[15] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage16):null,hourLables[15]+(null != currUsgHourData)?currUsgHourData.usage16:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage16),
				(noComparitionSelected)?null:hourLables[15]+prevUsgHourData.usage16,null,null];
		dataArray[16] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage17):null,hourLables[16]+(null != currUsgHourData)?currUsgHourData.usage17:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage17),
				(noComparitionSelected)?null:hourLables[16]+prevUsgHourData.usage17,null,null];
		dataArray[17] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage18):null,hourLables[17]+(null != currUsgHourData)?currUsgHourData.usage18:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage18),
				(noComparitionSelected)?null:hourLables[17]+prevUsgHourData.usage18,null,null];
		dataArray[18] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage19):null,hourLables[18]+(null != currUsgHourData)?currUsgHourData.usage19:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage19),
				(noComparitionSelected)?null:hourLables[18]+prevUsgHourData.usage19,null,null];
		dataArray[19] =[null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage20):null,hourLables[19]+(null != currUsgHourData)?currUsgHourData.usage20:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage20),
				(noComparitionSelected)?null:hourLables[19]+prevUsgHourData.usage20,null,null];
		dataArray[20] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage21):null,hourLables[20]+(null != currUsgHourData)?currUsgHourData.usage21:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage21),
				(noComparitionSelected)?null:hourLables[20]+prevUsgHourData.usage21,null,null];
		dataArray[21] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage22):null,hourLables[21]+(null != currUsgHourData)?currUsgHourData.usage22:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage22),
				(noComparitionSelected)?null:hourLables[21]+prevUsgHourData.usage22,null,null];
		dataArray[22] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage23):null,hourLables[22]+(null != currUsgHourData)?currUsgHourData.usage23:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage23),
				(noComparitionSelected)?null:hourLables[22]+prevUsgHourData.usage23,null,null];
		dataArray[23] = [null,(null != currUsgHourData)?parseFloat(currUsgHourData.usage24):null,hourLables[23]+(null != currUsgHourData)?currUsgHourData.usage24:null,(noComparitionSelected)?null:parseFloat(prevUsgHourData.usage24),
				(noComparitionSelected)?null:hourLables[23]+prevUsgHourData.usage24,null,null];
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForDailyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}

function getHourLabels(){
	var hourLbl = (viewType == 'T')?'':'<br/>' + 'Usage';
	return ['12am'+hourLbl, '1am'+hourLbl, '2am'+hourLbl ,'3am'+hourLbl,'4am'+hourLbl,'5am'+hourLbl,
            '6am'+hourLbl,'7am'+hourLbl,'8am'+hourLbl,'9am'+hourLbl,'10am'+hourLbl,'11am'+hourLbl,
            '12pm'+hourLbl,'1pm'+hourLbl,'2pm'+hourLbl,'3pm'+hourLbl,'4pm'+hourLbl,'5pm'+hourLbl,
            '6pm'+hourLbl,'7pm'+ hourLbl,'8pm'+hourLbl,'9pm'+hourLbl,'10pm'+hourLbl,'11pm'+hourLbl];
}

/* DAY GRAPH  FUNCTIONS*/

/* YEAR GRAPH FUNCTIONS */

function drawCompareWithPreviousYearGraph(currentYear){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(currentYear) ).done(function(data){
		if(null != data){drawTwoYearsDataAndHandleErrors (data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}

function drawOneYearGraph(currentYear){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(currentYear) ).done(function(data){
		if(null != data){drawOneYearDataAndHandleErrors(data);}else{hideAndShowGraphAndErrorMsg(false);}
	});
}

function drawTwoYearsDataAndHandleErrors (twoYearsData){  

	try{
	   compareGrpahData = twoYearsData;
	   changeSideLabelsBasedOnGraph(twoYearsData);
	   populatePrevAndNextNumbers(twoYearsData);
	   populateCostAndUsageAnalysisMessage(twoYearsData);
	   populateHeaderMessage(twoYearsData);
	   populateYearTemperaturePoints();
	   if(twoYearsData.dataAvailable){
		   hideAndShowGraphAndErrorMsg(true);
		   var data = getDataArrayForYearlyGraph();
		   drawUsageChart('comp-prev-week',data);
	   }else{
		   hideAndShowGraphAndErrorMsg(false);
	   }
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawTwoYearsDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
	}
} 


function drawOneYearDataAndHandleErrors(oneYearData){  

	try{
	   hideAndShowBasedOnViewType(viewType);
	   hideAndShowCostAndUsageArrows(oneYearData);
	   populatePrevAndNextNumbers(oneYearData);
	   populateCostAndUsageAnalysisMessage(oneYearData);
	   populateHeaderMessage(oneYearData);
	   if(viewType == 'G'){
		   singleGraphData = oneYearData;
		   changeSideLabelsBasedOnGraph(oneYearData);
		   populateYearTemperaturePoints();
		   if(oneYearData.dataAvailable){
			   hideAndShowGraphAndErrorMsg(true);
			   var data = getDataArrayForYearlyGraph();
			   drawUsageChart('comp-prev-week',data);
		   }
	   }else{hideAndShowGraphAndErrorMsg(true);drawTableForYearGraph(oneYearData);}
	   if(!oneYearData.dataAvailable){hideAndShowGraphAndErrorMsg(false);}
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawOneYearDataAndHandleErrors :::"+err.message);
	   hideAndShowGraphAndErrorMsg(false);
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
				completeHTML += htmlBegin+monthLiteralArray[i]+htmlmiddle+((null != monthAry[i] && null != monthAry[i].usage)?monthAry[i].usage:'')+
					htmlmiddle+((null != monthAry[i] && null != monthAry[i].cost)?getFixedDecimalVal(monthAry[i].cost,2):'')+htmlmiddle+getTempValueForTable(monthAry[i])+ htmlEnd;
			}
			$("#transTbody").html(completeHTML);
		}else{
			console.log("NO DATA AVILABLE");
			$("#transTbody").html("");
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE drawTableForYearGraph:::"+err.message);
	}
}


function drawComapreMonthToMonthAndHandleErrors(monthToMonthData){  
	
	try{
	   writeAnalysisForMonthToMonth(monthToMonthData);
	   populateHeaderMessage(monthToMonthData);
	   populateYearMonthToMonthDates(monthToMonthData);
	   populateYearMonthToMonthTempPoints(monthToMonthData);
	   if(monthToMonthData.dataAvailable){
		   hideAndShowForMonthToMonthGraph(false);
		   var data = getDataArrayForCompareMonthToMonth(monthToMonthData);
		   drawUsageChart('MtoM',data);
	   }else{
		   hideAndShowForMonthToMonthGraph(true);
	   }
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawComapreMonthToMonthAndHandleErrors :::"+err.message);
	   hideAndShowForMonthToMonthGraph(true);
	}
}


function populateYearTemperaturePoints(){
	
	var monthlyDataList = [];
	try{   
		if(noComparitionSelected){
			monthlyDataList = singleGraphData.monthlyDataList;
		}else{
			monthlyDataList = compareGrpahData.currentYearUsage.monthlyDataList;
		}
		for(i=0; i<numberOfMonths; i++){
			$("#cuhighyeartemp"+i).html((null != monthlyDataList && null != monthlyDataList[i])?getTemperatureValue(monthlyDataList[i].tempHigh):'');
			$("#culowyeartemp"+i).html((null != monthlyDataList && null != monthlyDataList[i])?getTemperatureValue(monthlyDataList[i].tempLow):'');
		}
	}catch(err){
		  console.log("ERROR OCCURED WHILE populateYearTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	}
}


function populateYearMonthToMonthTempPoints(costAndUsageData){
	
	var currentMonth = costAndUsageData.currentMonth;
	var comparedMonth = costAndUsageData.comparedMonth;
	$("#monthtomonthtempid").fadeIn();
	$("#mtomcurrtemphi").html(null != currentMonth.tempHigh?getTemperatureValue(currentMonth.tempHigh):NA);
	$("#mtomcurrtemplo").html(null != currentMonth.tempLow?getTemperatureValue(currentMonth.tempLow):NA);
	$("#mtomcomptemphi").html(null != comparedMonth.tempHigh?getTemperatureValue(comparedMonth.tempHigh):NA);
	$("#mtomcomptemplo").html(null != comparedMonth.tempLow?getTemperatureValue(comparedMonth.tempLow):NA);
}


function populateYearMonthToMonthDates(costAndUsageData){
	
	var currentMonth = costAndUsageData.currentMonth;
	var comparedMonth = costAndUsageData.comparedMonth;
	
	$("#compmonthtomonthdates").fadeIn();
	$("#mtomcurrentmonthtxt").html(currentMonth.month+"<br/>"+currentMonth.year);
	$("#mtomcomparedmonthtxt").html(comparedMonth.month+"<br/>"+comparedMonth.year);
}


function getDataArrayForYearlyGraph(){
	
	try{
		var dataArray = new Array(numberOfMonths);
		var currentMonthAry;
		var previousMonthAry;
		if(noComparitionSelected){
			currentMonthAry = singleGraphData.monthlyDataList;
		}else{
			currentMonthAry = compareGrpahData.currentYearUsage.monthlyDataList;
			previousMonthAry = compareGrpahData.previousYearUsage.monthlyDataList;
		}
		
		for(i=0; i<numberOfMonths; i++){
			var	dataRow = CreateDataArrayForYearChart(currentMonthAry[i],(noComparitionSelected)?null:previousMonthAry[i]);
			dataArray[i] = dataRow;
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForYearlyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function CreateDataArrayForYearChart(currMonth,prevMonth){
	
	try{
		var currUsage = 0.0;
		var currCost = 0.0;
		var prevUsage = 0.0;
		var prevCost = 0.0;
		var currentTempHi = 0;
		var currentTempLo = 0;
		var monthLabel = '';
		var currentUsagetooltip;
		var previousUsagetooltip;
		
		if(currMonth != null){
			currUsage = getCostOrUsageValue(currMonth.usage);
			currCost = getCostOrUsageValue(currMonth.cost);
			currentTempHi = getTemperatureHighTempValueNum(currMonth);
			currentTempLo = getTemperaturelowTempValueNum(currMonth);
			monthLabel = currMonth.month;
		}else{
			currUsage = null;
			currCost = null;
			currentTempHi = null;
			currentTempLo = null;
			monthLabel = null != prevMonth?prevMonth.month:'';
		}
		if(prevMonth != null){
			prevUsage = getCostOrUsageValue(prevMonth.usage);
			prevCost = getCostOrUsageValue(prevMonth.cost);
			monthLabel = prevMonth.day;
		}else{
			prevUsage = null;
			prevCost = null;
			monthLabel = null != currMonth?currMonth.month:'';
		}
		
		currentUsagetooltip= currUsage+' kWh' + '<br/>' + '$' + currCost;
		if(compareToPrevWeekSelected || compareToPrevYearSelected){
			previousUsagetooltip= prevUsage+' kWh' + '<br/>' + '$' + prevCost;
		}else{
			previousUsagetooltip = null;
			prevUsage = null;
			previousUsagetooltip = null;
			currentTempHi = null;
			currentTempLo = null;
		}
		return dataRow = [monthLabel,currUsage,currentUsagetooltip,prevUsage,previousUsagetooltip,currentTempHi,currentTempLo];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForYearChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}


function getDataArrayForCompareMonthToMonth(monthToMonthData) {
	
	try{
		var dataArray = new Array(2);
		if(null != monthToMonthData){
			var currentUsage = monthToMonthData.currentMonth;
			var compareUsage = monthToMonthData.comparedMonth;
			var currentMonthDataRow = [ '', getCostOrUsageValue(currentUsage.usage), 
			                            getTemperatureHighTempValueNum(currentUsage.tempHigh), getTemperatureHighTempValueNum(currentUsage.tempLow) ];
			var compareMonthDataRow = [ '', getCostOrUsageValue(compareUsage.usage), 
			                            getTemperatureHighTempValueNum(compareUsage.tempHigh), getTemperatureHighTempValueNum(compareUsage.tempLow) ];
			dataArray[0] = compareMonthDataRow;
			dataArray[1] = currentMonthDataRow;
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE getDataArrayForCompareMonthToMonth:::"+err.message);
	}
	return dataArray;
}


$("#monthtomonthcomp").click(function(event){
	event.preventDefault();
	var startMonth = $("#monthStart").val();
	var endMonth = $("#monthEnd").val();
	var startYear = $("#yearStart").val();
	var endYear = $("#yearEnd").val();
	if(startMonth == 0 || endMonth == 0 || startYear == 0 || endYear == 0){
		$("#headingError").text("Please choose a valid date").show();
	}else{
		var dateRange = startYear+startMonth+":"+endYear+endMonth;
		console.log("dateRange::"+dateRange);
		getMonthToMonthData(dateRange);
	}
});


function hideAndShowForMonthToMonthGraph(showErr){
	$("#downloadcsvid").addClass("novisibility");
	$("#yeardates").hide();
	$("#yeardates").hide();
	$("#yearlytempdivid").hide();
	if(showErr){
		$("#ColumnChart_div").hide();
		$("#costNUsageNoDataAvail").fadeIn();
	}else{
		$("#usageCompareDateSec1").addClass("novisibility");
		$("#costNUsageNoDataAvail").hide();
		$("#ColumnChart_div").fadeIn();
	}
}


function getMonthToMonthData(dateRange){
	
	$.when( getDataBasedOnGraphTypeAjaxCall(dateRange) ).done(function(data){
		drawComapreMonthToMonthAndHandleErrors(data);
	});
}


/* YEAR GRAPH FUNCTIONS */

function populateHeadingMessage(usage){
	
	if(null != usage && '' != usage){
		$("#messgaetxt").text(usage.weekOfMessage);
	}else{
		throw new HeaderMessageException("Populate Header Exception");
	}
}


function populateTemperaturePoints(){
	
	var dailyDataList = [];
	try{   
		if(noComparitionSelected){
			dailyDataList = singleGraphData.dailyDataList;
		}else{
			dailyDataList = compareGrpahData.currentWeekUsage.dailyDataList;
		}
		for(i=0; i<weekDays; i++){
	   		$("#cuhightemp"+i).html((null != dailyDataList && null != dailyDataList[i])?getTemperatureValue(dailyDataList[i].tempHigh):NA);
	   		$("#culowtemp"+i).html((null != dailyDataList && null != dailyDataList[i])?getTemperatureValue(dailyDataList[i].tempLow):NA);
	   	}
	}catch(err){
		  console.log("ERROR OCCURED WHILE populateTemperaturePoints:::"+err.message);
		  throw new TemperaturePointsException(err.message);
	}
}


function populateUCWeekDates(costAndUsageData){
	
	var strDateList = costAndUsageData.strDateList;
	for(i=0; i<strDateList.length; i++){
		   $("#costandusageDate"+i).text(strDateList[i]);
	}
}


function drawUsageChart(chartType,data){	
   	
	try{
		var options = getOptionsBasedOnChartType(chartType);	
		var dataTable = new google.visualization.DataTable();
		if(chartType == 'comp-prev-week'){
			dataTable.addColumn('string','Day');
			dataTable.addColumn('number','Usage');
		    dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number','Usage');
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number','Temperature');
			dataTable.addColumn('number','Temperature');
			chart = new google.visualization.ColumnChart(document.getElementById('ColumnChart_div'));
			dataTable.addRows(data);
		}else if(chartType == 'week'){
			dataTable.addColumn('string','Day');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number','Usage');
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number','Temperature');
			dataTable.addColumn('number','Temperature');
			chart = new google.visualization.ColumnChart(document.getElementById('ColumnChart_div'));
			dataTable.addRows(data);
		}else if(chartType == 'BD'){
			dataTable.addColumn('string', 'Slice Name');
			dataTable.addColumn('number', 'Usage');
		    dataTable.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
			chart = new google.visualization.PieChart(document.getElementById('PieChart_div'));
			dataTable.addRows(data);
		}else if(chartType == 'MtoM'){
			dataTable.addColumn('string','Day');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
			chart = new google.visualization.ColumnChart(document.getElementById('ColumnChart_div'));
			dataTable.addRows(data);
		}
		chart.draw(dataTable, options);
	 }catch(err){
	   console.log("ERROR OCCURED WHILE drawUsageChart:::"+err.message);
   	   throw new DrawChartException(err.message);
	 }
 }


function getOptionsBasedOnChartType(chartType){
	
	var options = {};
	if(chartType == 'week'){
		options = {
			width: 515,
			height:220,
			colors: ['333092'],
			tooltip: {isHtml: true,trigger:"both"},
			vAxis: {gridlines: {count:4, color: '#ccc'}, textStyle: {fontSize: 9}, title: 'kWh'},
			legend: {position:'none'},
			chartArea:{height:"83%", width: "80%", top: 35}
			};
	}else if(chartType == 'comp-prev-week'){
		options = {
			width: 515,
			height:230,
			vAxis: {gridlines: {count:4, color: '#ccc'}, textStyle: {fontSize: 9}, title: 'kWh'},
			vAxes:{1:{title:'Temperature(°F)'}},
			legend: {position:'none'},
			chartArea:{height:"83%", width: "80%", top: 35},
			seriesType:"bars",
			colors: ['333092','cccccc'],
			tooltip:{trigger:"both",isHtml:true},
			series:{2:{type: "line", color:"#EC00B2",targetAxisIndex:1}, 3:{type: "line",color:"00aeef",targetAxisIndex:1}}
			};
	}else if(chartType == 'BD'){
		 var options = {
                 width:230,
                 height:220, 
                 legend:'none', 
                 pieSliceText : 'none',
                 tooltip: {textStyle: {fontSize:11},trigger:"both"},
                 slices: {0: {color: '#333092'}, 1: {color: '#ffcd00'}, 
              	   2: {color: '#4a8a2b'}, 3: {color: '#009ddb'}, 4: {color: '#d80073'}},	
                 chartArea:{left:5,top:28,width:"100%",height:"80%"}
  			};
	}else if(chartType == 'MtoM'){
		
		options = {
				width: 515,
				height:230,
				vAxis: {gridlines: {count:4, color: '#ccc'}, textStyle: {fontSize: 9}, title: 'kWh'},
				vAxes:{1:{title:'Temperature(°F)'}},
				legend: {position:'none'},
				chartArea:{height:"83%", width: "80%", top: 35},
				seriesType:"bars",
				colors: ['333092','cccccc'],
				tooltip:{trigger:"both",isHtml:true},
				series:{2:{type: "line", color:"#EC00B2",targetAxisIndex:1}, 3:{type: "line",color:"00aeef",targetAxisIndex:1}}
			};
	}
	
	return options;
}


function getDataBasedOnGraphTypeAjaxCall(inputVal){
	
	console.log("BEFORE AJAX noComparitionSelected::"+noComparitionSelected+"::compareToPrevWeekSelected::"+compareToPrevWeekSelected
			+"::compareToPrevYearSelected::"+compareToPrevYearSelected+"::AND::GRAPH TYPE:::"+graphType+"::and input val::"+inputVal);
	var inpValues = {};
	var postURL = '';
	if(graphType == 'W'){
		inpValues = {"yearWeekNumber" : inputVal};
		if(noComparitionSelected){postURL = "/protected/usageHistory/esense/getweekusgforweeknumber.htm";}
		if(compareToPrevWeekSelected){postURL = "/protected/usageHistory/esense/gettwoweekscompare.htm";}
		if(compareToPrevYearSelected){postURL = "/protected/usageHistory/esense/gettwoweekscompare.htm";
			inpValues = {"yearWeekNumber" : inputVal,"comparitionWithPrevYear":true};
		}
	}else if(graphType == 'D'){
		inpValues = {"actualDay" : inputVal};
		if(noComparitionSelected){postURL = "/protected/usageHistory/esense/getdayusgforactualday.htm";}
		if(compareToPrevWeekSelected){postURL = "/protected/usageHistory/esense/gettwodayscompare.htm";}
		if(compareToPrevYearSelected){postURL = "/protected/usageHistory/esense/gettwodayscompare.htm";
			inpValues = {"actualDay" : inputVal,"comparitionWithPrevYear":true};
		}
	}else if(graphType == 'Y'){
		inpValues = {"yearMonthNum" : inputVal};
		if(noComparitionSelected){postURL = "/protected/usageHistory/esense/getyearlyusageforyear.htm";}
		if(compareToPrevWeekSelected){postURL = "/protected/usageHistory/esense/gettwoyearscompare.htm";}
		if(compareToPrevYearSelected){postURL = "/protected/usageHistory/esense/comparemonthtomonth.htm";
				var intValAry = inputVal.split(":"); 
				inpValues = {"fromDate" : intValAry[0],"toDate":intValAry[1]};
		}
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


function populateCostAndUsageAnalysisMessage(costAndUsageData){
	
	try{
		if(!costAndUsageData.dataAvailable){
			$("#usageAnalysisMsg1").html(usageChartAnalysisNoDataMsg);
		}else if(graphType == 'W'){
			writeAnalysisForWeek(costAndUsageData);
		}else if(graphType == 'D'){
			writeAnalysisForDay(costAndUsageData);
		}else if(graphType == 'Y'){
			writeAnalysisForYear(costAndUsageData);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateCostAndUsageAnalysisMessage::::"+err.message);
	}

}


function writeAnalysisForWeek(costAndUsageData){
	
	try{
		var analysisMessage1 = '';
		var analysisMessage2 = '';
		var analysisMessage3 = '';
		var emptySpace = ' ';
		if(noComparitionSelected){
			analysisMessage1 = usageChartAnalysisTotlValMsg;
			analysisMessage2 = costAndUsageData.weekTotalUsage;
			analysisMessage3 = usageChartAnalysisWeekKWhMsg;
			$("#usageAnalysisMsg1").html(analysisMessage1+emptySpace+analysisMessage2+emptySpace+analysisMessage3);
		}else{
			var currentUsage = costAndUsageData.currentWeekUsage.weekTotalUsage;
			var comparedUsage = costAndUsageData.previousWeekUsage.weekTotalUsage;
			var currentDateTxt = costAndUsageData.currentWeekUsage.dateRange;
			var comparedDateTxt = costAndUsageData.previousWeekUsage.dateRange;
			populateComparitionAnalysisMessage(currentUsage, comparedUsage,
					currentDateTxt, comparedDateTxt);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE writeAnalysisForWeek::::"+err.message);
	}
}


function writeAnalysisForDay(costAndUsageData){
	
	try{
		var analysisMessage1 = '';
		var analysisMessage2 = '';
		var analysisMessage3 = '';
		var emptySpace = ' ';
		if(noComparitionSelected){
			analysisMessage1 = getDateMessageForUsageByDayHour(costAndUsageData.actualDay);
			analysisMessage2 = (null != costAndUsageData.hourlyData)?costAndUsageData.hourlyData.totalUsage:0.00;
			analysisMessage3 = usageChartAnalysisKWhMsg;
			$("#usageAnalysisMsg1").html(analysisMessage1+emptySpace+analysisMessage2+emptySpace+analysisMessage3);
		}else{
			var currentUsage = costAndUsageData.currentDayUsage.hourlyData.totalUsage;
			var comparedUsage = costAndUsageData.previousDayUsage.hourlyData.totalUsage;
			var currentDateTxt = costAndUsageData.currentDayUsage.dayOfMessage;
			var comparedDateTxt = costAndUsageData.previousDayUsage.dayOfMessage;
			populateComparitionAnalysisMessage(currentUsage, comparedUsage,
					currentDateTxt, comparedDateTxt);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE writeAnalysisForDay::::"+err.message);
	}
}


function writeAnalysisForYear(costAndUsageData){
	
	try{
		var analysisMessage1 = '';
		var analysisMessage2 = '';
		var analysisMessage3 = '';
		var emptySpace = ' ';
		if(noComparitionSelected){
			analysisMessage1 = usageChartAnalysisTotlValMsg;
			analysisMessage2 = costAndUsageData.totalUsage;
			analysisMessage3 = usageChartAnalysisYearKWhMsg;
			$("#usageAnalysisMsg1").html(analysisMessage1+emptySpace+analysisMessage2+emptySpace+analysisMessage3);
		}else{
			var currentUsage = costAndUsageData.currentYearUsage.totalUsage;
			var comparedUsage = costAndUsageData.previousYearUsage.totalUsage;
			var currentDateTxt = costAndUsageData.currentYearUsage.year;
			var comparedDateTxt = costAndUsageData.previousYearUsage.year;
			populateComparitionAnalysisMessage(currentUsage, comparedUsage,
					currentDateTxt, comparedDateTxt);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE writeAnalysisForYear::::"+err.message);
	}
}


function writeAnalysisForMonthToMonth(costAndUsageData){
	
	var analysisMessage1 = '';
	var analysisMessage2 = '';
	var analysisMessage3 = '';
	
	if(costAndUsageData.dataAvailable){
		var currentMonth = costAndUsageData.currentMonth;
		var comparedMonth = costAndUsageData.comparedMonth;
		
		var currentUsage = currentMonth.usage;
		var comparedUsage = comparedMonth.usage;
		var currentDateTxt = currentMonth.month+" "+currentMonth.year;
		var comparedDateTxt = comparedMonth.month+" "+comparedMonth.year;
		populateComparitionAnalysisMessage(currentUsage, comparedUsage,
				currentDateTxt, comparedDateTxt);
	}
}


function getDateMessageForUsageByDayHour(inputDate) {
	var msg = '';
	if(inputDate != null && inputDate != '' && inputDate.length > 8) {
		var dateAry = inputDate.split("/");
		var month = new Number(dateAry[0]);
		var day = new Number(dateAry[1]);
		var year = new Number(dateAry[2]);
		var date = new Date();
		date.setDate(day);
		date.setMonth((month-1));
		date.setYear(year);
		var dayOfWeek = date.getDay();
		var monthTxt = monthLiteralArray[(month-1)];
		var dayOfWeekTxt = dayFullNameLiteralArray[dayOfWeek];
		var usageTxt = (usageChartAnalysisTotlValMsg.substring(0, 1)).toLowerCase() 
							+ usageChartAnalysisTotlValMsg.substring(1);
		msg = onLiteral + ' ' + dayOfWeekTxt + ', ' 
				+  monthTxt + ' ' + day + ', ' + year + ' ' + usageTxt;
	}
	return msg;
}


function populateComparitionAnalysisMessage(currentUsage, comparedUsage,
		currentDateTxt, comparedDateTxt) {
	$('#usageAnalysisMsg1').empty();
	var percentVal = calculatePercentage(currentUsage, comparedUsage);
	if(currentDateTxt != null && currentDateTxt != ''
		&& comparedDateTxt != null && comparedDateTxt != '') {
		var electricMsg = '';
		if(percentVal > 0) {
			electricMsg = usageChartAnalysisMoreElctrcMsg;
		} else if(percentVal < 0) {
			electricMsg = usageChartAnalysisLessElctrcMsg;
		} else {
			electricMsg = usageChartAnalysisElctrcMsg;
		}
		if(electricMsg != '') {
			percentVal = Math.abs(percentVal);
			var msgText = usageChartAnalysisYouUsdMsg 
							+ ' ' + percentVal + '%'
							+ ' ' + electricMsg
							+ ' ' + currentDateTxt
							+ ' ' + usageChartAnalysisThanMsg
							+ ' ' + comparedDateTxt;
			$('#usageAnalysisMsg1').html(msgText);
		}
	}
}

function prevData(){
	
	if(graphType == 'W'){
		drawOneWeekGraph(csPreviousWeekNumber);
	}else if(graphType == 'D'){
		drawOneDayGraph(csPreviousDay);
	}else if(graphType == 'Y'){
		drawOneYearGraph(csPreviousYear);
	}
}


function nextData(){
	
	if(graphType == 'W'){
		drawOneWeekGraph(csNextWeekNumber);
	}else if(graphType == 'D'){
		drawOneDayGraph(csNextDay);
	}else if(graphType == 'Y'){
		drawOneYearGraph(csNextYear);
	}
}


$(".export").off('click').on('click', function(){
	var fileName = '';
	var type = '';
	if(graphType == 'D'){
		type = "ESENSE_D";
		fileName = "dailyUsageData";
	}else if(graphType == 'W'){
		type = "ESENSE_W";
		fileName = "weeklyUsageData";
	}else if(graphType == 'Y'){
		type = "ESENSE_Y";
		fileName = "yearlyUsageData";
	}
	exportTableToCSV.apply(this, [singleGraphData, fileName,type]);
});


$(".momthToMonth").click(function(event){
	event.preventDefault();
	$("#monthToMonthComparison").hide();
});

/* Table logic starts */

$("#classcharttableid").click(function(){
	viewType = 'T';
	callFunctionBasedOnGraph();
});

function hideAndShowBasedOnViewType(type){
	
	if(type == 'T'){
		$("#chartareaid").hide();
		$("#charttableid").fadeIn();
		$("#usageCompareDateSec1").addClass("novisibility");
		$("#classchartareaid").removeClass("selectedclassictab");
		$("#classcharttableid").addClass("selectedclassictab");
	}else{
		$("#chartareaid").fadeIn();
		$("#charttableid").hide();
		$("#usageCompareDateSec1").removeClass("novisibility");
		$("#classchartareaid").addClass("selectedclassictab");
		$("#classcharttableid").removeClass("selectedclassictab");
	}
}


$("#classchartareaid").click(function(){
	viewType = 'G';
	callFunctionBasedOnGraph();
});

function callFunctionBasedOnGraph(){
	if(graphType == 'W'){drawOneWeekGraph(csCurrentYearWeekNumber);}
	if(graphType == 'D'){drawOneDayGraph(csActualDay);}
	if(graphType == 'Y'){drawOneYearGraph(csCurrentYear);}
}

/* Table logic ends */

