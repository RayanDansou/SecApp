pipeline {
    agent any

    environment {
        // Docker registry (update with your registry)
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'

        // Project naming
        PROJECT_NAME = 'secapp'
        BUILD_VERSION = "${env.BUILD_NUMBER}"

        // Notifications (update with your settings)
        SLACK_CHANNEL = '#secapp-builds'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('📋 Preparation') {
            steps {
                echo '🚀 Starting SecApp CI/CD Pipeline'
                echo "Build #${env.BUILD_NUMBER}"

                // Clean workspace
                cleanWs()

                // Checkout code
                checkout scm

                // Display environment info
                sh '''
                    echo "=== Environment Info ==="
                    docker --version
                    docker compose version
                    node --version || echo "Node not installed on agent"
                    python3 --version || echo "Python not installed on agent"
                '''
            }
        }

        stage('🔍 Validate Configuration') {
            steps {
                echo '🔍 Validating project configuration...'
                sh '''
                    # Check required files
                    test -f docker-compose.yml || (echo "❌ docker-compose.yml not found" && exit 1)
                    test -f .env.example || (echo "❌ .env.example not found" && exit 1)
                    test -f backend/requirements.txt || (echo "❌ backend/requirements.txt not found" && exit 1)
                    test -f frontend/package.json || (echo "❌ frontend/package.json not found" && exit 1)

                    # Validate docker-compose syntax
                    docker compose config --quiet || (echo "❌ Invalid docker-compose.yml" && exit 1)

                    echo "✅ Configuration validation passed"
                '''
            }
        }

        stage('🏗️ Build Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        echo '🐍 Building backend image...'
                        sh '''
                            cd backend
                            docker build -t ${PROJECT_NAME}-backend:${BUILD_VERSION} .
                            docker tag ${PROJECT_NAME}-backend:${BUILD_VERSION} ${PROJECT_NAME}-backend:latest
                        '''
                    }
                }

                stage('Build Frontend') {
                    steps {
                        echo '⚛️  Building frontend image...'
                        sh '''
                            cd frontend
                            docker build -t ${PROJECT_NAME}-frontend:${BUILD_VERSION} .
                            docker tag ${PROJECT_NAME}-frontend:${BUILD_VERSION} ${PROJECT_NAME}-frontend:latest
                        '''
                    }
                }

                stage('Build Database') {
                    steps {
                        echo '🐘 Building database image...'
                        sh '''
                            cd database
                            docker build -t ${PROJECT_NAME}-db:${BUILD_VERSION} .
                            docker tag ${PROJECT_NAME}-db:${BUILD_VERSION} ${PROJECT_NAME}-db:latest
                        '''
                    }
                }
            }
        }

        stage('🧪 Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        echo '🐍 Running backend tests...'
                        sh '''
                            # Start test database
                            docker run -d --name test-db-${BUILD_NUMBER} \
                                -e POSTGRES_DB=test_secapp \
                                -e POSTGRES_USER=test_user \
                                -e POSTGRES_PASSWORD=test_pass \
                                postgres:16-alpine

                            # Wait for database
                            sleep 10

                            # Run tests
                            docker run --rm \
                                --link test-db-${BUILD_NUMBER}:db \
                                -e DB_HOST=db \
                                -e DB_NAME=test_secapp \
                                -e DB_USER=test_user \
                                -e DB_PASSWORD=test_pass \
                                ${PROJECT_NAME}-backend:${BUILD_VERSION} \
                                pytest -v --cov --cov-report=xml --cov-report=html || true

                            # Cleanup
                            docker stop test-db-${BUILD_NUMBER}
                            docker rm test-db-${BUILD_NUMBER}
                        '''
                    }
                    post {
                        always {
                            // Publish test results
                            junit allowEmptyResults: true, testResults: '**/test-results/*.xml'

                            // Publish coverage report
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'htmlcov',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }

                stage('Code Quality') {
                    steps {
                        echo '🧹 Running code quality checks...'
                        sh '''
                            # Backend linting
                            docker run --rm ${PROJECT_NAME}-backend:${BUILD_VERSION} \
                                flake8 . || echo "⚠️  Linting issues found"
                        '''
                    }
                }
            }
        }

        stage('🔒 Security Scan') {
            steps {
                echo '🔒 Running security scans...'
                sh '''
                    # Scan backend image
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image ${PROJECT_NAME}-backend:${BUILD_VERSION} || true

                    # Scan frontend image
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image ${PROJECT_NAME}-frontend:${BUILD_VERSION} || true
                '''
            }
        }

        stage('🚀 Integration Test') {
            steps {
                echo '🚀 Running integration tests...'
                sh '''
                    # Create temporary .env
                    cp .env.example .env

                    # Start services
                    docker compose up -d

                    # Wait for services to be healthy
                    echo "⏳ Waiting for services..."
                    sleep 30

                    # Test health endpoints
                    curl -f http://localhost:8000/api/healthz/ || (echo "❌ Backend health check failed" && exit 1)
                    curl -f http://localhost:3000 || (echo "❌ Frontend health check failed" && exit 1)

                    echo "✅ Integration tests passed"
                '''
            }
            post {
                always {
                    sh '''
                        # Collect logs
                        docker compose logs > docker-logs.txt || true

                        # Stop services
                        docker compose down -v
                    '''
                    archiveArtifacts artifacts: 'docker-logs.txt', allowEmptyArchive: true
                }
            }
        }

        stage('📦 Push Images') {
            when {
                branch 'main'
            }
            steps {
                echo '📦 Pushing images to registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        sh '''
                            docker tag ${PROJECT_NAME}-backend:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_VERSION}
                            docker tag ${PROJECT_NAME}-frontend:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_VERSION}
                            docker tag ${PROJECT_NAME}-db:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-db:${BUILD_VERSION}

                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${BUILD_VERSION}
                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${BUILD_VERSION}
                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-db:${BUILD_VERSION}

                            # Push latest tags
                            docker tag ${PROJECT_NAME}-backend:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest
                            docker tag ${PROJECT_NAME}-frontend:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest
                            docker tag ${PROJECT_NAME}-db:${BUILD_VERSION} ${DOCKER_REGISTRY}/${PROJECT_NAME}-db:latest

                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:latest
                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:latest
                            docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-db:latest
                        '''
                    }
                }
            }
        }

        stage('🚢 Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                echo '🚢 Deploying to staging environment...'
                sh '''
                    # This is a placeholder for actual deployment
                    # Update with your deployment strategy (SSH, Kubernetes, etc.)
                    echo "Deployment to staging would happen here"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Send notifications (Slack, email, etc.)
        }

        failure {
            echo '❌ Pipeline failed!'
            // Send failure notifications
        }

        always {
            echo '🧹 Cleaning up...'
            sh '''
                # Clean up Docker resources
                docker system prune -f || true
            '''
        }
    }
}