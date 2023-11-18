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
    default: Date.now(),
  },
});
const Exercise = mongoose.model('Exercise', ExerciseSchema);
module.exports = Exercise

app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body
    const user = await User.create({ username })
    res.status(201).json({
      username: user.username,
      _id: user._id
    })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
})

app.get('/api/users', async (req, res) => {
  const fetchUsers = await User.find({}, '_id username')
  res.status(200).json( fetchUsers )
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    // Check if the user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const exercise = await Exercise.create({
      userId: _id,
      description,
      duration,
      date,
    });

    // Update the user with the new exercise
    user.exercises.push(exercise);
    await user.save();

    // Fetch the user again to include the exercises
    const updatedUser = await User.findById(_id).populate('exercises');

    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to get exercise log
app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    // Check if the user exists
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query parameters for date range
    const query = { userId: _id };
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    // Fetch exercise logs with optional limit
    let logs;
    if (limit) {
      logs = await Exercise.find(query).limit(parseInt(limit));
    } else {
      logs = await Exercise.find(query);
    }

    // Count of exercises
    const count = logs.length;

    // Prepare response object
    const response = {
      _id: user._id,
      username: user.username,
      count,
      log: logs.map(log => ({
        description: log.description,
        duration: log.duration,
        date: log.date.toDateString(),
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
