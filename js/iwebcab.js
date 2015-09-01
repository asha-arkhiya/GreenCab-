// Initial Set-up
var phone_number = localStorage.getItem('phone_number');
var customer_id = localStorage.getItem('customer_id');
var customer_hash = localStorage.getItem('customer_hash');
var current_page = "loading";
var last_page = "loading";
var address_mode = 'pickup';
var address_lat = 0.00000;
var address_long = 0.00000;
var search_data;
var search_auto;
var deviceType = 'Unknown';
var mybookings=false;
var dovibrate = new Array();
var myScroll = {};
// Location Vaiables
var latitude = 0.000000;
var longitude = 0.000000;
var new_home_lat = 0.000000;
var new_home_long = 0.000000;
var curloc;
var pickup_data = {};
var dropoff_data = {};
var viapoint_data = new Array;
var pickup_time = 'now';
var saved_booking_notes = '';
var airports_data;
var favourites_data;
var route_distance = 0;
var route_duration = 0;
var job_quote = 0.00;
var selected_rating = 3;

// JSON Variables
var drivers;
var userdata = new Array();
var jobdata = new Array();
var taxidata = new Array();
var pushNotification;
var pushToken='NA';
var pickup_banned = new Array();

var text_status = new Array();
text_status['Y'] = "Completed";
text_status['V'] = "Cancelled";
text_status['1'] = "En-route To Pick Up";
text_status['A'] = "Approaching Pick Up";
text_status['2'] = "En-route To Drop Off";
text_status['W'] = "Pending Pre-book";
text_status['Q'] = "Waiting For Driver";
text_status['P'] = "Pending Driver Acceptance";
var general_height = 0;
// PhoneGap
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	$(".page-content").css({'min-height':$(window).height()});
    document.addEventListener("backbutton", onBackKeyDown, false);
    document.addEventListener("menubutton", onMenuKeyDown, false);
	if(navigator.userAgent.match(/(iPad.*|iPhone.*|iPod.*);.*CPU.*OS 7_\d/i) || navigator.userAgent.match(/(iPad.*|iPhone.*|iPod.*);.*CPU.*OS 8_\d/i)) {
        $("body").addClass("ios7");
        $('body').append('<div id="ios7statusbar"/>');
        $(".appPage h1").css({"margin-top":"15px"});
    }
}


document.addEventListener("offline", function() {
	$(".appPage:visible, .loadingPage:visible").hide();
	$("#page_offline").show();
}, false);

document.addEventListener("online", function() {
  if(current_page!='loading'){
	$("#page_"+current_page).show();
	$("#page_offline").hide();
  }
}, false);

function onBackKeyDown(){
	moveToPage(last_page);
    return false;
}

function onMenuKeyDown(){
	moveToPage('home')
}

function getPhoneGapPath() {

    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );
    return 'file://' + path;

};


