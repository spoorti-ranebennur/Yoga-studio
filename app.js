const express = require('express');
const path = require('path');
const app = express();
const bodyparser = require('body-parser')
const port = 80;

// Set Pug as the view engine
app.set('view engine', 'pug');

// Set the views directory correctly
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'static')));
// app.js or index.js
const mongoose = require('mongoose');
app.use(express.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yogadata', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// Connection error handler
db.on('error', console.error.bind(console, '❌ Connection error:'));

// Successful connection
db.once('open', function () {
  console.log('✅ Connected to MongoDB successfully!');
});

const contactSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String

});
const Contact = mongoose.model('Contact', contactSchema);


app.use(express.json());


app.get('/', (req, res) => {
  res.render('pages/home');
});

app.get('/contact', (req, res) => {
  res.render('pages/contact');
});

app.post('/contact', (req, res) => {
  var myData = new Contact(req.body);
  myData.save()
    .then(() => {
      res.send("✅ Data has been saved to MongoDB.");
    })
    .catch((err) => {
      console.error("❌ Error saving data:", err);
      res.status(400).send("Error: Data was not saved.");
    });
});


const regSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', regSchema); // Capitalized model name



app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', (req, res) => {
  const myreg = new User(req.body); // Use capitalized User

  myreg.save()
    .then(() => {
      res.send("✅ REGISTRATION SUCCESSFUL. Data saved to MongoDB.");
    })
    .catch((err) => {
      console.error("❌ Error saving data:", err);
      res.status(400).send("❌ Error: Data was not saved.");
    });
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send("❌ User not found");
    }

    if (user.password !== password) {
      return res.status(400).send("❌ Incorrect password");
    }

    res.send(`✅ Welcome back, ${user.username}! You are logged in.`);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("❌ Something went wrong during login.");
  }
});


const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  classType: String,
  preferredDate: Date,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/book', (req, res) => {
  res.render('pages/book');
});

app.post('/book', (req, res) => {
  try {
    const bookingData = new Booking(req.body);
    bookingData.save();
    res.send('Your yoga class has been booked successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Booking failed. Try again.');
  }
});


const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

app.get('/testimonials', (req, res) => {
  const testimonials = Testimonial.find().sort({ date: -1 });
  res.render('pages/testimonials', { testimonials });
});

// POST: Submit testimonial
app.post('/submit', async (req, res) => {
  const { name, message } = req.body;
  Testimonial.save({ name, message });
});






app.listen(port, () => {
  console.log(`App is listening on ${port}`);
})