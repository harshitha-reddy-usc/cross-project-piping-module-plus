<?php
if(isset($_SESSION['filename'])) {
	$filename = $_SESSION['filename'];
	$file = fopen($filename, "r");
	if ($file) {
		$serializedData = fread($file, filesize($filename));
		fclose($file);
		$module = unserialize($serializedData);
        $module->createNewDestinationRecords();
        unlink($filename);
	} else {
		error_log("Unable to open $filename for reading.");
	}
} else {
	error_log("no filename set");
}
?>