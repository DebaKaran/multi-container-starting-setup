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
