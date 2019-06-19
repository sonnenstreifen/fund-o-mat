<?php
class Database {
  private static $instance;
  private $database;

  public static function getInstance() {
    if (!self::$instance) {
      self::$instance = new Database();
    }
    return self::$instance;
  }

  public function getConnection() {
    if (!$this->database) {
      try {
        $options = array(PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ, PDO::ATTR_ERRMODE => PDO::ERRMODE_WARNING);
        $this->database = new PDO(
          'mysql:host='.DB_HOST.';'.
          'dbname='.DB_NAME.';'.
          'port='.DB_PORT.';'.
          'charset=utf8',
          DB_USER,
          DB_PASSWORD,
          $options);
      } catch (PDOException $e) {
        echo 'Database connection can not be established. Please try again later.' . '<br>';
        echo 'Error code: ' . $e->getCode();
        exit;
      }
    }
    return $this->database;
  }

  public static function insertTip($amount, $message, $txid = "") {
    $database = Database::getInstance()->getConnection();
    $sql = "INSERT INTO donations
            SET amount      = :amount,
                message     = :message,
                txid        = :txid,
                donated     = NOW()";
    $query = $database->prepare($sql);
    $query->bindParam(':amount',      $amount,                PDO::PARAM_INT);
    $query->bindParam(':message',     $message,               PDO::PARAM_STR);
    $query->bindParam(':txid',        $txid,                  PDO::PARAM_STR);

    if ($query->execute() && $query->rowCount() == 1) {
      return true;
    } else {
      return false;
    }
  }

  public static function getDonations() {
    $database = Database::getInstance()->getConnection();
    $sql = "SELECT SUM(amount) as donations
            FROM donations";
    $query = $database->prepare($sql);
    if ($query->execute()) {
      if ($query->rowCount() == 1) {
        return $query->fetch();
      } else {
        return 0;
      }
    } else {
      self::createTable();
    }
  }

  public static function createTable() {
    $database = Database::getInstance()->getConnection();

    $sql = "CREATE TABLE IF NOT EXISTS `donations` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `amount` int(50) NOT NULL,
              `message` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
              `txid` varchar(256) COLLATE utf8_unicode_ci NULL DEFAULT NULL,
              `donated` datetime NOT NULL,
              PRIMARY KEY (`id`),
              INDEX `txid` (`txid`)
            ) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;";
    $database->query($sql);
  }
}

?>
