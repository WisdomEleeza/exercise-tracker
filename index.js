const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const connnectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
};

connnectDB();


const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.create({ username })
    res.status(201).json({ user })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
})

app.get('/api/users', async (req, res) => {
  const fetchUsers = await User.find()
  res.status(200).json({ fetchUsers })
})

app.post('/api/users/:_id/exercises', async (req, res) => {
 try {
   const { _id } = req.params
  const { description, durationn, date } = req.body
  const exercises = User.create({
    description,
    durationn,
    date
  })
  res.status(201).json(exercises)
 } catch (error) {
  res.status(500).json({ error })
 }
})

/**
 * You can POST to /api/users with form data username to create a new user.
 * The returned response from POST /api/users with form data username will be an object with username and _id properties.
 * You can make a GET request to /api/users to get a list of all users.
 * The GET request to /api/users returns an array.
 * Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
 * You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. 
    If no date is supplied, the current date will be used.
 */

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