function playAudio(file) {
    // Play the audio file at url
    var my_media = new Media(getPhoneGapPath()+"audio/"+file+".mp3",
        // success callback
        function () {
            console.log("playAudio():Audio Success");
        },
        // error callback
        function (err) {
            console.log("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}

// iWebCab JS
function parseQueryString() {
	var url = window.location.pathname;
    var queryStringIdx = url.indexOf('?');
    var pairs = url.substr(queryStringIdx + 1)
                   .split('&')
                   .map(function(p) { return p.split('='); });
    var result = { };
    for (var i = 0; i < pairs.length; i++) {
        result[decodeURIComponent(pairs[i][0])] = decodeURIComponent(pairs[i][1]);
    }

    return result;
}

function moveToPage(new_page){
	if(current_page!='welcome')last_page = current_page;
	$(".appPage:visible, .loadingPage:visible").fadeOut(200,function(){
		
		$("#page_"+new_page).fadeIn(200);
		if(new_page!='home' && new_page!='step2' && new_page!='payment'){
			if(new_page=='step1' || new_page=='step3'){
				$("#close").show();
				$("#menu").hide();
				$("#back").hide();
			}else{
				$("#close").hide();
				$("#back").show();
				$("#menu").hide();
			}
		}else{
			$("#close").hide();
			$("#back").hide();
			$("#menu").show();
      	}
		current_page = new_page;
		$(".page-content").css({'height':"100%"});
		if(new_page=='address_search'){
			 google.maps.event.trigger(map, 'resize');
			 map.panTo(curloc);
			 $("input[name=address_search-text]").val('');
			 $("select[name=favourites]").val('0');
			 $("select[name=airports]").val('0');
		}
	});
	
	$(".nav-item").find("em").addClass("unselected-nav");
	$(".nav-item").find("em").removeClass("selected-nav");
	if(new_page=='home'){
		$(".home-nav").find("em").addClass("selected-nav");
		$(".home-nav").find("em").removeClass("unselected-nav");
	}else if(new_page=='step2' || new_page=='step1'){
		$(".contact-nav").find("em").addClass("selected-nav");
		$(".contact-nav").find("em").removeClass("unselected-nav");
	}else if(new_page=='payment'){
		$(".payment-nav").find("em").addClass("selected-nav");
		$(".payment-nav").find("em").removeClass("unselected-nav");
	}
}

function process_config_changes(){
	if(allow_instant_jobs==false){
		$("#dopickupnow").hide();
		$("#doprebook").removeClass("button-left").addClass("button-center");
		$("#takemehome").hide();
		$("#nextbooking").show();
	}
}

$(document).ready(function(){
	general_height = $(window).height();
		deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
		document.title=brand_name;
		$(".brandname").html(brand_name);
		$(".brandlocation").html(brand_location);
		$(".dispatch-nav").attr("href","tel:"+dispatch_number);
		
		$(document).on("focus","input",function(){
			if($(window).height()!=general_height){
				$("div[id^='do']").hide();
				$(".pageContent").css({"bottom":"0px"});
			}
		});
		
		$(document).on("blur","input",function(){
			$("div[id^='do']").show();
			$(".pageContent").css({"bottom":"100px"});
			process_config_changes();
		});
		
		myScroll['mybookings'] = new IScroll('#page_mybookings .pageContentFull',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		myScroll['register'] = new IScroll('#page_register .pageContent',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		myScroll['address'] = new IScroll('#page_address .pageContentFull',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		myScroll['address_search'] = new IScroll('#page_address_search .pageContent',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		myScroll['completed'] = new IScroll('#page_completed .pageContent',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		myScroll['confirmation'] = new IScroll('#page_confirmation .pageContent',{ keyBindings: true, click: true, useTransform: true, zoom: false, scrollbars:true, interactiveScrollbars: true, shrinkScrollbars: 'scale' });		
		
		loadScript();
		is_verified();
		get_startup_data();
		process_config_changes();
		
	});

var onSuccess = function(position) {
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;
	curloc = new google.maps.LatLng(latitude,longitude);
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode({'latLng': curloc}, function(results, status) {
	    if(status == google.maps.GeocoderStatus.OK) {
	        search_data = results[0];
			var addr = search_data.formatted_address;
			$("#address_b1 span").html(addr);
			map.panTo(search_data.geometry.location);
			curloc = search_data.geometry.location;
			search_auto.setBounds(new google.maps.LatLngBounds(search_data.geometry.location,search_data.geometry.location));
	    };
	});

}

function onError(error) {
do_alert('code: '    + error.code    + '\n' +
      'message: ' + error.message + '\n');
}

function get_startup_data(){
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/airports.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
			},
			function (recvdata){
				$.each(recvdata, function(index, value){
					$("select[name=airports]").append($('<option></option>').attr("value",index).text(value['text']));
				});
				airports_data = recvdata;
			}
			,'json');

}	

function getjob(job_id){
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/check_live_bookings.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'job_id': job_id,
			},
			function (recvdata){
				if(recvdata['jobdata']['result']!='error'){
					jobdata = recvdata['jobdata'];
				}else{
					jobdata = new Array();
				}
				if(recvdata['taxidata']['result']!='error'){
					taxidata = recvdata['taxidata'];
				}else{
					taxidata = new Array();
				}
				update_job_screen();
			},'json');
}

function update_job_screen(){
	$("#status_line").removeClass("wfd gtp gtd can");
	if(jobdata['status']=='W'){
		$("#docanceljob").show();
		$("#docalldispatch").removeClass("button-center").addClass("button-xl-left");
		$("#status_line").addClass("can");
		$(".status_l1").html("Pending Pre-book");
		$(".status_l2").html(jobdata['pickup_time_text']);
		$(".status_l3").html("");
	}else if(jobdata['status']=='Q'){
		$("#docanceljob").show();
		$("#docalldispatch").removeClass("button-center").addClass("button-xl-left");
		$("#status_line").addClass("wfd");
		$(".status_l1").html("Waiting for a Driver");
		$(".status_l2").html("");
		$(".status_l3").html("");
	}else if(jobdata['status']=='P'){
		$("#docanceljob").show();
		$("#docalldispatch").removeClass("button-center").addClass("button-xl-left");
		$("#status_line").addClass("wfd");
		$(".status_l1").html("Request sent to a Driver");
		$(".status_l2").html("Awaiting Acceptance...");
		$(".status_l3").html("");
	}else if(jobdata['status']=='1'){

		$("#docanceljob").show();
		$("#docalldispatch").removeClass("button-center").addClass("button-xl-left");
		
		$("#status_line").addClass("gtp");
		$(".status_l1").html("Estimated Pick Up Time");
		if(taxidata.hasOwnProperty("internal_reference")){
			if(taxidata['internal_reference']=='')driver_ref=taxidata['taxi_id'];
			else driver_ref = taxidata['internal_reference'];
		}else{
			driver_ref=taxidata['taxi_id'];
		}
		$(".status_l3").html(taxidata['first_name']+" (Reg: "+driver_ref+") is on the way!")
		var jobdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(jobdata['start_job_lat'],jobdata['start_job_long']), new google.maps.LatLng(jobdata['pickup_lat'],jobdata['pickup_long']))*0.000621371192;
		var driverdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(taxidata['lat'],taxidata['long']), new google.maps.LatLng(jobdata['pickup_lat'],jobdata['pickup_long']))*0.000621371192;
		var perconway = 1-(driverdist/jobdist);
		if(jobdata['start_job_eta']==0)jobdata['start_job_eta']=(driverdist*3);
		var minstogo = Math.ceil(jobdata['start_job_eta']*(1-perconway));
		$(".gtp #status_p2").animate({'left': (perconway*100)+"%"},500);
		if(minstogo<1){
			$(".status_l2").html("Driver Approaching");
		}else{
			$(".status_l2").html(minstogo+" Minutes");
		}
	}else if(jobdata['status']=='A'){
		if(!dovibrate.hasOwnProperty("Job"+jobdata['job_id'])){
			navigator.notification.vibrate(2500);
			dovibrate["Job"+jobdata['job_id']]=true;
		}
		$("#docanceljob").hide();
		$("#docalldispatch").removeClass("button-xl-left").addClass("button-center");
		
		$("#status_line").addClass("gtp");
		$(".status_l1").html("Estimated Pick Up Time");

		if(taxidata.hasOwnProperty("internal_reference")){
			if(taxidata['internal_reference']=='')driver_ref=taxidata['taxi_id'];
			else driver_ref = taxidata['internal_reference'];
		}else{
			driver_ref=taxidata['taxi_id'];
		}
		$(".status_l3").html(taxidata['first_name']+" (Reg: "+driver_ref+") is approaching in a "+taxidata['car_colour']+" "+taxidata['car_make']+".");
		var jobdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(jobdata['start_job_lat'],jobdata['start_job_long']), new google.maps.LatLng(jobdata['pickup_lat'],jobdata['pickup_long']))*0.000621371192;
		var driverdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(taxidata['lat'],taxidata['long']), new google.maps.LatLng(jobdata['pickup_lat'],jobdata['pickup_long']))*0.000621371192;
		var perconway = 1-(driverdist/jobdist);
		var minstogo = Math.ceil(jobdata['start_job_eta']*(1-perconway));
		$(".gtp #status_p2").animate({'left': (perconway*100)+"%"},500);
		$(".status_l2").html("Driver Approaching");
					
	}else if(jobdata['status']=='2'){

		$("#docanceljob").hide();
		$("#docalldispatch").removeClass("button-xl-left").addClass("button-center");
		
		$("#status_line").addClass("gtd");
		$(".status_l1").html("Estimated Drop Off Time");

		if(taxidata.hasOwnProperty("internal_reference")){
			if(taxidata['internal_reference']=='')driver_ref=taxidata['taxi_id'];
			else driver_ref = taxidata['internal_reference'];
		}else{
			driver_ref=taxidata['taxi_id'];
		}
		$(".status_l3").html(taxidata['first_name']+" (Reg: "+driver_ref+") is your driver.")
		var jobdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(jobdata['dropoff_lat'],jobdata['dropoff_long']), new google.maps.LatLng(jobdata['pickup_lat'],jobdata['pickup_long']))*0.000621371192;
		var driverdist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(taxidata['lat'],taxidata['long']), new google.maps.LatLng(jobdata['dropoff_lat'],jobdata['dropoff_long']))*0.000621371192;
		var perconway = 1-(driverdist/jobdist);
		var minstogo = Math.ceil(jobdata['est_time_duration']*(1-perconway));
		$(".gtd #status_p2").animate({'left': (perconway*100)+"%"},500);
		if(minstogo<1){
			$(".status_l2").html("Driver Approaching");
		}else{
			$(".status_l2").html(minstogo+" Minutes");
		}
	}else if(jobdata['status']=='V'){

		$("#docanceljob").hide();
		$("#docalldispatch").removeClass("button-xl-left").addClass("button-center");
		
		$("#status_line").addClass("can");
		$(".status_l1").html("This job has been cancelled");
		$(".status_l2").html("");
		$(".status_l3").html("");
	}else if(jobdata['status']=='Y'){

		$("#docanceljob").hide();
		$(".status_l3").html("");
		$("#docalldispatch").removeClass("button-xl-left").addClass("button-center");
		
		if(current_page!='completed')moveToPage("completed");
		if(taxidata.hasOwnProperty("internal_reference")){
			if(taxidata['internal_reference']=='')driver_ref=taxidata['taxi_id'];
			else driver_ref = taxidata['internal_reference'];
		}else{
			driver_ref=taxidata['taxi_id'];
		}
		
		$("#payment_method").html(jobdata['fare_charge_method']);
		$("#total_cost").html(jobdata['currency_sign']+jobdata['cost']);
		$("#driver_name").html(taxidata['first_name']+" (Reg: "+driver_ref+")");
		
		if(jobdata['feedback_score']!=0){
			$(".ratings li.active").removeClass("active");
			$(".ratings li").slice(0,jobdata['feedback_score']).addClass('active');
			if(jobdata['feedback_score']==5)$(".completed_l6").html("Fantastic!");
			else if(jobdata['feedback_score']==4)$(".completed_l6").html("Very good!");
			else if(jobdata['feedback_score']==3)$(".completed_l6").html("Good");
			else if(jobdata['feedback_score']==2)$(".completed_l6").html("Poor");
			else if(jobdata['feedback_score']==1)$(".completed_l6").html("Awful");
			$("#complete_reason").hide();
			$("#doleavefeedback").hide();
			$("#docompleteend").show();
		}else{
			$("#complete_reason").hide();
			$("#doleavefeedback").show();
			$("#docompleteend").hide();
			$(".completed_l6").html("Please rate your ride");
			$(".ratings li.active").removeClass("active");
		}
		
		$("#status_line").addClass("can");
		$(".status_l1").html("Loading..");
		$(".status_l2").html("");
		
	}else{
		$("#status_line").addClass("can");
		$(".status_l1").html("Loading..");
		$(".status_l2").html("");
	}
}

