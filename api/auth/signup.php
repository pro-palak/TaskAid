<?php
// Start the session system
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
session_start();

// Include the database connection file
require_once "../../includes/config.php";

// Tell browser we're sending JSON
header('Content-Type: application/json');

// Clean up user input to prevent malicious code
function sanitize_input($data) {
    $data = trim($data);              // Remove extra spaces
    $data = stripslashes($data);      // Remove backslashes
    $data = htmlspecialchars($data);  // Convert special characters to HTML entities
    return $data;
}

// Check if this is a POST request (form submission)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    
    try {
        // Get and clean the form data
        $fullname = sanitize_input($_POST["fullname"]);
        $email = sanitize_input($_POST["email"]);
        $password = $_POST["password"];
        
        // Check if email is valid format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        // Check if email already exists in database
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("This email is already registered");
        }
        
        // Check password strength
        if (strlen($password) < 8 || 
            !preg_match("/[A-Z]/", $password) || 
            !preg_match("/[a-z]/", $password) || 
            !preg_match("/[0-9]/", $password)) {
            throw new Exception("Password must be at least 8 characters and contain uppercase, lowercase, and numbers");
        }
        
        // Convert password to secure hash
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Create SQL command to insert new user
        $sql = "INSERT INTO users (fullname, email, password, created_at) VALUES (?, ?, ?, NOW())";
        
        // Prepare and execute the SQL command
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
    
    // Send response back to JavaScript
    echo json_encode($response);
}
?>