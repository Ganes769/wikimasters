import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { Button } from "./ui/button";
import { UserButton } from "@stackframe/stack";
import { StackServerApp } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
export default async function NavBar() {
  const user = await stackServerApp.getUser();
  return (
    <nav className="w-full border-b bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 sticky top-0 z-60">
      <div className="container mx-auto items-center justify-between flex px-4 h-16">
        <div className="flex justify-between items-center w-full">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-grey-900"
          >
            Wikimasters
          </Link>
          <NavigationMenu>
            {user ? (
              <NavigationMenuItem>
                <UserButton />
              </NavigationMenuItem>
            ) : (
              <NavigationMenuList className="flex gap-2">
                <NavigationMenuItem>
                  <Button asChild variant="outline">
                    <Link href="/handler/signin">SignIn</Link>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button asChild variant="default">
                    <Link href="/handler/signup">Signup</Link>
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            )}
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
