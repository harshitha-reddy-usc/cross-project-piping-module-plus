<?php
header('Content-Type: application/json');

// get information about configured source projects
session_start();
$module->projects = $module->getProjects();
$module->getDestinationProjectData();
$module->getSourceProjectsData();

// prepare the information necessary to implement active form filtering and form status filtering (as configured in module)
$module->active_forms = $module->getProjectSetting('active-forms');
if (count($module->active_forms) == 1 && empty($module->active_forms[0])) {		// framework-version 2 can return an array that's not quite empty ([[0] => null])
	$module->active_forms = [];
}
$module->pipe_on_status = $module->getProjectSetting('pipe-on-status');
$module->formStatuses = $module->getFormStatusAllRecords($module->active_forms);
$verbose_failure_logging = $module->getProjectSetting("verbose-pipe-all-failure-logging");

$record_match_fields = $module->projects['destination']['records_match_fields'];
$response['total_records'] = count($record_match_fields);

$record_match_fields = $module->projects['destination']['records_match_fields'];
$record_match_keys = array_keys($record_match_fields);
$_SESSION['record_keys'] = serialize($record_match_keys);

$serialized_module = serialize($module);
$currentTimestampEpoch = time();
$filename = "/tmp/serialized_data_" . $currentTimestampEpoch . ".txt";
$file = fopen($filename, "w");
if ($file) {
    fwrite($file, $serialized_module);
    fclose($file);
    error_log("Serialized data has been written to $filename.");
} else {
    error_log("Unable to open $filename for writing.");
}
$_SESSION['filename'] = $filename;

echo json_encode($response);