import { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@lana/web/ui/card"

import { InformationCard } from "../information-card"

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="m-aut max-w-[60rem] md:w-[60rem] w-[90%]">{children}</Card>
    </main>
  )
}

async function AuthTemplateCard({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <CardHeader className="md:pb-0">
        <CardTitle className="mt-2 text-lg md:ml-14">Lana Bank</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row p-0 md:p-6 md:pt-0 justify-between">
        <InformationCard />
        {children}
      </CardContent>
    </Wrapper>
  )
}

export { Wrapper, AuthTemplateCard }