function apply_name(fn, ln){
	userdata['first_name']=fn;
	userdata['last_name']=ln;
	$(".firstnameField").val(fn);
	$(".lastnameField").val(ln);
	$(".passengernameField").val(fn+" "+ln);
	$("input[name=profile-firstname]").val(fn);
	$("input[name=profile-lastname]").val(ln);
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/favourites.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
			},
			function (recvdata){
				$("select[name=favourites]").html('');
				$.each(recvdata, function(index, value){
					$("select[name=favourites]").append($('<option></option>').attr("value",index).text(value['text']));
					if(value.hasOwnProperty('main'))$("input[name=profile-address]").val(value['text']);
				});
				favourites_data = recvdata;
			}
			,'json');
			get_my_bookings();
}

function get_my_bookings(){
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/customer_bookings.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
			},
			function (recvdata){
				$(".mybookings ul").html('');
				$.each(recvdata, function(index, value){
					$(".mybookings ul").prepend("<li><a href='#' class='booking_status' data-jobid='"+index+"' data-status='"+value['status']+"'><h4>#"+index+" - "+value['time']+"</h4>"
											+"<div class='txt_txt'><span class='status"+value['status']+"'>"+text_status[value['status']]+"</span><br/><b>From:</b> "+value['pickup']+"<br/><b>To:</b> "+value['dropoff']+"</div></a></li>");
				});
				setTimeout(function () {
					myScroll['mybookings'].refresh();
				}, 0);
			}
			,'json');
}

function apply_email(em){
	userdata['email']=em;
	$(".emailField").val(em);
	$("input[name=profile-email]").val(em);
	$("input[name=profile-mobile]").val(phone_number);
}


function is_verified(){
	if(phone_number==null)verify_now();
	else if(customer_hash==null)verify_now();
	else{
		$.post("https://cp.iwebcab.com/public_api/"+api_key+"/customer_verified.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'push_token':pushToken,
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					apply_name(recvdata['first_name'],recvdata['last_name']);
					apply_email(recvdata['email']);
					moveToPage('home');
				}else if(recvdata['result']=='valid-cin'){
					moveToPage('validate_code');
				}else {
					localStorage.setItem('customer_hash',null);
					customer_hash = null;
					localStorage.setItem('customer_id',null);
					customer_id = null;
					localStorage.setItem('phone_number',null);
					phone_number = null;
					verify_now();
				}
			},'json');
	}
}

function handleOpenURL(url){
	if(url.indexOf("bks")>-1){
		getjob();
		moveToPage('status');
	}
}

function verify_now(){
	moveToPage('unauthenticated');
}

$(document).on("click","#signup",function(){
	moveToPage('register');
});

$(document).on("click","#login",function(){
	moveToPage('login');
});

