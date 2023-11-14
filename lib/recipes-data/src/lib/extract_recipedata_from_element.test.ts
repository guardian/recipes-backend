import {response} from "./../res/recipejson-example.json";
import {extractRecipeData, RecipeOutput} from "./extract_recipedata_from_element";
import type {Block} from "@guardian/content-api-models/v1/block";


describe("extractRecipeData", () => {

  it("block containing multiple recipe elements ", () => {
    const webUrl = response.results[0].webUrl
    const block: Block = {
      "id": "5a4b754ce4b0e33567c465c7",
      "bodyHtml": "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      "bodyTextSummary": "",
      "attributes": {},
      "published": true,
      "contributors": [],
      "createdBy": {
        "email": "stephanie.fincham@guardian.co.uk",
        "firstName": "Stephanie",
        "lastName": "Fincham"
      },
      "lastModifiedBy": {
        "email": "stephanie.fincham@guardian.co.uk",
        "firstName": "Stephanie",
        "lastName": "Fincham"
      },
      "elements": [
        {
          "type": "image",
          "assets": [
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/2000.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 2000,
                "height": 1200
              }
            },
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 1000,
                "height": 600
              }
            },
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 500,
                "height": 300
              }
            },
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/140.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 140,
                "height": 84
              }
            },
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/5512.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 5512,
                "height": 3308
              }
            },
            {
              "type": "image",
              "mimeType": "image/jpeg",
              "file": "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              "typeData": {
                "aspectRatio": "5:3",
                "width": 5512,
                "height": 3308,
                "isMaster": true
              }
            }
          ],
          "imageTypeData": {
            "caption": "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            "copyright": "LOUISE HAGGER",
            "displayCredit": true,
            "credit": "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            "source": "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            "alt": "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            "mediaId": "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            "mediaApiUri": "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            "suppliersReference": "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            "imageType": "Photograph"
          }
        }
      ]
    }
    const result = extractRecipeData(webUrl, block)
    expect(result).toEqual({UId: "", jsonData: ""})
  })

  it("block containing no recipe elements", () => {

  })

  it("block with an invalid recipe element (no ID field)", () => {

  })


})
