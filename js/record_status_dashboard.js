CrossProjectPipingModulePlus = {};

CrossProjectPipingModulePlus.ajax_endpoint = "AJAX_ENDPOINT";

CrossProjectPipingModulePlus.ajax_complete = function(data, status, xhr) {
	console.log("ajax completed", {data: data, status: status, xhr: xhr});
	$(".cpp_pipe_all_loader_plus").css('display', 'none');
	$("button#pipe_all_records_plus").attr('disabled', false);
	
	if (status == 'success' && data.responseJSON && data.responseJSON['success'] == true) {
		window.location.reload();
	} else {
		if (data.responseJSON && data.responseJSON['error']) {
			alert(data.responseJSON['error']);
		} else {
			alert("The Sync Records Across Projects module failed to get a response for your action. Please contact a REDCap administrator or the author of this module.");
		}
	}
}

CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded = function() {
	if (typeof($) != 'undefined') {
		// wait 
		$(function() {
			$("form#dashboard-config + div").append("<button id='pipe_all_records_plus' class='btn btn-xs btn-rcpurple fs13'><div class='cpp_pipe_all_loader_plus'></div>Sync Records Across Projects</button>");
			
			$("body").on("click", "button#pipe_all_records_plus", function(event) {
				// show spinning loader icon and disabled pipe button
				$(".cpp_pipe_all_loader_plus").css('display', 'inline-block');
				$("button#pipe_all_records_plus").attr('disabled', true);
				
				// send ajax request to pipe_all_records_plus endpoint
				$.get({
					url: CrossProjectPipingModulePlus.ajax_endpoint,
					complete: CrossProjectPipingModulePlus.ajax_complete,
				});
			});
		});
	} else {
		setTimeout(CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded, 100);
	}
}

CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded();