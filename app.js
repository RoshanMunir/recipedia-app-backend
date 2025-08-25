const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth'); 

dotenv.config();

const app = express(); 


app.use(express.json());
app.use(cors());


app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Hello Recipe App!');
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

