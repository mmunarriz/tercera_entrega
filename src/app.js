import express from 'express';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import sessionsRouter from './routes/sessions.js';
import viewsRouter from './routes/views.js';
import mongoose from 'mongoose';
import config from './config/config.js';

const MONGO_URL = config.mongoUrl
const PORT = config.port

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'))

const connection = mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
// catch all route
app.get("*", (req, res) => {
    res.send('Error 404 - Not Found');
});

const server = app.listen(PORT, () => console.log("Listening on port " + PORT))