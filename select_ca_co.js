function fn_preProcessForm(){
            
            /**
            *  pre process the form if any
            */
            
   }

/**
 * 
 */
$('.ctrls').bind('click',function(e){
	e.preventDefault();
	var targetLinkId='';
	//console.dir(this);
	if($($(this).find('span'))){
		targetLinkId = this.id;
	}else{
		targetLinkId = e.target.id;
	}
	var reqFrom = $('#requestFrom').val();
	if ( typeof reqFrom !== "undefined" && reqFrom !== null  && reqFrom =='deleteCA') {
		
		 $('#accountnumber').val($('#accountnumber_'+targetLinkId).val());
		 $('#checkdigit').val($('#checkdigit_'+targetLinkId).val());
		 $('#accountname').val($('#accountname_'+targetLinkId).val());
		 $('#bpNum').val($('#bpNum_'+targetLinkId).val());
		 $('#ebilflag').val($('#ebilflag_'+targetLinkId).val());
		 $('#paperflag').val($('#paperflag_'+targetLinkId).val());
		 $('#formatAccountNumber').val($('#formatAccountNumber_'+targetLinkId).val());
		
		
		$("#addDelCASubmitFrm").attr('action', '/protected/removeAccount.htm');
		$("#addDelCASubmitFrm").submit(); 
	} else {
		//alert("CONTINUE CLICK:" + targetLinkId);
		
		$('#bpNum').val($('#bpNum_'+ targetLinkId).val());
		$('#caNum').val($('#caNum_'+ targetLinkId).val());
		$('#contractId').val($('#contractId_'+ targetLinkId).val());
		
		//alert("Bp Nnum:" + $('#bpNum').val() + ", Ca Num:" + $('#caNum').val() + ", Contract Id:" + $('#contractId').val());
			
		$("#multiCACOSelFrm").attr('action', '/protected/oam/continueByPrimaryCaSelection.htm');
		$("#multiCACOSelFrm").submit();
	}			
});

/**
 * Ajax call on click Display More Account Numbers. Implemented AJAX framework 
 * Added by: Jenith 
 * on: 10/11/2013
 */
$("#displayMoreAccount").click(function() {
	
	//alert("Inside displayMoreAccount()");
	//$("#nextFiveAddress").show().addClass("blockelement"); // replace this code with your method to place the addresses. Use the nextFiveAddress as holder to place the addresses you get
	//$("#getMoreAddressOpt").hide(); // call this when you reached all the service addresses
	
	$(this).hide();
	$(this).after('<img id="loadingMore" src="/resources/assets/images/public/processing.gif" />');
	
	var $caCoTbl = $("#cacoTable");
	var $statusMsgDiv = $("#statusMsg");

	// Hide ajax response error status
	$statusMsgDiv.hide();
	
	//alert('in ajax call');
	
	 var getMoreCaList = {
            url : "/protected/oam/displayMoreCaList.htm",
            success: function(result){
        		//alert("Done displayMoreCaList.htm call");
        		//alert(result);
        		
        		if (result == "FAILURE") {
        			$statusMsgDiv.removeClass('successMsg').addClass('errorMsg').show();
        			
        			$("#loadingMore").hide();
        		} else {
        			$caCoTbl.append(result).show();
            		
            		//TaskId - CHG0004640  - MultiCA Display Start
            		$("#loadingMore").hide();
            		var caTempVal=$("#moreCaCountTemp").val();
            		$("#moreCaCount").text(caTempVal);
            		$("#moreCaCountRow").remove();
            		
            		

            		if(caTempVal==0)
            			$("#getMoreAccountOpt").hide();
            		//TaskId - CHG0004640  - MultiCA Display End
        		}
        		
        		// Hide disply more header
           	 	// $(".dmth").hide();
                $('#displayMoreAccount').show();
            }
     };

	 var ajaxDone = callMyAjax(getMoreCaList);
});

/**
 * Dynamic Display More Addresses ID, so added by Jenith on 10/12/2013
 * 
 * @param targetLinkId
 */
function dispMoreServAddresses(targetLinkId) {
	
	//alert("DISPL MORE SERV ADDR CLICK:" + targetLinkId);
	
	$("#nextFiveAddress_" + targetLinkId).show().addClass("blockelement");
	$("#getMoreAddressOpt_" + targetLinkId).hide();
}

/**
 * 
 */
$("#displayMoreAddress").click(function() {
		$("#nextFiveAddress").show().addClass("blockelement"); // replace this code with your method to place the addresses. Use the nextFiveAddress as holder to place the addresses you get
		$("#getMoreAddressOpt").hide(); // call this when you reached all the service addresses
});