import { ReactNode } from "react"

import { Card, CardContent } from "@lana/web/ui/card"

import { InformationCard } from "../information-card"

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-muted">
      <Card className="max-w-[60rem] md:w-[60rem] w-[90%]">{children}</Card>
    </main>
  )
}

async function AuthTemplateCard({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <CardContent className="flex flex-col md:flex-row p-0 md:p-6 justify-between">
        <InformationCard />
        {children}
      </CardContent>
    </Wrapper>
  )
}

export { Wrapper, AuthTemplateCard }
