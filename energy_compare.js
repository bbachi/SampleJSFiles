var weekDays = 7;
var numberOfMonths = 12;
var totalCost = 0.0;
var totalUsage = 0.0;
var fahrenheit = '&deg;';
var kWh =  ' kWh';
var NA = " ";

var ecPreviousWeekNumber = '';
var ecNextWeekNumber = '';
var ecCurrentYearWeekNumber = '';
var ecPreviousDay = '';
var ecNextDay = '';
var ecActualDay = '';
var ecPreviousYear = '';
var ecNextYear = '';
var ecCurrentYear = '';

var ecGraphType = '';
var byChartSelected = false;
var byTotalsSelected = false;

google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
	ecGraphType = 'W';
	byChartSelected = true;
	$("#pcdailylytempdivid").hide();
	$("#pcyearlytempdivid").hide();
	$("#pcyearmonths").hide();
	$("#pcdayhours").hide();
	drawByChartWeekGraph(ecCurrentYearWeekNumber);
});


$("#viewcmpoption").change(function () {
	
	byChartSelected = ($("#viewcmpoption").val() == 1);
	byTotalsSelected = ($("#viewcmpoption").val() == 2);
	
	console.log("byChartSelected::"+byChartSelected+"::byTotalsSelected::"+byTotalsSelected+"::ecGraphType::"+ecGraphType);
	
	if(byChartSelected){
		if(ecGraphType == 'D'){drawByChartDayGraph(ecActualDay);};
		if(ecGraphType == 'W'){drawByChartWeekGraph(ecCurrentYearWeekNumber);};
		if(ecGraphType == 'Y'){drawByChartYearGraph(ecCurrentYear);};
	}else if(byTotalsSelected){
		if(ecGraphType == 'D'){drawByTotalsDayGraph(ecActualDay);};
		if(ecGraphType == 'W'){drawByTotalsWeekGraph(ecCurrentYearWeekNumber);};
		if(ecGraphType == 'Y'){drawByTotalsYearGraph(ecCurrentYear);};
	}
});

$("#viewcmptype").change(function () {
	
	if($("#viewcmptype").val() == 'day'){drawPCDailyChart();}
	if($("#viewcmptype").val() == 'week'){drawPCWeeklyChart();}
	if($("#viewcmptype").val() == 'year'){drawPCYearlyChart();}
});

function populatePCPrevAndNextNumbers(usageData){
	ecPreviousWeekNumber = usageData.prevYearWeekNumber;
	ecNextWeekNumber = usageData.nextYearWeekNumber;
	ecCurrentYearWeekNumber = usageData.currentYearWeekNum;
	ecPreviousDay = usageData.prevDay;
	ecNextDay = usageData.nextDay;
	ecActualDay = usageData.actualDay;
	ecPreviousYear = usageData.previousYear;
	ecNextYear = usageData.nextYear;
	ecCurrentYear = usageData.currentYear;
}


