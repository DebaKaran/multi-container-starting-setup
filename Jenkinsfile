pipeline {
  agent {
    label 'myagents'  // Make sure this matches your agent label in Jenkins
  }

  environment {
    NOTIFY_EMAILS = credentials('notify-emails')
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
          sh 'cat frontend/src/this_file_does_not_exist.js'
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
      mail to: env.NOTIFY_EMAILS,
           subject: "Build Failed: ${env.JOB_NAME} [#${env.BUILD_NUMBER}]",
           body: "View details here: ${env.BUILD_URL}"
    }
    success {
      echo 'Deployment successful!'
    }
  }
}
