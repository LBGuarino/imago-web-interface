import ContactForm from "@/components/ContactForm";

export default function AccessRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-12">
      <div className="w-full max-w-2xl">
        <ContactForm />
      </div>
    </div>
  );
}
