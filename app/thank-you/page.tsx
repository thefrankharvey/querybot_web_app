import Link from "next/link";
import React from "react";

const ThankYouPage = () => {
  return (
    <div className="w-full">
      <div className="pt-12 pb-10 md:pt-20 md:pb-20 w-full md:w-[85%] mx-auto max-w-4xl">
        <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-8 text-center">
          🎉 You did it! You are one of us now.
        </h1>

        <div className="flex flex-col gap-6 bg-white rounded-lg p-6 md:p-12 shadow-lg max-w-4xl mx-auto">
          <p className="text-gray-700 text-lg">
            You’ve taken one strategic step closer to escaping Query Hell.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold mb-2">What’s next</h2>
            <ul className="flex flex-col gap-4 list-none m-0 p-0">
              <li>
                ✔ Check your inbox – within minutes you should see a
                confirmation email from us in the inbox for the email you used
                to sign up – if it&apos;s not there (or in your spam folder)
                please reach out to{" "}
                <a
                  href="mailto:support@writequeryhook.site"
                  className="underline"
                >
                  support@writequeryhook.site
                </a>
                .
              </li>
              <li>✔ Lookout for your tactical alerts in your inbox.</li>
              <li>
                ✔ Try our{" "}
                <Link href="/smart-match">
                  <span className="font-bold bg-accent text-black px-2 py-1 rounded-md">
                    Smart Match
                  </span>{" "}
                </Link>
                feature for free! Your top 3 literary agents are waiting for
                you.
              </li>
              <li>✔ Tell a fellow author.</li>
              <li>✔ Follow us on social media.</li>
            </ul>
          </section>

          <section className="space-y-4 text-gray-700">
            <p>
              Write Query Hook was born to uplift and champion authors. We are
              fiercely committed to you and your success.
            </p>
            <p>
              So, I want to extend my personal thank you and support. If you
              need anything please reach out through any of these channels:
            </p>
          </section>

          <section className="space-y-2">
            <ul className="space-y-2 list-none m-0 p-0">
              <li>
                Love or Hate:{" "}
                <a
                  href="mailto:feedback@writequeryhook.site"
                  className="underline"
                >
                  feedback@writequeryhook.site
                </a>
              </li>
              <li>
                Help:{" "}
                <a
                  href="mailto:support@writequeryhook.site"
                  className="underline"
                >
                  support@writequeryhook.site
                </a>
              </li>
              <li>
                Success Stories:{" "}
                <a
                  href="mailto:testimonials@writequeryhook.site"
                  className="underline"
                >
                  testimonials@writequeryhook.site
                </a>
              </li>
              <li>
                Work With Us:{" "}
                <a
                  href="mailto:workwith@writequeryhook.site"
                  className="underline"
                >
                  workwith@writequeryhook.site
                </a>
              </li>
            </ul>
          </section>

          <p className="text-gray-700">
            We are always hungry for ways to improve our service. Please use any
            of the channels above to let us know how we can do more!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
