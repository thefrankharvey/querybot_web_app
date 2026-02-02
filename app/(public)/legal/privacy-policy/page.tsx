import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="w-full">
      <div className="pt-12 pb-10 md:pt-20 md:pb-20 w-full md:w-[85%] mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-[32px] font-semibold text-accent leading-tight mb-4 text-left">
          Privacy Policy
        </h1>

        <div className="flex flex-col gap-6 bg-white rounded-lg p-6 md:p-12 shadow-lg max-w-4xl mx-auto">
          <p className="text-lg font-semibold leading-relaxed">
            Effective Date: January, 2025
          </p>

          <p className="text-gray-700">
            Our website address is: https://writequeryhook.com.
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="mb-4">
                We value your privacy and are committed to protecting your
                personal data. This Privacy Policy explains what information we
                collect, how we use it, your rights, and how we comply with the
                General Data Protection Regulation (GDPR).
              </p>
              <p>
                By using our services, you agree to the collection and use of
                your information as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Who We Are</h2>
              <p className="mb-4">
                Write Query Hook (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) is the data controller responsible for your
                personal data. If you have any questions about this policy or
                how we handle your data, you can contact us at:
              </p>
              <p>
                📧 <strong>Email:</strong> support@writequeryhook.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                3. What Data We Collect
              </h2>
              <p className="mb-4">
                We collect the following types of personal data:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Personal Information – Name, email, payment details.</li>
                <li>
                  ✔ Usage Data – IP address, browser type, device info, pages
                  visited, time spent on pages.
                </li>
                <li>
                  ✔ Cookies & Tracking Technologies – Used for analytics and
                  marketing (you can manage cookies in your browser settings).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                4. Your Data & Intellectual Property Protection
              </h2>
              <p className="mb-4">
                At Write Query Hook, we champion authors. We prioritize and
                support the safety of the author&apos;s original work. We follow
                a strict non-retention policy to protect your intellectual
                property. While our software uses a Large Language Model (LLM)
                to analyze user submitted manuscripts, query letters, synopses,
                and other materials, we never store, use, or distribute your
                materials in any way.
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Your work remains 100% yours.</li>
                <li>
                  ✔ We do not retain or reuse your content for any purpose,
                  including AI training.
                </li>
                <li>
                  ✔ All data is processed in real time and permanently discarded
                  after analysis.
                </li>
                <li>
                  ✔ Your materials will NOT be reviewed by or distributed to any
                  person.
                </li>
              </ul>
              <p>
                We are committed to ensuring that your submissions are analyzed
                securely and privately in compliance with our non-retention
                policies and applicable data protection laws, including GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                5. Legal Basis for Processing (GDPR Compliance)
              </h2>
              <p className="mb-4">
                Under GDPR, we must have a lawful basis to collect and process
                your data. These include:
              </p>
              <ul className="space-y-2 ml-4">
                <li>
                  ✔ Contractual Necessity – To provide our service to you.
                </li>
                <li>
                  ✔ Legitimate Interest – To improve our service, prevent fraud,
                  and ensure security.
                </li>
                <li>
                  ✔ Legal Obligation – To comply with tax, regulatory, or legal
                  requirements.
                </li>
                <li>
                  ✔ Consent – For marketing emails or non-essential cookies (you
                  can withdraw consent at any time).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                6. How We Use Your Data
              </h2>
              <p className="mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="space-y-2 ml-4">
                <li>✔ To provide and improve our services.</li>
                <li>✔ To process payments securely via Stripe.</li>
                <li>✔ To send important service updates.</li>
                <li>✔ For analytics and marketing (only if you opt-in).</li>
                <li>✔ To comply with legal requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                7. How Long We Keep Your Data
              </h2>
              <p className="mb-4">
                We retain your data only as long as necessary for the purposes
                outlined in this policy:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Account Data: Stored until you request deletion.</li>
                <li>
                  ✔ Transaction Data: Retained for tax & legal reasons (usually
                  7 years).
                </li>
                <li>✔ Marketing Data: Retained until you unsubscribe.</li>
                <li>
                  ✔ Cookies & Analytics Data: Based on browser settings and
                  expiration policies.
                </li>
              </ul>
              <p>
                Once your data is no longer needed, we securely delete or
                anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                8. Your Rights Under GDPR
              </h2>
              <p className="mb-4">
                If you are an EU or UK resident, you have the following rights:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>
                  ✔ Right to Access – Request a copy of the data we hold on you.
                </li>
                <li>
                  ✔ Right to Rectification – Correct inaccurate or incomplete
                  data.
                </li>
                <li>
                  ✔ Right to Erasure (&quot;Right to be Forgotten&quot;) –
                  Request data deletion.
                </li>
                <li>
                  ✔ Right to Restrict Processing – Limit how we use your data.
                </li>
                <li>
                  ✔ Right to Data Portability – Request a copy of your data in a
                  machine-readable format.
                </li>
                <li>
                  ✔ Right to Object – Opt out of direct marketing or certain
                  processing.
                </li>
                <li>
                  ✔ Right to Withdraw Consent – If processing is based on
                  consent, you can withdraw at any time.
                </li>
              </ul>
              <p className="mb-4">
                To exercise any of these rights, email us at
                support@writequeryhook.com.
              </p>
              <p>
                If you are unhappy with our response, you can file a complaint
                with your local Data Protection Authority.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                9. Data Security Measures
              </h2>
              <p className="mb-4">
                We use industry-standard security practices to protect your
                data, including:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Encryption of sensitive information.</li>
                <li>✔ Secure payment processing (via Stripe).</li>
                <li>✔ Limited access to personal data internally.</li>
                <li>✔ Regular security audits to detect vulnerabilities.</li>
              </ul>
              <p>
                While we take all reasonable precautions, no system is 100%
                secure, so we encourage safe browsing habits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Sharing Your Data</h2>
              <p className="mb-4">
                We do not sell your data. We only share it with:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>
                  ✔ Trusted service providers (e.g., Stripe for payments,
                  analytics providers).
                </li>
                <li>✔ Legal authorities if required by law.</li>
              </ul>
              <p>
                All third parties must comply with strict data protection
                agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                11. International Data Transfers
              </h2>
              <p className="mb-4">
                If we transfer your data outside the EU or UK, we ensure
                adequate protection through:
              </p>
              <ul className="space-y-2 ml-4">
                <li>
                  ✔ Standard Contractual Clauses (SCCs) approved by the European
                  Commission.
                </li>
                <li>
                  ✔ Adequacy decisions (for countries deemed safe by the EU).
                </li>
                <li>✔ Other legal mechanisms if required.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Cookies Policy</h2>
              <p className="mb-4">
                At Write Query Hook, we use cookies and similar tracking
                technologies to enhance your experience on our website. This
                policy explains what cookies are, how we use them, and your
                choices regarding cookie settings.
              </p>

              <h3 className="text-xl font-semibold mb-3">What Are Cookies?</h3>
              <p className="mb-4">
                Cookies are small text files stored on your device (computer,
                tablet, or phone) when you visit a website. They help websites
                function properly, remember user preferences, and analyze
                visitor behavior.
              </p>

              <h3 className="text-xl font-semibold mb-3">How We Use Cookies</h3>
              <p className="mb-4">We use cookies to:</p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Ensure our website functions properly.</li>
                <li>✔ Improve your experience by remembering preferences.</li>
                <li>✔ Analyze website traffic and usage patterns.</li>
                <li>✔ Deliver relevant marketing and advertising.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                Types of Cookies We Use
              </h3>
              <p className="mb-4">We use the following types of cookies:</p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>
                  🔹 Essential Cookies – Required for website functionality
                  (e.g., login, security).
                </li>
                <li>
                  🔹 Analytics Cookies – Help us understand how users interact
                  with our site (e.g., Google Analytics).
                </li>
                <li>
                  🔹 Functional Cookies – Remember user preferences (e.g.,
                  language settings).
                </li>
                <li>
                  🔹 Marketing Cookies – Used for personalized ads and
                  remarketing (e.g., Facebook Pixel).
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                How to Manage Cookies
              </h3>
              <p className="mb-4">
                You have control over your cookie preferences. You can:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>✔ Accept all cookies.</li>
                <li>✔ Customize which cookies you allow.</li>
                <li>✔ Disable cookies through your browser settings.</li>
              </ul>
              <p className="mb-4">
                Most browsers allow you to block or delete cookies, but this may
                affect website functionality.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Third-Party Cookies
              </h3>
              <p className="mb-4">
                Some third-party services we use (e.g., Stripe for payments,
                Google Analytics for tracking) may place their own cookies.
                Their privacy policies apply to these cookies, and we do not
                have control over them.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Changes to This Cookies Policy
              </h3>
              <p>
                We may update this Cookies Policy from time to time. Any changes
                will be reflected on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Third-Party Links</h2>
              <p>
                We may link to third-party services (e.g., Facebook). Their
                privacy policies apply, not ours.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                14. Changes to This Policy
              </h2>
              <p>
                We may update this policy from time to time. If changes are
                significant, we&apos;ll notify you via email or on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">15. Questions?</h2>
              <p>
                We&apos;re here to help authors! Reach out at
                support@writequeryhook.com if you have any questions or
                concerns.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
