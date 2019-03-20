<?php
ini_set("display_errors", 0);

/* a random secret key to write incomming mainnet transactions into the database
   (must be the same as the one in the python script on the full node) */
define("SECRET",            "CHANGE_ME");

/* database configuration */
define("DB_USER",           "CHANGE_ME");
define("DB_NAME",           "CHANGE_ME");
define("DB_HOST",           "localhost");
define("DB_PORT",           3306);
define("DB_PASSWORD",       "CHANGE_ME");

// IP address or FQDN (domain name) of lnd server
define("LND_IP",            "CHANGE_ME");
define("LND_PORT_MAINNET",  "CHANGE_ME");                 // Standard mainnet port is 8080
define("LND_PORT_TESTNET",  "CHANGE_ME");                 // Optional
define("INVOICE_MACAROON_HEX",                            // No spaces
       "CHANGE_ME"
      );
define("EXPIRY",            "1800");                      // seconds

// Optional EMAIL notifications
// To disable, leave EMAIL_TO as '' (empty string)
define("EMAIL_TO"       ,   "CHANGE_ME");                 // e.g. 'me@my.domain'
define("EMAIL_TO_NAME"  ,   "CHANGE_ME");                 // e.g. 'My Name'
define("EMAIL_FROM"     ,   "CHANGE_ME");                 // e.g. 'me@my.domain'
define("EMAIL_FROM_NAME",   "LightningTip");
?>
