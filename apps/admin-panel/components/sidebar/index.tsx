import { NavigationLinks } from "./navigation-links"

import { LogOut, Menu } from "@/components/icons"
import { Sheet, SheetTrigger, SheetContent } from "@/components/primitive/sheet"
import { Button } from "@/components/primitive/button"

export default function SideBar() {
  return (
    <>
      <div className="hidden md:block bg-primary-foreground border-r border-secondary-foreground w-64">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold ml-4 mt-4">LAVA BANK</h1>
          </div>
          <div className="flex flex-col justify-between h-full ">
            <div className="flex flex-col ml-8 mt-8 gap-4">
              <NavigationLinks />
            </div>
            <div className="flex justify-center items-center p-4 border-t border-secondary-foreground">
              <Button variant="primary" className="w-60">
                <div className="flex gap-2 items-center">
                  <LogOut className="w-6 h-6" />
                  <p>Log out</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex items-center p-4">
              <Menu className="w-6 h-6" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col justify-between h-full">
            <div className="p-4">
              <h1 className="text-xl font-bold mb-4">LAVA BANK</h1>
              <NavigationLinks />
            </div>
            <div className="flex justify-center items-center p-4 border-t border-secondary-foreground">
              <Button variant="primary" className="w-60">
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
