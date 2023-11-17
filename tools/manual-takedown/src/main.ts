import * as process from "process";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {removeAllRecipesForArticle} from "@recipes-api/lib/recipes-data";

const dynamoClient = new DynamoDBClient();

async function main() {
  const articleId = process.env["ARTICLE_ID"];
  if(!articleId || articleId=="") {
    console.error("You must specify an article ID as a commandline argument");
    process.exit(2);
  }

  console.log("Attempting takedown on ", articleId);
  await removeAllRecipesForArticle(dynamoClient, articleId);
}

main().then(()=>process.exit(0)).catch(err=>{
  console.error(err);
  process.exit(1);
})
