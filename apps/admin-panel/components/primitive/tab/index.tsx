import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Tabs>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>((props, ref) => <TabsPrimitive.Tabs ref={ref} {...props} />)
Tabs.displayName = TabsPrimitive.Tabs.displayName

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsList>
>((props, ref) => (
  <TabsPrimitive.TabsList ref={ref} {...props} className="flex flex-row space-x-4 mb-6" />
))
TabsList.displayName = TabsPrimitive.TabsList.displayName

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsTrigger>
>((props, ref) => (
  <TabsPrimitive.TabsTrigger
    ref={ref}
    {...props}
    className="uppercase bg-zinc-700 py-1 px-4 tabsTrigger"
  />
))
TabsTrigger.displayName = TabsPrimitive.TabsTrigger.displayName

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.TabsContent>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.TabsContent>
>((props, ref) => <TabsPrimitive.TabsContent ref={ref} {...props} />)
TabsContent.displayName = TabsPrimitive.TabsContent.displayName
