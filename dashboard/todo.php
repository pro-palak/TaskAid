<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

require_once __DIR__ . "../../includes/config.php";

if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true) {
    header("location: /public/login.html");
    exit;
}

error_log("Session data: " . print_r($_SESSION, true));

try {
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC");
    $stmt->execute([$_SESSION["id"]]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Error fetching tasks: " . $e->getMessage());
    $tasks = [];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    
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
                $response["success"] = true;
                break;
                
            case "update":
                $stmt = $pdo->prepare("UPDATE tasks SET title = ?, description = ?, due_date = ?, estimated_time = ?, completed = ? WHERE id = ? AND user_id = ?");
                $stmt->execute([
                    $_POST["title"],
                    $_POST["description"],
                    $_POST["due_date"],
                    $_POST["estimated_time"],
                    $_POST["completed"],
                    $_POST["task_id"],
                    $_SESSION["id"]
                ]);
                $response["success"] = true;
                break;
                
            case "delete":
                $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?");
                $stmt->execute([$_POST["task_id"], $_SESSION["id"]]);
                $response["success"] = true;
                break;
        }
    } catch (Exception $e) {
        $response["success"] = false;
        $response["message"] = $e->getMessage();
    }
    
    echo json_encode($response);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC");
$stmt->execute([$_SESSION["id"]]);
$tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskAid - Task Manager</title>
    <link rel="stylesheet" href="../public/css/style.css">
</head>
<body class="task-page">
<body class="task-page" data-user-id="<?php echo htmlspecialchars($_SESSION['id']); ?>">

    <header>
        <nav class="navbar">
            <div class="logo">
            <a href="../public/index.html"><img src="../public/assets/TaskAid AllBlack.png" alt="TaskAid Logo" class="logo-img"></a>
            </div>
            <div class="nav-links">
            </div>
        </nav>
    </header>

    <div class="white-noise-player">
    <button id="noiseToggle" class="noise-toggle" aria-label="Toggle white noise">
        <span class="noise-icon">🔊</span>
        <span class="noise-status">Play</span>
    </button>
    <div class="volume-control">
        <input type="range" id="volumeSlider" min="0" max="100" value="50" class="volume-slider">
    </div>
    <audio id="whiteNoiseAudio" loop preload="auto">
        <source src="/taskaid/public/assets/WhiteNoise.mp3" type="audio/mpeg">
        <source src="../public/assets/WhiteNoise.mp3" type="audio/mpeg">
        <source src="../../public/assets/WhiteNoise.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
    </audio>
    </div>

    <div class="todoContentWrapper">
        <main class="task-main">
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress" style="width: 60%;"></div>
                </div>
                <p class="progress-text">3 of 5 tasks completed today</p>
            </div>
    
            <div class="quote-container">
                <p class="daily-quote">"You're doing great—one step at a time!"</p>
            </div>
    
            <div class="task-and-notes">
                <div class="main-task-container">
                    <h2 class="focus-heading">Current Focus</h2>
                    <div class="task-card">
                        <div class="editable-title">
                            <h3 class="task-title" id="taskTitle">Complete Project Presentation</h3>
                            <button class="edit-title-btn">Edit</button>
                        </div>
                        <div class="task-details">
                            <span class="task-deadline">Due: Tomorrow, 5 PM</span>
                            <div class="time-block">
                                <p>Suggested time: 30 minutes</p>
                                <div class="time-options">
                                    <button class="time-btn">15m</button>
                                    <button class="time-btn active">30m</button>
                                    <button class="time-btn">60m</button>
                                </div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn start-btn">Start Task</button>
                            <button class="action-btn snooze-btn">Snooze</button>
                        </div>
                    </div>
                </div>
    
                <div class="notes-container">
                    <h3>Task Notes</h3>
                    <textarea id="taskNotes" placeholder="Add your notes here..."></textarea>
                </div>
            </div>
    
            <div class="reward-box">
            </div>      
    
            <button class="quick-add-btn">
                <span class="plus-icon">+</span>
                Add New Task
            </button>
        </main>
        <div class="side-panel">
            <button class="panel-toggle" id="panelToggle">All Tasks</button>
            <div class="panel-content">
                <div class="task-list">
                </div>
            </div>
        </div>
    </div>
 

    <script src="../public/js/todo.js"></script>
</body>
</html>