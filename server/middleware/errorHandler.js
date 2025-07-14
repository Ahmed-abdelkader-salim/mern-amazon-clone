
export const errorHandler = (err, req, res, next) =>{
    console.error(err.stack);
    if(err.name === 'ValidationError'){
        return res.status(400).json({
            message:'Validation Error',
            errors:Object.values(err.errors).map(error => ({
                field:error.path,
                message:error.message
            }))
        })
    }

    if(err.name === 'MongoError'){
        return res.status(400).json({
            message:'Duplicate Error',
            field:Object.keys(err.keyPattern)[0],
        });
    }

    res.status(500).json({
        message:'Internal Server Error',
        error:process.env.NODE_ENV === 'development' ? err.message : undefined
    })
}