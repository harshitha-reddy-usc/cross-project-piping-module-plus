CrossProjectPipingModulePlus = {};

CrossProjectPipingModulePlus.ajax_endpoint = "AJAX_ENDPOINT";
CrossProjectPipingModulePlus.initial_ajax_endpoint = "INITIAL_AJAX";
CrossProjectPipingModulePlus.processed_count = 0;


CrossProjectPipingModulePlus.ajax_complete = function(data, status, xhr) {
	console.log("ajax completed", {data: data, status: status, xhr: xhr});
	if (status == 'success' && data.responseJSON && data.responseJSON['success'] == true) {
		if (CrossProjectPipingModulePlus.totalRecords === CrossProjectPipingModulePlus.processed_count) {
			$(".cpp_pipe_all_loader_plus").css('display', 'none');
			$("button#pipe_all_records_plus").attr('disabled', false);
			window.location.reload();
		}
	} else {
		$(".cpp_pipe_all_loader_plus").css('display', 'none');
		$("button#pipe_all_records_plus").attr('disabled', false);
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
				const totalItems = CrossProjectPipingModulePlus.totalRecords;
				const batchSize = 10000;
				let remainingItems = totalItems;

				while (remainingItems > 0) {
					const currentBatchSize = Math.min(batchSize, remainingItems);
					CrossProjectPipingModulePlus.processed_count += currentBatchSize;
					endIndex = startIndex + currentBatchSize;

					$.get({
						url: CrossProjectPipingModulePlus.ajax_endpoint,
						async: false,
						data: {
							start_index: startIndex,
							end_index: endIndex
						},
						complete: CrossProjectPipingModulePlus.ajax_complete
					});

					remainingItems -= currentBatchSize;
					startIndex = endIndex + 1;
				}
				console.log("All items processed!");
			});
		});
	} else {
		setTimeout(CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded, 100);
	}
}

CrossProjectPipingModulePlus.addButtonAfterJqueryLoaded();