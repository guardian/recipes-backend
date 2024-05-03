import type { Recipe} from './facia-models';
import {FeastCuration} from './facia-models';

describe("facia-models", ()=>{
  it("should be able to validate real data", ()=>{
    const rawContent = {
      id: "D9AEEA41-F8DB-4FC8-A0DA-275571EA7331",
      edition: "northern",
      version: "v1",
      issueDate: "2024-01-02",
      fronts: {
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
  }

    const typedData = FeastCuration.parse(rawContent);
    expect(typedData.fronts["all-recipes"].length).toEqual(1);

    expect(typedData.fronts["all-recipes"][0].body).toEqual("");
    expect(typedData.fronts["all-recipes"][0].id).toEqual("d353e2de-1a65-45de-85ca-d229bc1fafad");
    expect(typedData.fronts["all-recipes"][0].title).toEqual("Dish of the day");
    expect(typedData.fronts["all-recipes"][0].items.length).toEqual(1);
    const theRecipe = typedData.fronts["all-recipes"][0].items[0] as Recipe;
    expect(theRecipe.recipe.id).toEqual("14129325")

});
})
