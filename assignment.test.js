const playwright = require("playwright");
const { test , expect } = require("@playwright/test");
const retry = require("async-retry");

test('form publisher test', async ()=>{
  /*
  TEXT DESCRIPTION:
  open a new google form, open the addons and assert we got the correct texts 
  */

	const MAIN_EMAIL = 'aksam.upwork@gmail.com';
	const MAIN_EMAIL_PASS = 'Physics@1';

  // create the browser and page
  console.log("Launch browser")
  const browser = await playwright['chromium'].launch({headless: false});
  const context = await browser.newContext();
  const page = await context.newPage();

  // selectors for google login
	const usernameInput = "#identifierId";
	const passwordInput = '[name="password"]';
	const nextButton = "//button[1]/div[2]";

  // login to google
	console.log("Log in to google with email: ", MAIN_EMAIL);
	await page.goto("https://accounts.google.com/signin/v2");
	await page.fill(usernameInput,   MAIN_EMAIL);
	await page.click(nextButton);
	await page.fill(passwordInput, MAIN_EMAIL_PASS);
	await page.click(nextButton);
	await page.waitForTimeout(3000);

  // go to google forms, open a blank form
  console.log("Go to forms page");
  const URL_GOOGLE_FORMS = "https://docs.google.com/forms/";
  await page.goto(URL_GOOGLE_FORMS);
  await page.waitForTimeout(3000);
  await page.click(':is(div.docs-homescreen-templates-templateview-showcase:has-text("Blank"))');
  await page.waitForTimeout(3000);

  // selectors for addon and form publisher iframe
  const formPublisherMainFrame = "userHtmlFrame";
  const addonsMenu = '[data-action-id="freebird-extension-menu"]';
  const addonsMenuHeader = '[role="heading"][aria-level="1"]';
  const formPublisher = 'text=Form Publisher';
  const getStarted = '[aria-label="Get started"]';
  const closeButton = '[aria-label="Close"]'
  const selectGoogleDoc = '[class^="SelectTemplate_document"]'
  const selectGoogleSpreadsheet = '[class^="SelectTemplate_spreadsheet"]'
  const selectGoogleSlides = '[class^="SelectTemplate_slide"]'

  // activate the form publisher
	console.log("wait for addons icon")
  await page.waitForSelector(addonsMenu, { timeout: 10000 });

  console.log("Click addons symbol")
  await page.click(addonsMenu);
  await page.waitForTimeout(1000);
  await page.waitForSelector(formPublisher, { timeout: 1000 })

  console.log("Click on 'Form Publisher'")
  await page.click(formPublisher);
  await page.waitForSelector(addonsMenuHeader, { timeout: 1000 });

  let isGetStartedVisible = await page.isVisible(getStarted, { timeout: 1000 });
  console.log("isGetStartedVisible ",isGetStartedVisible);
  if (isGetStartedVisible){
    await page.click(getStarted);
  }else{
    console.log("get started is not visible, click close");
  };

  // selectors for blank form with form publisher
  const initialSetupHeader = '[class^="InitialSetUp_header"]';
  const InitialSetUpExplanation = '[class^="InitialSetUp_explanation"]';
  const InitialSetUpButtons = '[class^="InitialSetUp_buttons"]'

  console.log("Wait for Iframe to appear");
    await retry(
      async (bail) => {
        FormFrame = await page.frame({ name: formPublisherMainFrame });
        await FormFrame.isVisible(initialSetupHeader, { timeout: 100 });
        await FormFrame.isVisible(InitialSetUpExplanation, { timeout: 100 });
        await FormFrame.isVisible(InitialSetUpButtons, { timeout: 100 });
        console.log("Form Publisher loaded successfully!");
      },
      {
        retries: 50,
        minTimeout: 100,
        maxTimeout: 200,
      }
    );
  // EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE EXAMPLE HERE 
  // make assertions on the iframe that it contains the relevant text
  let formFrame = await page.frame({ name: formPublisherMainFrame });
  let iframeBodyText = await formFrame.innerText("body");
  expect(iframeBodyText).toContain("Form Publisher works better if you already have questions in your form");
  expect(iframeBodyText).toContain("help");
  expect(iframeBodyText).toContain("Start setup");
  expect(iframeBodyText).toContain("Try demo");

  // locators for Form Publisher window
  const StartSetup = "text=Start setup";
  const GoogleDocument = "text=Google Documentchevron_right";
  const NextButton = 'text=Next';
  const FrameName = 'userHtmlFrame';
  const GoogleDocumentTemplate = 'text=Form Publisher Template';
  const OutputFolder = 'text=Form Publisher Output\'s Folder';
  
  console.log('click Start Setup')
  await page.frame({ name: FrameName }).click(StartSetup);

  console.log('click Google Document')

  await page.frame({ name: FrameName }).click(GoogleDocument);
  const GoogleDoc = page.frame({ name: FrameName}).locator("(//img)[2]");
  await expect(GoogleDoc).toHaveAttribute('alt', 'Google Doc Icon');
  await page.frame({name: FrameName }).click(NextButton);
  
  console.log("Open Google Drive")
  await page.goto("https://drive.google.com/drive/my-drive");
  
  console.log("verify if Google Document Template is present in Google Drive")
  let isGoogleDocumentTemplate = await page.isVisible(GoogleDocumentTemplate, { timeout: 1000 });
  if (isGoogleDocumentTemplate){
    console.log("isGoogleDocumentTemplate ",isGoogleDocumentTemplate);
  }else{
    console.log("Google Document Template is not visible");
  };

  console.log("verify if output folder is present in Google Drive")
  let isOutputFolder = await page.isVisible(OutputFolder, { timeout: 1000 });
  if (isOutputFolder){
    console.log("isOutputFolder ",isOutputFolder);
  }else{
    console.log("Out Folder is not visible");
  };

  await page.waitForTimeout(2000);
  await browser.close()
});
