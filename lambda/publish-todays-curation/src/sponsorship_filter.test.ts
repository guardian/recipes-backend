import fs from "node:fs";
import path from "path";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {mockClient} from "aws-sdk-client-mock";
import {MiseEnPlaceData, MiseEnPlaceDataFormat} from "@recipes-api/lib/facia";
import {filterS3Front} from "./sponsorship_filter";

const s3mock = mockClient(S3Client);

function loadFixture(name:string) {
  const filepath = path.join(__dirname, name);

  const buffer = fs.readFileSync(filepath);
  return JSON.parse(buffer.toString("utf-8")) as unknown;
}

const originalData = loadFixture("real-curation-data.json");

describe('filterS3Front', () => {
  beforeEach(()=>{
    s3mock.reset();
    s3mock.on(GetObjectCommand).resolves({
      //@ts-ignore
      Body: {
        transformToString: jest.fn().mockResolvedValue(JSON.stringify(originalData))
      }
    });
  });

  function countRecipes(front:MiseEnPlaceDataFormat): number {
    return front.reduce((ctr, container)=>
        // eslint-disable-next-line no-prototype-builtins -- this is only test code
      ctr + container.items.filter(item=>item.hasOwnProperty("recipe")).length
    , 0)
  }

  it("should download and filter", async ()=>{
    const original = MiseEnPlaceData.parse(originalData);
    const updated = await filterS3Front("fake-front");

    expect(original.length).toEqual(updated.length);

    original.forEach((originalContainer, i)=>{
      const updatedContainer = updated[i];
      if(originalContainer.items.length>7) {
        expect(originalContainer.items.length).toBeGreaterThanOrEqual(updatedContainer.items.length);
      }
    });

    //Not the most scientific of tests - but then right now we are only working on randomly filtering
    const originalRecipeCount = countRecipes(original);
    const updatedRecipeCount = countRecipes(updated);
    expect(originalRecipeCount).toBeGreaterThan(updatedRecipeCount);
  });

});
