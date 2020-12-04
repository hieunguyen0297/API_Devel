const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const xss = require('xss-clean');
const rateLimit = require("express-rate-limit");
const hpp = require('hpp');
const cors = require('cors');

const app = express()

//Init body-parser
app.use(express.json());

//Cookie parser
app.use(cookieParser())


//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to Database
connectDB();



//Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}


//Sanitize data 
app.use(mongoSanitize())


//Set security headers
app.use(helmet())

//Prevent xss attacks
app.use(xss())

//Rate limiting request
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter)


//Prevent http param pollution
app.use(hpp());

//Enable CORS so other domain can connect to this API
app.use(cors())

//File upload
app.use(fileupload());


//Upload public folder // set static
app.use(express.static(path.join(__dirname, 'public')))


// Initial Routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'))
app.use('/api/v1/courses', require('./routes/courses'))
app.use('/api/v1/auth', require('./routes/auth'))
app.use('/api/v1/auth/users', require('./routes/admin'))
app.use('/api/v1/reviews', require('./routes/reviews'))

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue.bold))


//Handle unhandle promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    //Close server and exit process
    server.close(() => process.exit(1));
})