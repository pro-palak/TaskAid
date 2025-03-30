<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
session_start();

require_once "../../includes/config.php";

header('Content-Type: application/json');

function sanitize_input($data) {
    $data = trim($data);             
    $data = stripslashes($data);      
    $data = htmlspecialchars($data); 
    return $data;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    
    try {
        $fullname = sanitize_input($_POST["fullname"]);
        $email = sanitize_input($_POST["email"]);
        $password = $_POST["password"];
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("This email is already registered");
        }
        
        if (strlen($password) < 8 || 
            !preg_match("/[A-Z]/", $password) || 
            !preg_match("/[a-z]/", $password) || 
            !preg_match("/[0-9]/", $password)) {
            throw new Exception("Password must be at least 8 characters and contain uppercase, lowercase, and numbers");
        }
        
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (fullname, email, password, created_at) VALUES (?, ?, ?, NOW())";
        
        if ($stmt = $pdo->prepare($sql)) {
            if ($stmt->execute([$fullname, $email, $hashed_password])) {
                $response["success"] = true;
                $response["message"] = "Registration successful!";
            } else {
                throw new Exception("Something went wrong. Please try again later.");
            }
        }
    } catch (Exception $e) {
        $response["success"] = false;
        $response["message"] = $e->getMessage();
    }
    
    echo json_encode($response);
}
?>