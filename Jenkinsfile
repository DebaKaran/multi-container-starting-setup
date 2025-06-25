pipeline {
  agent {
    label 'myagents'  // Make sure this matches your agent label in Jenkins
  }

  environment {
    COMPOSE_CMD = "docker-compose -f docker-compose.yml -f docker-compose.override.yml"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Run Containers') {
      steps {
        sh "${COMPOSE_CMD} up -d --build"
      }
    }

    stage('Verify Running Containers') {
      steps {
        sh "docker ps"
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