function hidePCArrowsBasedOnData(usage){
	
	try{
		var preAvail = usage.prevDataAvailable;
		var nextAvail = usage.nextDataAvailable;
		if(preAvail !== undefined){
			if(preAvail){
				$("#enrgycomp_week_prev").removeClass("novisibility");
			}else{
				$("#enrgycomp_week_prev").addClass("novisibility");
			}
		}
		if(undefined !== nextAvail){
			if(nextAvail){
				$("#enrgycomp_week_next").removeClass("novisibility");
			}else{
				$("#enrgycomp_week_next").addClass("novisibility");
			}
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE hideArrowsBasedOnData:::"+err.message);
	}
}


function drawPCDailyChart(){
	ecGraphType = 'D';
	//populateFlagsBasedOnGraphType();
	$("#energycomparechartid ul li").removeClass("t_active");
	$("#energycomparechartid ul li:nth-child(1)").addClass("t_active");
	$("#viewcmpoption option:eq(0)").text(byHour);
	$("#pcweeklytempdivid").hide();
	$("#pcyearlytempdivid").hide();
	$("#pcdailylytempdivid").fadeIn();
	$("#pcweekdates").hide();
	$("#pcyeardates").hide();
	$("#pcyearmonths").hide();
	$("#pcdaydates").fadeIn();
	$("#pcdayhours").fadeIn();
	$('#bychartlabeltxt').text(byHour);
	drawByChartDayGraph(ecActualDay);
}

function drawPCWeeklyChart(){
	ecGraphType = 'W';
	//populateFlagsBasedOnGraphType();
	$("#energycomparechartid ul li").removeClass("t_active");
	$("#energycomparechartid ul li:nth-child(2)").addClass("t_active");
	$("#viewcmpoption option:eq(0)").text(byDay);
	$("#pcweeklytempdivid").fadeIn();
	$("#pcdailylytempdivid").hide();
	$("#pcyearlytempdivid").hide();
	$("#pcweekdates").fadeIn();
	$("#pcyeardates").hide();
	$("#pcyearmonths").hide();
	$("#pcdayhours").hide();
	$("#pcdaydates").hide();
	$('#bychartlabeltxt').text(byDay);
	drawByChartWeekGraph(ecCurrentYearWeekNumber);
}

function drawPCYearlyChart(){
	ecGraphType = 'Y';
	//populateFlagsBasedOnGraphType();
	$("#energycomparechartid ul li").removeClass("t_active");
	$("#energycomparechartid ul li:nth-child(3)").addClass("t_active");
	$("#viewcmpoption option:eq(0)").text(byMonth);
	$("#pcweeklytempdivid").hide();
	$("#pcdailylytempdivid").hide();
	$("#pcyearlytempdivid").fadeIn();
	$("#pcweekdates").hide();
	$("#pcyeardates").fadeIn();
	$("#pcyearmonths").fadeIn();
	$("#pcdayhours").hide();
	$("#pcdaydates").hide();
	$('#bychartlabeltxt').text(byMonth);
	drawByChartYearGraph(ecCurrentYear);
}


function drawByChartWeekGraph(yearWeekNum){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(yearWeekNum) ).done(function(data){
		drawPCWeeklyChartAndHandleErrors(data);
	});
}

function drawByChartDayGraph(actualDay){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
		drawPCDailyChartAndHandleErrors(data);
	});
}


function drawByChartYearGraph(currentYear){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(currentYear) ).done(function(data){
		drawPCYearlyChartAndHandleErrors(data);
	});
}


function drawByTotalsWeekGraph(yearWeekNum){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(yearWeekNum) ).done(function(data){
		drawPCWeeklyChartAndHandleErrors(data);
	});
}

function drawByTotalsDayGraph(actualDay){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(actualDay) ).done(function(data){
		drawPCDailyChartAndHandleErrors(data);
	});
}


function drawByTotalsYearGraph(currentYear){
	
	$.when( getPCUsageAjaxCallBasedOnGraphType(currentYear) ).done(function(data){
		drawPCYearlyChartAndHandleErrors(data);
	});
}

function hideAndShowPCGraphAndErrorMsg(hideErrMsg){
	$("#BarChart_div").removeClass("usagehisLoading marginleftloading");
	if(hideErrMsg){
		$("#NoPCDataAvail").hide();
		$("#BarChart_div").fadeIn();
	}else{
		$("#BarChart_div").hide();
		$("#NoPCDataAvail").fadeIn();
	}
}


