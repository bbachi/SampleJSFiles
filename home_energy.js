var weekDays = 7;
var numberOfMonths = 12;
var totalCost = 0.0;
var totalUsage = 0.0;
var fahrenheit = '&deg;';
var kWh =  ' kWh';
var NA = ' ';
var ehPreviousWeekNumber = '';
var ehNextWeekNumber = '';
var ehCurrentYearWeekNumber = '';
var ehPreviousDay = '';
var ehNextDay = '';
var ehActualDay = '';
var ehPreviousYear = '';
var ehNextYear = '';
var ehCurrentYear = '';
var ehCurrYearMonthNum = '';
var ehPrevYearMonthNum = '';
var ehNextYearMonthNum = '';
var ehCurrentBDYearNum = '';

var ehGraphType = '';
var isThisUserHasPool = false;


google.load("visualization", "1", {packages:["corechart"]});
google.setOnLoadCallback(function(){
	ehGraphType = 'W';
	$("#piemonthtempdivid").hide();
	drawBDWeeklyUsageChart();
});

$("#viewbdtype").change(function(){
	if($("#viewbdtype").val() == 'week'){drawBDWeeklyUsageChart();}
	if($("#viewbdtype").val() == 'year'){drawBDMonthlyUsageChart()();}
});


function populateHEPrevAndNextNumbers(usageData){
	ehPreviousWeekNumber = usageData.prevYearWeekNumber;
	ehNextWeekNumber = usageData.nextYearWeekNumber;
	ehCurrentYearWeekNumber = usageData.currentYearWeekNum;
	ehPreviousDay = usageData.prevDay;
	ehNextDay = usageData.nextDay;
	ehActualDay = usageData.actualDay;
	ehPreviousYear = usageData.previousYear;
	ehNextYear = usageData.nextYear;
	ehCurrentYear = usageData.currentYear;
	ehCurrYearMonthNum = usageData.currentMonthNum;
	ehPrevYearMonthNum = usageData.previousMonthNum;
	ehNextYearMonthNum = usageData.nextMonthNum;
}


function hideAndShowHomeEnergyArrows(usageData){
	
	if(usageData.prevDataAvailable){
		$("#energyuse_prev").removeClass("novisibility");
	}else{
		$("#energyuse_prev").addClass("novisibility");
	}
	if(usageData.nextDataAvailable){
		$("#energyuse_next").removeClass("novisibility");
	}else{
		$("#energyuse_next").addClass("novisibility");
	}
}


function drawBDWeeklyUsageChart(){
	drawBDWeekChart(ehCurrentYearWeekNumber);
}

function drawBDMonthlyUsageChart(){
	drawBDMonthChart(ehCurrYearMonthNum);
}

$("ul#monthLabels li").click(function(event){
	event.preventDefault();
	var index = $(this).index()+1;
	if(!$("#bdmonth"+index).hasClass("nodatalink")){
		drawBDMonthChart(ehCurrentYear+index);
	}
});

