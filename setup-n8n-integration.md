# N8N Integration Setup Guide

## Current Status
✅ **Next.js App**: Running at http://localhost:3000  
✅ **N8N Platform**: Running at http://localhost:5678  
✅ **Workflow Files**: Created in `/n8n-workflows/` directory

## Step-by-Step Setup

### 1. Access N8N Dashboard
- Open your browser and go to: http://localhost:5678
- Or use the browser preview button that was created

### 2. Import Workflows
For each workflow file in the `n8n-workflows/` directory:

1. **In N8N Dashboard:**
   - Click "+" to create a new workflow
   - Click the "..." menu (three dots) in the top right
   - Select "Import from file"
   - Choose one of these files:
     - `expense-tracking-workflow.json`
     - `bookkeeping-workflow.json` 
     - `payroll-workflow.json`
     - `request-composer-workflow.json`

2. **After importing each workflow:**
   - Click "Save" to save the workflow
   - Click "Activate" to enable the webhook
   - The webhook URL will be automatically generated as:
     - http://localhost:5678/webhook/expense-tracking
     - http://localhost:5678/webhook/bookkeeping
     - http://localhost:5678/webhook/payroll
     - http://localhost:5678/webhook/request-composer

### 3. Test the Integration

1. **Go to your Next.js dashboard**: http://localhost:3000/dashboard

2. **Test Foundation Services:**
   - Click "Trigger Expense Tracking"
   - Click "Trigger Bookkeeping" 
   - Click "Trigger Payroll"
   - Each should show a success message

3. **Test Growth Requests:**
   - Select a request type (e.g., "Financial Analysis")
   - Enter request details
   - Click "Submit Request"
   - Should show success message

### 4. Webhook Endpoints
Your dashboard is configured to use these endpoints:
```
- Expense Tracking: http://localhost:5678/webhook/expense-tracking
- Bookkeeping: http://localhost:5678/webhook/bookkeeping  
- Payroll: http://localhost:5678/webhook/payroll
- Request Composer: http://localhost:5678/webhook/request-composer
```

### 5. Customizing Workflows
Once imported, you can customize each workflow in N8N to:
- Add email notifications
- Connect to external APIs (QuickBooks, Stripe, etc.)
- Add data processing logic
- Store data in databases
- Trigger other automations

## Troubleshooting
- If webhooks don't work, ensure workflows are "Active" in N8N
- Check that N8N is running on port 5678
- Verify webhook URLs match exactly in your dashboard code
- Check browser console for any CORS or network errors
