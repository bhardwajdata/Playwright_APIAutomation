# Playwright API Automation

This project contains Playwright API automation tests for various endpoints with proper reporting and GitHub Actions integration.

## 🚀 Features

- **API Testing**: Comprehensive API tests using Playwright.
- **Smart Reporting**: Detailed HTML reports using `playwright-smart-reporter`.
- **GitHub Actions**: Automated test execution on every push.
- **Schema Validation**: Built-in JSON schema validation for API responses.
- **Parallel Execution**: Tests run in parallel for faster execution.

## 📂 Project Structure

```
Api_PWAutomation/
├── .github/workflows/playwright.yml       # GitHub Actions workflow
├── pages/
│   ├── api/                               # API test classes
│   ├── payloads/                          # Request payloads
│   └── schema/                            # Response schemas
├── tests/
│   ├── Bookingapi.spec.js                 # Booking API tests
│   ├── Productapi.spec.js                 # Product API tests
│   └── platziproduct.spec.js              # Platzi Product API tests
├── playwright.config.js                    # Playwright configuration
└── package.json                           # Dependencies
```

## 🛠️ Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd Api_PWAutomation
```

2. **Install dependencies**

```bash
npm install
```

3. **Install Playwright browsers**

```bash
npx playwright install
```

## 🏃‍♂️ Running Tests Locally

To run all API tests:

```bash
npx playwright test --grep '@api'
```

To run specific test files:

```bash
npx playwright test tests/Bookingapi.spec.js --grep '@api'
```

To run tests in parallel:

```bash
npx playwright test --grep '@api' --workers=3
```

## 📊 View Reports

Install the playwright-smart-reporter.
npm install playwright-smart-reporter  

Add the path of the report in playwright.config.js file.
reporter: [
    ['list'],
    ['playwright-smart-reporter', {
      outputFolder: 'test-results',
      open: 'never'
    }]
  ],

After running tests, the HTML report will be generated at:

```
tests/smart-report.html
```

Open this file in your browser to view detailed test results.

## 🤖 GitHub Actions

Tests run automatically on every push to the repository.

### Manual Trigger

You can also trigger the workflow manually:

1. Go to the **Actions** tab in GitHub
2. Select **API Automation Workflow**
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### View Results

1. Go to the **Actions** tab
2. Click on the workflow run
3. Check the **Summary** tab for overall status
4. Download the **playwright-report** artifact for detailed results

## 📋 Test Suites

### Booking API Tests
- Get Booking by ID
- Create Booking
- Update Booking
- Delete Booking

### Product API Tests
- Get Product by ID
- Create Product
- Update Product
- Delete Product

### Platzi Product API Tests
- Get Product by ID
- Create Product
- Update Product
- Delete Product

## 📝 Configuration

Edit `playwright.config.js` to configure:
- Test directory: `testDir`
- Number of workers: `workers`
- Reporter settings: `reporter`
- Browser settings: `projects`

## 🤝 Contributing

1. Create a new branch for your changes
2. Make your changes
3. Test locally
4. Push to GitHub
5. Open a Pull Request

