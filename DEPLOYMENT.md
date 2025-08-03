# SmartMealBuddy Deployment Guide

## Local Development

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

### Quick Start
1. Run the setup script:
   ```bash
   ./setup.sh
   ```

2. Configure environment variables:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database URL and API keys
   ```

3. Set up database:
   ```bash
   npx prisma migrate dev
   ```

4. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

## Docker Development

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Database only
docker-compose up postgres -d

# Backend only
docker-compose up backend -d

# Frontend only
docker-compose up frontend -d
```

## Production Deployment

### AWS Deployment

#### Option 1: AWS App Runner
1. **Backend Deployment:**
   ```bash
   # Build and push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   docker build -t smartmealbuddy-backend ./backend
   docker tag smartmealbuddy-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/smartmealbuddy-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/smartmealbuddy-backend:latest
   ```

2. **Frontend Deployment:**
   ```bash
   # Build for production
   cd frontend
   npm run build
   
   # Deploy to S3 + CloudFront
   aws s3 sync build/ s3://your-bucket-name --delete
   aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
   ```

#### Option 2: AWS ECS with Fargate
1. **Create ECS Cluster:**
   ```bash
   aws ecs create-cluster --cluster-name smartmealbuddy-cluster
   ```

2. **Deploy using ECS Task Definitions:**
   ```json
   {
     "family": "smartmealbuddy-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "your-ecr-repo/smartmealbuddy-backend:latest",
         "portMappings": [
           {
             "containerPort": 5000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "DATABASE_URL",
             "value": "your-rds-connection-string"
           }
         ]
       }
     ]
   }
   ```

#### Option 3: AWS Elastic Beanstalk
1. **Initialize EB:**
   ```bash
   cd backend
   eb init smartmealbuddy-api
   eb create production
   ```

2. **Deploy:**
   ```bash
   eb deploy
   ```

### Database Setup (AWS RDS)

1. **Create RDS PostgreSQL Instance:**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier smartmealbuddy-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username smartmealbuddy \
     --master-user-password your-secure-password \
     --allocated-storage 20 \
     --vpc-security-group-ids sg-xxxxxxxx
   ```

2. **Run Migrations:**
   ```bash
   DATABASE_URL="postgresql://username:password@your-rds-endpoint:5432/smartmealbuddy" npx prisma migrate deploy
   ```

### Environment Variables for Production

#### Backend (.env)
```bash
DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/smartmealbuddy"
JWT_SECRET="your-super-secure-jwt-secret-256-bits"
JWT_EXPIRES_IN="7d"
SPOONACULAR_API_KEY="your-spoonacular-api-key"
PORT=5000
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL="https://api.your-domain.com/api"
```

## Monitoring and Logging

### AWS CloudWatch
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/ecs/smartmealbuddy

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "SmartMealBuddy-HighCPU" \
  --alarm-description "High CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Health Checks
The backend includes a health check endpoint at `/health`:
```json
{
  "status": "OK",
  "message": "SmartMealBuddy API is running",
  "timestamp": "2024-02-05T10:30:00.000Z"
}
```

## SSL/TLS Configuration

### Using AWS Certificate Manager
```bash
# Request certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names "*.your-domain.com" \
  --validation-method DNS
```

## Backup Strategy

### Database Backups
```bash
# Automated RDS backups (enabled by default)
aws rds modify-db-instance \
  --db-instance-identifier smartmealbuddy-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

### Application Backups
```bash
# S3 backup for static assets
aws s3 sync s3://your-app-bucket s3://your-backup-bucket --delete
```

## Scaling Considerations

### Auto Scaling
```bash
# ECS Service Auto Scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/smartmealbuddy-cluster/smartmealbuddy-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10
```

### Database Scaling
- Use RDS Read Replicas for read-heavy workloads
- Consider Aurora Serverless for variable workloads
- Implement connection pooling (PgBouncer)

## Security Best Practices

1. **Environment Variables:**
   - Use AWS Systems Manager Parameter Store or Secrets Manager
   - Never commit secrets to version control

2. **Network Security:**
   - Use VPC with private subnets
   - Configure security groups properly
   - Enable WAF for web application firewall

3. **Database Security:**
   - Enable encryption at rest and in transit
   - Use IAM database authentication
   - Regular security updates

4. **Application Security:**
   - Implement rate limiting
   - Use HTTPS everywhere
   - Regular dependency updates
   - Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   ```bash
   # Test connection
   psql "postgresql://user:pass@endpoint:5432/dbname"
   ```

2. **CORS Issues:**
   - Check FRONTEND_URL environment variable
   - Verify CORS configuration in server.js

3. **Memory Issues:**
   - Monitor CloudWatch metrics
   - Increase ECS task memory allocation

### Logs Access
```bash
# ECS logs
aws logs get-log-events --log-group-name /aws/ecs/smartmealbuddy --log-stream-name your-stream

# Application logs
docker-compose logs backend
docker-compose logs frontend
```

## Performance Optimization

1. **Database:**
   - Add database indexes for frequently queried fields
   - Use database connection pooling
   - Implement query optimization

2. **API:**
   - Implement caching (Redis)
   - Use CDN for static assets
   - Optimize API response sizes

3. **Frontend:**
   - Code splitting and lazy loading
   - Image optimization
   - Bundle size optimization
