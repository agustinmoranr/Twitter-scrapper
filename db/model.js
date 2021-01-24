const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mySchema = new Schema({
  _id: { type: String, required: true },
  text: { type: String, required: true },
  description: { type: String, required: false },
  created_at: { type: String, required: true },
  lang: { type: String, required: false },
  label: [{ type: String, required: true }],
  matching_rules: [
    {
      id: { type: String, required: true },
      tag: { type: String, required: true },
    },
  ],
  user: {
    id: { type: String, required: true },
    username: { type: String, required: true },
    location: { type: String, required: false },
  },
  context_annotations: [
    {
      entity: { type: Map, required: false },
      domain: { type: Map, required: false },
    },
  ],
});

const Model = mongoose.model("tweets", mySchema);

module.exports = Model;
