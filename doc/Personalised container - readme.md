## Personalized Container (cuisine based recommendation as of its launch on 12th March 2026\) 

####   What it does 

* Identifies a user's top cuisine based on their past interactions (“open\_recipe” events saved in BigQuery) \- (Only the top 20 most recent interactions per user are considered.)

* We have got provision of new table for us in the BQ diaspora just this purpose only  
  datatech-platform-prod.feast\_egress.feast\_personalisation\_unseen\_recipes

* We are recommending up to 20 unseen recipes matching their top cuisine that are 

* There is no minimum number of recipes opened required for this container to appear, so not enforcing a minimum threshold. If a user has opened fewer than 20 recipes or as long as they have at least one recipe interaction.  
* ![how to view this][image1]

####  GCS bucket

Regarding GCS bucket access which is present at the Data tech team side, we have been granted access for both Personalised code & prod GCS bucket. We can modify the code bucket files but not prod which is what we wanted.

#### Personalised container architecture:  ![diagram][image2]

#### References of associated repos for backend, personalised API and data platform ecosystem:

[https://github.com/guardian/recipes-backend](https://github.com/guardian/recipes-backend)

[https://github.com/guardian/personalised-app-experience](https://github.com/guardian/personalised-app-experience)

[https://github.com/guardian/gcp-iac-terraform](https://github.com/guardian/gcp-iac-terraform)

[https://github.com/guardian/ophan-data-lake](https://github.com/guardian/ophan-data-lake)

[https://github.com/guardian/data-platform-models](https://github.com/guardian/data-platform-models)

[image1]: ./Personalised-in-pipeline.png
[image2]: ./Personalised-archi-overview.png
