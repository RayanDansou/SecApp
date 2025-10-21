pipeline {
    agent any

    environment {
        // Configuration Docker
        DOCKER_REGISTRY = 'your-docker-registry.com'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'

        // Configuration du projet
        PROJECT_NAME = 'secapp'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend"

        // Versioning
        VERSION = "${BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()

        // Environnement
        COMPOSE_PROJECT_NAME = "${PROJECT_NAME}"
    }

    options {
        // Garder les 10 derniers builds
        buildDiscarder(logRotator(numToKeepStr: '10'))

        // Timeout global du pipeline
        timeout(time: 1, unit: 'HOURS')

        // Horodatage dans les logs
        timestamps()
    }

    stages {
        stage('🔍 Checkout') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '📦 Récupération du code source'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                checkout scm

                sh '''
                    echo "Commit: ${GIT_COMMIT_SHORT}"
                    echo "Branch: ${GIT_BRANCH}"
                    echo "Build: ${BUILD_NUMBER}"
                '''
            }
        }

        stage('🔧 Environment Setup') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '⚙️  Configuration de l\'environnement'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                script {
                    // Créer le fichier .env depuis les credentials Jenkins
                    withCredentials([
                        string(credentialsId: 'django-secret-key', variable: 'DJANGO_SECRET'),
                        string(credentialsId: 'postgres-password', variable: 'DB_PASSWORD'),
                        string(credentialsId: 'azure-openai-key', variable: 'AZURE_KEY'),
                        string(credentialsId: 'resend-api-key', variable: 'RESEND_KEY')
                    ]) {
                        sh '''
                            cp .env.example .env
                            sed -i "s|DJANGO_SECRET_KEY=.*|DJANGO_SECRET_KEY=${DJANGO_SECRET}|" .env
                            sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${DB_PASSWORD}|" .env
                            sed -i "s|AZURE_OPENAI_API_KEY=.*|AZURE_OPENAI_API_KEY=${AZURE_KEY}|" .env
                            sed -i "s|RESEND_API_KEY=.*|RESEND_API_KEY=${RESEND_KEY}|" .env
                        '''
                    }
                }

                sh '''
                    echo "✅ Fichier .env configuré"
                    docker --version
                    docker-compose --version || docker compose version
                '''
            }
        }

        stage('🏗️  Build Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '🔨 Build de l\'image Backend (Django)'
                        sh '''
                            docker build -t ${BACKEND_IMAGE}:${VERSION} \
                                         -t ${BACKEND_IMAGE}:latest \
                                         --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                         --build-arg VCS_REF=${GIT_COMMIT_SHORT} \
                                         ./backend
                        '''
                    }
                }

                stage('Build Frontend') {
                    steps {
                        echo '🔨 Build de l\'image Frontend (Next.js)'
                        sh '''
                            docker build -t ${FRONTEND_IMAGE}:${VERSION} \
                                         -t ${FRONTEND_IMAGE}:latest \
                                         --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                                         --build-arg VCS_REF=${GIT_COMMIT_SHORT} \
                                         ./frontend
                        '''
                    }
                }
            }
        }

        stage('🧪 Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                        echo '🧪 Tests Backend (Django)'
                        echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                        sh '''
                            # Démarrage temporaire pour les tests
                            docker-compose up -d database
                            sleep 10

                            # Exécution des tests Django
                            docker run --rm \
                                --network ${COMPOSE_PROJECT_NAME}_secapp-network \
                                -e DATABASE_URL=postgresql://secapp_user:secapp_password@database:5432/secapp \
                                ${BACKEND_IMAGE}:${VERSION} \
                                python manage.py test --verbosity=2

                            # Vérification de la configuration
                            docker run --rm ${BACKEND_IMAGE}:${VERSION} python manage.py check
                        '''
                    }
                }

                stage('Frontend Tests') {
                    steps {
                        echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                        echo '🧪 Tests Frontend (Next.js)'
                        echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                        sh '''
                            # Tests unitaires Frontend (si configurés)
                            docker run --rm ${FRONTEND_IMAGE}:${VERSION} npm test -- --passWithNoTests || true
                        '''
                    }
                }
            }
        }

        stage('🔍 Code Quality & Security') {
            parallel {
                stage('Lint Backend') {
                    steps {
                        echo '📝 Analyse statique Python (flake8, pylint)'
                        sh '''
                            docker run --rm ${BACKEND_IMAGE}:${VERSION} \
                                flake8 --max-line-length=120 --exclude=migrations . || true
                        '''
                    }
                }

                stage('Lint Frontend') {
                    steps {
                        echo '📝 Analyse statique JavaScript/TypeScript (ESLint)'
                        sh '''
                            docker run --rm ${FRONTEND_IMAGE}:${VERSION} \
                                npm run lint || true
                        '''
                    }
                }

                stage('Security Scan') {
                    steps {
                        echo '🔒 Scan de sécurité des images Docker'
                        sh '''
                            # Scan des vulnérabilités avec Trivy (si installé)
                            which trivy && trivy image ${BACKEND_IMAGE}:${VERSION} || echo "Trivy non installé"
                            which trivy && trivy image ${FRONTEND_IMAGE}:${VERSION} || echo "Trivy non installé"
                        '''
                    }
                }
            }
        }

        stage('📦 Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch 'staging'
                }
            }
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '📤 Push des images vers le registre'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        sh '''
                            docker push ${BACKEND_IMAGE}:${VERSION}
                            docker push ${BACKEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${VERSION}
                            docker push ${FRONTEND_IMAGE}:latest
                        '''
                    }
                }
            }
        }

        stage('🚀 Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '🚀 Déploiement de l\'application'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

                script {
                    def environment = env.BRANCH_NAME == 'main' ? 'production' : 'development'

                    echo "Déploiement vers l'environnement: ${environment}"

                    sh '''
                        # Arrêt des anciens conteneurs
                        docker-compose down || true

                        # Démarrage avec les nouvelles images
                        docker-compose up -d

                        # Attente du démarrage
                        sleep 15

                        # Vérification de l'état
                        docker-compose ps
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '🧹 Nettoyage'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

            // Nettoyage des images non utilisées
            sh '''
                docker system prune -f || true
            '''
        }

        success {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '✅ BUILD RÉUSSI !'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

            // Notification (à configurer selon vos besoins)
            // emailext subject: "✅ Build Success - ${PROJECT_NAME} #${BUILD_NUMBER}",
            //          body: "Le build ${BUILD_NUMBER} a réussi.",
            //          to: 'team@example.com'
        }

        failure {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '❌ BUILD ÉCHOUÉ !'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

            // Notification d'échec
            // emailext subject: "❌ Build Failed - ${PROJECT_NAME} #${BUILD_NUMBER}",
            //          body: "Le build ${BUILD_NUMBER} a échoué. Consultez les logs.",
            //          to: 'team@example.com'
        }

        unstable {
            echo '⚠️  BUILD INSTABLE'
        }
    }
}