$(document).on("click", "#dologin", function(){
	
	var seccode = $.md5(api_key+'-'+$("input[name=login-password]").val());
	phone_number = $("input[name=login-mobile]").val();
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/validate_customer_hash.json",
			{
				'phone_number': phone_number,
				'customer_hash': seccode,
				'push_token':pushToken,
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					
					localStorage.setItem('customer_hash',seccode);
					customer_hash = seccode;
					
					localStorage.setItem('customer_id',recvdata['customer_id']);
					customer_id = recvdata['customer_id'];
					
					localStorage.setItem('phone_number',recvdata['phone_number']);
					phone_number = recvdata['phone_number'];
					
					apply_name(recvdata['first_name'],recvdata['last_name']);
					apply_email(recvdata['email']);
					
					moveToPage('home');
					process_config_changes();
				}else if(recvdata['result']=='valid-cin'){
					localStorage.setItem('customer_hash',seccode);
					customer_hash = seccode;
					
					localStorage.setItem('customer_id',recvdata['customer_id']);
					customer_id = recvdata['customer_id'];
					
					localStorage.setItem('phone_number',recvdata['phone_number']);
					phone_number = recvdata['phone_number'];
					
					moveToPage('validate_code');
					process_config_changes();
				}else if(recvdata['result']=='valid-reset'){
					do_alert("We have sent you a brand new security code via SMS - please use this code and try again.");
				}else {
					do_alert("The login details you have provided are invalid - please try again");
				}
			},'json');
});

$(document).on("click","#doforgotlogin",function(){
	
	phone_number = $("input[name=login-mobile]").val();
	if(phone_number=='')do_alert("Please enter your telephone number first before clicking forgot.");
	else{
		$.post("https://cp.iwebcab.com/public_api/"+api_key+"/reset_security_code.json",
			{
				'phone_number': phone_number
			},
			function (recvdata){
				if(recvdata['result']=='nocustomer'){
					do_alert("Please follow the instructions in the SMS you will receive in a moment to reset your code.");
				}else{
					do_alert("Please call our dispatch line on "+dispatch_number+" for a reset.");
				}
			});
	}
});

$(document).on("click", "#dovalidateresend", function(){
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/reset_account_code.json",
			{
				'phone_number': phone_number,
				'customer_hash': customer_hash,
			},
			function (recvdata){
				if(recvdata['result']=='nocustomer'){
					do_alert("We do not have a customer account with your phone number, please register for a new account.");
					moveToPage('register');
				}else if(recvdata['result']=='sent'){
					do_alert("A new security code has now been sent to you via SMS. Please wait up to 60 seconds before re-attempting.");
				}
			},'json');
});

$(document).on("click", "#dovalidate", function(){
		
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/validate_seccode.json",
			{
				'phone_number': phone_number,
				'customer_hash': customer_hash,
				'push_token':pushToken,
				'sec_code': $.md5(api_key+'-'+$("input[name=validation-code]").val())
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					localStorage.setItem('customer_id',recvdata['customer_id']);
					customer_id = recvdata['customer_id'];
					is_verified();
				}else {
					do_alert("The verification code you have entered is invalid - please check and try again.");
				}
			},'json');
});

$(document).on("click","#home_b1",function(){
	moveToPage('book');	
	// Clean up!
		address_mode='pickup';
		pickup_data = {};
		dropoff_data = {};
		viapoint_data = new Array;
		pickup_time = 'now';
		saved_booking_notes = '';
		route_distance = 0;
		route_duration = 0;
		job_quote = 0.00;
		selected_rating = 3;
		jobdata = new Array();
		taxidata = new Array();
		$("#book_b2 span, .txt_dropoff_address").html("");
		$("#book_b1 span, .txt_pickup_address").html("");
		$(".viapoint").remove();
		$("#vad").hide();
		$(".txt_via_addresses").html("Not Provided");
		$("textarea[name=booking_notes]").val('');		
	// All cleaned up :)
});

$(document).on("click","#home_b2",function(){
	get_my_bookings();
	moveToPage('mybookings');
});

$(document).on("click","#home_b3",function(){
	moveToPage('profile');
});

$(document).on("click","input[name=profile-address]",function(){
	address_mode='home';
	moveToPage('address_search');
	$("#text_row").show();
	$("#airport_row").hide();
	$("#favourites_row").hide();
	map.setZoom(15);
	search_auto.setTypes(["geocode"]);
});

$(document).on("click","#book_b1",function(){
	address_mode='pickup';
	moveToPage('address');
});

$(document).on("click","#book_b2",function(){
	address_mode='dropoff';
	moveToPage('address');
});

$(document).on("click","#book_b3",function(){
	moveToPage('book_more');
});

$(document).on("click","#book_more_b1",function(){
	address_mode='viapoint';
	moveToPage('address');
});

$(document).on("click","#book_more_b2",function(){
	moveToPage('book_notes');
});

$(document).on("click","#address_b1",function(){
	address_lat = curloc.lat().toFixed(5);
	address_long = curloc.lng().toFixed(5);
	address_text = $("#address_b1 span").html();
	
	if(address_mode=='pickup'){
		$("#book_b1 span, .txt_pickup_address").html(address_text);
		pickup_data = { 'text': address_text, 'lat': address_lat, 'long': address_long }
	}
	else if(address_mode=='dropoff'){
		dropoff_data = { 'text': address_text, 'lat': address_lat, 'long': address_long }
		$("#book_b2 span, .txt_dropoff_address").html(address_text);
	}
	else if(address_mode=='viapoint'){
		viapoint_data[viapoint_data.length] = { 'text': address_text, 'lat': address_lat, 'long': address_long }
		$('#page_book .page_menu ul li:nth-last-child(2)').before('<li class="viapoint"><a href="#" class="book_viapoint">Via Point<span>'+address_text+'</span></a></li>');
		
		if($("#vad").is(":visible")){
			$(".txt_via_addresses").append("<br/>"+address_text);
		}else{
			$("#vad").show();
			$(".txt_via_addresses").html(address_text);
		}
	}
	moveToPage('book');
	
});

$(document).on("click","#address_b2",function(){
	moveToPage('address_search');
	$("#text_row").show();
	$("#airport_row").hide();
	$("#favourites_row").hide();
	map.setZoom(15);
	search_auto.setTypes(["geocode","establishment"]);
});

$(document).on("click","#address_b3",function(){
	moveToPage('address_search');
	map.setZoom(12);
	$("#text_row").hide();
	$("#airport_row").show();
	$("#favourites_row").hide();
	setTimeout(function () {
		myScroll['address_search'].refresh()
	}, 100);
});


$(document).on("click","#address_b4",function(){
	moveToPage('address_search');
	$("#text_row").show();
	$("#airport_row").hide();
	$("#favourites_row").hide();
	map.setZoom(15);
	search_auto.setTypes(["establishment"]);
});

$(document).on("click","#address_b5",function(){
	moveToPage('address_search');
	$("#text_row").hide();
	$("#airport_row").hide();
	$("#favourites_row").show();
	map.setZoom(15);
});

