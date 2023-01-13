require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')
const request = require('request')

const lti = require('ltijs').Provider

// Setup
lti.setup(
  process.env.LTI_KEY,
  { // Database configuration
    url: process.env.DB_URL
  },
  { // Options
    staticPath: path.join(__dirname, './public'), // Path to static files
    appRoute: '/lti/launch',
    loginRoute: '/lti/login',
    keysetRoute: '/lti/keys', // Optionally, specify some of the reserved routes
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true // Set DevMode to false if running in a production environment with https
  }
)

// When receiving successful LTI launch redirects to app
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
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
  console.log('deployeeeed')
  /**
   * Register platform
   */
  /* CANVAS */
  // const platform = await lti.registerPlatform({
  //   url: 'https://canvas.instructure.com',
  //   name: 'ltijs-content-test',
  //   clientId: '10000000000016',
  //   authenticationEndpoint: 'https://canvas-temp.pagewerkz.com/api/lti/authorize_redirect',
  //   accesstokenEndpoint: 'https://canvas-temp.pagewerkz.com/api/login/oauth2/token',
  //   authConfig: {
  //     method: 'JWK_SET',
  //     key: 'https://canvas-temp.pagewerkz.com/api/lti/security/jwks'
  //   }
  // })
  // console.log(await platform.platformPublicKey())
  /* MOODLE */
  // const platform = await lti.registerPlatform({
  //   url: 'https://sandbox.moodledemo.net',
  //   name: 'Platform',
  //   clientId: 'fLOQQlZGpyCCNie',
  //   authenticationEndpoint: 'https://sandbox.moodledemo.net/mod/lti/auth.php',
  //   accesstokenEndpoint: 'https://sandbox.moodledemo.net/mod/lti/token.php',
  //   authConfig: {
  //     method: 'JWK_SET',
  //     key: 'https://sandbox.moodledemo.net/mod/lti/certs.php'
  //   }
  // })
  // console.log(await platform.platformPublicKey())
}

setup()
