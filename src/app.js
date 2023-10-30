import express from 'express';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import sessionsRouter from './routes/sessions.js';
import viewsRouter from './routes/views.js';
import productsRouter from './routes/products.js'
import cartsRouter from './routes/carts.js'
import mongoose from 'mongoose';
import config from './config/config.js';
import { Server } from "socket.io";
import Message from './dao/models/message.js';

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

// Template engine
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
// catch all route
app.get("*", (req, res) => {
    res.send('Error 404 - Not Found');
});

const server = app.listen(PORT, () => console.log("Listening on port " + PORT))

// Chat
const io = new Server(server)
let messages = [];

io.on('connection', socket => {
    console.log('Nuevo cliente conectado');

    socket.on('message', data => {
        messages.push(data);

        // Crea un nuevo mensaje usando el messageSchema y lo guarda en MongoDB
        const newMessage = new Message({
            user: data.user,
            message: data.message,
        });

        newMessage.save()
            .then(() => {
                io.emit('messageLogs', messages);
            })
            .catch(error => {
                console.error('Error al guardar el mensaje en MongoDB:', error);
            });
    });

    socket.on('authenticated', data => {
        socket.broadcast.emit('newUserConnected', data);
    });
});