$(document).on("click","#dostorenotes",function(){
	saved_booking_notes = $("textarea[name=booking_notes]").val();
	$(".txt_notes").html(saved_booking_notes);
	moveToPage('book');
});

function do_alert(message){
	navigator.notification.alert(message, function(){return true;}, brand_name, "OK");
}

$(document).on("click",".b_add_new_card",function(){
	if(phone_number==null)verify_now();
	else if(customer_hash==null)verify_now();
	else{
		$.post("https://cp.iwebcab.com/public_api/"+api_key+"/add_new_card.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'creditcard': $("#cardnumberField").val(),
				'expiry':$("#cardexpmonthField").val()+$("#cardexpyearField").val(),
				'cvv':$("#cvvcodeField").val()
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					apply_card(recvdata['l4d'],recvdata['type']);
					$("#cc_success").show().delay(3000).fadeOut(400);
				}else {
					$("#cc_fail").show().delay(3000).fadeOut(400);
				}
			},'json');
	}
});

$(document).on("click","#b_new_card",function(){
	$("#div_b_new_card").hide();
	$("#new_card").show();
});
	
$(document).on("click", ".home-nav, #back", function(){
	if(current_page=='step4')moveToPage('step3');
	else moveToPage('home');
});

// Back Button Actions
$(document).on("click","#page_register .backButton", function(){
	moveToPage('unauthenticated');
});

$(document).on("click","#page_home .backButton", function(){
	navigator.notification.confirm("Are you sure you wish to logout?", function(val){
		if(val==2){
		moveToPage('unauthenticated');
		localStorage.setItem('customer_hash',null);
		customer_hash = null;
		localStorage.setItem('customer_id',null);
		customer_id = null;
		localStorage.setItem('phone_number',null);
		phone_number = null;
		$("login-mobile").val("");
		$("login-password").val("");
	}}, "Logout", "Cancel,Logout");
});

$(document).on("click","#page_login .backButton", function(){
	moveToPage('unauthenticated');
});

$(document).on("click","iwebcab",function(){
	var ref = window.open('http://www.iwebcab.com?from=ca', '_blank', 'location=yes');
});

$(document).on("click", ".home-nav, #close, #b_keep_job, #page_mybookings .backButton, #page_contactus .backButton", function(){
	moveToPage('home');
});

$(document).on("click","#page_book .backButton", function(){
	navigator.notification.confirm("Do you want to delete this booking?", function(val){
		if(val==2){
			moveToPage('home');
	}}, "Your Booking", "No,Yes");
});

$(document).on("click","#page_contactus_email .backButton", function(){
	moveToPage('contactus');
});

$(document).on("click","#page_address .backButton", function(){
	moveToPage('book');
});
$(document).on("click","#page_address_search .backButton", function(){
	if(address_mode=='home')moveToPage('profile');
	else moveToPage('address');
});

$(document).on("click","#page_book_more .backButton", function(){
	moveToPage('book');
});

$(document).on("click","#page_requirements .backButton", function(){
	moveToPage('book');
});

$(document).on("click","#page_confirmation .backButton, #page_prebook .backButton", function(){
	moveToPage('requirements');
});

$(document).on("click","#book_next",function(){
	if(dropoff_data.hasOwnProperty('text') && pickup_data.hasOwnProperty('text')){
		if(dropoff_data.text!='' && pickup_data.text!=''){
			moveToPage('requirements');
			route_it();
			return;
		}
	}

	do_alert("You must select a pick up and drop off location before proceeding.")
	
});

$(document).on("click","#page_status .backButton", function(){
	if(mybookings)moveToPage('mybookings');
	else moveToPage('home');
});

$(document).on("click","#page_completed .backButton, #docompleteend, #page_profile .backButton", function(){
	if(mybookings)moveToPage('mybookings');
	else moveToPage('home');
});

$(document).on("click","#docalldispatch, #contactus_b1",function(){
	if(jobdata.hasOwnProperty("job_id")){
		window.location='tel:'+dispatch_number+',*2'+jobdata['job_id'];
	}else{
		window.location='tel:'+dispatch_number+',*1'+customer_id;
	}
});

$(document).on("click","#home_b4",function(){
	moveToPage('contactus');
});

$(document).on("click","#contactus_b2",function(){
	moveToPage('contactus_email');
});

$(document).on("click","#page_book_notes .backButton", function(){
	$("textarea[name=booking_notes]").val(saved_booking_notes);
	moveToPage('book');
});

$(document).on("click","#doprebook",function(){
	moveToPage("prebook");
	$("#current_date span:eq(0)").html("Not Set");
	$("#current_date span:eq(1)").html("Not Set");
	$( "#prebook-date" ).datepicker({
        inline: true,  
        defaultDate: 'now',
		minDate: 'now',
		autoSize: true,
		dateFormat: 'DD d M yy',
	});
	
	$('#prebook-time').timepicker({
		defaultTime: 'now',
		onHourShow: pickup_hour,
		onMinuteShow: pickup_min,
		onSelect: function(){
			btime=($('#prebook-time').timepicker('getHour')*60)+$('#prebook-time').timepicker('getMinute');
			$("#current_date span:eq(1)").html($("#prebook-time").timepicker("getTime"));
			},
		});
	
		$('#prebook-time').timepicker('disable');
		$( "#prebook-date" ).trigger("change");
	    
	});

$(document).on("change","#prebook-date",function(){
	$("#prebook-time").val('');
	$('#prebook-time').timepicker('disable');

	$("#current_date span:eq(0)").html($("#prebook-date").val());
   
    $.post("https://cp.iwebcab.com/public_api/"+api_key+"/check_prebook_day_availability.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'date': $(this).val(),
			},
			function (recvdata){
				pickup_banned=recvdata;
				$("#prebook-time").timepicker("refresh");
				$('#prebook-time').timepicker('enable');
			}
			,'json');
	   
});

function pickup_hour(hour){
		if(pickup_banned.hasOwnProperty(hour+'00') && pickup_banned.hasOwnProperty(hour+'30'))return false;
		else return true;
}

function pickup_min(hour,min){
		if(min<30)var min='00';
		else var min='30';

		if(pickup_banned.hasOwnProperty(hour+min))return false;
		else return true;
}

