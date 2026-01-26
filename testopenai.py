from openai import AzureOpenAI

# Remplace par ta clé trouvée dans ton portail Azure
AZURE_OPENAI_KEY = "FXTT3DcnrTH8wB2udITYwXD4QviKdL9hsB4LOyP5yxQTFI8RWAgIJQQJ99BKACfhMk5XJ3w3AAABACOGOcx3"
AZURE_OPENAI_ENDPOINT = "https://guardianiq.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT = "gpt-5-mini"
AZURE_OPENAI_API_VERSION = "2024-12-01-preview"

client = AzureOpenAI(
    api_key=AZURE_OPENAI_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT
)

response = client.chat.completions.create(
    model=AZURE_OPENAI_DEPLOYMENT,
    messages=[
        {"role": "system", "content": "Tu es un assistant Azure OpenAI."},
        {"role": "user", "content": "Dis-moi bonjour avec enthousiasme !"}
    ]
)

print("✅ Réponse du modèle :", response.choices[0].message.content)
