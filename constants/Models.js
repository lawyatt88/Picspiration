const Clarifai = require('clarifai');

const models = [
    {id: Clarifai.GENERAL_MODEL,
    name: 'General'},
    {id: Clarifai.FOOD_MODEL,
    name: 'Food'},
    {id: Clarifai.NSFW_MODEL,
    name: 'NSFW'},
    {id: Clarifai.TRAVEL_MODEL,
    name: 'Travel'},
    {id: Clarifai.WEDDING_MODEL,
    name: 'Wedding'}
  ]

  export default models