$(document).on("click","#doconfirmprebook",function(){
	if($("#current_date span:eq(0)").html()=='Not Set' || $("#current_date span:eq(1)").html()=='Not Set'){
		do_alert("You must specify a date and time by using the widgets on this page.");
	}else{
		$.post("https://cp.iwebcab.com/public_api/"+api_key+"/cost_estimate.json",
				{
					'phone_number': phone_number,
					'customer_id': customer_id,
					'customer_hash': customer_hash,
					'distance': route_distance,
					'duration': route_duration,
				},
				function (recvdata){
					$(".txt_price_estimate").html(recvdata.currency_sign+""+recvdata.cost+" "+recvdata.currency);
					job_quote = recvdata.cost;
				}
				,'json');
		$(".txt_time").html($("#current_date span:eq(0)").html()+" at "+$("#current_date span:eq(1)").html());	
		pickup_time=$("#current_date span:eq(0)").html()+" "+$("#current_date span:eq(1)").html();
		$(".txt_requirements").html("Passengers: "+$("select[name=passengers] option:selected").val()+". Suitcases: "+$("select[name=suitcases] option:selected").val()+". Wheelchair: "+$("select[name=wheelchair] option:selected").text()+".");
		moveToPage('confirmation');
	}
})

$(document).on("click","#dopickupnow", function(){
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/pickup_estimate.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'lat': pickup_data.lat,
				'long': pickup_data.long,
			},
			function (recvdata){
				$(".txt_time").html(recvdata['t2p']);
				if(recvdata['t2pd']>40)do_alert(("Please be aware your pickup estimate is "+recvdata['t2p']).replace(/&#189;/g,String.fromCharCode("189")));
			}
			,'json');
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/cost_estimate.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'distance': route_distance,
				'duration': route_duration,
			},
			function (recvdata){
				$(".txt_price_estimate").html(recvdata.currency_sign+""+recvdata.cost+" "+recvdata.currency);
				job_quote = recvdata.cost;
			}
			,'json');
	pickup_time='now';
	$(".txt_requirements").html("Passengers: "+$("select[name=passengers] option:selected").val()+". Suitcases: "+$("select[name=suitcases] option:selected").val()+". Wheelchair: "+$("select[name=wheelchair] option:selected").text()+".");
	moveToPage('confirmation');

});

$(document).on("click","#dosendemail", function(){
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/send_email.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'message': $("textarea[name=contactus_email]").val()
			},
			function (recvdata){
				do_alert("Thank you, your message has been received and we will be back in touch shortly.")
			}
			,'json');
	moveToPage('home');
});


$(document).on("click","#doconfirmsearchaddress", function(){
	if($("#text_row").is(":visible")){
		if(address_mode=='pickup'){
			$("#book_b1 span, .txt_pickup_address").html($("input[name=address_search-text]").val());
			pickup_data = { 'text': $("input[name=address_search-text]").val(), 'lat': address_lat, 'long': address_long }
		}
		else if(address_mode=='dropoff'){
			dropoff_data = { 'text': $("input[name=address_search-text]").val(), 'lat': address_lat, 'long': address_long }
			$("#book_b2 span, .txt_dropoff_address").html($("input[name=address_search-text]").val());
		}
		else if(address_mode=='viapoint'){
			viapoint_data[viapoint_data.length] = { 'text': $("input[name=address_search-text]").val(), 'lat': address_lat, 'long': address_long }
			$('#page_book .page_menu ul li:nth-last-child(2)').before('<li class="viapoint"><a href="#" class="book_viapoint">Via Point<span>'+$("input[name=address_search-text]").val()+'</span></a></li>');
			if($("#vad").is(":visible")){
				$(".txt_via_addresses").append("<br/>"+$("input[name=address_search-text]").val());
			}else{
				$("#vad").show();
				$(".txt_via_addresses").html($("input[name=address_search-text]").val());
			}
		}else if(address_mode=='home'){
			$("input[name=profile-address]").val($("input[name=address_search-text]").val());
			new_home_lat = address_lat;
			new_home_long = address_long;
			moveToPage('profile');
			return;
		}
	}else if($("#airport_row").is(":visible")){
		
		if($("select[name=airports]").text()=='Select Airport'){
			moveToPage('book');
			return;
		}
		if($("input[name=airport-terminal]").val()!='')var terminal = " - "+$("input[name=airport-terminal]").val();
		else var terminal = '';
		
		if(address_mode=='pickup'){
			$("#book_b1 span, .txt_pickup_address").html($("select[name=airports] option:selected").text()+terminal);
			pickup_data = { 'text': $("select[name=airports] option:selected").text()+terminal, 'lat': address_lat, 'long': address_long, 'flight': $("input[name=airport-flight]").val()}
		}
		else if(address_mode=='dropoff'){
			dropoff_data = { 'text': $("select[name=airports] option:selected").text()+terminal, 'lat': address_lat, 'long': address_long, 'flight': $("input[name=airport-flight]").val()}
			$("#book_b2 span, .txt_dropoff_address").html($("select[name=airports] option:selected").text()+terminal);
		}
		else if(address_mode=='viapoint'){
			viapoint_data[viapoint_data.length] = { 'text': $("select[name=airports] option:selected").text()+terminal, 'lat': address_lat, 'long': address_long, 'flight': $("input[name=airport-flight]").val() }
			$('#page_book .page_menu ul li:nth-last-child(2)').before('<li class="viapoint"><a href="#" class="book_viapoint">Via Point<span>'+$("select[name=airports] option:selected").text()+terminal+'</span></a></li>');
			
			if($("#vad").is(":visible")){
				$(".txt_via_addresses").append("<br/>"+$("select[name=airports] option:selected").text()+terminal);
			}else{
				$("#vad").show();
				$(".txt_via_addresses").html($("select[name=airports] option:selected").text()+terminal);
			}
		}
	}else if($("#favourites_row").is(":visible")){
		
		if($("select[name=favourites]").text()=='Select Favourite'){
			moveToPage('book');
			return;
		}
		
		if(address_mode=='pickup'){
			$("#book_b1 span, .txt_pickup_address").html($("select[name=favourites] option:selected").text());
			pickup_data = { 'text': $("select[name=favourites] option:selected").text(), 'lat': address_lat, 'long': address_long }
		}
		else if(address_mode=='dropoff'){
			dropoff_data = { 'text': $("select[name=favourites] option:selected").text(), 'lat': address_lat, 'long': address_long }
			$("#book_b2 span, .txt_dropoff_address").html($("select[name=favourites] option:selected").text());
		}
		else if(address_mode=='viapoint'){
			viapoint_data[viapoint_data.length] = { 'text': $("select[name=favourites] option:selected").text(), 'lat': address_lat, 'long': address_long }
			$('#page_book .page_menu ul li:nth-last-child(2)').before('<li class="viapoint"><a href="#" class="book_viapoint">Via Point<span>'+$("select[name=favourites] option:selected").text()+'</span></a></li>');
		
			if($("#vad").is(":visible")){
				$(".txt_via_addresses").append("<br/>"+$("select[name=favourites] option:selected").text());
			}else{
				$("#vad").show();
				$(".txt_via_addresses").html($("select[name=favourites] option:selected").text());
			}
			
		}
	}
	moveToPage('book');
});

