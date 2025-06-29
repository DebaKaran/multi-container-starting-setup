pipeline {
  agent {
    label 'myagents'  // Make sure this matches your agent label in Jenkins
  }

  environment {
    COMPOSE_CMD = "docker-compose -f docker-compose.yaml -f docker-compose.override.yaml"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Run Containers') {
      steps {
        dir("${env.WORKSPACE}") {
          sh "pwd && ls -la"
          sh "ls -la ./frontend"
          sh "ls -la ./backend"
          sh "${COMPOSE_CMD} up -d --build"
        }
      }
    }

    stage('Verify Running Containers') {
      steps {
        dir("${env.WORKSPACE}") {
          sh "docker ps"
        }
        
      }
    }
  }

  post {
    failure {
      echo 'Pipeline failed! Sending alert...'
      // Add email/slack/etc. notifications here
    }
    success {
      echo 'Deployment successful!'
    }
  }
}
