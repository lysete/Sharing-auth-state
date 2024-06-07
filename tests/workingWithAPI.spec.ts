import { test, expect, request } from '@playwright/test';
//Kept the objet in tags.json file and importing that file
import tags from '../test-data/tags.json'

test.beforeEach(async ({page}) =>{
  await page.route('*/**/api/tags', async route =>{
    
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://conduit.bondaracademy.com/')

})

test('has title', async ({ page }) => {
   // for this we need to do a beforeEach method before we open the home page
  await page.route('*/**/api/articles*', async route =>{
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a MOCK test description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })

  })
  
  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText("This is a MOCK test title")
  await expect(page.locator('app-article-list p').first()).toContainText("This is a MOCK test description")
});

test('delete articles', async({page, request}) =>{
   //we need to use the actual API that returns us positive status code 200 and more
  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
     //now need to pass the object that is UN and PW ahich was want to send to the API in order to get the token
    data: {
      "user":
      {"email":"dashatest@test.com","password":"qwerty2134"}
    }
  })
  const responseBody = await response.json()
  //keeping the token value into a variable for using later
  const accessToken = responseBody.user.token
  
  //Now as the token is ready, we need to perform the second API call to actually create the article
  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article":{"title":"This is a test Title","description":"This is a test Description","body":"Test Body","tagList":["4"]}
    },
     //Now we need to put the authorization header
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('This is a test Title').click()
  await page.getByRole('button', {name: "Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toContainText("This is a test Title")

})

test ('create article', async ({page, request}) =>{
  await page.getByText('New Article').click()
  await page.getByRole('textbox', {name:"Article Title"}).fill('Playwright is awesome')
  await page.getByRole('textbox', {name:"What's this article about?"}).fill('About the Playwright')
  await page.getByRole('textbox', {name:"Write your article (in markdown)"}).fill('Automation is awesome')
  await page.getByRole('button', {name:"Publish Article"}).click()
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug


  await expect(page.locator('app-article-page h1')).toContainText("Playwright is awesome")
  await page.getByText("Home").click()
  await page.getByText("Global Feed").click()

  await expect(page.locator('app-article-list h1').first()).toContainText("Playwright is awesome")

  const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
     //now need to pass the object that is UN and PW ahich was want to send to the API in order to get the token
    data: {
      "user":
      {"email":"dashatest@test.com","password":"qwerty2134"}
    }
  })
  const responseBody = await response.json()
  //keeping the token value into a variable for using later
  const accessToken = responseBody.user.token
  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`,{
    headers: {
      Authorization: `Token ${accessToken}`
    }
  })
  expect(deleteArticleResponse.status()).toEqual(204)
})

