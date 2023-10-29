import express from 'express';
import cookieParser from 'cookie-parser';
import sessionsRouter from './routes/sessions.js';
import mongoose from 'mongoose';
import config from './config/config.js';

const MONGO_URL = config.mongoUrl
const PORT = config.port

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.use('/', sessionsRouter);
// catch all route
app.get("*", (req, res) => {
    res.send('Error 404 - Not Found');
});

const server = app.listen(PORT, () => console.log("Listening on port " + PORT))