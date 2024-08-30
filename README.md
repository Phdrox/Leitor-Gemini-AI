# Projeto Leitor de hidrômetro e gasômetro com Gemini IA Vision
Projeto com o objetivo de realizar a leitura de um hidrômetro e um gasômetro e enviar para o banco de dados,
através de uma IA (Gemini).
# Tecnologias utilizadas
- Node.js
- Docker
- Typescrit
- Express.js
- MySQL

[![My Skills](https://skillicons.dev/icons?i=nodejs,mysql,express,typescript,docker)](https://skillicons.dev)
# Instrução
**Observação é necessário ter o docker instalado!**
Clone o projeto 

``
git clone https://github.com/Phdrox/Leitor-Gemini-AI.git
``

Use o docker-compose para subir a aplicação no docker

``
docker-compose up
``
# Respostas

## POST

``
localhost/upload
``
**body**
Mandar em formato form-data
- Imagem deve ser no formato base 64!
  
```
{
"image": "base64",
"customer_code": "string",
"measure_datetime": "datetime",
"measure_type": "WATER" ou "GAS"
}
```

Status 200

```json
{
"image_url": "string",
"measure_value":"number",
"measure_uuid": "string"
}
```
Status 400

```json
{
"error_code": "INVALID_DATA",
"error_description":"string"
}
```

Status 409

```json
{
"error_code": "DOUBLE_REPORT",
"error_description": "Leitura do mês já
realizada"
}
```

# PATCH

``
localhost/confirm
``

**body**
Mandar em formato json
```json
{
"measure_uuid": "string",
"confirmed_value": "integer"
}
```

Status 200

```json
{
"success": true
}

```

Status 400

```json
{
"error_code": "INVALID_DATA",
"error_description":"string"
}
```

Status 409

```json
{
"error_code": "DOUBLE_REPORT",
"error_description": "Leitura do mês já
realizada"
}
```

Status 404

```json
{
"error_code":
"MEASURE_NOT_FOUND",
"error_description": "Leitura do mês já
realizada",
}
```

# GET

``
localhost/<customer code>/list?measure_type
``

Status 200

```json
{
"customer_code": "string",
"measures": [
{
"measure_uuid": "string",
"measure_datetime": "datetime",
"measure_type": "string",
"has_confirmed":"boolean",
"image_url": "string"
},
]
}
```

Status 400

```json
{
"error_code": "INVALID_TYPE",
"error_description": “Tipo de medição não
permitida”
}
```


Status 404

```json
{
"error_code": "MEASURES_NOT_FOUND",
"error_description": "Nenhuma leitura
encontrada"
}
```
______________________________________________________
**Processo Seletivo Shopper**






