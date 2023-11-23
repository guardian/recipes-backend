import bodyParser from 'body-parser';
import {renderFile as ejs} from "ejs";
import express from 'express';
import {importNewData} from "./submit-data";

export const app = express();
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);

const router = express.Router();
router.use(bodyParser.json());

router.post('/api/curation', (req, resp)=>{
  importNewData(req.body)
    .then(()=>{
      return resp.status(200).json({status: "ok"})
    })
    .catch((err)=>{
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment -- can't help `err` being untyped
      return resp.status(200).json({status: "error", detail: err.toString()})
    })
});

app.use('/', router);
