import bodyParser from 'body-parser';
import {renderFile as ejs} from "ejs";
import express from 'express';
import type {Request} from 'express';
import {getBodyContentAsJson} from "./helpers";
import {importNewData} from "./submit-data";

export const app = express();
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);

const router = express.Router();
router.use(bodyParser.json());

interface CurationParams {
  region: string;
  variant: string;
}

/**
 * Checks whether the parameters make sense and raises an exception if they don't
 * @param params CurationParams object
 */
function validateCurationParams(params: CurationParams) {
  const checker = /[^\\w]+/;

  if(!params.region.match(checker) || !params.variant.match(checker)) {
    throw new Error("Invalid region parameter");
  }
}

router.post('/api/curation/:region/:variant', (req: Request<CurationParams>, resp)=>{
  if(req.header("Content-Type") != "application/json") {
    resp.status(405).json({status: "error", detail: "wrong content type"});
    return;
  }

  try {
    validateCurationParams(req.params)
  } catch(err) {
    console.log("Provided params ", req.params, " did not validate");
    resp.status(400).json({status: "error", "detail": "invalid regionalisation parameters. region and variant must be basic strings with no punctuation etc."})
    return;
  }

  try {
    const textContent = getBodyContentAsJson(req.body);
    if(textContent.length==0) {
      resp.status(400).json({status: "error", detail: "no content was sent"});
      return;
    }

    importNewData(textContent, req.params.region, req.params.variant)
      .then(() => {
        return resp.status(200).json({status: "ok"})
      })
      .catch((err) => {
        console.error(err);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment -- can't help `err` being untyped
        return resp.status(500).json({status: "error", detail: err.toString()})
      })
  } catch(err) {
    console.error("Could not parse incoming data as json: ", err);
    return resp.status(400).json({status: "error", detail: "invalid content"});
  }
});

app.use('/', router);
