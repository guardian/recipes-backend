import {AssetType} from "@guardian/content-api-models/v1/assetType";
import type {Content} from "@guardian/content-api-models/v1/content";
import {ContentType} from "@guardian/content-api-models/v1/contentType";
import {ElementType} from "@guardian/content-api-models/v1/elementType";
import {registerMetric} from "@recipes-api/cwmetrics";
import {extractAllRecipesFromArticle} from "./extract-recipes";
import {makeCapiDateTime} from "./utils";

jest.mock("@recipes-api/cwmetrics", () => ({
  registerMetric: jest.fn(),
}));

jest.mock("./config", () => ({}));

describe("extractAllRecipesFromAnArticle", () => {

  it("should work if main and body block contains one recipe each", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
              type: ElementType.RECIPE,
              assets: [],
              recipeTypeData: {
                recipeJson: "{\"id\":\"0009782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
              }
            },
            {
              type: ElementType.IMAGE,
              assets: [
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/2000.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 2000,
                    height: 1200
                  }
                },
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
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/140.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 140,
                    height: 84
                  }
                },
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/5512.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 5512,
                    height: 3308
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
            },
            elements: [
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              },
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
                  recipeJson: "{\"id\":\"9782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound.length).toEqual(2)
    expect(recipesFound[0]?.recipeUID).toEqual("0009782ef45121589b29656a0e4ee9f8525c0be62e6")
    expect(recipesFound[1]?.recipeUID).toEqual("9782ef45121589b29656a0e4ee9f8525c0be62e6")
    expect(registerMetric).toHaveBeenCalled()
    expect(registerMetric).toBeCalledTimes(2)
  })


  it("should work if main and body blocks contains multiple recipes", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
              type: ElementType.RECIPE,
              assets: [],
              recipeTypeData: {
                recipeJson: "{\"id\":\"1-9782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
              }
            },
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
                recipeJson: "{\"id\":\"2-9782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
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
                  recipeJson: "{\"id\":\"3-9782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
                }
              },
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              },
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
                  recipeJson: "{\"id\":\"4-9782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound.length).toEqual(4)
    expect(recipesFound[0]?.recipeUID).toEqual("1-9782ef45121589b29656a0e4ee9f8525c0be62e6")
    expect(recipesFound[1]?.recipeUID).toEqual("2-9782ef45121589b29656a0e4ee9f8525c0be62e6")
    expect(recipesFound[2]?.recipeUID).toEqual("3-9782ef45121589b29656a0e4ee9f8525c0be62e6")
    expect(recipesFound[3]?.recipeUID).toEqual("4-9782ef45121589b29656a0e4ee9f8525c0be62e6")
  })


  it("should return empty array when main and body blocks contains no recipe", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
            },
            elements: [
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound.length).toEqual(0)
  })


  it("should return empty array if main and body blocks contains invalid recipe (no ID)", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
            },
            elements: [
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound.length).toEqual(0)
  })


  it("should work if both main and body block contains invalid recipes (no ID)", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
              type: ElementType.RECIPE,
              assets: [],
              recipeTypeData: {
                recipeJson: "{\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
              }
            },
            {
              type: ElementType.IMAGE,
              assets: [
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/2000.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 2000,
                    height: 1200
                  }
                },
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
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/140.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 140,
                    height: 84
                  }
                },
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/5512.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 5512,
                    height: 3308
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
            },
            elements: [
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              },
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
                  recipeJson: "{\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound).toEqual([])
  })

  it("should return only 1 recipe if main contains single valid and body block contains single invalid recipe (no ID)", async () => {
    const articleContent: Content = {
      tags: [],
      id: "lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      type: ContentType.ARTICLE,
      sectionId: "lifeandstyle",
      sectionName: "Life and style",
      webPublicationDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
      webTitle: "Thomasina Miers’ recipe for soba noodles with rainbow vegetables in a sesame seed dressing",
      webUrl: "http://www.code.dev-theguardian.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      apiUrl: "http://content.code.dev-guardianapis.com/lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers",
      references: [],
      blocks: {
        main: {
          id: "5a4b754ce4b0e33567c465c7",
          bodyHtml: "<figure class=\"element element-image\" data-media-id=\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\"> <img src=\"https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/1000.jpg\" alt=\"Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.\" width=\"1000\" height=\"600\" class=\"gu-image\" /> <figcaption> <span class=\"element-image__caption\">Thomasina Miers’ soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing.</span> <span class=\"element-image__credit\">Photograph: Louise Hagger for the Guardian. Food styling: Emily Kydd. Prop styling: Jennifer Kay</span> </figcaption> </figure>",
          bodyTextSummary: "",
          attributes: {},
          published: true,
          createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          publishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
          lastModifiedDate: makeCapiDateTime("2018-01-02T12:05:04Z"),
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
              type: ElementType.RECIPE,
              assets: [],
              recipeTypeData: {
                recipeJson: "{\"id\":\"0009782ef45121589b29656a0e4ee9f8525c0be62e6\",\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
              }
            },
            {
              type: ElementType.IMAGE,
              assets: [
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/2000.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 2000,
                    height: 1200
                  }
                },
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
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/140.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 140,
                    height: 84
                  }
                },
                {
                  type: AssetType.IMAGE,
                  mimeType: "image/jpeg",
                  file: "https://media.guim.co.uk/58c32a98ae4463b5129bf717b1b2312d8ffc0d45/0_318_5512_3308/5512.jpg",
                  typeData: {
                    aspectRatio: "5:3",
                    width: 5512,
                    height: 3308
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
        },
        body: [
          {
            id: "c639832d-de71-4290-b493-6a1db0bc0e76",
            bodyHtml: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> <p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> <p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> <h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> <p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> <p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> <p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> <p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> <p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> <p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p> <aside class=\"element element-rich-link element--thumbnail\"> <p> <span>Related: </span><a href=\"https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers\">Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce</a> </p> </aside>  <p>Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve.</p> <p><strong>And for the rest of the week…</strong></p> <p>So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.</p>  <!-- Recipe element -->",
            bodyTextSummary: "More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break. Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins. So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague Meera Sodha’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice. Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six. 200g soba or glass noodles 50g frozen soya beans 1 tbsp sesame oil 2 carrots, peeled, then grated or cut into thin ribbons 150g red cabbage, finely shredded 100g mooli or radishes, cut into matchsticks or thin slivers 1 green apple 3 spring onions, finely sliced 1 small bunch coriander, roughly chopped 1 handful mint leaves, roughly torn 1 handful basil leaves (or more coriander), roughly chopped 40g toasted sunflower seeds 25g toasted sesame seeds (a mixture of black and white looks good), to serve For the dressing 1 thumb-sized chunk fresh ginger, peeled ½ garlic clove 50g tahini Juice of 1 lime 1 tbsp sriracha (or your favourite style of chilli sauce) 1 bird’s-eye chilli, stalked removed (optional) 1 tbsp soy sauce 1 tbsp demerara sugar (or honey) 3 tbsp sesame oil 25ml water Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart). Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\nRoughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped. Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again. With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream. If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together. Toss the dressing through the salad and season to taste; it may need more lime juice. Scatter the sesame seeds on top and serve. And for the rest of the week… So long as it’s undressed and covered, the salad will keep in the crisper drawer for a few days. The dressing works well on all sorts of veg, from strips of red pepper to bean sprouts or sliced crisp turnips. And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.",
            attributes: {},
            published: true,
            createdDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            firstPublishedDate: makeCapiDateTime("2018-01-05T17:00:18Z"),
            publishedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            lastModifiedDate: makeCapiDateTime("2023-11-16T12:20:10Z"),
            contributors: [],
            createdBy: {
              email: "bob.granleese@guardian.co.uk",
              firstName: "Bob",
              lastName: "Granleese"
            },
            lastModifiedBy: {
              email: "andy.gallagher@guardian.co.uk",
              firstName: "Andy",
              lastName: "Gallagher"
            },
            elements: [
              {
                type: ElementType.TEXT,
                assets: [],
                textTypeData: {
                  html: "<p>More food: really? After two weeks of leftover roast potatoes dipped in mayonnaise for elevenses (because it’s Christmas), cake in the middle of the afternoon (ditto), mince pies drowning in rum butter and cream after practically every meal, endless cheese? I very rarely say this, but I’m ready for a break.</p> \n<p>Not a break full stop – I have a greedy reputation to uphold, after all – but more a break from traditional foods, and in my post-Christmas delirium I keep thinking back to a blissful few weeks once spent in southern India, and to its richly spiced and largely vegetarian diet. We ate vast amounts, yet returned home feeling light and refreshed after this welcome holiday from heavy proteins.</p> \n<p>So, this week, I am going light on meat and heavy on vegetables (and without straying too far into my colleague <a href=\"https://www.theguardian.com/profile/meera-sodha\">Meera Sodha</a>’s territory). By all means pair today’s salad with fried fish, if that’s what you fancy, or chargrilled onglet, but I’ll be eating a big plateful on its own. Or perhaps as a side to some egg-fried rice.</p> \n<h2><strong>Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing</strong></h2> \n<p>This riotously bright salad is crunchy, light and, with its flavour-packed dressing, intensely savoury, making it the perfect antidote to January. A ribbon peeler or mandoline will help with the prep enormously. Serves six.<br></p> \n<p><strong>200g soba or glass noodles</strong><br><strong>50g frozen soya beans</strong><br><strong>1 tbsp sesame oil</strong><br><strong>2 carrots, peeled, then grated or cut into thin ribbons</strong><br><strong>150g red cabbage, finely shredded</strong><br><strong>100g mooli or radishes, cut into matchsticks or thin slivers</strong><br><strong>1 green apple</strong><br><strong>3 spring onions, finely sliced </strong><br><strong>1 small bunch coriander, roughly chopped</strong><br><strong>1 handful mint leaves, roughly torn</strong><br><strong>1 handful basil leaves (or more coriander), roughly chopped</strong><br><strong>40g toasted sunflower seeds </strong><br><strong>25g toasted sesame seeds (a mixture of black and white looks good), to serve</strong></p> \n<p>For the dressing<br><strong>1 thumb-sized chunk fresh ginger, peeled</strong><br><strong>½ garlic clove</strong><br><strong>50g tahini</strong><br><strong>Juice of 1 lime</strong><br><strong>1 tbsp sriracha (or your favourite style of chilli sauce)</strong><br><strong>1 bird’s-eye chilli, stalked removed (optional)</strong><br><strong>1 tbsp soy sauce</strong><br><strong>1 tbsp demerara sugar</strong><br><strong> (or honey)</strong></p> \n<p><strong>3 tbsp sesame oil</strong><br><strong>25ml water</strong></p> \n<p>Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch. Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).</p> \n<p>Add the carrots, red cabbage and mooli or radishes to the bowl. Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander. Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).</p>"
                }
              },
              {
                type: ElementType.RICH_LINK,
                assets: [],
                richLinkTypeData: {
                  url: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  originalUrl: "https://www.theguardian.com/lifeandstyle/2017/dec/15/roast-winter-vegetables-walnut-pomegranate-sauce-recipe-fesenjan-thomasina-miers",
                  linkText: "Thomasina Miers’ recipe for roast winter vegetables with walnut and pomegranate sauce",
                  linkPrefix: "Related: ",
                  role: "thumbnail"
                }
              },
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
                  recipeJson: "{\"canonicalArticle\":\"lifeandstyle/2018/jan/05/soba-noodle-salad-vegetables-spicy-sesame-dressing-recipe-thomasina-miers\",\"title\":\"Soba noodles with crisp rainbow vegetables and a spicy sesame seed dressing\",\"featuredImage\":\"58c32a98ae4463b5129bf717b1b2312d8ffc0d45\",\"contributors\":[],\"byline\":[\"Thomasina Miers\"],\"ingredients\":[{\"recipeSection\":\"For the dressing\",\"ingredientsList\":[{\"amount\":{\"min\":200.0,\"max\":200.0},\"unit\":\"g\",\"name\":\"soba\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"frozen soya beans\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":2.0,\"max\":2.0},\"unit\":\"\",\"name\":\"carrots\",\"optional\":true},{\"amount\":{\"min\":150.0,\"max\":150.0},\"unit\":\"g\",\"name\":\"red cabbage\",\"optional\":true},{\"amount\":{\"min\":100.0,\"max\":100.0},\"unit\":\"g\",\"name\":\"mooli\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"green apple\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"\",\"name\":\"spring onions\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"small bunch\",\"name\":\"coriander\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"mint leaves\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"handful\",\"name\":\"basil leaves\",\"optional\":true},{\"amount\":{\"min\":40.0,\"max\":40.0},\"unit\":\"g\",\"name\":\"toasted sunflower seeds\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"g\",\"name\":\"toasted sesame seeds\",\"optional\":true}]},{\"recipeSection\":\"And for the rest of the week…\",\"ingredientsList\":[{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"thumb\",\"name\":\"fresh ginger\",\"optional\":true},{\"amount\":{\"min\":0.5,\"max\":0.5},\"unit\":\"clove\",\"name\":\"garlic\",\"optional\":true},{\"amount\":{\"min\":50.0,\"max\":50.0},\"unit\":\"g\",\"name\":\"tahini\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"lime\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"sriracha\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"\",\"name\":\"bird’s\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"soy sauce\",\"optional\":true},{\"amount\":{\"min\":1.0,\"max\":1.0},\"unit\":\"tbsp\",\"name\":\"demerara sugar\",\"optional\":true},{\"unit\":\"\",\"name\":\"\",\"optional\":true},{\"amount\":{\"min\":3.0,\"max\":3.0},\"unit\":\"tbsp\",\"name\":\"sesame oil\",\"optional\":true},{\"amount\":{\"min\":25.0,\"max\":25.0},\"unit\":\"ml\",\"name\":\"water\",\"optional\":true}]}],\"suitableForDietIds\":[],\"cuisineIds\":[],\"mealTypeIds\":[],\"celebrationsIds\":[\"summer-food-and-drink\"],\"utensilsAndApplianceIds\":[],\"techniquesUsedIds\":[],\"timings\":[],\"instructions\":[{\"stepNumber\":0,\"description\":\"Cook the noodles in boiling water according to the packet instructions, and add the soya beans for the final minute of cooking, to blanch.\",\"images\":[]},{\"stepNumber\":1,\"description\":\"Drain and rinse under cold water until cool and no longer clumping together, then put in a large salad bowl and toss with a tablespoon of sesame oil to coat (this will help keep the noodles apart).\",\"images\":[]},{\"stepNumber\":2,\"description\":\"Add the carrots, red cabbage and mooli or radishes to the bowl.\",\"images\":[]},{\"stepNumber\":3,\"description\":\"Peel, core and finely shred the apple directly into the bowl, then add the spring onions and coriander.\",\"images\":[]},{\"stepNumber\":4,\"description\":\"Add the picked herb leaves and pop the bowl in the fridge while you get on with the dressing (covered, if you’re not eating straight away).\",\"images\":[]},{\"stepNumber\":5,\"description\":\"Roughly chop the ginger, put it in a food processor with the garlic and tahini, and blitz until finely chopped.\",\"images\":[]},{\"stepNumber\":6,\"description\":\"Add the lime, sriracha, chilli (if using), soy sauce and sugar, and blitz again.\",\"images\":[]},{\"stepNumber\":7,\"description\":\"With the motor running slowly, add the sesame oil bit by bit, followed by the water, and process until the dressing is the consistency of double cream.\",\"images\":[]},{\"stepNumber\":8,\"description\":\"If the dressing looks as if it has split, put a tablespoon of tahini in a bowl, then slowly whisk in the split dressing – it should quickly come back together.\",\"images\":[]},{\"stepNumber\":9,\"description\":\"Toss the dressing through the salad and season to taste; it may need more lime juice.\",\"images\":[]},{\"stepNumber\":10,\"description\":\"Scatter the sesame seeds on top and serve.\",\"images\":[]},{\"stepNumber\":11,\"description\":\"And if you want to add a meaty element, toss through some hot griddled strips of beef or pork tenderloin.\",\"images\":[]}]}"
                }
              }
            ]
          }
        ],
        totalBodyBlocks: 1
      },
      isHosted: false
    }

    const recipesFound = await extractAllRecipesFromArticle(articleContent)
    expect(recipesFound.length).toEqual(1)
    expect(recipesFound[0]?.recipeUID).toEqual("0009782ef45121589b29656a0e4ee9f8525c0be62e6")
  })


})
