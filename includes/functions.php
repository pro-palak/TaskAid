<?php
// includes/functions.php

function createTask($pdo, $userId, $title, $description, $dueDate, $estimatedTime) {
    $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, description, due_date, estimated_time) 
                          VALUES (?, ?, ?, ?, ?)");
    return $stmt->execute([$userId, $title, $description, $dueDate, $estimatedTime]);
}

function getTasks($pdo, $userId) {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function updateTask($pdo, $taskId, $userId, $title, $description, $dueDate, $estimatedTime, $completed) {
    $stmt = $pdo->prepare("UPDATE tasks 
                          SET title = ?, description = ?, due_date = ?, 
                              estimated_time = ?, completed = ? 
                          WHERE id = ? AND user_id = ?");
    return $stmt->execute([$title, $description, $dueDate, $estimatedTime, $completed, $taskId, $userId]);
}

function deleteTask($pdo, $taskId, $userId) {
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
    return $stmt->execute([$taskId, $userId]);
}

function getUserByEmail($pdo, $email) {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updateResetToken($pdo, $email, $token, $expiry) {
    $stmt = $pdo->prepare("UPDATE users SET reset_token = ?, reset_expiry = ? WHERE email = ?");
    return $stmt->execute([$token, $expiry, $email]);
}
?>