$(document).on("click","#dobookingedit",function(){
	moveToPage('book');
})

$(document).on("click", "#dosignup", function(){
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/create_customer.json",
			{
				'phone_number': $("input[name=register-mobile]").val(),
				'first_name':	$("input[name=register-firstname]").val(),
				'last_name':	$("input[name=register-lastname]").val(),
				'email':	$("input[name=register-email]").val(),
				'new_pin':	$("input[name=register-password]").val(),
			},
			function (recvdata){
				if(recvdata['result']=='success'){

					var seccode = $.md5(api_key+'-'+$("input[name=register-password]").val());
					localStorage.setItem('customer_hash',seccode);
					customer_hash = seccode;
					
					localStorage.setItem('customer_id',recvdata['customer_id']);
					customer_id = recvdata['customer_id'];
					
					localStorage.setItem('phone_number',recvdata['phone_number']);
					phone_number = recvdata['phone_number'];
					
					moveToPage('validate_code');
				}else{
					do_alert("You already have an account with us - please use the forgot securty code option if required.");
					moveToPage('login');
				}
			},'json');
});



$(document).on("click", "#doprofile", function(){
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/update_customer_profile.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'first_name':	$("input[name=profile-firstname]").val(),
				'last_name':	$("input[name=profile-lastname]").val(),
				'email':	$("input[name=profile-email]").val(),
				'new_mobile':	$("input[name=profile-mobile]").val(),
				'new_home_lat':	new_home_lat,
				'new_home_long': new_home_long,
				'new_home_address': $("input[name=profile-address]").val(),
			},
			function (recvdata){
				if(recvdata['result']=='valid'){				
					phone_number = recvdata['phone_number'];
					apply_name($("input[name=profile-firstname]").val(), $("input[name=profile-lastname]").val());
					apply_email($("input[name=profile-email]").val());	
					localStorage.setItem('phone_number',recvdata['phone_number']);
					
					do_alert("Your profile information has been updated successfully.");
				}else{
					do_alert("Unable to update your information - please contact dispatch.");
				}
			},'json');
});

$(document).on("click","#takemehome",function(){
	if($("input[name=profile-address]").val()==''){
		moveToPage('profile');
		do_alert("Please fill in your home address in your profile first to use this feature.");
	}else{
		address_lat = curloc.lat().toFixed(5);
		address_long = curloc.lng().toFixed(5);
		address_text = $("#address_b1 span").html();
		$("#book_b1 span, .txt_pickup_address").html(address_text);
		pickup_data = { 'text': address_text, 'lat': address_lat, 'long': address_long }

		address_lat = favourites_data['main']['lat'];
		address_long = favourites_data['main']['lon'];
		address_text = favourites_data['main']['text'];
		$("#book_b2 span, .txt_dropoff_address").html(address_text);
		dropoff_data = { 'text': address_text, 'lat': address_lat, 'long': address_long }
		route_it('true');
		
	}
})

$(document).on("click", "#docanceljob", function(){

	$("#docanceljob").hide();
	$("#docalldispatch").removeClass("button-xl-left").addClass("button-center");
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/cancel_job.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'job_id':	jobdata['job_id']
			},
			function (recvdata){
				getjob(jobdata['job_id']);
				get_my_bookings();
			},'json');
});

$(document).on("click","#b_job_1",function(){
	moveToPage('step4');
});

$(document).on("click","#dobooking",function(){

	$("#dobooking").hide();
	$("#dobookingedit").hide();

	if(pickup_data.hasOwnProperty('flight'))var pickup_flight=pickup_data.flight;
	else var pickup_flight='';
	if(dropoff_data.hasOwnProperty('flight'))var dropoff_flight=dropoff_data.flight;
	else var dropoff_flight='';
	
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/instant_booking.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'passenger_name':	userdata['first_name']+" "+userdata['last_name'],
				'passenger_total':	$("select[name=passengers] option:selected").val(),
				'cases_total':	$("select[name=suitcases] option:selected").val(),
				'wheelchair': $("select[name=wheelchair] option:selected").val(),
				'pickup_address':	pickup_data.text,
				'pickup_lat':	pickup_data.lat,
				'pickup_long':	pickup_data.long,
				'pickup_flight': pickup_flight,
				'dropoff_address':	dropoff_data.text,
				'dropoff_lat':	dropoff_data.lat,
				'dropoff_flight': dropoff_flight,
				'viapoints': JSON.stringify(viapoint_data),
				'dropoff_long':	dropoff_data.long,
				'distance': route_distance,
				'duration': route_duration,
				'cost': job_quote,
				'notes': saved_booking_notes,
				'pickup_time': pickup_time,
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					mybookings=false;
					moveToPage('status');
					getjob(recvdata['job_id']);
					get_my_bookings();
					$("#dobooking").show();
					$("#dobookingedit").show();
					do_alert("Thank you for your booking - you can now view your booking status from this page.");
				}else{
					alert(recvdata['error']);
					$("#dobooking").show();
					$("#dobookingedit").show();
				}
			},'json');
	
});

$(document).on("click","#doleavefeedback",function(){
	$("#doleavefeedback").hide();
	
	if(selected_rating<3){
		rating_notes = $("input[name=completed-reason]").val();
	}else{
		rating_notes = '';
		
	}
	$.post("https://cp.iwebcab.com/public_api/"+api_key+"/booking_feedback.json",
			{
				'phone_number': phone_number,
				'customer_id': customer_id,
				'customer_hash': customer_hash,
				'job_id': jobdata['job_id'],
				'rating': selected_rating,
				'notes': rating_notes,
			},
			function (recvdata){
				if(recvdata['result']=='valid'){
					do_alert("Thank you for your feedback, this has now been stored.")
					jobdata['feedback_score']=selected_rating;
					$("#complete_reason").hide();
					$("#docompleteend").show();
				}else{
					do_alert(recvdata['error']);
					$("#doleavefeedback").show();
				}
			},'json');
});

