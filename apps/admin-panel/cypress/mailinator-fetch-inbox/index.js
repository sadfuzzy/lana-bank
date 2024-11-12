import process from "process"

import axios from "axios"
import { CookieJar } from "tough-cookie"
import ws from "ws"

const MAILINATOR_URL = "https://www.mailinator.com"
const MAILINATOR_WS_URL = "wss://www.mailinator.com/ws/fetchpublic"

let emailID = process.argv[2]
const waitEmailID = process.argv[3]
const waitTime = parseInt(process.argv[4]) || 30000

if (emailID.endsWith("@mailinator.com")) {
  emailID = emailID.replace("@mailinator.com", "")
}

const getHome = () =>
  axios.get(`${MAILINATOR_URL}/v4/public/inboxes.jsp?to=${emailID}`, {
    headers: {
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
  })

const getMail = ({ cookie, id }) =>
  axios.get(`${MAILINATOR_URL}/fetch_public?msgid=${id}`, {
    headers: {
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      "Cookie": cookie,
    },
    referrerPolicy: "strict-origin-when-cross-origin",
  })

async function main() {
  const home = await getHome()
  const cookies = home.headers["set-cookie"]

  const jar = new CookieJar()
  cookies.forEach((cookie) => {
    jar.setCookieSync(cookie, MAILINATOR_URL)
  })

  const cookieString = jar.getCookieStringSync(MAILINATOR_URL)

  const wsClient = new ws(MAILINATOR_WS_URL, {
    headers: {
      Cookie: cookieString,
    },
  })

  const onClose = () => {
    wsClient.close(1000)
  }

  process.on("SIGINT", onClose)
  process.on("SIGTERM", onClose)

  wsClient.on("open", () => {
    wsClient.send(
      JSON.stringify({
        cmd: "sub",
        channel: emailID,
      }),
    )
  })

  wsClient.on("message", async (buffer) => {
    try {
      const { channel, msgs, id, from } = JSON.parse(buffer.toString("utf-8"))

      if (
        (channel === "initial_msgs" && msgs.some((msg) => msg.seconds_ago < 10)) ||
        (channel === "msg" && from === waitEmailID)
      ) {
        const msgId = id || msgs.find((msg) => msg.seconds_ago < 10)?.id
        if (!msgId) return

        onClose()

        const { data } = await getMail({ cookie: cookieString, id: msgId })
        console.log(JSON.stringify(data.data, null, 2))

        process.exit(0)
      }
    } catch (error) {}
  })

  await new Promise((resolve) => setTimeout(resolve, waitTime))
  onClose()
  console.error(
    JSON.stringify({ errored: true, reason: "Timed out waiting for email" }, null, 2),
  )
  process.exit(1)
}

main().catch(console.error)