function drawBDWeekChartAndHandleErrors(bdWeeklyUsageData){
	  
	try{
	   populateBDWeekDates(bdWeeklyUsageData);
	   populateHEPrevAndNextNumbers(bdWeeklyUsageData);
	   hideAndShowHomeEnergyArrows(bdWeeklyUsageData);
	   populateBDAnalysisMessage(bdWeeklyUsageData);
	   populateBDWeekTemperatureData(bdWeeklyUsageData);
	   if(bdWeeklyUsageData.dataAvailable){
		   hideAndShowBDGraphAndErrorMsg(true); 
		   populatePieChartData(bdWeeklyUsageData);
		   var data = getDataArrayForBDGraph(bdWeeklyUsageData);
		   drawBDChart(data);
	   }else{
		   hideAndShowBDGraphAndErrorMsg(false); 
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawBDWeekChartAndHandleErrors:::"+err.message);
	   hideAndShowBDGraphAndErrorMsg(false); 
   }
}


function drawBDMonthChartAndHandleErrors(bdMonthlyUsageData){
	   
   try{
	   populateBDMonthDates(bdMonthlyUsageData);
	   populateHEPrevAndNextNumbers(bdMonthlyUsageData);
	   hideAndShowHomeEnergyArrows(bdMonthlyUsageData);
	   populateBDAnalysisMessage(bdMonthlyUsageData);
	   disableMonthLinksBasedOnYearMaxMonthNum(bdMonthlyUsageData);
	   if(bdMonthlyUsageData.dataAvailable){
		   hideAndShowBDGraphAndErrorMsg(true); 
		   populatePieChartData(bdMonthlyUsageData);
		   var data = getDataArrayForBDGraph(bdMonthlyUsageData);
		   drawBDChart(data);
	   }else{
		   hideAndShowBDGraphAndErrorMsg(false);  
	   }
   }catch(err){
	   console.log("ERROR OCCURED WHILE drawBDMonthChartAndHandleErrors:::"+err.message);
	   hideAndShowBDGraphAndErrorMsg(false);
   }
}


function hideAndShowBDGraphAndErrorMsg(hideErrMsg){
	$("#PieChart_div").removeClass("usagehisLoading marginleftloading");
	if(hideErrMsg){
		$("#pietbl").show();
		$("#pieNoDataAvail").hide();
		$("#PieChart_div").fadeIn();
	}else{
		$("#pietbl").hide();
		$("#PieChart_div").hide();
		$("#pieNoDataAvail").fadeIn();
	}
}


function populateBDWeekTemperatureData(bdData){
	
	try{
		var highTempList = bdData.highTempList;
		var lowTempList = bdData.lowTempList;
		for(i=0; i<weekDays; i++){
			$("#enrgUseTempHi"+i).html((null != highTempList && null != highTempList[i])?getTemperatureValue(highTempList[i]):NA);
			$("#enrgUseTempLo"+i).html((null != highTempList && null != lowTempList[i])?getTemperatureValue(lowTempList[i]):NA);
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE populateBDWeekTemperatureData::::"+err.message);
	}
}


function getBDTempDataAndPopulate(yearMonthNum){
	
	try{
		var yearNum = yearMonthNum.substring(0,4);
		if(ehCurrentBDYearNum !== yearNum){
			ehCurrentBDYearNum = yearNum;
			$.when( getBDYearTemperatureData(yearNum) ).done(function(data){
				populateBDYearTempPoints(data);
			});
		}else{
			console.log("NO BACK END CALL:::SINCE THE SAME YEAR");
		}
	}catch(err){
		console.log("ERROR OCCURED WHILE getBDTempDataAndPopulate::::"+err.message);
	}
}

function populateBDYearTempPoints(tempData){
	
	if(null != tempData && tempData.dataAvailable){
		var tempList = tempData.tempList;
		for(i=0;i<numberOfMonths;i++){
			$("#enrgUseMonthTempHi"+i).html(null != tempList[i] && null != tempList[i].tempHigh?getTemperatureValue(tempList[i].tempHigh):NA);
			$("#enrgUseMonthTempLo"+i).html(null != tempList[i] && null != tempList[i].tempLow?getTemperatureValue(tempList[i].tempLow):NA);
		}
	}else{
		for(i=0;i<numberOfMonths;i++){
			$("#enrgUseMonthTempHi"+i).html(NA);
			$("#enrgUseMonthTempLo"+i).html(NA);
		}
	}
}

function drawBDWeekChart(yearWeekNumber){
	ehGraphType = 'W';
	$("#homeenergyusechartid ul li").removeClass("t_active");
	$("#homeenergyusechartid ul li:nth-child(1)").addClass("t_active");
	$("#monthLabels").hide();
	$("#bdweekdates").show();
	$("#monthbddate").addClass("novisibility");
	$("#pieweektempdivid").show();
	$("#piemonthtempdivid").hide();
	$.when( getBDUsageAjaxCallBasedOnGraphType(yearWeekNumber) ).done(function(data){
		drawBDWeekChartAndHandleErrors(data);
	});
}

function drawBDMonthChart(yearMonthNum){
	ehGraphType = 'M';
	$("#homeenergyusechartid ul li").removeClass("t_active");
	$("#homeenergyusechartid ul li:nth-child(2)").addClass("t_active");
	$("#monthLabels").show();
	$("#bdweekdates").hide();
	$("#pieweektempdivid").hide();
	$("#monthbddate").removeClass("novisibility");
	$("#piemonthtempdivid").show();
	$.when( getBDUsageAjaxCallBasedOnGraphType(yearMonthNum) ).done(function(data){
		drawBDMonthChartAndHandleErrors(data);
	});
	getBDTempDataAndPopulate(yearMonthNum);
}


function disableMonthLinksBasedOnYearMaxMonthNum(bdMonthlyUsageData){
	
	var maxYearMonthNum = bdMonthlyUsageData.maxYearMonthNum;
	if(null != maxYearMonthNum && maxYearMonthNum.length > 4){
		var monthNum = parseInt(maxYearMonthNum.substring(4));
		for(i=1; i<=12;i++){
			$("#bdmonth"+i).removeClass("nodatalink");
		}
		if(monthNum != 12){
			for(i=monthNum+1; i<=12; i++){
				$("#bdmonth"+i).addClass("nodatalink");
			}
		}
		
	}
}


function getBDUsageAjaxCallBasedOnGraphType(inputVal){
	
	var inpValues = {};
	var postURL = '';
	if(ehGraphType == 'W'){
		inpValues = {"yearWeekNumber" : inputVal};
		postURL = "/protected/usageHistory/esense/getbdweeklyusage.htm";
	}else if(ehGraphType == 'M'){
		inpValues = {"yearMonthNum" : inputVal};
		postURL = "/protected/usageHistory/esense/getbdmonthlyusage.htm";
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

function getBDYearTemperatureData(inputVal){
	
	var inpValues = {"yearMonthNum" : inputVal};
	var postURL = '/protected/usageHistory/esense/getbdyeartempdata.htm';
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


function populatePieChartData(displayBDData){
	
	var heatingAndCoolingUsg = 0;
	var baseChargeUsg = 0;
	var refrigeratorUsg = 0;
	var othersUsg = 0;
	var poolPumpUsg = 0;
	
	var heatingAndCoolingCost = 0;
	var baseChargeCost = 0;
	var refrigeratorCost = 0;
	var othersCost = 0;
	var poolPumpCost = 0;
	
	var heatingAndCoolingPercent = 0;
	var baseChargePercent = 0;
	var refrigeratorPercent = 0;
	var othersPercent = 0;
	var poolPumpPercent = 0;
	
	
	try{
		var sliceList = displayBDData.bdUsage.sliceList;
		
		for(i=0; i<sliceList.length; i++){
			var id = sliceList[i].id;
			if(id == '1'){
				baseChargeUsg = getFixedDecimalVal(parseFloat(sliceList[i].usage),2);
				baseChargeCost = getFixedDecimalVal(parseFloat(sliceList[i].cost),2);
				baseChargePercent = getFixedDecimalVal(parseFloat(sliceList[i].usagePercentage),1);
			}
			if(id == '2'){
				refrigeratorUsg = getFixedDecimalVal(parseFloat(sliceList[i].usage),2);
				refrigeratorCost = getFixedDecimalVal(parseFloat(sliceList[i].cost),2);
				refrigeratorPercent = getFixedDecimalVal(parseFloat(sliceList[i].usagePercentage),1);
			}
			if(id == '3'){
				poolPumpUsg = getFixedDecimalVal(parseFloat(sliceList[i].usage),2);
				poolPumpCost = getFixedDecimalVal(parseFloat(sliceList[i].cost),2);
				poolPumpPercent = getFixedDecimalVal(parseFloat(sliceList[i].usagePercentage),1);
			}
			if(id == '4'){
				heatingAndCoolingUsg = getFixedDecimalVal(parseFloat(sliceList[i].usage),2);
				heatingAndCoolingCost = getFixedDecimalVal(parseFloat(sliceList[i].cost),2);
				heatingAndCoolingPercent = getFixedDecimalVal(parseFloat(sliceList[i].usagePercentage),1);
			}
			if(id == '5'){
				othersUsg = getFixedDecimalVal(parseFloat(sliceList[i].usage),2);
				othersCost = getFixedDecimalVal(parseFloat(sliceList[i].cost),2);
				othersPercent = getFixedDecimalVal(parseFloat(sliceList[i].usagePercentage),1);
			}
		}
		
		$("#enrgUseSlicePercnt1").text(baseChargePercent);
		$("#enrgUseSliceCost1").text(baseChargeCost);
		$("#enrgUseSliceUsage1").text(baseChargeUsg);
		
		$("#enrgUseSlicePercnt2").text(refrigeratorPercent);
		$("#enrgUseSliceCost2").text(refrigeratorCost);
		$("#enrgUseSliceUsage2").text(refrigeratorUsg);
		
		if(poolPumpUsg == 0 && poolPumpPercent == 0){
			$("#enrgUseSliceRow3").hide();
		}else{
			isThisUserHasPool = true;
			$("#enrgUseSlicePercnt3").text(poolPumpPercent);
			$("#enrgUseSliceCost3").text(poolPumpCost);
			$("#enrgUseSliceUsage3").text(poolPumpUsg);
		}
		
		$("#enrgUseSlicePercnt4").text(heatingAndCoolingPercent);
		$("#enrgUseSliceCost4").text(heatingAndCoolingCost);
		$("#enrgUseSliceUsage4").text(heatingAndCoolingUsg);
		
		$("#enrgUseSlicePercnt5").text(othersPercent);
		$("#enrgUseSliceCost5").text(othersCost);
		$("#enrgUseSliceUsage5").text(othersUsg);
		
		$("#totalSliceCostData").text("$"+getFixedDecimalVal(parseFloat(displayBDData.totalCost),2));
		$("#totalSliceUsageData").text(getFixedDecimalVal(parseFloat(displayBDData.totalUsage),2));
	}catch(err){
		console.log("ERROR OCCURED WHILE populatePieChartData:::::"+err.message);
	}
}


function getDataArrayForBDGraph(displayBDData){
	
	var sliceList = displayBDData.bdUsage.sliceList;
	var dataArray = new Array(sliceList.length);
	try{
		for(var i=0; i<sliceList.length; i++) {
			var sliceId = sliceList[i].id;
			var sliceName = sliceList[i].name;
			var sliceUsage = getCostOrUsageValue(sliceList[i].usage);
			var sliceCost = getCostOrUsageValue(sliceList[i].cost);
			var tooltip = getFixedDecimalVal(sliceUsage,2) + ' kWh' + ' ' + '$' + getFixedDecimalVal(sliceCost,2);
			var rowValue = [sliceName, sliceUsage, tooltip];
			if(sliceName != null){
				dataArray[i] = rowValue;
			}
		}
		
	}catch(err){
		   console.log("ERROR OCCURED WHILE getDataArrayForWeeklyGraph:::"+err.message);
		   throw new CreateDataArrayForChartException(err.message);
	}
	return dataArray;
}

function drawBDChart(data){	
	   
	try{
		var options = getPieOptionsBasedOnChartType();
		var dataTable = new google.visualization.DataTable();
		dataTable.addColumn('string', 'Slice Name');
		dataTable.addColumn('number', 'Usage');
	    dataTable.addColumn({type: 'string', role: 'tooltip', 'p': {'html': true}});
	    dataTable.addRows(data);
		var chart = new google.visualization.PieChart(document.getElementById('PieChart_div'));
		chart.draw(dataTable, options);
	}catch(err){
	   console.log("ERROR OCCURED WHILE drawUsageChart:::"+err.message);
   	   throw new DrawChartException(err.message);
	 }
 }


function getPieOptionsBasedOnChartType(){
	
	var withPool = {0: {color: '#ffd200'}, 1: {color: '#ec008c'}, 
        	   2: {color: '#4a8a2b'}, 3: {color: '#439539'}, 4: {color: '#333092'}};
		var withoutPool = {0: {color: '#ffd200'}, 1: {color: '#ec008c'}, 
        	   2: {color: '#4a8a2b'}, 3: {color: '#333092'}};
	var options = {
            width:230,
            height:200, 
            legend:'none', 
            pieSliceText : 'none',
            slices: isThisUserHasPool?withPool:withoutPool,
            chartArea:{left:5,top:28,width:"100%",height:"100%"}
			};
	return options;
}


function populateBDWeekDates(bdData){
	
	var strDateList = bdData.strDateList;
	for(i=0; i<strDateList.length; i++){
		   $("#bdenrgCompDate"+i).text(strDateList[i]);
	}
}

function populateBDMonthDates(bdData){
	$("#monthbddate").text(bdData.month);
}


function prevBDData(){
	
	if(ehGraphType == 'W'){
		drawBDWeekChart(ehPreviousWeekNumber);
	}else if(ehGraphType == 'M'){
		drawBDMonthChart(ehPrevYearMonthNum);
	}
}


function nextBDData(){
	
	if(ehGraphType == 'W'){
		drawBDWeekChart(ehNextWeekNumber);
	}else if(ehGraphType == 'M'){
		drawBDMonthChart(ehNextYearMonthNum);
	}
}

function populateBDAnalysisMessage(bdData){
	
	try{
		if(bdData.dataAvailable){
			populateAnalysisMessage(bdData);
		}else{
			$("#usageAnalysisMsg2").html(usageChartAnalysisNoDataMsg);	
		}
	}catch(err){
		$("#usageAnalysisMsg2").html(usageChartAnalysisNoDataMsg);
		console.log("ERROR OCCURED WHILE populateBDAnalysisMessage::::"+err.message);
	}
}


function populateAnalysisMessage(bdData){
	
	var hvacUsage = 0.0;
	var analysis = '';
	var analysispart2 = '';
	var sliceList = bdData.bdUsage.sliceList;
	if(ehGraphType == 'W'){analysispart2 = pieWeekUsageMsg}else{analysispart2 = usageChartAnalysisEctyMonth};
	if(sliceList.length >0){
		hvacUsage = getFixedDecimalVal(parseFloat(sliceList[3].usage),2);
	}
	if(isNaN(hvacUsage) || hvacUsage == 0){
		$("#usageAnalysisMsg2").html(analysis+usageChartAnalysisNoDataMsg);
	}else{
		$("#usageAnalysisMsg2").html(analysis+usageChartAnalysisPieMsg+hvacUsage+analysispart2+
				'<a href =javascript:openEnergysavingsTip();>'+pielinkMsg+'</a>'+pielinkAftermsg);
	}
}

function openEnergysavingsTip(){
	var win = window.open(language_codeSavingTip, '_blank');
	win.focus();
}