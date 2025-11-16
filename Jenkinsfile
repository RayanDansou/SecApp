pipeline {
    agent any

    environment {
        // Credentials Docker Hub (à configurer dans Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('guardianiqdockertoken')
        DOCKER_REPO = 'rayandans/guardianiq'

        // Version basée sur le build number
        VERSION = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "📦 Cloning repository..."
                    checkout scm
                }
            }
        }

        stage('Create env files') {
            steps {
                script {
                    echo "🛠️ Creating environment files..."

                    // Backend .env
                    sh """
                        cat > .env <<EOF
                        DDJANGO_SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,*,82.29.170.94

DB_NAME=guardianiq_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432


AZURE_OPENAI_KEY=FXTT3DcnrTH8wB2udITYwXD4QviKdL9hsB4LOyP5yxQTFI8RWAgIJQQJ99BKACfhMk5XJ3w3AAABACOGOcx3
AZURE_OPENAI_ENDPOINT=https://guardianiq.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_MODEL=gpt-5-mini

RESEND_API_KEY=re_RHqRCsMG_GC8himVnndkeZHzLiX52voGC
RESEND_FROM_EMAIL=noreply@guardianiq.cloud


# Google OAuth Configuration
GOOGLE_CLIENT_ID=124527769655-0uh4fbe69iit5puro7hlev0bchpcs85r.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

FRONTEND_URL=https://guardianiq.cloud
REACT_APP_API_URL=https://api.guardianiq.cloud
                        EOF
                    """

                    // Frontend .env
                    sh """          
                        cat > frontend/.env <<EOF
                        REACT_APP_API_URL=https://api.guardianiq.cloud
                        REACT_APP_GOOGLE_CLIENT_ID=124527769655-0uh4fbe69iit5puro7hlev0bchpcs85r.apps.googleusercontent.com
                        EOF
                    """

                    echo "✅ Environment files created"
                }
            }
        }


        stage('Build Images') {
            steps {
                script {
                    echo "🔨 Building Docker images..."

                    // Build Backend
                    sh """
                        mkdir -p backend/staticfiles || true
                        docker build -t ${DOCKER_REPO}:backend-${VERSION} \
                            -f backend/Dockerfile ./backend
                    """

                    // Build Frontend
                    sh """
                        docker build -t ${DOCKER_REPO}:frontend-${VERSION} \
                            -f frontend/Dockerfile ./frontend
                    """

                    echo "✅ Images built successfully"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "🚀 Pushing images to Docker Hub..."

                    sh """
                        echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin

                        # Push avec version
                        docker push ${DOCKER_REPO}:backend-${VERSION}
                        docker push ${DOCKER_REPO}:frontend-${VERSION}

                        # Tag et push en tant que 'latest'
                        docker tag ${DOCKER_REPO}:backend-${VERSION} ${DOCKER_REPO}:backend-latest
                        docker tag ${DOCKER_REPO}:frontend-${VERSION} ${DOCKER_REPO}:frontend-latest

                        docker push ${DOCKER_REPO}:backend-latest
                        docker push ${DOCKER_REPO}:frontend-latest

                        docker logout
                    """

                    echo "✅ Images pushed successfully"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "🚀 Deploying application..."

                    sh """
                        # Arrêt des conteneurs existants
                        docker compose -f docker-compose.prod.yml down db backend frontend|| true

                        # Mise à jour des images
                        docker compose -f docker-compose.prod.yml pull

                        # Démarrage des services
                        docker compose -f docker-compose.prod.yml up db backend frontend -d

                        # Attendre que les services soient prêts
                        sleep 20

                        echo "✅ Services started successfully"
                    """

                    echo "✅ Deployment completed"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Checking service health..."

                    sh """
                        # Vérifier que les conteneurs tournent
                        docker ps --filter "name=guardianiq" --format "table {{.Names}}\\t{{.Status}}"

                        # Test basique de connectivité backend
                        curl -f http://localhost:8888/api/ || echo "⚠️ Backend not responding"

                        # Test basique de connectivité frontend
                        curl -f http://localhost:3333/ || echo "⚠️ Frontend not responding"
                    """

                    echo "✅ Health check completed"
                }
            }
        }
    }

    post {
        success {
            echo """
            ✅ ========================================
            ✅ Pipeline SUCCESS!
            ✅ ========================================
            📦 Backend:  ${DOCKER_REPO}:backend-${VERSION}
            📦 Frontend: ${DOCKER_REPO}:frontend-${VERSION}
            🌐 Backend:  http://localhost:8888
            🌐 Frontend: http://localhost:3333
            ✅ ========================================
            """
        }
        failure {
            echo """
            ❌ ========================================
            ❌ Pipeline FAILED!
            ❌ Check logs for details
            ❌ ========================================
            """
        }
        always {
            // Nettoyage des images intermédiaires
            sh 'docker system prune -f || true'
        }
    }
}
