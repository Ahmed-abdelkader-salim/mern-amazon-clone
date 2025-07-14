import mg from 'mailgun-js';

export const mailgun = () => {
    mg({
        apiKey:MAILGUN_API_KEY,
        domain:MAILGUN_DOMAIN,
    });
    
}