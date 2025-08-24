from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os

from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configurações da API Guardian Web
GUARDIAN_BASE_URL = "https://www.guardianweb.online/webservicev1gw"
GUARDIAN_AUTH_ENDPOINT = f"{GUARDIAN_BASE_URL}/v1/autenticar"
GUARDIAN_ABASTECIMENTOS_ENDPOINT = f"{GUARDIAN_BASE_URL}/v2/listar/abastecimentos"

# Arquivo de cache local
CACHE_FILE = "cache_abastecimentos.json"

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

@app.route('/api/authenticate', methods=['POST'])
def authenticate_proxy():
    if not request.is_json:
        return jsonify({"erros": ["Conteúdo da requisição deve ser JSON"]}), 400

    data = request.get_json()
    login = data.get('login')
    senha = data.get('senha')

    if not login or not senha:
        return jsonify({"erros": ["Login e senha são obrigatórios"]}), 400

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    payload = json.dumps({"login": login, "senha": senha})

    try:
        response = requests.post(GUARDIAN_AUTH_ENDPOINT, headers=headers, data=payload)
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response else 500
        error_message = e.response.text if e.response else str(e)
        return jsonify({"erros": [f"Erro na comunicação com a API GuardianWeb: {error_message}"]}), status_code

@app.route('/api/abastecimentos', methods=['GET'])
def get_abastecimentos_proxy():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"erros": ["Token de autenticação Bearer é necessário"]}), 401

    token = auth_header.split(' ')[1]
    params = request.args.to_dict()

    placa = params.get("placa", "").strip().upper()
    frota = params.get("frota", "").strip().upper()
    data_ini = params.get("dataIni")
    data_fim = params.get("dataFim")

    # Identificador do cache por chave única
    cache_key = f"{placa or frota}_{data_ini}_{data_fim}"

    cache = load_cache()

    if cache_key in cache:
        print(f"🔁 Dados retornados do cache para {cache_key}")
        return jsonify({"dados": cache[cache_key]}), 200

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(GUARDIAN_ABASTECIMENTOS_ENDPOINT, headers=headers, params=params)
        response.raise_for_status()
        dados = response.json().get("dados", [])

        if dados:
            cache[cache_key] = dados
            save_cache(cache)

        return jsonify({"dados": dados}), 200

    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response else 500
        error_message = e.response.text if e.response else str(e)
        return jsonify({"erros": [f"Erro na comunicação com a API GuardianWeb: {error_message}"]}), status_code

if __name__ == '__main__':
    print("✅ Servidor proxy com cache iniciado em http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
