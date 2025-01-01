<?php
session_start();
require_once __DIR__ . "../../includes/config.php";
header('Content-Type: application/json');

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    echo json_encode(["success" => false, "message" => "Not authenticated"]);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        switch ($_POST["action"]) {
            case "add":
                $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, description, due_date, estimated_time) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([
                    $_SESSION["id"],
                    $_POST["title"],
                    $_POST["description"],
                    $_POST["due_date"],
                    $_POST["estimated_time"]
                ]);
                echo json_encode([
                    "success" => true,
                    "task_id" => $pdo->lastInsertId()
                ]);
                break;

            case "update":
                $stmt = $pdo->prepare("UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?");
                $stmt->execute([
                    $_POST["completed"],
                    $_POST["task_id"],
                    $_SESSION["id"]
                ]);
                echo json_encode(["success" => true]);
                break;
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>