# TO-DO List Project

Build a simple web-based to-do list that uses IBM Cloudant as the store of the to-do items.

## Pre-requisites

Sign up for an [IBM Cloud account](https://cloud.ibm.com)  and provision a free [Cloudant service](https://cloud.ibm.com/catalog/services/cloudant).

## Installation

Clone this repo and cd into it

```
npm install
export CLOUDANT_URL=<value_from_Cloudant_service_credentials> (e.g. "https://34b15485ikrt5-f77a60944371-bluemix.cloudantnosqldb.appdomain.cloud")
export CLOUDANT_APIKEY=<value_from_Cloudant_service_credentials>
npm run start
```

Visit http://localhost:8080
