<?php
header('Content-Type: application/json');

require_once 'config.php';

// Validate input
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['name']) || !isset($input['phone']) || !isset($input['product']) || !isset($input['consent'])) {
  echo json_encode(['message' => 'Missing required fields']);
  exit;
}

$name = filter_var($input['name'], FILTER_SANITIZE_STRING);
$phone = filter_var($input['phone'], FILTER_SANITIZE_STRING);
$product = filter_var($input['product'], FILTER_SANITIZE_STRING);
$consent = (int)$input['consent'];

// Validate E.164 phone format
if (!preg_match('/^\+[1-9]\d{9,14}$/', $phone)) {
  echo json_encode(['message' => 'Invalid phone number format']);
  exit;
}

// Connect to MySQL
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
  echo json_encode(['message' => 'Database connection failed']);
  exit;
}

// Insert into database
$stmt = $mysqli->prepare("INSERT INTO submissions (name, phone, product, consent, submitted_at) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param('sssi', $name, $phone, $product, $consent);
if (!$stmt->execute()) {
  echo json_encode(['message' => 'Database error']);
  $stmt->close();
  $mysqli->close();
  exit;
}
$stmt->close();
$mysqli->close();

// Send WhatsApp message
if ($consent) {
  $url = "https://graph.facebook.com/v20.0/{$phone_number_id}/messages";
  $data = [
    'messaging_product' => 'whatsapp',
    'to' => $phone,
    'type' => 'text',
    'text' => ['body' => "Thank you, {$name}, for choosing {$product}!"]
  ];
  
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $whatsapp_token,
    'Content-Type: application/json'
  ]);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);
  curl_close($ch);
  
  if (!$response) {
    echo json_encode(['message' => 'WhatsApp API error']);
    exit;
  }
}

echo json_encode(['message' => 'Submission successful']);
?>
