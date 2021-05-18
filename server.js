const express = require('express');
const path = require('path');
const port = process.env.PORT || 5010;
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const CoursesRoutes = require('./routes/courses');
const SyncRoutes = require('./routes/sync');
const MoodleRoutes = require('./routes/moodleLogin');
const FBlogin = require('./routes/fblogin');
const MoodleDump = require('./routes/dumpMoodleCourses');

app.use('/dump/api/v1/', CoursesRoutes);
app.use('/dump/api/v1/sync/', SyncRoutes);
app.use('/api/v1/moodle/', MoodleRoutes);
app.use('/api/', FBlogin);
app.use('/sync/api/v1/', MoodleDump);


app.listen(port, () => {
    console.log(`listening ${port}`);
  });