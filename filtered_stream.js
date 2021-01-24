const needle = require("needle");
const DB = require("./db/mongo");

const Model = require("./db/model");
const config = require("./config/index");

//db connection
const DB_URI = `mongodb+srv://${config.db.db_user}:${config.db.db_password}@puentech.4m87s.mongodb.net/${config.db.db_name}?retryWrites=true&w=majority`;
DB(DB_URI);

const token = config.twitterAPI.bearer_token;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=context_annotations,geo,lang,public_metrics,created_at&expansions=author_id,geo.place_id&place.fields=id,country,country_code,full_name&user.fields=location";

// Edit rules as desired here below
const rules = [
  // { 'value': 'dog has:images -is:retweet', 'tag': 'dog pictures' },
  // { 'value': 'cat has:images -grumpy', 'tag': 'cat pictures' },
  {
    value: "#govtech govtech",
    tag: "govtech",
  },
  {
    value: "#whatsapp whatsapp has:images -is:retweet",
    tag: "whatsapp",
  },
  {
    value: "#tech #technology tech technology -is:retweet",
    tag: "tech",
  },
  {
    value: "#facebook facebook has:images -is:retweet",
    tag: "facebook",
  },
];

async function getAllRules() {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
    return null;
  }

  return response.body;
}

async function deleteAllRules(rules) {
  if (!Array.isArray(rules.data)) {
    return null;
  }

  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
    return null;
  }

  return response.body;
}

async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
    return null;
  }

  return response.body;
}

function streamConnect(token) {
  //Listen to the stream
  const options = {
    timeout: 1000 * 60 * 12,
  };

  const stream = needle.get(
    streamURL,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    options
  );

  stream
    .on("data", async (data) => {
      try {
        const json = await JSON.parse(data);

        const myTweet = {
          _id: json.data.id,
          text: json.data.text,
          description:
            json.data.context_annotations[0].domain.description || "",
          created_at: json.data.created_at,
          lang: json.data.lang || "",
          label: [],
          matching_rules: json.matching_rules,
          user: json.includes.users[0],
          context_annotations: json.data.context_annotations || "",
        };

        myTweet.matching_rules.forEach((rule) => myTweet.label.push(rule.tag));
        const newTweet = new Model(myTweet);

        //validate that document dont already exist
        const exist = await getTweetById(Model, myTweet._id);

        //if not exists save it
        if (!exist) {
          newTweet.save((err, data) => {
            err
              ? console.error(err)
              : console.log({
                  id: data._id,
                  context_annotations: myTweet.context_annotations || "",
                });
          });
        }
      } catch (e) {
        // Keep alive signal received. Do nothing.
      }
    })
    .on("error", (error) => {
      if (error.code === "TIMEOUT") {
        stream.emit("timeout");
      }
    });

  return stream;
}

(async () => {
  let currentRules;

  try {
    // Gets the complete list of rules currently applied to the stream
    currentRules = await getAllRules();

    // Delete all rules. Comment the line below if you want to keep your existing rules.
    await deleteAllRules(currentRules);

    // Add rules to the stream. Comment the line below if you don't want to add new rules.
    await setRules();
  } catch (e) {
    console.error("SET RULES ERROR: ", e);
    process.exit(-1);
  }

  // Listen to the stream.
  // This reconnection logic will attempt to reconnect when a disconnection is detected.
  // To avoid rate limites, this logic implements exponential backoff, so the wait time
  // will increase if the client cannot reconnect to the stream.

  const filteredStream = streamConnect(token);
  let timeout = 0;
  let attempts = 0;
  filteredStream.on("timeout", () => {
    // Reconnect on error
    console.warn("A connection error occurred. Reconnecting…");
    setInterval(() => {
      attempts++;
      console.warn("Attempts to Reconnect: ", attempts);
      timeout += 1000;
      streamConnect(token);
    }, 10000 + timeout);
    streamConnect(token);
  });
})();

async function getTweetById(Model, id) {
  let exist;

  await Model.findById({ _id: id }, (err, data) => {
    if (err) {
      console.error("couldn found document");
      return (exist = true);
    }
    if (data) {
      console.error("[Error:] This tweet is already on the collection");
      return (exist = true);
    }
    return (exist = false);
  });
  return exist;
}
