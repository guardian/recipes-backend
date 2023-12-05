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
  const buffer = req.body as Buffer;

  if(req.header("Content-Type") != "application/json") {
    resp.status(405).json({status: "error", detail: "wrong content type"});
    return;
  }

  if(buffer.length==0) {
    resp.status(400).json({status: "error", detail: "no content was sent"});
    return;
  }

  try {
    const textContent = buffer.toString('utf-8');
    console.log("Received payload ", textContent);
    JSON.parse(textContent);

    importNewData(buffer)
      .then(() => {
        return resp.status(200).json({status: "ok"})
      })
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment -- can't help `err` being untyped
        return resp.status(200).json({status: "error", detail: err.toString()})
      })
  } catch(err) {
    console.error("Could not parse incoming data as json: ", err);
    return resp.status(400).json({status: "error", detail: "invalid content"});
  }
});

app.use('/', router);
