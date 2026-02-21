# TODO: Connect to Database and Remove Dummy Data

## Backend Routes (server/routes/)
- [ ] 1. Add email exists check route (server/routes/auth.js)
- [ ] 2. Add phone exists check route (server/routes/auth.js)
- [ ] 3. Add fraud logs route (server/routes/fraudLogs.js - check if exists)

## Frontend API (src/lib/api.ts)
- [ ] 4. Add emailExists API method
- [ ] 5. Add phoneExists API method  
- [ ] 6. Add getFraudLogs API method

## Frontend Database Operations (src/lib/database.ts)
- [ ] 7. Implement emailExists function
- [ ] 8. Implement phoneExists function
- [ ] 9. Implement fraudLogOperations.getFraudLogs with real database query
- [ ] 10. Implement fraudLogOperations.getUnresolvedFraudCount with real query

## Frontend Pages
- [ ] 11. Update Dashboard.tsx to use dataService instead of mockData
- [ ] 12. Update other pages using mockData

## Testing
- [ ] 13. Test database connections
- [ ] 14. Verify all endpoints work correctly
