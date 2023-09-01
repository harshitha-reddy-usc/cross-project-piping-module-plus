<?php
header('Content-Type: application/json');

session_start();
if(isset($_SESSION['record_keys'])) {
    $record_match_keys = unserialize($_SESSION['record_keys']);
} else {
	error_log("no variables set");
	$record_match_keys = [];
}

if(isset($_SESSION['filename'])) {
	$filename = $_SESSION['filename'];
	$file = fopen($filename, "r");
	if ($file) {
		$serializedData = fread($file, filesize($filename));
		fclose($file);
		$module = unserialize($serializedData);
	} else {
		error_log("Unable to open $filename for reading.");
	}
} else {
	error_log("no filename set");
}

$failures = 0;
$successes = 0;
$pipe_attempts = 0;

$data_to_save = [];
$start_index = intval($_GET['start_index']);
$end_index = intval($_GET['end_index']);

$records_ids = array_slice($record_match_keys, $start_index, $end_index - $start_index + 1);

foreach ($records_ids as $val => $rid) {
	$data = $module->pipeToRecord($rid);
	foreach($data as $recordid => $value) {
		$data_to_save["$recordid"] = $value;
	}
}

$batch_size = 1000;
$batches = array_chunk($data_to_save, $batch_size, true);
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