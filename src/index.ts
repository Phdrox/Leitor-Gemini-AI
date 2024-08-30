import express, { Express} from "express";
import router from './routes';
import cors from "cors";

const app: Express = express();
app.use(express.json());
app.use('/upload',express.static('upload'))
app.use(cors({origin:'*'}));
app.use('/',router);

app.listen(80, () => {
 console.log('Servidor rodando');
});