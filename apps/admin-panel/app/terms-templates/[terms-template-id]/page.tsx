import TermsTemplateDetails from "./details"

function TermsTemplate({
  params,
}: {
  params: {
    "terms-template-id": string
  }
}) {
  const { "terms-template-id": termsTemplateId } = params

  return (
    <main className="max-w-[70rem] m-auto">
      <TermsTemplateDetails id={termsTemplateId} />
    </main>
  )
}

export default TermsTemplate
