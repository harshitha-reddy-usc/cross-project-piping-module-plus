CrossProjectPipingModulePlus = {};

CrossProjectPipingModulePlus.ajax_endpoint = "AJAX_ENDPOINT";
CrossProjectPipingModulePlus.initial_ajax_endpoint = "INITIAL_AJAX";

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

				$.get({
					url: CrossProjectPipingModulePlus.initial_ajax_endpoint,
					async: false,
					success: function(data) {
						CrossProjectPipingModulePlus.totalRecords = data['total_records'];
					}
				});

				var startIndex = 0;
				var batchSize = 10000;
				var endIndex = Math.min(startIndex + batchSize, CrossProjectPipingModulePlus.totalRecords);
				var status = "success";
				function makeAjaxCall() {
					if (startIndex <= endIndex && endIndex <= CrossProjectPipingModulePlus.totalRecords && status === "success") {
						// send ajax request to pipe_all_records_plus endpoint;
						$.get({
							url: CrossProjectPipingModulePlus.ajax_endpoint,
							//async: false,
							data: {
								start_index: startIndex,
								end_index: endIndex
							},
							success: function(data) {
								startIndex = endIndex + 1;
								endIndex = Math.min(startIndex + batchSize, CrossProjectPipingModulePlus.totalRecords);
								makeAjaxCall(); // Recursive call to the function
							},
							error: function(jqXHR, textStatus, errorThrown) {
								console.log("Error:", errorThrown);
								status = "failure";
							},
							complete: CrossProjectPipingModulePlus.ajax_complete
						});
					}
				}
				makeAjaxCall();
			});
		});
	} else {
		setTimeout(CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded, 100);
	}
}

CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded();