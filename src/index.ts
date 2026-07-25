import 'dotenv/config';
import { buildApp } from './app.js';
import { startExpirePaymentLinksJob } from './infra/jobs/expire-payment-links.job.js';

const app = buildApp();

const PORT = Number(process.env.PORT) || 3333
const HOST = '0.0.0.0'

app.listen({ port: PORT, host: HOST }, (err) => {
    if(err){
        app.log.error(err);
        process.exit(1);
    }

    startExpirePaymentLinksJob();
});