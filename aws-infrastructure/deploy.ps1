# CarbonLens AWS Deployment Script
# This script deploys the AWS infrastructure for CarbonLens

param(
    [Parameter(Mandatory=$true)]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "carbonlens",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$Profile = "default"
)

Write-Host "🚀 Starting CarbonLens AWS Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Project: $ProjectName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "❌ AWS CLI is not installed. Please install it first: https://aws.amazon.com/cli/"
    exit 1
}

# Check if AWS credentials are configured
try {
    $awsIdentity = aws sts get-caller-identity --profile $Profile --region $Region 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ AWS credentials not configured. Please run 'aws configure' first."
        exit 1
    }
    Write-Host "✅ AWS credentials verified" -ForegroundColor Green
} catch {
    Write-Error "❌ Failed to verify AWS credentials"
    exit 1
}

# Create deployment directory
$deploymentDir = "aws-deployments"
if (-not (Test-Path $deploymentDir)) {
    New-Item -ItemType Directory -Path $deploymentDir
    Write-Host "📁 Created deployment directory: $deploymentDir" -ForegroundColor Blue
}

# Deploy CloudFormation stack
$stackName = "$ProjectName-$Environment"
$templateFile = "cloudformation-template.yaml"
$parametersFile = "parameters-$Environment.json"

Write-Host "📦 Deploying CloudFormation stack: $stackName" -ForegroundColor Blue

# Create parameters file if it doesn't exist
if (-not (Test-Path $parametersFile)) {
    $parameters = @{
        ProjectName = $ProjectName
        Environment = $Environment
        DomainName = ""
    } | ConvertTo-Json -Depth 2
    
    $parameters | Out-File -FilePath $parametersFile -Encoding UTF8
    Write-Host "📝 Created parameters file: $parametersFile" -ForegroundColor Blue
}

# Deploy the stack
try {
    $deployCommand = "aws cloudformation deploy --template-file $templateFile --stack-name $stackName --parameter-overrides ProjectName=$ProjectName Environment=$Environment --capabilities CAPABILITY_NAMED_IAM --region $Region --profile $Profile"
    
    Write-Host "🔄 Executing deployment command..." -ForegroundColor Yellow
    Invoke-Expression $deployCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ CloudFormation stack deployed successfully!" -ForegroundColor Green
    } else {
        Write-Error "❌ CloudFormation deployment failed"
        exit 1
    }
} catch {
    Write-Error "❌ Deployment failed: $_"
    exit 1
}

# Get stack outputs
Write-Host "📊 Retrieving stack outputs..." -ForegroundColor Blue
try {
    $outputs = aws cloudformation describe-stacks --stack-name $stackName --region $Region --profile $Profile --query 'Stacks[0].Outputs' --output json | ConvertFrom-Json
    
    # Save outputs to file
    $outputs | ConvertTo-Json -Depth 3 | Out-File -FilePath "$deploymentDir/outputs-$Environment.json" -Encoding UTF8
    
    Write-Host "📋 Stack Outputs:" -ForegroundColor Green
    foreach ($output in $outputs) {
        Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Cyan
    }
    
    # Create environment file
    $envFile = ".env.aws"
    $envContent = @"
# CarbonLens AWS Configuration
# Generated on $(Get-Date)

# API Gateway
AWS_API_GATEWAY_URL=$($outputs | Where-Object { $_.OutputKey -eq "ApiGatewayUrl" } | Select-Object -ExpandProperty OutputValue)

# S3 Buckets
AWS_PRODUCT_IMAGES_BUCKET=$($outputs | Where-Object { $_.OutputKey -eq "ProductImagesBucketName" } | Select-Object -ExpandProperty OutputValue)
AWS_USER_DATA_BUCKET=$($outputs | Where-Object { $_.OutputKey -eq "UserDataBucketName" } | Select-Object -ExpandProperty OutputValue)

# DynamoDB Tables
AWS_PRODUCTS_TABLE=$($outputs | Where-Object { $_.OutputKey -eq "ProductsTableName" } | Select-Object -ExpandProperty OutputValue)
AWS_USER_SCANS_TABLE=$($outputs | Where-Object { $_.OutputKey -eq "UserScansTableName" } | Select-Object -ExpandProperty OutputValue)
AWS_ENVIRONMENTAL_DATA_TABLE=$($outputs | Where-Object { $_.OutputKey -eq "EnvironmentalDataTableName" } | Select-Object -ExpandProperty OutputValue)

# AWS Configuration
AWS_REGION=$Region
AWS_PROFILE=$Profile
ENVIRONMENT=$Environment
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "📝 Created environment file: $envFile" -ForegroundColor Green
    
} catch {
    Write-Warning "⚠️ Could not retrieve stack outputs: $_"
}

# Create deployment summary
$summary = @"
# CarbonLens AWS Deployment Summary
Generated: $(Get-Date)

## Deployment Details
- **Stack Name**: $stackName
- **Environment**: $Environment
- **Region**: $Region
- **Profile**: $Profile

## Resources Created
- **API Gateway**: REST API for CarbonLens endpoints
- **Lambda Functions**: 
  - Product Detection (Amazon Rekognition)
  - Environmental Analysis (Amazon Bedrock)
  - User Analytics
- **DynamoDB Tables**:
  - Products table with GSI indexes
  - User scans table
  - Environmental data table
- **S3 Buckets**:
  - Product images bucket
  - User data bucket

## Next Steps
1. Update your application to use the AWS services
2. Configure your React Native app with the API endpoints
3. Test the product detection and environmental analysis features
4. Set up monitoring and logging

## API Endpoints
- Product Detection: POST /detect-product
- Environmental Analysis: POST /analyze-environmental
- User Analytics: GET /user-analytics

## Environment Variables
Copy the contents of .env.aws to your application's .env file
"@

$summary | Out-File -FilePath "$deploymentDir/deployment-summary-$Environment.md" -Encoding UTF8

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📄 Check the deployment summary: $deploymentDir/deployment-summary-$Environment.md" -ForegroundColor Blue
Write-Host "🔧 Environment variables saved to: .env.aws" -ForegroundColor Blue
Write-Host "📊 Stack outputs saved to: $deploymentDir/outputs-$Environment.json" -ForegroundColor Blue

Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.aws to your project root as .env" -ForegroundColor White
Write-Host "2. Update your React Native app to use AWS services" -ForegroundColor White
Write-Host "3. Test the API endpoints" -ForegroundColor White
Write-Host "4. Deploy your mobile app" -ForegroundColor White
