# CarbonLens AWS Setup Script
# Complete setup guide for AWS infrastructure

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "carbonlens",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "🌱 CarbonLens AWS Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check prerequisites
Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor Blue

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found. Installing..." -ForegroundColor Red
    
    # Download and install AWS CLI
    $awsCliUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
    $installerPath = "$env:TEMP\AWSCLIV2.msi"
    
    try {
        Invoke-WebRequest -Uri $awsCliUrl -OutFile $installerPath
        Start-Process msiexec.exe -Wait -ArgumentList "/i $installerPath /quiet"
        Write-Host "✅ AWS CLI installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install AWS CLI. Please install manually: https://aws.amazon.com/cli/" -ForegroundColor Red
        exit 1
    }
}

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check completed" -ForegroundColor Green

# Configure AWS credentials
Write-Host "`n🔐 AWS Credentials Setup" -ForegroundColor Blue
Write-Host "You need to configure your AWS credentials. Choose an option:" -ForegroundColor Yellow
Write-Host "1. Use existing AWS credentials" -ForegroundColor White
Write-Host "2. Configure new AWS credentials" -ForegroundColor White
Write-Host "3. Use AWS SSO" -ForegroundColor White

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "Using existing AWS credentials..." -ForegroundColor Green
    }
    "2" {
        Write-Host "Configuring AWS credentials..." -ForegroundColor Yellow
        aws configure
    }
    "3" {
        Write-Host "Setting up AWS SSO..." -ForegroundColor Yellow
        $ssoStartUrl = Read-Host "Enter your SSO start URL"
        $ssoRegion = Read-Host "Enter your SSO region (e.g., us-east-1)"
        $accountId = Read-Host "Enter your AWS account ID"
        $roleName = Read-Host "Enter your SSO role name"
        
        aws configure sso --sso-start-url $ssoStartUrl --sso-region $ssoRegion --sso-account-id $accountId --sso-role-name $roleName
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

# Verify AWS credentials
Write-Host "`n🔍 Verifying AWS credentials..." -ForegroundColor Blue
try {
    $identity = aws sts get-caller-identity --region $Region
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AWS credentials verified" -ForegroundColor Green
        $identityObj = $identity | ConvertFrom-Json
        Write-Host "Account ID: $($identityObj.Account)" -ForegroundColor Cyan
        Write-Host "User/Role: $($identityObj.Arn)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ AWS credentials verification failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Failed to verify AWS credentials" -ForegroundColor Red
    exit 1
}

# Create IAM policies for Bedrock access
Write-Host "`n🔧 Setting up AWS Bedrock access..." -ForegroundColor Blue

$bedrockPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:$Region::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
                "arn:aws:bedrock:$Region::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
            ]
        }
    ]
}
"@

$bedrockPolicyFile = "bedrock-policy.json"
$bedrockPolicy | Out-File -FilePath $bedrockPolicyFile -Encoding UTF8

Write-Host "📝 Created Bedrock policy: $bedrockPolicyFile" -ForegroundColor Green

# Deploy infrastructure
Write-Host "`n🚀 Deploying AWS infrastructure..." -ForegroundColor Blue

try {
    # Run the deployment script
    & ".\deploy.ps1" -Environment $Environment -ProjectName $ProjectName -Region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Infrastructure deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Infrastructure deployment failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    exit 1
}

# Set up sample data
Write-Host "`n📊 Setting up sample data..." -ForegroundColor Blue

$sampleDataScript = @"
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const sampleProducts = [
    {
        id: 'prod_001',
        name: 'Organic Bananas',
        brand: 'Nature\'s Best',
        category: 'Fruits',
        barcode: '1234567890123',
        ingredients: 'Organic bananas',
        packaging: 'Compostable',
        origin: 'Ecuador',
        sustainabilityScore: 85,
        environmental: {
            carbonFootprint: { perUnit: 0.3, per1000Units: 300 },
            waterUsage: { perUnit: 25, per1000Units: 25000 },
            sustainabilityScore: 85
        }
    },
    {
        id: 'prod_002',
        name: 'Almond Milk',
        brand: 'Almond Breeze',
        category: 'Dairy Alternatives',
        barcode: '1234567890124',
        ingredients: 'Almonds, water, natural flavors',
        packaging: 'Recyclable carton',
        origin: 'California',
        sustainabilityScore: 75,
        environmental: {
            carbonFootprint: { perUnit: 0.8, per1000Units: 800 },
            waterUsage: { perUnit: 150, per1000Units: 150000 },
            sustainabilityScore: 75
        }
    },
    {
        id: 'prod_003',
        name: 'Grass-Fed Beef',
        brand: 'Local Farms',
        category: 'Meat',
        barcode: '1234567890125',
        ingredients: 'Grass-fed beef',
        packaging: 'Biodegradable',
        origin: 'Local',
        sustainabilityScore: 60,
        environmental: {
            carbonFootprint: { perUnit: 2.5, per1000Units: 2500 },
            waterUsage: { perUnit: 200, per1000Units: 200000 },
            sustainabilityScore: 60
        }
    }
];

