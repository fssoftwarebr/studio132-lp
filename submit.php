<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['message' => 'Método não permitido.'], 405);
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload)) {
    respond(['message' => 'Dados inválidos.'], 422);
}

$fields = [
    'nome' => 255,
    'cidade_uf' => 255,
    'whatsapp' => 50,
    'horario_contato' => 100,
    'tipo_projeto' => 100,
    'ambiente' => 255,
    'nivel_escolhido' => 100,
];

$data = [];

foreach ($fields as $field => $maxLength) {
    $value = isset($payload[$field]) && is_string($payload[$field])
        ? trim($payload[$field])
        : '';

    if ($value === '' || strlen($value) > $maxLength) {
        respond(['message' => 'Preencha todos os campos obrigatórios.'], 422);
    }

    $data[$field] = $value;
}

$apiKey = getenv('TRELLO_API_KEY') ?: '';
$token = getenv('TRELLO_API_TOKEN') ?: '';
$listId = getenv('TRELLO_LIST_ID') ?: '';

if ($apiKey === '' || $token === '' || $listId === '') {
    error_log('Studio132 Trello integration is not configured.');
    respond(['message' => 'Não foi possível registrar sua solicitação agora.'], 503);
}

$description = implode("\n", [
    'Nova solicitação de consultoria Studio132',
    '',
    'Nome: '.$data['nome'],
    'Cidade/UF: '.$data['cidade_uf'],
    'WhatsApp: '.$data['whatsapp'],
    'Melhor horário: '.$data['horario_contato'],
    'Tipo de projeto: '.$data['tipo_projeto'],
    'Ambiente: '.$data['ambiente'],
    'Nível de interesse: '.$data['nivel_escolhido'],
]);

$cardData = http_build_query([
    'key' => $apiKey,
    'token' => $token,
    'idList' => $listId,
    'name' => $data['nome'].' - '.$data['tipo_projeto'],
    'desc' => $description,
    'pos' => 'top',
]);

$curl = curl_init('https://api.trello.com/1/cards');
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $cardData,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);

$responseBody = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_error($curl);
curl_close($curl);

if ($responseBody === false || $status < 200 || $status >= 300) {
    error_log(sprintf('Trello submission failed (%s): %s', $status ?: 'curl', $curlError ?: 'API rejection'));
    respond(['message' => 'Não foi possível registrar sua solicitação agora.'], 502);
}

$card = json_decode($responseBody, true);

respond([
    'message' => 'Solicitação enviada com sucesso.',
    'card' => [
        'id' => $card['id'] ?? null,
        'url' => $card['shortUrl'] ?? $card['url'] ?? null,
    ],
], 201);

function respond(array $body, int $status): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
