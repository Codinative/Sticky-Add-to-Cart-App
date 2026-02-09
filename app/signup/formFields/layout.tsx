import FormHeader from "@/components/common/header";

export default function layout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div className="container mx-auto py-8 px-6 max-w-7xl">
            <FormHeader title="Form Fields Selection" description="Choose the fields you want to show on your Signup Form" />
            {children}
        </div>
    )
}