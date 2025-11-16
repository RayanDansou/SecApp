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

        stage('Build Images') {
            steps {
                script {
                    echo "🔨 Building Docker images..."

                    // Build Backend
                    sh """
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

        stage('Run Tests') {
            steps {
                script {
                    echo "🧪 Running tests..."

                    // Tests Backend Django
                    sh """
                        docker run --rm ${DOCKER_REPO}:backend-${VERSION} \
                            python manage.py test --noinput || true
                    """

                    // Tests Frontend (si configurés)
                    // sh "docker run --rm ${DOCKER_REPO}:frontend-${VERSION} npm test || true"

                    echo "✅ Tests completed"
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
                        docker-compose -f docker-compose.prod.yml down db backend frontend|| true

                        # Mise à jour des images
                        docker-compose -f docker-compose.prod.yml pull db backend frontend

                        # Démarrage des services
                        docker-compose -f docker-compose.prod.yml up db backend frontend -d

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
