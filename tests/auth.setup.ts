import { test as setup } from '@playwright/test';

const authFile = '.auth/user.json'

setup('authentification', async ({page})=>{
  await page.goto('https://conduit.bondaracademy.com/');
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name:"Email"}).fill('dashatest@test.com')
  await page.getByRole('textbox', {name:"Password"}).fill('qwerty2134')
  await page.getByRole('button').click()
  await page.waitForTimeout(1000)
  await page.waitForResponse('https://conduit-api.bondaracademy.com/api/tags')

  await page.context().storageState({path: authFile})

})
