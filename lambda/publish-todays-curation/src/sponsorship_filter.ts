import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {ContainerItem, MiseEnPlaceData, MiseEnPlaceDataFormat, Recipe} from "@recipes-api/lib/facia";
import {Bucket} from "./config";

const s3client = new S3Client({region: process.env["AWS_REGION"]});

function isRecipeSponsored(recipeUID:string):boolean {
  return Math.random() > 0.7; //fake it for the time being
}

async function downloadCurationFile(Key: string) {
  const req = new GetObjectCommand({
    Bucket,
    Key
  });

  const response = await s3client.send(req);
  const content = response.Body ? await response.Body.transformToString("utf-8") : undefined;
  return content ? MiseEnPlaceData.parse(JSON.parse(content)) : undefined;
}

function maybeRecipe(theThing:unknown):Recipe | undefined {
  try {
    //Is the given entry a recipe entry?
    return Recipe.parse(theThing);
  } catch(err) {
    return undefined;  //if not, then return undefined.
  }
}

function filterItemList(itemList: ContainerItem[]): ContainerItem[] {
  return itemList.filter(entry=>{
    const recipePtr = maybeRecipe(entry);
    if(recipePtr) {
      return !isRecipeSponsored(recipePtr.recipe.id); //if it IS sponsored, we do NOT want to keep it.
    } else {
      return true;  //keep it if it's not a recipe
    }
  })
}

export async function filterS3Front(Key: string) {
  const content = await downloadCurationFile(Key);

  if(content) {
    console.log(`Curation front ${Key} has ${content.length} containers`);
    return content.map((container)=>({
      ...container,
      items: filterItemList(container.items),
    })) as MiseEnPlaceDataFormat
  } else {
    throw new Error(`There was no content for the front ${Key}`);
  }
}
