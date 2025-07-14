import Joi from 'joi';
export const productValidatorSchema = Joi.object({
    name: Joi.string().required().min(3).max(30),
    slug:Joi.string().required(),
    image:Joi.string().required(),
    images:Joi.array().items(Joi.string()),
    price:Joi.number().required().min(0),
    originalPrice:Joi.number().required().min(0),
    brand:Joi.string().required(),
    category:Joi.string().required(),
    countInStock:Joi.number().required().min(0),
    isPrime:Joi.boolean().required(),
    hasCoupon:Joi.boolean().required(),
    isFreeShipping:Joi.boolean().required(),
    numReviews:Joi.number().required().min(0),
    reviews:Joi.array().items(Joi.object({
        name:Joi.string().required(),
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5),
    }))


});