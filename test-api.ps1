# Test DZ-Stagiaire API Endpoints

# 1. Register a student
Write-Host "=== Testing Student Registration ===" -ForegroundColor Green
$studentReg = @{
  Uri = "http://localhost:3000/auth/register"
  Method = "POST"
  ContentType = "application/json"
  Body = '{"username":"student1","email":"student1@example.com","password":"password123"}'
}
$studentUser = Invoke-RestMethod @studentReg
Write-Host "Student registered:" $studentUser.username -ForegroundColor Green

# 2. Login as student
Write-Host "`n=== Testing Student Login ===" -ForegroundColor Green
$studentLogin = @{
  Uri = "http://localhost:3000/auth/login"
  Method = "POST"
  ContentType = "application/json"
  Body = '{"username":"student1","password":"password123"}'
}
$studentToken = Invoke-RestMethod @studentLogin
Write-Host "Student JWT Token:" $studentToken.access_token.Substring(0, 20) "..." -ForegroundColor Green

# 3. Update student profile
Write-Host "`n=== Testing Student Profile Update ===" -ForegroundColor Green
$studentProfile = @{
  Uri = "http://localhost:3000/students/profile"
  Method = "PUT"
  ContentType = "application/json"
  Headers = @{"Authorization" = "Bearer $($studentToken.access_token)"}
  Body = '{"firstName":"Ahmed","lastName":"Youssef","phone":"+213123456789","location":"Algiers","bio":"Computer Science student"}'
}
$updatedStudent = Invoke-RestMethod @studentProfile
Write-Host "Student profile updated:" $updatedStudent.firstName $updatedStudent.lastName -ForegroundColor Green

# 4. Register a company
Write-Host "`n=== Testing Company Registration ===" -ForegroundColor Cyan
$companyReg = @{
  Uri = "http://localhost:3000/auth/register"
  Method = "POST"
  ContentType = "application/json"
  Body = '{"username":"tech_solutions","email":"hr@techsolutions.dz","password":"company123"}'
}
$companyUser = Invoke-RestMethod @companyReg
Write-Host "Company registered:" $companyUser.username -ForegroundColor Cyan

# 5. Login as company
Write-Host "`n=== Testing Company Login ===" -ForegroundColor Cyan
$companyLogin = @{
  Uri = "http://localhost:3000/auth/login"
  Method = "POST"
  ContentType = "application/json"
  Body = '{"username":"tech_solutions","password":"company123"}'
}
$companyToken = Invoke-RestMethod @companyLogin
Write-Host "Company JWT Token:" $companyToken.access_token.Substring(0, 20) "..." -ForegroundColor Cyan

# 6. Update company profile
Write-Host "`n=== Testing Company Profile Update ===" -ForegroundColor Cyan
$companyProfile = @{
  Uri = "http://localhost:3000/companies/profile"
  Method = "PUT"
  ContentType = "application/json"
  Headers = @{"Authorization" = "Bearer $($companyToken.access_token)"}
  Body = '{"companyName":"Tech Solutions DZ","industry":"Software","location":"Algiers","website":"https://techsolutions.dz","description":"Leading software development company","phone":"+21321234567"}'
}
$updatedCompany = Invoke-RestMethod @companyProfile
Write-Host "Company profile updated:" $updatedCompany.companyName -ForegroundColor Cyan

# 7. Create a job offer
Write-Host "`n=== Testing Job Offer Creation ===" -ForegroundColor Yellow
$jobOffer = @{
  Uri = "http://localhost:3000/job-offers"
  Method = "POST"
  ContentType = "application/json"
  Headers = @{"Authorization" = "Bearer $($companyToken.access_token)"}
  Body = '{"title":"Senior Software Engineer","type":"job","description":"We are looking for a senior developer","requiredSkills":"[\"TypeScript\",\"NestJS\",\"PostgreSQL\"]","location":"Algiers","salary":150000,"duration":"Full-time","deadline":"2025-12-31T23:59:59Z","company":{"companyId":1}}'
}
$createdOffer = Invoke-RestMethod @jobOffer
Write-Host "Job offer created:" $createdOffer.title -ForegroundColor Yellow

# 8. List all job offers
Write-Host "`n=== Testing List All Job Offers ===" -ForegroundColor Yellow
$allOffers = @{
  Uri = "http://localhost:3000/job-offers"
  Method = "GET"
}
$offersList = Invoke-RestMethod @allOffers
Write-Host "Total job offers:" $offersList.Count -ForegroundColor Yellow
foreach ($offer in $offersList) {
  Write-Host "- $($offer.title) by $($offer.company.companyName)"
}

# 9. Apply for a job
Write-Host "`n=== Testing Student Job Application ===" -ForegroundColor Magenta
$application = @{
  Uri = "http://localhost:3000/applications"
  Method = "POST"
  ContentType = "application/json"
  Headers = @{"Authorization" = "Bearer $($studentToken.access_token)"}
  Body = '{"offerId":1,"coverLetter":"I am very interested in this position"}'
}
$appResult = Invoke-RestMethod @application
Write-Host "Application submitted with status:" $appResult.status -ForegroundColor Magenta

Write-Host "`n=== All Tests Completed Successfully ===" -ForegroundColor Green
