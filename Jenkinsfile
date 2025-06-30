pipeline {
  agent {
    label 'myagents'  // Make sure this matches your agent label in Jenkins
  }

  parameters {
    string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Tag for Docker image')
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
          sh 'cat frontend/src/index.js'
        }
      }
    }
    stage('Build & Run Containers') {
      steps {
        dir("${env.WORKSPACE}") {
         sh 'chmod +x run-prod.sh'
         // Pass the IMAGE_TAG from Jenkins into your script
         sh "IMAGE_TAG=${params.IMAGE_TAG} ./run-prod.sh"
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
           body:  """\
              Build failed for job: ${env.JOB_NAME}
              Build number: ${env.BUILD_NUMBER}
              URL: ${env.BUILD_URL}
            """
    }
    success {
      echo 'Deployment successful!'
    }
  }
}
