require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')
const request = require('request')

const lti = require('ltijs').Provider

// Setup
lti.setup(
  process.env.LTI_KEY,
  {
    url:
      'mongodb://' +
      process.env.DB_HOST +
      '/' +
      process.env.DB_NAME +
      '?authSource=admin',
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  },
  {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to true if the testing platform is in a different domain and https is not being used
  }
)

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  console.log('Token', token.platformContext.custom.name)
  const url =
    'https://s3-signed-url.s3.ap-southeast-1.amazonaws.com/07b502e461349c25773523bc9dab6a89a5688701a324f066f3c94485bd1794ad?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZPWXCDVOVEZNG6VB%2F20221205%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20221205T043803Z&X-Amz-Expires=3600&X-Amz-Signature=06d9131113bc9d04b8abfdc8fd1988604b28efd8b87da2cfc9db35526f27599e&X-Amz-SignedHeaders=host&x-id=GetObject'
  request(
    {
      url: url,
      encoding: null
    },
    (err, resp, buffer) => {
      if (!err && resp.statusCode === 200) {
        res.set('Content-Type', 'image/jpeg')
        res.send(resp.body)
      }
    }
  )
  // return res.sendFile(path.join(__dirname, './photos/dog.jpg'))
})

// When receiving deep linking request redirects to deep screen
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Setting up routes
lti.app.use(routes)

// Setup function
const setup = async () => {
  await lti.deploy({ port: process.env.PORT })

  /**
   * Register platform
   */
  const platform = await lti.registerPlatform({
    url: 'https://sandbox.moodledemo.net',
    name: 'Platform',
    clientId: 'yjYox6K917IE6RK',
    authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
    accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      key: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
    }
  })
  console.log(await platform.platformPublicKey())
}

setup()
