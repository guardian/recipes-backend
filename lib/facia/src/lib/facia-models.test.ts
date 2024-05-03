import type { Recipe} from './facia-models';
import {FeastCuration} from './facia-models';

describe("facia-models", ()=>{
  it("should be able to validate real data", ()=>{
    const rawContent ={
      "all-recipes": [
        {
          "id": "d353e2de-1a65-45de-85ca-d229bc1fafad",
          "title": "Dish of the day",
          "body": "",
          "items": [
            {
              "recipe": {
                "id": "14129325"
              }
            }
          ]
        }
      ],
      "meat-free": [
        {
          "id": "fa6ccb35-926b-4eff-b3a9-5d0ca88387ff",
          "title": "Dish of the day",
          "body": "",
          "items": [
            {
              "recipe": {
                "id": "14132263"
              }
            }
          ]
        }
      ]
    }

    const typedData = FeastCuration.parse(rawContent);
    expect(typedData["all-recipes"].length).toEqual(1);

    expect(typedData["all-recipes"][0].body).toEqual("");
    expect(typedData["all-recipes"][0].id).toEqual("d353e2de-1a65-45de-85ca-d229bc1fafad");
    expect(typedData["all-recipes"][0].title).toEqual("Dish of the day");
    expect(typedData["all-recipes"][0].items.length).toEqual(1);
    const theRecipe = typedData["all-recipes"][0].items[0] as Recipe;
    expect(theRecipe.recipe.id).toEqual("14129325")

});
})