function drawPCWeeklyChartAndHandleErrors(pcWeeklyUsage){
	
   try{
	   populatePCTemperaturePoints(pcWeeklyUsage);
	   populatePCPrevAndNextNumbers(pcWeeklyUsage);
	   hidePCArrowsBasedOnData(pcWeeklyUsage);
	   populatePCAnalysisMessage(pcWeeklyUsage);
	   populatePCDates(pcWeeklyUsage);
	   if(pcWeeklyUsage.dataAvailable){
		   hideAndShowPCGraphAndErrorMsg(true);
		   var data = getDataArrayForPCWeeklyGraph(pcWeeklyUsage);
		   var chartType = byChartSelected?'line':'bar';
		   drawPCChart(chartType,data);
	   }else{hideAndShowPCGraphAndErrorMsg(false);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCWeeklyChartAndHandleErrors:::"+err.message);
	   hideAndShowPCGraphAndErrorMsg(false);
   }
}

function drawPCDailyChartAndHandleErrors(pcDailyUsage){
	
   try{
	   populatePCDayTemperaturePoints(pcDailyUsage);
	   populatePCPrevAndNextNumbers(pcDailyUsage);
	   hidePCArrowsBasedOnData(pcDailyUsage);
	   populatePCAnalysisMessage(pcDailyUsage);
	   populatePCDates(pcDailyUsage);
	   if(pcDailyUsage.dataAvailable){
		   hideAndShowPCGraphAndErrorMsg(true);
		   var data = getDataArrayForPCDailyGraph(pcDailyUsage);
		   var chartType = byChartSelected?'line':'bar';
		   drawPCChart(chartType,data);
	   }else{hideAndShowPCGraphAndErrorMsg(false);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCDailyChartAndHandleErrors:::"+err.message);
	   hideAndShowPCGraphAndErrorMsg(false);
   }
}


function drawPCYearlyChartAndHandleErrors(pcYearlyUsage){
	
   try{
	   populatePCYearTemperaturePoints(pcYearlyUsage);
	   populatePCPrevAndNextNumbers(pcYearlyUsage);
	   hidePCArrowsBasedOnData(pcYearlyUsage);
	   populatePCAnalysisMessage(pcYearlyUsage);
	   populatePCDates(pcYearlyUsage);
	   if(pcYearlyUsage.dataAvailable){
		   hideAndShowPCGraphAndErrorMsg(true);
		   var data = getDataArrayForPCYearlyGraph(pcYearlyUsage);
		   var chartType = byChartSelected?'line':'bar';
		   drawPCChart(chartType,data);
	   }else{hideAndShowPCGraphAndErrorMsg(false);}
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawPCYearlyChartAndHandleErrors:::"+err.message);
	   hideAndShowPCGraphAndErrorMsg(false);
   }
}


function getDataArrayForPCDailyGraph(pcData){
	
	var dayHours = 24;
	var dataArray = new Array(9);
	try{
		var avgHourlyData = pcData.avgHourlyData;
		var effHourlyData = pcData.effHourlyData;
		var selfHourlyData = pcData.selfHourlyData;
		if(byChartSelected){
			dataArray[0] = ['',parseFloat(avgHourlyData.usage1),parseFloat(selfHourlyData.usage1),parseFloat(effHourlyData.usage1)];
			dataArray[1] = ['',parseFloat(avgHourlyData.usage2),parseFloat(selfHourlyData.usage2),parseFloat(effHourlyData.usage2)];
			dataArray[2] = ['',parseFloat(avgHourlyData.usage3),parseFloat(selfHourlyData.usage3),parseFloat(effHourlyData.usage3)];
			dataArray[3] = ['',parseFloat(avgHourlyData.usage4),parseFloat(selfHourlyData.usage4),parseFloat(effHourlyData.usage4)];
			dataArray[4] = ['',parseFloat(avgHourlyData.usage5),parseFloat(selfHourlyData.usage5),parseFloat(effHourlyData.usage5)];
			dataArray[5] = ['',parseFloat(avgHourlyData.usage6),parseFloat(selfHourlyData.usage6),parseFloat(effHourlyData.usage6)];
			dataArray[6] = ['',parseFloat(avgHourlyData.usage7),parseFloat(selfHourlyData.usage7),parseFloat(effHourlyData.usage7)];
			dataArray[7] = ['',parseFloat(avgHourlyData.usage8),parseFloat(selfHourlyData.usage8),parseFloat(effHourlyData.usage8)];
			dataArray[8] = ['',parseFloat(avgHourlyData.usage9),parseFloat(selfHourlyData.usage9),parseFloat(effHourlyData.usage9)];
			dataArray[9] = ['',parseFloat(avgHourlyData.usage10),parseFloat(selfHourlyData.usage10),parseFloat(effHourlyData.usage10)];
			dataArray[10] = ['',parseFloat(avgHourlyData.usage11),parseFloat(selfHourlyData.usage11),parseFloat(effHourlyData.usage11)];
			dataArray[11] = ['',parseFloat(avgHourlyData.usage12),parseFloat(selfHourlyData.usage12),parseFloat(effHourlyData.usage12)];
			dataArray[12] = ['',parseFloat(avgHourlyData.usage13),parseFloat(selfHourlyData.usage13),parseFloat(effHourlyData.usage13)];
			dataArray[13] = ['',parseFloat(avgHourlyData.usage14),parseFloat(selfHourlyData.usage14),parseFloat(effHourlyData.usage14)];
			dataArray[14] = ['',parseFloat(avgHourlyData.usage15),parseFloat(selfHourlyData.usage15),parseFloat(effHourlyData.usage15)];
			dataArray[15] = ['',parseFloat(avgHourlyData.usage16),parseFloat(selfHourlyData.usage16),parseFloat(effHourlyData.usage16)];
			dataArray[16] = ['',parseFloat(avgHourlyData.usage17),parseFloat(selfHourlyData.usage17),parseFloat(effHourlyData.usage17)];
			dataArray[17] = ['',parseFloat(avgHourlyData.usage18),parseFloat(selfHourlyData.usage18),parseFloat(effHourlyData.usage18)];
			dataArray[18] = ['',parseFloat(avgHourlyData.usage19),parseFloat(selfHourlyData.usage19),parseFloat(effHourlyData.usage19)];
			dataArray[19] = ['',parseFloat(avgHourlyData.usage20),parseFloat(selfHourlyData.usage20),parseFloat(effHourlyData.usage20)];
			dataArray[20] = ['',parseFloat(avgHourlyData.usage21),parseFloat(selfHourlyData.usage21),parseFloat(effHourlyData.usage21)];
			dataArray[21] = ['',parseFloat(avgHourlyData.usage22),parseFloat(selfHourlyData.usage22),parseFloat(effHourlyData.usage22)];
			dataArray[22] = ['',parseFloat(avgHourlyData.usage23),parseFloat(selfHourlyData.usage23),parseFloat(effHourlyData.usage23)];
			dataArray[23] = ['',parseFloat(avgHourlyData.usage24),parseFloat(selfHourlyData.usage24),parseFloat(effHourlyData.usage24)];
		}else{
			return ['',parseFloat(avgHourlyData.totalUsage),getFixedDecimalVal(parseFloat(avgHourlyData.totalUsage),2) +kWh,
			        parseFloat(selfHourlyData.totalUsage),getFixedDecimalVal(parseFloat(selfHourlyData.totalUsage),2) +kWh,
			        parseFloat(effHourlyData.totalUsage),getFixedDecimalVal(parseFloat(effHourlyData.totalUsage),2) +kWh];
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForPCWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function CreateDataArrayForPCWeeklyLineChart(effWeek,avgWeek,selfWeek){
	
	try{
		var avgUsage = 0.0;
		var effUsage = 0.0;
		var selfUsage = 0.0;
		
		avgUsage = (null != avgWeek && null != avgWeek.usage)?getCostOrUsageValue(avgWeek.usage):null;
		selfUsage = (null != selfWeek && null != selfWeek.usage)?getCostOrUsageValue(selfWeek.usage):null;
		effUsage = (null != effWeek && null != effWeek.usage)?getCostOrUsageValue(effWeek.usage):null;
		return dataRow = ['',avgUsage,selfUsage,effUsage];
	}catch(err){
		   console.log("ERROR OCCURED WHILE CreateDataArrayForWeekAvgAndEffChart:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
}

function getDataArrayForPCWeeklyGraph(pcData){
	
	try{
		var avgUsage = pcData.avgWeekUsage;
		var effUsage = pcData.effWeekUsage;
		var selfUsage = pcData.selfWeekUsage;
		if(byChartSelected){
			var dataArray = new Array(weekDays);
			var avgUsageWeekAry = avgUsage.dailyDataList;
			var effUsageWeekAry = effUsage.dailyDataList;
			var selfUsageWeekAry = selfUsage.dailyDataList;
			
			for(i=0; i<weekDays; i++){
				var	dataRow = CreateDataArrayForPCWeeklyLineChart(effUsageWeekAry[i],avgUsageWeekAry[i],selfUsageWeekAry[i]);
				dataArray[i] = dataRow;
			}
		}else{
			return ['',parseFloat(avgUsage.weekTotalUsage),getFixedDecimalVal(parseFloat(avgUsage.weekTotalUsage),2) +kWh,
			        parseFloat(selfUsage.weekTotalUsage),getFixedDecimalVal(parseFloat(selfUsage.weekTotalUsage),2) +kWh,
			        parseFloat(effUsage.weekTotalUsage),getFixedDecimalVal(parseFloat(effUsage.weekTotalUsage),2) +kWh];
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForPCWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function getDataArrayForPCYearlyGraph(pcData){
	
	try{
		var avgUsage = pcData.avgYearUsage;
		var effUsage = pcData.effYearUsage;
		var selfUsage = pcData.selfYearUsage;
		if(byChartSelected){
			var dataArray = new Array(numberOfMonths);
			var avgUsageYearAry = avgUsage.monthlyDataList;
			var effUsageYearAry = effUsage.monthlyDataList;
			var selfUsageYearAry = selfUsage.monthlyDataList;
			
			for(i=0; i<numberOfMonths; i++){
				var	dataRow = CreateDataArrayForPCWeeklyLineChart(effUsageYearAry[i],avgUsageYearAry[i],selfUsageYearAry[i]);
				dataArray[i] = dataRow;
			}
		}else{
			return ['',parseFloat(avgUsage.totalUsage),getFixedDecimalVal(parseFloat(avgUsage.totalUsage),2) +kWh,
			        parseFloat(selfUsage.totalUsage),getFixedDecimalVal(parseFloat(selfUsage.totalUsage),2) +kWh,
			        parseFloat(effUsage.totalUsage),getFixedDecimalVal(parseFloat(effUsage.totalUsage),2) +kWh];
		}
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForPCWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}


function populatePCTemperaturePoints(pcData){
	
	try{
		if(byChartSelected){
			$("#pcdailylytempdivid").hide();
			$("#pcweeklytempdivid").fadeIn();
			var selfUsageWeekAry = (null != pcData.selfWeekUsage)?pcData.selfWeekUsage.dailyDataList:null;
			for(i=0; i<weekDays; i++){
				$("#pchightemp"+i).html((null != selfUsageWeekAry && null != selfUsageWeekAry[i])?getTemperatureHighTempValue(selfUsageWeekAry[i]):NA);
				$("#pclowtemp"+i).html((null != selfUsageWeekAry && null != selfUsageWeekAry[i])?getTemperaturelowTempValue(selfUsageWeekAry[i]):NA);
			}
		}else{
			$("#pcweeklytempdivid").hide();
			$("#pcdailylytempdivid").fadeIn();
			$("#pchightempday").html(getTemperatureHighTempAvgValue(pcData));
			$("#pclowtempday").html(getTemperaturelowTempAvgValue(pcData));
		}
	}catch(err){
		 console.log("ERROR OCCURED WHILE populatePCTemperaturePoints:::"+err.message);
	}
}

function populatePCYearTemperaturePoints(pcData){
	
	try{
		if(byChartSelected){
			$("#pcdailylytempdivid").hide();
			$("#pcyearlytempdivid").fadeIn();
			var selfUsageYearAry = (null != pcData.selfYearUsage)?pcData.selfYearUsage.monthlyDataList:null;
			for(i=0; i<numberOfMonths; i++){
				$("#pchighyeartemp"+i).html((null != selfUsageYearAry && null != selfUsageYearAry[i])?getTemperatureHighTempValue(selfUsageYearAry[i]):NA);
				$("#pclowyeartemp"+i).html((null != selfUsageYearAry && null != selfUsageYearAry[i])?getTemperaturelowTempValue(selfUsageYearAry[i]):NA);
			}
		}else{
			$("#pcyearlytempdivid").hide();
			$("#pcdailylytempdivid").fadeIn();
			$("#pchightempday").html(getTemperatureHighTempAvgValue(pcData));
			$("#pclowtempday").html(getTemperaturelowTempAvgValue(pcData));
		}
	}catch(err){
		 console.log("ERROR OCCURED WHILE populatePCYearTemperaturePoints:::"+err.message);
	}
}

function populatePCDayTemperaturePoints(pcData){
	
	var selfUsageDay = pcData.selfHourlyData;
	$("#pchightempday").html(getTemperatureHighTempValue(selfUsageDay));
	$("#pclowtempday").html(getTemperaturelowTempValue(selfUsageDay));
}


function prevPCData(){
	
	if(ecGraphType == 'W'){
		byChartSelected?drawByChartWeekGraph(ecPreviousWeekNumber):drawByTotalsWeekGraph(ecPreviousWeekNumber);
	}else if(ecGraphType == 'D'){
		byChartSelected?drawByChartDayGraph(ecPreviousDay):drawByTotalsDayGraph(ecPreviousDay);
	}else if(ecGraphType == 'Y'){
		byChartSelected?drawByChartYearGraph(ecPreviousYear):drawByTotalsYearGraph(ecPreviousYear);
	}
}


function nextPCData(){
	
	if(ecGraphType == 'W'){
		byChartSelected?drawByChartWeekGraph(ecNextWeekNumber):drawByTotalsWeekGraph(ecNextWeekNumber);
	}else if(ecGraphType == 'D'){
		byChartSelected?drawByChartDayGraph(ecNextDay):drawByTotalsDayGraph(ecNextDay);
	}else if(ecGraphType == 'Y'){
		byChartSelected?drawByChartYearGraph(ecNextYear):drawByTotalsYearGraph(ecNextYear);
	}
}


function getPCUsageAjaxCallBasedOnGraphType(inputVal){
	
	var inpValues = {};
	var postURL = '';
	if(ecGraphType == 'W'){
		inpValues = {"yearWeekNumber" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcweeklyusage.htm";
	}else if(ecGraphType == 'D'){
		inpValues = {"actualDay" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcdailyusage.htm";
	}else if(ecGraphType == 'M'){
		inpValues = {"actualDay" : inputVal};
		postURL = "/protected/usageHistory/esense/getpcmonthlyusage.htm";
	}else if(ecGraphType == 'Y'){
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


function drawPCChart(chartType,data){	
   
	try{
		var options = getPCOptionsBasedOnChartType(chartType);	
		var dataTable = new google.visualization.DataTable();
		if(chartType == 'line'){
			dataTable.addColumn('string','Day');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
			dataTable.addColumn('number','Usage');
			dataTable.addRows(data);
			chart = new google.visualization.LineChart(document.getElementById('BarChart_div'));
		}else if(chartType == 'bar'){
			dataTable.addColumn('string','Year');
			dataTable.addColumn('number',totalGraphLabelAvg);
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number',totalGraphLabelYou);
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addColumn('number',totalGraphLabelEff);
			dataTable.addColumn({'type': 'string', 'role': 'tooltip', 'p': {'html': true}});
			dataTable.addRow(data);
			chart = new google.visualization.BarChart(document.getElementById('BarChart_div'));
		}
		chart.draw(dataTable, options);
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawUsageChart:::"+err.message);
   	   throw new DrawChartException(err.message);
	 }
 }


function getPCOptionsBasedOnChartType(chartType){
	
	var options = {};
	if(chartType == 'line'){
		options = {
				width: 520,
		        height: 240,
		        vAxis: {gridlines: {count:4, color: '#ccc'}, textStyle: {fontSize: 9}, title: 'kWh'},
		        hAxis: { textStyle: {fontSize: 9}},
		        chartArea:{height:"73%", width: "85%", top: 35},
				bar: { groupWidth: '50' },
				colors:['gray','#333092','green'],
				legend: {position:'none'},
				pointSize:5
			};
	}else if(chartType == 'bar'){
		options = {
	 			width: 520,
		        height: 200,
			    colors:['gray','#333092','green'],
			    legend: 'none',
			    bar: {groupWidth: "50%"},
			    vAxis: {gridlines: {count:4, color: '#ccc'}, textStyle: {fontSize: 9}, title: 'kWh'},
		        hAxis: { textStyle: {fontSize: 9}},
			    chartArea:{left:22,top:28,width:"75%",height:"90%"}, 
			};
	}
	return options;
}


function populatePCAnalysisMessage(pcData){
	
	var avgUsage = 0.0;
	var selfUsage = 0.0;
	var analysis = '';
	var analysispart2 = '';
	try{
		if(!pcData.dataAvailable){
			$("#usageAnalysisMsg3").html(usageChartAnalysisNoDataMsg);	
		}else{
			if(ecGraphType == 'W'){
				avgUsage = getFixedDecimalVal(parseFloat(pcData.avgWeekUsage.weekTotalUsage),2);
				selfUsage = getFixedDecimalVal(parseFloat(pcData.selfWeekUsage.weekTotalUsage),2);
				analysispart2 = usageChartAnalysisCmpMsg;
			}else if(ecGraphType == 'D'){
				avgUsage = getFixedDecimalVal(parseFloat(pcData.avgHourlyData.totalUsage),2);
				selfUsage = getFixedDecimalVal(parseFloat(pcData.selfHourlyData.totalUsage),2);
				analysispart2 = usageChartAnalysisEctyToday;
			}else if(ecGraphType == 'Y'){
				avgUsage = getFixedDecimalVal(parseFloat(pcData.avgYearUsage.totalUsage),2);
				selfUsage = getFixedDecimalVal(parseFloat(pcData.selfYearUsage.totalUsage),2);
				analysispart2 = usageChartAnalysisEctyYear;
			}
			var analysispart3 = usageChartAnalysisCmpMoreMsg;
			if(isNaN(avgUsage) || avgUsage == 0){
				$("#usageAnalysisMsg3").html(analysis+usageChartAnalysisNoDataMsg);
			}else{
				var percent = calculatePercentage(avgUsage, selfUsage);
			    if(percent >0){analysispart3 = usageChartAnalysisCmpLessMsg};
			    percent = Math.abs(percent);
			    $("#usageAnalysisMsg3").html(analysis+usageChartAnalysisTotlValMsg+" "+selfUsage+analysispart2+percent+analysispart3);
			}
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE populatePCAnalysisMessage::::"+err.message);
	}

}


function populatePCDates(pcData){
	
	if(ecGraphType == 'W'){
		populatePCWeekDates(pcData);
	}else if(ecGraphType == 'D'){
		var currentDay = pcData.dayOfMessage;
		$("#pcdaydates").text(currentDay);
	}else if(ecGraphType == 'Y'){
		var currentYear = pcData.selfYearUsage.year;
		$("#pcyeardates").text(currentYear);
	}
}


function populatePCWeekDates(pcData){
	
	try{
		var strDateList = pcData.strDateList;
		for(i=0; i<weekDays; i++){
			   $("#pcenrgCompDate"+i).text(strDateList[i]);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE populatePCWeekDates::::"+err.message);
	}
}