export const generateRandomEmail = () => {
  const getRandomString = (minLength: number, maxLength: number) => {
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789"
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
    let result = ""
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const username = getRandomString(5, 10)
  const domain = getRandomString(5, 10)

  return `${username}@${domain}.test`
}

export function addVirtualAuthenticator() {
  return Cypress.automation("remote:debugger:protocol", {
    command: "WebAuthn.enable",
    params: {},
  }).then(() => {
    return Cypress.automation("remote:debugger:protocol", {
      command: "WebAuthn.addVirtualAuthenticator",
      params: {
        options: {
          protocol: "ctap2",
          transport: "internal",
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
        },
      },
    }).then((result) => {
      return result.authenticatorId
    })
  })
}
