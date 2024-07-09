import {AssetType} from "@guardian/content-api-models/v1/assetType";
import type {Block} from "@guardian/content-api-models/v1/block";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import type {Sponsorship} from "@guardian/content-api-models/v1/sponsorship";
import {SponsorshipType} from "@guardian/content-api-models/v1/sponsorshipType";
import {extractRecipeData} from "./extract-recipes";
import {makeCapiDateTime} from './utils';

jest.mock('./config', () => ({
  FeaturedImageWidth: 700,
  PreviewImageWidth: 300,
  ImageDpr: 1,
}));

describe("extractRecipeData", () => {

  it("should work when block containing single recipe element", () => {
    const canonicalId = "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers"
    const block: Block = {
      id: "5a4b754ce4b0e33567c465c7",
      bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      bodyTextSummary: "",
      attributes: {},
      published: true,
      contributors: [],
      createdBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      lastModifiedBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      elements: [
        {
          type: ElementType.TEXT,
          assets: [],
          textTypeData: {
            html: "<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"id\":\"1\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[{\"type\":\"contributor\",\"tagId\":\"profile/thomasina-miers\"}],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.IMAGE,
          assets: [
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 1000,
                height: 600
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 500,
                height: 300
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 5512,
                height: 3308,
                isMaster: true
              }
            }
          ],
          imageTypeData: {
            caption: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            copyright: "LOUISE HAGGER",
            displayCredit: true,
            credit: "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            source: "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            alt: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            mediaId: "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            mediaApiUri: "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            suppliersReference: "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            imageType: "Photograph"
          }
        }
      ]
    }
    const result = extractRecipeData(canonicalId, block, [])
    expect(result.length).toEqual(1)
    expect(result[0]?.recipeUID).toEqual("62ac3f0f98f6495cbefd72c11fac6d1e26390e99")
    const originalContent = block.elements[1].recipeTypeData?.recipeJson ? JSON.parse(block.elements[1].recipeTypeData.recipeJson) as Record<string, unknown> : {};
    const expected = JSON.stringify({...originalContent, contributors: ["profile/thomasina-miers"], byline: []});
    expect(result[0]?.jsonBlob).toEqual(expected);
  })

  it("should work when block containing multiple recipe elements", () => {
    const canonicalId = "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers"
    const block: Block = {
      id: "5a4b754ce4b0e33567c465c7",
      bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      bodyTextSummary: "",
      attributes: {},
      published: true,
      contributors: [],
      createdBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      lastModifiedBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      elements: [
        {
          type: ElementType.TEXT,
          assets: [],
          textTypeData: {
            html: "<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"id\":\"1\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[{\"type\":\"contributor\",\"tagId\":\"profile/thomasina-miers\"}],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"id\":\"1\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[{\"type\":\"contributor\",\"tagId\":\"profile/thomasina-miers\"}],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"id\":\"1\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[{\"type\":\"contributor\",\"tagId\":\"profile/thomasina-miers\"}],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.IMAGE,
          assets: [
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 1000,
                height: 600
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 500,
                height: 300
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 5512,
                height: 3308,
                isMaster: true
              }
            }
          ],
          imageTypeData: {
            caption: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            copyright: "LOUISE HAGGER",
            displayCredit: true,
            credit: "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            source: "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            alt: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            mediaId: "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            mediaApiUri: "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            suppliersReference: "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            imageType: "Photograph"
          }
        }
      ]
    }
    const result = extractRecipeData(canonicalId, block, [])
    expect(result.length).toEqual(3)
    expect(result[2]?.recipeUID).toEqual("62ac3f0f98f6495cbefd72c11fac6d1e26390e99")
    const originalContent = block.elements[3].recipeTypeData?.recipeJson ? JSON.parse(block.elements[3].recipeTypeData.recipeJson) as Record<string, unknown> : {};
    const expected = JSON.stringify({...originalContent, contributors: ["profile/thomasina-miers"], byline: []});
    expect(result[2]?.jsonBlob).toEqual(expected);
  })

  it("should work when block containing no recipe elements ", () => {
    const canonicalId = "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers"
    const block: Block = {
      id: "5a4b754ce4b0e33567c465c7",
      bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      bodyTextSummary: "",
      attributes: {},
      published: true,
      contributors: [],
      createdBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      lastModifiedBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      elements: [
        {
          type: ElementType.TEXT,
          assets: [],
          textTypeData: {
            html: "<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>"
          }
        },
        {
          type: ElementType.IMAGE,
          assets: [
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 1000,
                height: 600
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 500,
                height: 300
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 5512,
                height: 3308,
                isMaster: true
              }
            }
          ],
          imageTypeData: {
            caption: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            copyright: "LOUISE HAGGER",
            displayCredit: true,
            credit: "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            source: "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            alt: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            mediaId: "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            mediaApiUri: "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            suppliersReference: "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            imageType: "Photograph"
          }
        }
      ]
    }
    const result = extractRecipeData(canonicalId, block, [])
    expect(result.length).toEqual(0)
  })


  it("should return empty array when block has got invalid recipe element (no ID field) ", () => {
    const canonicalId = "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers"
    const block: Block = {
      id: "5a4b754ce4b0e33567c465c7",
      bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      bodyTextSummary: "",
      attributes: {},
      published: true,
      contributors: [],
      createdBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      lastModifiedBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      elements: [
        {
          type: ElementType.TEXT,
          assets: [],
          textTypeData: {
            html: "<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":\"Thomasina Miers\",\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.IMAGE,
          assets: [
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 1000,
                height: 600
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 500,
                height: 300
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 5512,
                height: 3308,
                isMaster: true
              }
            }
          ],
          imageTypeData: {
            caption: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            copyright: "LOUISE HAGGER",
            displayCredit: true,
            credit: "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            source: "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            alt: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            mediaId: "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            mediaApiUri: "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            suppliersReference: "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            imageType: "Photograph"
          }
        }
      ]
    }
    const recipesFound = extractRecipeData(canonicalId, block, [])
    expect(recipesFound).toEqual([null])
    expect(recipesFound.length).toEqual(1)
  })

  it("should work when block containing recipe element and sponsorship data as well", () => {
    const canonicalId = "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers"
    const block: Block = {
      id: "5a4b754ce4b0e33567c465c7",
      bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
      bodyTextSummary: "",
      attributes: {},
      published: true,
      contributors: [],
      createdBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      lastModifiedBy: {
        email: "stephanie.fincham@guardian.co.uk",
        firstName: "Stephanie",
        lastName: "Fincham"
      },
      elements: [
        {
          type: ElementType.TEXT,
          assets: [],
          textTypeData: {
            html: "<p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> \n<p><strong>And for the rest of the week…</strong></p> \n<p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>"
          }
        },
        {
          type: ElementType.RECIPE,
          assets: [],
          recipeTypeData: {
            recipeJson: "{\"id\":\"1\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[{\"type\":\"contributor\",\"tagId\":\"profile/thomasina-miers\"}],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"item\":\"soba\",\"unit\":\"g\",\"comment\":\"or glass noodles\",\"text\":\"200g soba or glass noodles\"},{\"item\":\"frozen soya beans\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g frozen soya beans\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp sesame oil\"},{\"item\":\"carrots\",\"unit\":\"\",\"comment\":\"peeled then grated or cut into thin ribbons\",\"text\":\"2 carrots, peeled, then grated or cut into thin ribbons\"},{\"item\":\"red cabbage\",\"unit\":\"g\",\"comment\":\"finely shredded\",\"text\":\"150g red cabbage, finely shredded\"},{\"item\":\"mooli\",\"unit\":\"g\",\"comment\":\"or radishes cut into matchsticks or thin slivers\",\"text\":\"100g mooli or radishes, cut into matchsticks or thin slivers\"},{\"item\":\"green apple\",\"unit\":\"\",\"comment\":\"\",\"text\":\"1 green apple\"},{\"item\":\"spring onions\",\"unit\":\"\",\"comment\":\"finely sliced\",\"text\":\"3 spring onions, finely sliced\"},{\"item\":\"coriander\",\"unit\":\"small bunch\",\"comment\":\"roughly chopped\",\"text\":\"1 small bunch coriander, roughly chopped\"},{\"item\":\"mint leaves\",\"unit\":\"handful\",\"comment\":\"roughly torn\",\"text\":\"1 handful mint leaves, roughly torn\"},{\"item\":\"basil leaves\",\"unit\":\"handful\",\"comment\":\"or more coriander roughly chopped\",\"text\":\"1 handful basil leaves (or more coriander), roughly chopped\"},{\"item\":\"toasted sunflower seeds\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"40g toasted sunflower seeds\"},{\"item\":\"toasted sesame seeds\",\"unit\":\"g\",\"comment\":\"a mixture of black and white looks good to serve\",\"text\":\"25g toasted sesame seeds (a mixture of black and white looks good), to serve\"}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"item\":\"fresh ginger\",\"unit\":\"thumb\",\"comment\":\"sized chunk  peeled\",\"text\":\"1 thumb-sized chunk fresh ginger, peeled\"},{\"item\":\"garlic\",\"unit\":\"clove\",\"comment\":\"\",\"text\":\"½ garlic clove\"},{\"item\":\"tahini\",\"unit\":\"g\",\"comment\":\"\",\"text\":\"50g tahini\"},{\"item\":\"lime\",\"unit\":\"\",\"comment\":\"Juice of\",\"text\":\"Juice of 1 lime\"},{\"item\":\"sriracha\",\"unit\":\"tbsp\",\"comment\":\"or your favourite style of chilli sauce\",\"text\":\"1 tbsp sriracha (or your favourite style of chilli sauce)\"},{\"item\":\"bird’s\",\"unit\":\"\",\"comment\":\"eye chilli stalked removed optional\",\"text\":\"1 bird’s-eye chilli, stalked removed (optional)\"},{\"item\":\"soy sauce\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp soy sauce\"},{\"item\":\"demerara sugar\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"1 tbsp demerara sugar\"},{\"item\":\"\",\"unit\":\"\",\"comment\":\"or honey\",\"text\":\"(or honey)\"},{\"item\":\"sesame oil\",\"unit\":\"tbsp\",\"comment\":\"\",\"text\":\"3 tbsp sesame oil\"},{\"item\":\"water\",\"unit\":\"ml\",\"comment\":\"\",\"text\":\"25ml water\"}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
          }
        },
        {
          type: ElementType.IMAGE,
          assets: [
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 1000,
                height: 600
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/500.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 500,
                height: 300
              }
            },
            {
              type: AssetType.IMAGE,
              mimeType: "image/jpeg",
              file: "http://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/master/5512.jpg",
              typeData: {
                aspectRatio: "5:3",
                width: 5512,
                height: 3308,
                isMaster: true
              }
            }
          ],
          imageTypeData: {
            caption: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            copyright: "LOUISE HAGGER",
            displayCredit: true,
            credit: "Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            source: "Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay",
            alt: "Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.",
            mediaId: "58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            mediaApiUri: "https://api.media.gutools.co.uk/images/58c32a98ae4463b5129bf717b1b2312d8ffc0d45",
            suppliersReference: "Soba noodles with crisp rainbow vegetables and a spicy sesame se",
            imageType: "Photograph"
          }
        }
      ]
    }
    const activeSponsorships: Sponsorship[] = [
      {
        sponsorshipType: SponsorshipType.SPONSORED,
        sponsorName: "theguardian.org",
        sponsorLogo: "https://static.theguardian.com/commercial/sponsor/22/Feb/2024/f459c58b-6553-486d-939a-5f23fd935f78-Guardian.orglogos-for badge.png",
        sponsorLink: "https://theguardian.org/",
        aboutLink: "https://www.theguardian.com/global-development/2010/sep/14/about-this-site",
        sponsorLogoDimensions: {
          width: 280,
          height: 180
        },
        highContrastSponsorLogo: "https://static.theguardian.com/commercial/sponsor/22/Feb/2024/3d8e52dc-1d0b-4f95-8cd1-48a674e1309d-guardian.org new logo - white version (3).png",
        highContrastSponsorLogoDimensions: {
          width: 280,
          height: 180
        },
        validFrom: makeCapiDateTime("2023-09-21T16:18:10Z"),
        validTo: makeCapiDateTime("2026-08-30T23:00:00Z"),
      }
    ]
    const result = extractRecipeData(canonicalId, block, activeSponsorships)
    expect(result.length).toEqual(1)
    expect(result[0]?.recipeUID).toEqual("62ac3f0f98f6495cbefd72c11fac6d1e26390e99")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment -- this is safe
    const data = JSON.parse(JSON.parse(JSON.stringify(result))[0]?.jsonBlob)
    const sponsorsExists = "sponsors" in data
    expect(sponsorsExists).toBe(true)
  })


});
