"use server"
import { redirect } from "next/navigation"

export const handleCustomerSearchFormSubmit = async (formData: FormData) => {
  if (formData.get("submit") === "clear") {
    redirect(`/customer`)
  }

  const customerId = formData.get("customerId")
  if (!customerId || typeof customerId !== "string") {
    redirect(`/customer`)
  }
  redirect(`/customer?customerId=${customerId}`)
}
