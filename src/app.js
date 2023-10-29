import express from 'express';
import cookieParser from 'cookie-parser';
import sessionsRouter from './routes/sessions.js';
import config from './config/config.js';

const PORT = config.port

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', sessionsRouter);
// catch all route
app.get("*", (req, res) => {
    res.send('Error 404 - Not Found');
});

const server = app.listen(PORT, () => console.log("Listening on port " + PORT))