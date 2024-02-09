const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
const shortid = require('shortid');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database to store users and exercises
let users = [];

// POST endpoint to create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = {
    username,
    _id: shortid.generate()
  };
  users.push(newUser);
  res.json(newUser);
});

// GET endpoint to get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// POST endpoint to add exercise for a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const userIndex = users.findIndex(user => user._id === _id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newExercise = {
    username: users[userIndex].username,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: users[userIndex]._id
  };

  users[userIndex].log = users[userIndex].log || [];
  users[userIndex].log.push(newExercise);

  res.json({
    username: users[userIndex].username,
    description,
    duration: parseInt(duration),
    date: newExercise.date,
    _id: users[userIndex]._id
  });
});

// GET endpoint to retrieve a full exercise log of any user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find(user => user._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let { from, to, limit } = req.query;
  let log = user.log || [];

  if (from || to) {
    let fromDate = new Date(0);
    let toDate = new Date();

    if (from) {
      fromDate = new Date(from);
    }

    if (to) {
      toDate = new Date(to);
    }

    log = log.filter(exercise => {
      const exerciseDate = new Date(exercise.date);
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    });
  }

  if (limit) {
    log = log.slice(0, limit);
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
