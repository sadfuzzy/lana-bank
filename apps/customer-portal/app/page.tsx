import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitive/card"

import { RocketIcon } from "@/components/icons"
import { Checkbox } from "@/components/primitive/check-box"
import { Label } from "@/components/primitive/label"

export default function Home() {
  return (
    <main className="max-w-[75rem] m-auto">
      <OnboardingCard twoFactorAuthEnabled={false} kycCompleted={false} />
    </main>
  )
}

const OnboardingCard = ({
  twoFactorAuthEnabled,
  kycCompleted,
}: {
  twoFactorAuthEnabled: boolean
  kycCompleted: boolean
}) => {
  return (
    <Card className="mt-24">
      <CardHeader className="md:pb-0">
        <div className="flex align-middle gap-4">
          <RocketIcon className="hidden md:block w-10 h-10" />
          <div className="flex flex-col gap-2">
            <CardTitle className="mt-2">
              Complete onboarding steps to Initiate a Loan
            </CardTitle>
            <CardDescription>
              Complete the following steps to initiate to complete your onboarding process
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-6">
        <div className="ml-14 flex flex-col gap-4">
          <Link className="flex gap-2 items-center" href="/settings/2fa">
            <Checkbox checked={twoFactorAuthEnabled} />
            <Label className="hover:underline">Enable Two-Factor Authentication </Label>
          </Link>
          <Link className="flex gap-2 items-center" aria-disabled href="/settings">
            <Checkbox checked={kycCompleted} />
            <Label className="hover:underline">Complete KYC or KYB onboarding</Label>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
