const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoos')

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



/**
 * You can POST to /api/users with form data username to create a new user.
 * The returned response from POST /api/users with form data username will be an object with username and _id properties.
 * You can make a GET request to /api/users to get a list of all users.
 */

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
