#!/usr/bin/env pwsh

$baseUrl = "http://localhost:3000"

Write-Host "=== Phase 1 Validation & Authorization Testing ===" -ForegroundColor Cyan

# Test 1: Register student
Write-Host "`nTest 1: Register student with role student"
$student1 = @{
  username = "student2"
  email = "student2@example.com"
  password = "Student123456"
  role = "student"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
    -Body (ConvertTo-Json $student1) -ContentType "application/json"
  Write-Host "✅ Student registered: " $response.username
  $studentUserId = $response.userId
} catch {
  Write-Host "❌ Failed:" $_.ErrorDetails.Message
}

# Test 2: Register company
Write-Host "`nTest 2: Register company with role company"
$company1 = @{
  username = "company2"
  email = "company2@example.com"
  password = "Company123456"
  role = "company"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
    -Body (ConvertTo-Json $company1) -ContentType "application/json"
  Write-Host "✅ Company registered: " $response.username
  $companyUserId = $response.userId
} catch {
  Write-Host "❌ Failed:" $_.ErrorDetails.Message
}

# Test 3: Login student and get JWT
Write-Host "`nTest 3: Login student and get JWT token"
$loginData = @{
  username = "student2"
  password = "Student123456"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
    -Body (ConvertTo-Json $loginData) -ContentType "application/json"
  Write-Host "✅ Student login successful, JWT:" $response.access_token.Substring(0, 20) + "..."
  $studentToken = $response.access_token
} catch {
  Write-Host "❌ Failed:" $_.ErrorDetails.Message
}

# Test 4: Company login
Write-Host "`nTest 4: Login company and get JWT token"
$companyLogin = @{
  username = "company2"
  password = "Company123456"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
    -Body (ConvertTo-Json $companyLogin) -ContentType "application/json"
  Write-Host "✅ Company login successful, JWT:" $response.access_token.Substring(0, 20) + "..."
  $companyToken = $response.access_token
} catch {
  Write-Host "❌ Failed:" $_.ErrorDetails.Message
}

# Test 5: Validation - Try register with short password (< 8 chars)
Write-Host "`nTest 5: Validation - Short password should fail"
$invalidData = @{
  username = "invalid"
  email = "invalid@example.com"
  password = "short"
  role = "student"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
    -Body (ConvertTo-Json $invalidData) -ContentType "application/json" -SkipHttpErrorCheck
  Write-Host "❌ Should have failed but didn't"
} catch {
  Write-Host "✅ Validation rejected:" $_.ErrorDetails.Message
}

# Test 6: Validation - Invalid email
Write-Host "`nTest 6: Validation - Invalid email should fail"
$invalidEmail = @{
  username = "user123"
  email = "notanemail"
  password = "ValidPass123"
  role = "student"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST `
    -Body (ConvertTo-Json $invalidEmail) -ContentType "application/json" -SkipHttpErrorCheck
  Write-Host "❌ Should have failed but didn't"
} catch {
  Write-Host "✅ Validation rejected invalid email"
}

# Test 7: Authorization - Student cannot create job offers
Write-Host "`nTest 7: Authorization - Student should not create job offers"
$jobOfferTest = @{
  title = "Senior Developer"
  description = "Looking for senior developer"
  type = "job"
  requiredSkills = "JavaScript, TypeScript"
  location = "Remote"
}

try {
  $response = Invoke-RestMethod -Uri "$baseUrl/job-offers" -Method POST `
    -Headers @{Authorization = "Bearer $studentToken"} `
    -Body (ConvertTo-Json $jobOfferTest) -ContentType "application/json" -SkipHttpErrorCheck
  Write-Host "❌ Should have rejected student, but didn't"
} catch {
  Write-Host "✅ Authorization rejected student: Correct!"
}

# Test 8: Authorization - Company CAN create job offers
Write-Host "`nTest 8: Authorization - Company should create job offers"
try {
  $response = Invoke-RestMethod -Uri "$baseUrl/job-offers" -Method POST `
    -Headers @{Authorization = "Bearer $companyToken"} `
    -Body (ConvertTo-Json $jobOffer) -ContentType "application/json"
  Write-Host "✅ Company created job offer: " $response.title
  $offerId = $response.offerId
} catch {
  Write-Host "❌ Failed:" $_.ErrorDetails.Message
}

# Test 9: Duplicate application prevention
Write-Host "`nTest 9: Duplicate application - Second apply should fail"
$applicationData = @{
  offerId = $offerId
  coverLetter = "I am very interested!"
}

# First application
try {
  $response = Invoke-RestMethod -Uri "$baseUrl/applications" -Method POST `
    -Headers @{Authorization = "Bearer $studentToken"} `
    -Body (ConvertTo-Json $applicationData) -ContentType "application/json"
  Write-Host "✅ Student applied successfully"
} catch {
  Write-Host "❌ First application failed:" $_.ErrorDetails.Message
}

# Second application (duplicate)
try {
  $response = Invoke-RestMethod -Uri "$baseUrl/applications" -Method POST `
    -Headers @{Authorization = "Bearer $studentToken"} `
    -Body (ConvertTo-Json $applicationData) -ContentType "application/json" -SkipHttpErrorCheck
  Write-Host "❌ Duplicate application was allowed (should fail)"
} catch {
  Write-Host "✅ Duplicate prevented: Correct!"
}

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
