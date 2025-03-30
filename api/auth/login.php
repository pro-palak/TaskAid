<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/login_error.log');
session_start();
require_once "../../includes/config.php";
header('Content-Type: application/json');

error_log("Login attempt - POST data: " . print_r($_POST, true));


function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    
    try {
        $email = sanitize_input($_POST["email"]);
        $password = $_POST["password"];
        $remember = isset($_POST["remember"]) ? true : false;
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        $sql = "SELECT id, fullname, email, password FROM users WHERE email = ?";
        
        if ($stmt = $pdo->prepare($sql)) {
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() == 1) {
                $row = $stmt->fetch();
                
                if (password_verify($password, $row["password"])) {
                    $_SESSION["loggedin"] = true;
                    $_SESSION["id"] = $row["id"];
                    $_SESSION["email"] = $row["email"];
                    $_SESSION["fullname"] = $row["fullname"];
                    
                    if ($remember) {
                        $token = bin2hex(random_bytes(32));
                        setcookie("remember_token", $token, time() + (86400 * 30), "/");
                        
                        $stmt = $pdo->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
                        $stmt->execute([$token, $row["id"]]);
                    }
                    
                    $response["success"] = true;
                    $response["message"] = "Login successful!";
                } else {
                    throw new Exception("Invalid email or password");
                }
            } else {
                throw new Exception("Invalid email or password");
            }
        }
    } catch (Exception $e) {
        $response["success"] = false;
        $response["message"] = $e->getMessage();
    }
    
    echo json_encode($response);
}
?>