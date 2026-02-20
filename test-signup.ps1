$body = @{
    aadhaarNumber = "767901437516"
    password = "test123"
    email = "test@example.com"
    phone = "+916300395240"
    personalInfo = @{
        fullName = "Test User"
        dateOfBirth = "1990-01-01"
        gender = "Male"
        address = "Test Address"
        state = "Test State"
        pincode = "123456"
    }
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/signup" -Body $body -ContentType "application/json"
