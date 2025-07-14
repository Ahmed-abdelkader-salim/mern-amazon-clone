import Joi from 'joi';
export const reviewValidate = Joi.object({
    reviews:Joi.array().items(Joi.object({
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5),
    }))


});