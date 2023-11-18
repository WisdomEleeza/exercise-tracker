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

const ExerciseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Exercise = mongoose.model('Exercise', ExerciseSchema);
module.exports = Exercise

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
  const { description, duration, date } = req.body
  const exercises = User.create({
    description,
    duration,
    date
  })
  res.status(201).json(exercises)
 } catch (error) {
  res.status(500).json({ error })
 }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
