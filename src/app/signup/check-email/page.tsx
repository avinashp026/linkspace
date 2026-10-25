import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Check your email
        </h1>

        <p className="mt-4 text-sm leading-6 text-gray-600">
          If your signup request was accepted, Supabase has initiated the
          email confirmation process. Open the verification email and
          follow its instructions to activate your account.
        </p>

        <p className="mt-6 text-sm text-gray-600">
          Once you have verified your email, continue to the sign-in page.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          Go to sign in
        </Link>
      </div>
    </main>
  );
}