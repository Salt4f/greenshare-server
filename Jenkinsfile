pipeline {
    environment {
        dockerImage = ''
        dockerRepo = 'raulplesa/greenshare-server'
        
        SSH_HOST = 'vgafib.org'
        SSH_USER = 'root'
        SSH_PASSWORD = credentials('85276347-e499-4eed-8d85-d9e6885b6c67')
        
    }
    agent any
    stages {
        
        stage('Build') {
            steps {
                script {
                    if (env.GIT_BRANCH == 'origin/master') {
                            dockerImage = docker.build dockerRepo +  ":$BUILD_NUMBER"
                    }
                    else {
                            dockerImage = docker.build dockerRepo +  ":$BUILD_NUMBER" + '-dev'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    dockerImage.inside {
                        sh 'npm test'
                    }
                }
            }
            post {
                failure {
                    script {
                        if (env.GIT_BRANCH == 'origin/master') {
                            sh "docker rmi $dockerRepo:$BUILD_NUMBER"
                        }
                        else {    
                            sh "docker rmi $dockerRepo:$BUILD_NUMBER-dev"
                        }
                    }
                }
            }
        }
        
        stage('Push') {
            when { expression { return env.GIT_BRANCH == 'origin/master'} }
            steps {
                script {
                    docker.withRegistry('', 'f25b0a11-079e-4857-bae2-053744f91c97') {
                        dockerImage.push()
                        dockerImage.push("latest")
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    if (env.GIT_BRANCH == 'origin/master') {
                        sh "docker rmi $dockerRepo:$BUILD_NUMBER"
                    }
                    else {    
                        sh "docker rmi $dockerRepo:$BUILD_NUMBER-dev"
                    }
                }
            }
        }

        stage("Deploy"){
            when { expression { return env.GIT_BRANCH == 'origin/master'} }
            steps {
                script {
                    def remote = [:]
                    remote.name = env.SSH_HOST
                    remote.host = env.SSH_HOST
                    remote.user = env.SSH_USER
                    remote.password = env.SSH_PASSWORD
                    remote.allowAnyHosts = true
                    sshCommand remote: remote, command: "./pes/backend.sh"
                }
            }
        }
        
    }
}
