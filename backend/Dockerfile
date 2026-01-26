# Utilise une image Python officielle
FROM python:3.11-slim

# Variables d'environnement pour Django
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Crée le dossier de l'app
WORKDIR /app

# Installe les dépendances système pour WeasyPrint
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    python3-pip \
    python3-cffi \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libffi-dev \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

# Installe pip requirements
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copie le projet
COPY . .
COPY staticfiles/ ./staticfiles/

# Expose le port
EXPOSE 8000

# Commande pour lancer le serveur
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
