import { readdirSync, readFileSync } from "fs"
import { join } from "path"

const messagesDir = join(process.cwd(), "messages")
const messageFiles = readdirSync(messagesDir).filter((file) => file.endsWith(".json"))

const messages = {}
messageFiles.forEach((file) => {
  const locale = file.replace(".json", "")
  messages[locale] = JSON.parse(readFileSync(join(messagesDir, file), "utf8"))
})
const referenceLocale = "en"
const referenceMessages = messages[referenceLocale]

function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey))
    } else {
      acc[prefixedKey] = obj[key]
    }
    return acc
  }, {})
}

const flattenedReference = flattenObject(referenceMessages)
const referenceKeys = Object.keys(flattenedReference)

let hasMissingTranslations = false
const missingTranslations = {}
Object.keys(messages).forEach((locale) => {
  if (locale === referenceLocale) return
  const flattenedLocale = flattenObject(messages[locale])
  const missingKeys = referenceKeys.filter((key) => !(key in flattenedLocale))
  if (missingKeys.length > 0) {
    hasMissingTranslations = true
    missingTranslations[locale] = missingKeys
  }
})

if (hasMissingTranslations) {
  console.error("Missing translations found:")
  console.error(JSON.stringify(missingTranslations, null, 2))
  process.exit(1)
} else {
  console.log("All translations are complete! ✅")
  process.exit(0)
}
