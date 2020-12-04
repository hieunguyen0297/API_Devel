const mongoose = require('mongoose');


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add a number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    scholarhipsAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: true
    }

})

//Static method to get average of course tuitions 
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    // console.log('Calculating avg cost...'.black.bgCyan)

    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])

    console.log(obj)

    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost/10) * 10
        })
    }catch (err) {
        console.log(err)
    }
}


//Call get average cost after save 
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp)
})

//Call get average cost before remove 
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp)
})



module.exports = mongoose.model('Course', CourseSchema);