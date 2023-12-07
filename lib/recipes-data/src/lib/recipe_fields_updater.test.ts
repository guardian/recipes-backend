import type {Content} from "@guardian/content-api-models/v1/content";
import {updateContributors} from "./recipe_fields_updater";

describe("recipe_fields_updater.updateContributors", () => {
  it("should update the `contributors` array in the recipe from the article data", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="profile/uyen-luu">Uyen Luu</a>, <a href="profile/giorgiolocatelli">Giorgio Locatelli</a>, <a href="profile/meera-sodha">Meera Sodha</a>, <a href="profile/jose-pizarro">José Pizarro</a>, <a href="profile/jane-baxter">Jane Baxter</a>',
      }
    };

    const result = updateContributors(partialArticle, {});
    expect(result.contributors).toEqual(['profile/uyen-luu','profile/giorgiolocatelli','profile/meera-sodha','profile/jose-pizarro','profile/jane-baxter']);
  })

  it("should not touch 'contributors' if there is already data", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="profile/uyen-luu">Uyen Luu</a>, <a href="profile/giorgiolocatelli">Giorgio Locatelli</a>, <a href="profile/meera-sodha">Meera Sodha</a>, <a href="profile/jose-pizarro">José Pizarro</a>, <a href="profile/jane-baxter">Jane Baxter</a>',
      }
    };

    const result = updateContributors(partialArticle, {
      contributors: ["profile/xyz"]
    });
    expect(result.contributors).toEqual(["profile/xyz"])
  })

  it("should overwrite the `contributors` array if it only has empty entries", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="profile/uyen-luu">Uyen Luu</a>, <a href="profile/giorgiolocatelli">Giorgio Locatelli</a>, <a href="profile/meera-sodha">Meera Sodha</a>, <a href="profile/jose-pizarro">José Pizarro</a>, <a href="profile/jane-baxter">Jane Baxter</a>',
      }
    };

    const result = updateContributors(partialArticle, {
      contributors: [" "]
    });
    expect(result.contributors).toEqual(['profile/uyen-luu','profile/giorgiolocatelli','profile/meera-sodha','profile/jose-pizarro','profile/jane-baxter']);
  })
});
