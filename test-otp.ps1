$body = @{
    aadhaarNumber = "767901437516"
    method = "sms"
    type = "login"
    phone = "+916300395240"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/send-otp" -Body $body -ContentType "application/json"
