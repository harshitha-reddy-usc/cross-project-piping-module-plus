<?php
header('Content-Type: application/json');

$failures = 0;
$successes = 0;
$pipe_attempts = 0;

$record_match_fields = $module->projects['destination']['records_match_fields'];
$data_to_save = [];
foreach ($record_match_fields as $rid => $info) {
	$data =  $module->pipeToRecord($rid);
	foreach($data as $recordid => $value) {
		$data_to_save["$recordid"] = $value;
	}
}

$batch_size = 1000;
$batches = array_chunk($data_to_save, $batch_size);
foreach ($batches as $batch) {
	$save_result = \REDCap::saveData('array', $batch);
	$pipe_attempts++;
	# Quick-Fix for PHP8 Support
	$ids = (array) $save_result['ids'];
	if (!empty($ids)) {
		$successes++;
	} elseif (!empty($save_result['errors'])) {
		$failures++;
		if (!empty($verbose_failure_logging)) {
			\REDCap::logEvent("Sync Records Across Projects", "Verbose Pipe-All piping failure information\n" . implode($save_result, "\n"));
		}
	}
}
$module->createNewDestinationRecords();

$no_change_records = $pipe_attempts - $successes - $failures;
$changed_records = $pipe_attempts - $no_change_records;

\REDCap::logEvent("Sync Records Across Projects: Pipe All Records",
	"Records piped: $pipe_attempts.
	Successes: $successes.
	Failures: $failures.
	Changed / Unchanged records: $changed_records / $no_change_records");

$response = [];
if (empty($errors)) {
	$response['success'] = true;
} else {
	$response['error'] = implode('. ', $errors);
}

echo json_encode($response);