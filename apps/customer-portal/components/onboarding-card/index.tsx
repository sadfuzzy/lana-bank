// const OnboardingCard = ({
//   twoFactorAuthEnabled,
//   kycCompleted,
// }: {
//   twoFactorAuthEnabled: boolean
//   kycCompleted: boolean
// }) => {
//   return (
//     <Card className="mt-10">
//       <CardHeader className="md:pb-0">
//         <div className="flex align-middle gap-4">
//           <RocketIcon className="hidden md:block w-10 h-10" />
//           <div className="flex flex-col gap-2">
//             <CardTitle className="mt-2">
//               Complete onboarding steps to Initiate a Loan
//             </CardTitle>
//             <CardDescription>
//               Complete the following steps to initiate to complete your onboarding process
//             </CardDescription>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="mt-6">
//         <div className="ml-14 flex flex-col gap-4">
//           <Link
//             data-test-id="enable-2fa-button"
//             className="flex gap-2 items-center"
//             href="/settings/2fa"
//           >
//             <Checkbox checked={twoFactorAuthEnabled} />
//             <Label className="hover:underline">Enable Two-Factor Authentication </Label>
//           </Link>
//           <KycKybWrapper kycCompleted={kycCompleted} />
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
