pipeline {
  agent {
    label 'myagents'  // Make sure this matches your agent label in Jenkins
  }


  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

     stage('Verify Frontend Code') {
      steps {
        dir("${env.WORKSPACE}") {
          echo 'Verifying frontend/src contents...'
          sh 'ls -la frontend/src'
          sh 'cat frontend/src/index.js'
        }
      }
    }
    stage('Build & Run Containers') {
      steps {
        dir("${env.WORKSPACE}") {
         sh 'chmod +x run-dev.sh'
         sh './run-dev.sh'
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
