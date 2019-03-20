<?php
require_once "./config.php";
require_once "./database.php";

if (isset($_POST)) {
  header($_SERVER["SERVER_PROTOCOL"]." 200 OK");
  $inputJSON = file_get_contents('php://input');
  $input = json_decode($inputJSON);
  if ($input->secret == SECRET) {
    if (insertTip($input->amount_sat, "mainchain", $input->txid)) {
      echo "success";
    } else {
      echo "success";
    }
  } else {
    echo "forbidden";
  }
} else {
  header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
}

?>