async function addSampleData() {
    for (const product of sampleProducts) {
        try {
            await dynamodb.put({
                TableName: process.env.PRODUCTS_TABLE,
                Item: product
            }).promise();
            console.log('Added product:', product.name);
        } catch (error) {
            console.error('Error adding product:', error);
        }
    }
}

addSampleData();
"@

$sampleDataFile = "setup-sample-data.js"
$sampleDataScript | Out-File -FilePath $sampleDataFile -Encoding UTF8

Write-Host "📝 Created sample data script: $sampleDataFile" -ForegroundColor Green

# Create environment configuration
Write-Host "`n⚙️ Creating environment configuration..." -ForegroundColor Blue

$envConfig = @"
# CarbonLens AWS Configuration
# Generated on $(Get-Date)

# AWS Configuration
AWS_REGION=$Region
AWS_PROFILE=default

# API Endpoints
AWS_API_GATEWAY_URL=https://your-api-gateway-url.execute-api.$Region.amazonaws.com/$Environment

# DynamoDB Tables
AWS_PRODUCTS_TABLE=$ProjectName-$Environment-products
AWS_USER_SCANS_TABLE=$ProjectName-$Environment-user-scans
AWS_ENVIRONMENTAL_DATA_TABLE=$ProjectName-$Environment-environmental-data

# S3 Buckets
AWS_PRODUCT_IMAGES_BUCKET=$ProjectName-$Environment-product-images
AWS_USER_DATA_BUCKET=$ProjectName-$Environment-user-data

# Environment
ENVIRONMENT=$Environment
PROJECT_NAME=$ProjectName

# AWS Services
AWS_USE_REKOGNITION=true
AWS_USE_BEDROCK=true
AWS_USE_DYNAMODB=true
AWS_USE_S3=true

# Feature Flags
ENABLE_AI_ANALYSIS=true
ENABLE_ENVIRONMENTAL_TRACKING=true
ENABLE_USER_ANALYTICS=true
ENABLE_PRODUCT_DETECTION=true
"@

$envConfig | Out-File -FilePath ".env.aws" -Encoding UTF8
Write-Host "✅ Environment configuration created: .env.aws" -ForegroundColor Green

# Create setup summary
$setupSummary = @"
# CarbonLens AWS Setup Complete! 🎉

## What was deployed:
- **API Gateway**: REST API for all CarbonLens endpoints
- **Lambda Functions**: 
  - Product Detection (Amazon Rekognition)
  - Environmental Analysis (Amazon Bedrock)
  - User Analytics
- **DynamoDB Tables**: Products, User Scans, Environmental Data
- **S3 Buckets**: Product Images, User Data
- **IAM Roles**: Proper permissions for all services

## Next Steps:

### 1. Update Your React Native App
Copy the environment variables from .env.aws to your project's .env file:

\`\`\`bash
cp .env.aws .env
\`\`\`

### 2. Install AWS SDK in your React Native project:
\`\`\`bash
npm install aws-sdk @aws-sdk/client-dynamodb @aws-sdk/client-s3 @aws-sdk/client-rekognition
\`\`\`

### 3. Update your services to use AWS:
- Replace Google Cloud Vision with Amazon Rekognition
- Replace Gemini AI with Amazon Bedrock
- Replace Firebase with DynamoDB and S3

### 4. Test the API endpoints:
- Product Detection: POST /detect-product
- Environmental Analysis: POST /analyze-environmental  
- User Analytics: GET /user-analytics

### 5. Deploy your mobile app:
\`\`\`bash
# For Android
npx react-native run-android

# For iOS  
npx react-native run-ios
\`\`\`

## API Endpoints:
- **Base URL**: https://your-api-gateway-url.execute-api.$Region.amazonaws.com/$Environment
- **Product Detection**: POST /detect-product
- **Environmental Analysis**: POST /analyze-environmental
- **User Analytics**: GET /user-analytics

## Cost Optimization:
With unlimited AWS credits, you can:
- Use Amazon Bedrock for AI analysis
- Store images in S3 with lifecycle policies
- Use DynamoDB on-demand billing
- Enable CloudWatch monitoring

## Monitoring:
- CloudWatch Logs for Lambda functions
- CloudWatch Metrics for DynamoDB and S3
- X-Ray tracing for API Gateway

## Security:
- IAM roles with least privilege
- S3 bucket policies for public images
- API Gateway CORS configuration
- DynamoDB encryption at rest

Happy coding! 🌱📱
"@

$setupSummary | Out-File -FilePath "AWS_SETUP_COMPLETE.md" -Encoding UTF8

Write-Host "`n🎉 AWS Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Infrastructure deployed" -ForegroundColor Green
Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host "✅ Sample data ready" -ForegroundColor Green
Write-Host "✅ Documentation created" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.aws to your project root as .env" -ForegroundColor White
Write-Host "2. Update your React Native services to use AWS" -ForegroundColor White
Write-Host "3. Test the API endpoints" -ForegroundColor White
Write-Host "4. Deploy your mobile app" -ForegroundColor White

Write-Host "`n📄 Check AWS_SETUP_COMPLETE.md for detailed instructions" -ForegroundColor Blue
Write-Host "🔧 Environment variables saved to .env.aws" -ForegroundColor Blue

Write-Host "`n🚀 Your CarbonLens app is ready for AWS! 🌱" -ForegroundColor Green