$(document).on("change","select[name=airports]",function(){
	var airportiata = $("select[name=airports]").val();
	if(airportiata=='0'){
		map.panTo(curloc);
		return;
	}
	var airportlatlng = new google.maps.LatLng(airports_data[airportiata]['lat'],airports_data[airportiata]['lon']);
	map.setCenter(airportlatlng);
  	map.panTo(airportlatlng);
  	
  	address_lat = airportlatlng.lat().toFixed(5);
  	address_long = airportlatlng.lng().toFixed(5);
});

$(document).on("change","select[name=favourites]",function(){
	var fav = $("select[name=favourites]").val();
	if(fav=='0'){
		map.panTo(curloc);
		return;
	}
	var favlatlng = new google.maps.LatLng(favourites_data[fav]['lat'],favourites_data[fav]['lon']);
	map.setCenter(favlatlng);
  	map.panTo(favlatlng);
  	
  	address_lat = favlatlng.lat().toFixed(5);
  	address_long = favlatlng.lng().toFixed(5);
});

$(document).on("click",".ratings li",function(){
	if(jobdata['feedback_score']==0){
		selected_rating = $(this).index()+1;
		$(".ratings li.active").removeClass("active");
		$(".ratings li").slice(0,selected_rating).addClass('active');
	
		$("#complete_reason").hide();
		if(selected_rating==5)$(".completed_l6").html("Fantastic!");
		else if(selected_rating==4)$(".completed_l6").html("Very good!");
		else if(selected_rating==3)$(".completed_l6").html("Good");
		else if(selected_rating==2){
			$(".completed_l6").html("Poor");
			$("#complete_reason").show();
		}
		else if(selected_rating==1){
			$(".completed_l6").html("Awful");
			$("#complete_reason").show();
		}
	}	
});

$(document).on("click","#nextbooking",function(){
	getjob();
	moveToPage('status');
})

$(document).on("click",".booking_status",function(){
	mybookings=true;
	getjob($(this).data('jobid'));
	if($(this).data('status')=='Y')moveToPage('completed');
	else moveToPage('status');
})

setInterval(function(){
	if($("#page_status").is(":visible") && jobdata.hasOwnProperty("job_id"))getjob(jobdata['job_id']);
	if($("#page_mybookings").is(":visible"))get_my_bookings();
},10000);

 // --------------------------------------------------------
 // -------------- [ GOOGLE MAPS DATA ] --------------------
 // --------------------------------------------------------
	function loadScript() {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=initialize_map&libraries=geometry,places';
		document.body.appendChild(script);
	}
	
	function initialize_map() {

		navigator.geolocation.getCurrentPosition(onSuccess, onError);
		   			   		
		var myOptions = {
		  zoom: 15,
		  center: new google.maps.LatLng(51.0453246,-114.0581012),
		  streetViewControl: false,
		  scrollwheel: false,
		  navigationControl: false,
		  mapTypeControl: false,
		  disableDefaultUI: true,
		  scaleControl: false,
		  draggable: false,
		  mapTypeId: google.maps.MapTypeId.ROADMAP
		};
			
		map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
		
		$("#map_canvas").append('<img src="images/pickuplarge.png" id="pickupicon" style="position: absolute; top:50%; left:50%;  margin-top: -130px; margin-left: -76px; -moz-transform:scale(0.4); -webkit-transform:scale(0.4); transform:scale(0.4); z-index:10000;">');
		
		var dmarker = new google.maps.Marker({
		        position: map.getCenter(),
		        map: map
	    });	
	    
	    var autoOptions = {
	    		bounds: new google.maps.LatLngBounds(curloc, curloc),
	    		types: ['geocode']	    		
	    };
	    
		search_auto = new google.maps.places.Autocomplete($("input[name=address_search-text]")[0],autoOptions);
		
		google.maps.event.addListener(search_auto, 'place_changed', function() {
		 	
	    	var place = search_auto.getPlace();
		 	
		 	if (!place.geometry) {
				do_alert("The pickup location could not be validated - try again.");
				setTimeout(function(){$("input[name=address_search-text]").val('')},50); 
		   		return;
		 	}
		 				
			if(($.inArray("airport",place.types)!=-1) && $('input[name=booking_type]:checked').val()!='airport'){
				do_alert("Please go back and select 'Airport' as your search method.");
			  	setTimeout(function(){$("input[name=address_search-text]").val('')},50); 
			    return;
			}	
			
		 	map.setCenter(place.geometry.location);
	 	  	map.panTo(place.geometry.location);
	 	  	
	 	  	address_lat = place.geometry.location.lat().toFixed(5);
	 	  	address_long = place.geometry.location.lng().toFixed(5);
	
	 	  	var addr = place.formatted_address;
			if(place.name!='' && place.formatted_address.toLowerCase().indexOf(place.name.toLowerCase())<0) addr = "("+place.name+") "+ addr;
			setTimeout(function(){$("input[name=address_search-text]").val(addr)},50); 
			return;
		});  
  
	}
	
	function route_it(skip){

		directionsService = new google.maps.DirectionsService();
		var waypoints = new Array;
		$.each(viapoint_data, function(index, value){
			waypoints.push({location: new google.maps.LatLng(value.lat,value.long)})
		});
		
		
		var request = {
		   origin: new google.maps.LatLng(pickup_data.lat,pickup_data.long),
		   destination: new google.maps.LatLng(dropoff_data.lat,dropoff_data.long),
		   waypoints: waypoints,
		   travelMode: google.maps.DirectionsTravelMode.DRIVING,
		   unitSystem: google.maps.DirectionsUnitSystem.IMPERIAL,
		   provideRouteAlternatives: false,
		 };
	
		 directionsService.route(request, function(response, status) {
		   if (status == google.maps.DirectionsStatus.OK) {

		    var legs = response.routes[0].legs;
		    totalDistance = 0;
		    totalDuration = 0;
		    for ( var i=0; i<legs.length; ++i ){
		        totalDistance += legs[i].distance.value;
		        totalDuration += legs[i].duration.value;
		    }
		    route_distance = Math.round((totalDistance*0.000621371192)*100)/100;
		    route_duration = Math.round((totalDuration/60)*10)/10;
		   }
		 });
		 
		 if(skip=='true')setTimeout(function(){$("#dopickupnow").trigger("click")},50);
	}

 // --------------------------------------------------------
 // -------------- [ GOOGLE MAPS DATA ] --------------------
 // --------------------------------------------------------