const { populate } = require("../models/Course");

const advancedResults = (model, populate) => async (req, res, next) => {
    //Make a copy of req.query
    let reqQuery = {...req.query }

    //Fields exclude
    const removeFields = ['select','sort', 'page', 'limit']

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    //Take request query transform to string //query string
    let queryStr = JSON.stringify(reqQuery)

    //Create match
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`)

    //Finding resource
    let query = model.find(JSON.parse(queryStr));

    //Select Field
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    //Sort field
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }else{
        query = query.sort('-createdAt')
    }


    //Page
    const page = parseInt(req.query.page, 10) || 1; //1 is default page
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments();


    query = query.skip(startIndex).limit(limit)

    if(populate){
        query = query.populate(populate)
    }


    const results = await query;

    //Pagination results
    const pagination = {};

    if(endIndex < total){
        pagination.next = {
            page: page +1,
            limit
        }
    }


    if(startIndex > 0){
        pagination.pre = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
};

module.exports = { advancedResults }