const mongoose = require('mongoose');


//mongoose returns a Promise
const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`Mongoose Connected: ${conn.connection.host}`.magenta)
}


module.exports = connectDB
