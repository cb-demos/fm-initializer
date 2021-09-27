import axios from "axios";

require("dotenv").config();
import Rox from "rox-node";

const userToken = process.env.USER_TOKEN || "";
const appName = process.env.APP_NAME || "";

const environmentKeys: { [key: string]: any } = {
  production: {
    name: "Production",
    key: null,
  },
  preProd: {
    name: "Pre-Prod",
    key: null,
  },
  qa: {
    name: "QA",
    key: null,
  },
  dev: {
    name: "Dev",
    key: null,
  },
};

if (!userToken || !appName) {
  throw new Error("USER_TOKEN & APP_NAME environment variables required.");
}

const getHeaders = {
  accept: "application/json",
  authorization: `Bearer ${userToken}`,
};

let appId: string;

const postHeaders = {
  ...getHeaders,
  "content-type": "application/json",
};

async function setupFMAppAndEnvironment() {
  const { data: applications } = await axios.get(
    "https://x-api.rollout.io/public-api/applications",
    {
      headers: getHeaders,
    }
  );
  const appMatches = applications.filter(
    (item: { name: string; id: string }) => item.name === appName
  );
  if (appMatches.length > 0) {
    appId = appMatches[0].id;
    if (appMatches.length > 1) {
      console.log(`Multiple matching apps found, using ${appId}`);
    }
    console.log(`Matching app found, using ${appId}`);
  } else {
    console.log("No existing app with desired name, creating now.");
    await timer(1500);
    const { data: newApplication } = await axios.post(
      "https://x-api.rollout.io/public-api/applications",
      {
        applicationName: appName,
      },
      {
        headers: postHeaders,
      }
    );
    appId = newApplication.id;
    await timer(5000);
    console.log(`Created new app ${appName} with id ${newApplication.id}`);
  }

  //  Get current environments
  await timer(1500);
  const { data: environments } = await axios.get(
    `https://x-api.rollout.io/public-api/applications/${appId}/environments`,
    {
      headers: getHeaders,
    }
  );
  for (const [key, value] of Object.entries(environmentKeys)) {
    const match = environments.filter(
      (env: { name: string }) => env.name === value.name
    );
    if (match.length > 0) {
      //  If they do exist, update the map
      console.log(`Environment ${value.name} already exists.`);
      environmentKeys[key].key = match[0].key;
    } else {
      // Otherwise create them
      await timer(1500);
      const { data: environment } = await axios.put(
        `https://x-api.rollout.io/public-api/applications/${appId}/environments/key`,
        {
          name: value.name,
          description: `${value.name} Environment`,
        },
        {
          headers: postHeaders,
        }
      );
      environmentKeys[key].key = environment.key;
      console.log(`Environment ${value.name} created`);
    }
  }
}

async function createTargetGroups() {
  await timer(1500);
  const { data: currentTargetGroups } = await axios.get(
    `https://x-api.rollout.io/public-api/applications/${appId}/target-groups`,
    {
      headers: getHeaders,
    }
  );

  for (const tg of targetGroups) {
    const match = currentTargetGroups.filter(
      (item: { name: string }) => item.name === tg.name
    );
    if (match > 0) {
      console.log(`Target group ${tg.name} already exists`);
    } else {
      await timer(1500);
      const { data: newTargetGroup } = await axios.put(
        `https://x-api.rollout.io/public-api/applications/${appId}/target-groups`,
        tg,
        {
          headers: postHeaders,
        }
      );
      console.log(`Created ${tg.name}`);
    }
  }
}

const flags = {
  contrastButton: new Rox.Flag(),
};

Rox.setCustomBooleanProperty("isBetaUser", false);
Rox.setCustomStringProperty("accountType", "dental");

async function initRollout() {
  const options = {};

  Rox.register("frontend", flags);

  await Rox.setup(environmentKeys.production.key, options);
}

(async () => {
  try {
    await setupFMAppAndEnvironment();
    await initRollout();
    await createTargetGroups();
    console.log("Done loading CloudBees Feature Management");
    process.exit(0);
  } catch (e) {
    console.error(e);
  }
})();

// Current FM rate limit is 1req/sec so need to timeout to avoid hitting those
const timer = (ms: number | undefined) => {
  return new Promise((res) => setTimeout(res, ms));
};

const targetGroups = [
  {
    type: "target-group",
    name: "betaUsers",
    conditions: [{ operator: "is-true", property: "isBetaUser" }],
  },
  {
    type: "target-group",
    name: "dentalCustomers",
    conditions: [
      {
        operator: "in-array",
        property: "accountType",
        operand: ["dental", "all-in-one"],
      },
    ],
  },
  {
    type: "target-group",
    name: "visionCustomers",
    conditions: [
      {
        operator: "in-array",
        property: "accountType",
        operand: ["vision", "all-in-one"],
      },
    ],
  },
  {
    type: "target-group",
    name: "healthCustomers",
    conditions: [
      {
        operator: "in-array",
        property: "accountType",
        operand: ["health", "all-in-one"],
      },
    ],
  },
];
