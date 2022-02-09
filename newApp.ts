import axios, { AxiosError } from "axios"

require("dotenv").config()

const email = process.env.EMAIL || ""
const userToken = process.env.USER_TOKEN || ""
const appName = process.env.APP_NAME || ""

type Applications = {
  [id: string]: {
    environments: {
      [environmentName: string]: "read" | "write"
    }
  }
}

if (!userToken || !appName) {
  throw new Error("USER_TOKEN & APP_NAME environment variables required.")
}

const getHeaders = {
  accept: "application/json",
  authorization: `Bearer ${userToken}`,
}

let appId: string

const postHeaders = {
  ...getHeaders,
  "content-type": "application/json",
}

async function setupFMAppAndEnvironment() {
  const { data: applications } = await axios.get(
    "https://x-api.rollout.io/public-api/applications",
    {
      headers: getHeaders,
    }
  )
  const appMatches = applications.filter(
    (item: { name: string; id: string }) => item.name === appName
  )
  if (appMatches.length > 0) {
    appId = appMatches[0].id
    if (appMatches.length > 1) {
      console.log(`Multiple matching apps found, using ${appId}`)
    }
    console.log(`Matching app found, using ${appId}`)
  } else {
    console.log("No existing app with desired name, creating now.")
    await timer(1500)
    const { data: newApplication } = await axios.post(
      "https://x-api.rollout.io/public-api/applications",
      {
        applicationName: appName,
      },
      {
        headers: postHeaders,
      }
    )
    appId = newApplication.id
    await timer(5000)
    console.log(`Created new app ${appName} with id ${newApplication.id}`)
  }

  //  Get current environments
  await timer(1500)
  const { data: environments } = await axios.get(
    `https://x-api.rollout.io/public-api/applications/${appId}/environments`,
    {
      headers: getHeaders,
    }
  )
}

type UserResponse = {
  name: string
  email: string
  teamAdmin: boolean
  applications: Applications
}

async function createOrUpdateUser() {
  await timer(1500)
  const newApplication = {} as Applications
  newApplication[appId] = {
    environments: {
      Production: "write",
    },
  }
  let userData
  try {
    const resp = await axios.get(
      `https://x-api.rollout.io/public-api/users/${email}`,
      {
        headers: getHeaders,
      }
    )
    userData = resp.data as UserResponse
  } catch (e) {
    const err = e as AxiosError
    console.log("User doesn't exist")
  }
  await timer(1500)
  if (!userData) {
    try {
      const resp = await axios.put(
        `https://x-api.rollout.io/public-api/users`,
        {
          email: email,
          name: email,
          teamAdmin: false,
          applications: newApplication,
        },
        {
          headers: postHeaders,
        }
      )
    } catch (e) {
      const err = e as AxiosError
      console.log("Unable to create user")
    }
  } else {
    const transformedUser = {
      ...userData,
      applications: {
        ...userData.applications,
        ...newApplication,
      },
    } as UserResponse
    try {
      const resp = await axios.put(
        `https://x-api.rollout.io/public-api/users`,
        transformedUser,
        {
          headers: postHeaders,
        }
      )
    } catch (e) {
      const err = e as AxiosError
      console.log("Unable to update user")
    }
  }
}

;(async () => {
  try {
    await setupFMAppAndEnvironment()
    await createOrUpdateUser()

    console.log("Done loading CloudBees Feature Management")
    process.exit(0)
  } catch (e) {
    console.error(e)
  }
})()

// Current FM rate limit is 1req/sec so need to timeout to avoid hitting those
const timer = (ms: number | undefined) => {
  return new Promise((res) => setTimeout(res, ms))
}
