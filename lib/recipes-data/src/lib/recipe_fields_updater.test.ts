import type {Content} from "@guardian/content-api-models/v1/content";
import {updateByline, updateContributors} from "./recipe_fields_updater";

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

describe("recipe_fields_updater.updateByline", ()=>{
  it("should take the content byline if there is no byline nor contributors array", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="https://www.booktrust.org.uk/book/b/barry-the-fish-with-fingers-and-the-hairy-scary-monster/">Barry</a>, Norman, Keith and NoBot',
        byline: 'Barry, Norman, Keith and NoBot'
      }
    }

    const result = updateByline(partialArticle, {

    });
    expect(result.byline).toEqual("Barry, Norman, Keith and NoBot");
  });

  it("should ignore the content byline if there is already a byline", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="https://www.booktrust.org.uk/book/b/barry-the-fish-with-fingers-and-the-hairy-scary-monster/">Barry</a>, Norman, Keith and NoBot',
        byline: 'Barry, Norman, Keith and NoBot'
      }
    }

    const result = updateByline(partialArticle, {
      byline: 'NoBot, the robot with no bottom'
    });
    expect(result.byline).toEqual("NoBot, the robot with no bottom");
  });

  it("should ignore the content byline if there is a populated contributors array", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="https://www.booktrust.org.uk/book/b/barry-the-fish-with-fingers-and-the-hairy-scary-monster/">Barry</a>, Norman, Keith and NoBot',
        byline: 'Barry, Norman, Keith and NoBot'
      }
    }

    const result = updateByline(partialArticle, {
      contributors: ["https://booksforbugs.co.uk/product/norman-the-slug-with-the-silly-shell/"]
    });
    expect(result.byline).toBeUndefined();
  });

  it("should take the content byline if there is an un-populated contributors array", ()=>{
    // @ts-ignore
    const partialArticle:Content = {
      fields: {
        bylineHtml: '<a href="https://www.booktrust.org.uk/book/b/barry-the-fish-with-fingers-and-the-hairy-scary-monster/">Barry</a>, Norman, Keith and NoBot',
        byline: 'Barry, Norman, Keith and NoBot'
      }
    }

    const result = updateByline(partialArticle, {
      contributors: [" "]
    });
    expect(result.byline).toEqual('Barry, Norman, Keith and NoBot');
  });
})
