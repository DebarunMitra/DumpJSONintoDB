const express = require('express');
const path = require('path');
const port = process.env.PORT || 5010;
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const CoursesRoutes = require('./routes/courses');
const SyncRoutes = require('./routes/sync');

app.use('/dump/api/v1/', CoursesRoutes);
app.use('/dump/api/v1/sync/', SyncRoutes);

app.listen(port, () => {
    console.log(`listening ${port}`);
  });