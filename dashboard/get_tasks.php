<?php
session_start();
require_once __DIR__ . "../../includes/config.php";

header('Content-Type: application/json');

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT * FROM tasks 
        WHERE user_id = ? 
        ORDER BY due_date ASC
    ");
    
    $stmt->execute([$_SESSION["id"]]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($tasks);
} catch (PDOException $e) {
    error_log("Error fetching tasks: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Database error",
        "debug" => $e->getMessage()
    ]);
}
?>