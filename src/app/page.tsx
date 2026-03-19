import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4">
      <h1 className="text-2xl font-semibold">Welcome to the ResonaAI</h1>
      <div className=" felx items-center gap-4">

        <OrganizationSwitcher
          afterSelectOrganizationUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
        <UserButton />

      </div>
    </div>
  )
}