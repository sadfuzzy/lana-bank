import { redirect } from "next/navigation"

import UsersTable from "./users-table"

import { Input } from "@/components/primitive/input"

import { Label } from "@/components/primitive/label"
import { Button } from "@/components/primitive/button"

import { PageHeading } from "@/components/page-heading"

const searchUser = async (formData: FormData) => {
  "use server"
  if (formData.get("submit") === "clear") {
    redirect(`/user`)
  }

  const userId = formData.get("userId")
  if (!userId || typeof userId !== "string") {
    redirect(`/user`)
  }
  redirect(`/user?userId=${userId}`)
}

async function UserPage({ searchParams }: { searchParams: { userId?: string } }) {
  const { userId } = searchParams

  return (
    <main>
      <PageHeading>Users</PageHeading>
      <div className="mt-4 mb-4 max-w-[30rem]">
        <Label htmlFor="userId">User ID</Label>
        <form className="flex gap-2" action={searchUser}>
          <Input placeholder="Find a user by user ID" id="userId" name="userId" />
          <Button variant="secondary">Search</Button>
          {userId && (
            <Button type="submit" name="submit" value="clear">
              X Clear
            </Button>
          )}
        </form>
      </div>
      <UsersTable userId={userId} />
    </main>
  )
}

export default UserPage
