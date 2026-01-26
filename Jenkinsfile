pipeline {
    agent any

    environment {
        // Credentials Docker Hub (à configurer dans Jenkins)
        DOCKERHUB_CREDENTIALS = credentials('guardianiqdockertoken')
        DOCKER_REPO = 'rayandans/guardianiq'

        // Version basée sur le build number
        VERSION = "${env.BUILD_NUMBER}"
        DISCORD_WEBHOOK = credentials('discord_webhook_url')
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
                        docker build --no-cache -t ${DOCKER_REPO}:backend-${VERSION} \
                            -f backend/Dockerfile ./backend
                    """

                    // Build Frontend
                    sh """
                        docker build --no-cache -t ${DOCKER_REPO}:frontend-${VERSION} \
                            -f frontend/Dockerfile ./frontend
                    """

                    echo "✅ Images built successfully"
                }
            }
        }

        stage('Security scans') {
            steps {
                script {
                    try {
                        sh """
                            set -e
                            echo "🔹 Vérification de Trivy"
                            if ! trivy --version > /dev/null 2>&1; then
                                echo "❌ Trivy non installé. Installation..."
                                curl -sfL https://github.com/aquasecurity/trivy/releases/download/v0.38.3/trivy_0.38.3_Linux-64bit.tar.gz -o trivy.tar.gz
                                tar zxvf trivy.tar.gz
                                mv trivy /usr/local/bin/
                                rm trivy.tar.gz
                                echo "✅ Trivy installé"
                            fi
                            rm discord_msg*.txt || true

                            echo "🔹 Scan backend"
                            trivy image --format template --template "@/var/jenkins_home/scripts/summary.tpl" --severity MEDIUM,HIGH,CRITICAL --no-progress "${DOCKER_REPO}:backend-${VERSION}" > backend_vulnerabilities.txt
                            echo "🔐 Vulnérabilités Backend :" > discord_msg1.txt
                            echo '```' >> discord_msg1.txt
                            cat backend_vulnerabilities.txt >> discord_msg1.txt
                            echo '```' >> discord_msg1.txt

                            echo "🔹 Scan frontend"
                            trivy image --format template --template "@/var/jenkins_home/scripts/summary.tpl" --severity MEDIUM,HIGH,CRITICAL --no-progress "${DOCKER_REPO}:frontend-${VERSION}" > frontend_vulnerabilities.txt
                            echo "🔐 Vulnérabilités Frontend :" > discord_msg2.txt
                            echo '```' >> discord_msg2.txt
                            cat frontend_vulnerabilities.txt >> discord_msg2.txt
                            echo '```' >> discord_msg2.txt
                        """

                        ['discord_msg1.txt', 'discord_msg2.txt'].each { file ->
                            if (fileExists(file)) {
                                def content = readFile(file)
                                notifyDiscord(content)
                            }
                        }

                        notifyDiscord("✅ *Security Scan* terminé avec succès !")
                    } catch (e) {
                        notifyDiscord("❌ Échec du *Security Scan* : ${e.message}")
                        error("Aborting pipeline.")
                    }
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
                        sleep 5

                        echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin
                        
                        # Mise à jour des images
                        docker compose -f docker-compose.prod.yml pull

                        # Démarrage des services
                        docker compose -f docker-compose.prod.yml up db backend frontend -d

                        # Attendre que les services soient prêts
                        sleep 5

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
            🌐 Backend:  https://guardianiq.cloud
            🌐 Frontend: http://api.guardianiq.cloud
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
            sh 'docker system prune -a -f || true'
        }
    }
}

def notifyDiscord(String message) {
    int chunkSize = 1900
    int totalLength = message.length()
    int numChunks = (int)Math.ceil(totalLength / (double)chunkSize)

    for (int i = 0; i < numChunks; i++) {
        int startIdx = i * chunkSize
        int endIdx = Math.min(startIdx + chunkSize, totalLength)
        String chunk = message.substring(startIdx, endIdx)

        // Échappement spécial pour shell + JSON
        def safeChunk = chunk
            .replace('\\', '\\\\')
            .replace('"', '\\"')
            .replace('`', '\\`')
            .replace('$', '\\$')
            .replace('\n', '\\n')
            .replace('\r', '')

        sh """
            curl -X POST \
                -H 'Content-Type: application/json' \
                -d "{\\"content\\": \\"${safeChunk}\\"}" \
                \${DISCORD_WEBHOOK}
        """

        sleep(time: 1, unit: 'SECONDS')
    }
}
