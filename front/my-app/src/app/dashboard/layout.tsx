export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to bg-indigo-100 justify-center min-h-screen py-2">
            {children}
        </div>
    )
}