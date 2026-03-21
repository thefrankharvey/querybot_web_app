import React from "react";

const RefundPolicy = () => {
  return (
    <div className="ambient-page w-full">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="ambient-page-shell-narrow pb-10 pt-12 md:pb-20 md:pt-20">
        <h1 className="page-title mb-4 text-left text-4xl md:text-[32px]">
          Refund Policy
        </h1>

        <div className="glass-panel-strong rich-copy mx-auto flex max-w-4xl flex-col gap-6 p-6 md:p-12">
          <p className="text-lg font-semibold leading-relaxed">
            Effective Date: January, 2025
          </p>

          <p>
            At Write Query Hook, we take pride in the quality of our service and
            the value it provides. Since our services are digital and automated,
            all sales are final, and we do not offer refunds.
          </p>

          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">However</h2>
              <p className="mb-4">
                We are committed to authors and their success. We understand
                that things don&apos;t always go as expected – we still love you
                – and we genuinely care about your experience. If you encounter
                any issues with our service, please reach out—we&apos;re here to
                help.
              </p>
              <p className="mb-4">
                📧 <strong>Email:</strong> support@writequeryhook.com
              </p>
              <p>
                We will work with you to troubleshoot problems, clarify
                misunderstandings, or find a fair solution whenever possible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                When Refunds May Be Considered
              </h2>
              <p className="mb-4">
                While we maintain a no-refund policy, we may review refund
                requests on a case-by-case basis in situations such as:
              </p>
              <ul className="space-y-2 ml-4 mb-4">
                <li>
                  ✔ Technical issues that prevent service access (and cannot be
                  resolved).
                </li>
                <li>✔ Billing errors (e.g., duplicate charges).</li>
                <li>
                  ✔ Failure to deliver the promised service (due to an error on
                  our part).
                </li>
              </ul>
              <p>
                Refunds, if granted, will be processed to the original payment
                method within 5-10 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                Chargebacks & Disputes
              </h2>
              <p>
                If you have a billing concern, please contact us first before
                filing a dispute. We are happy to investigate and resolve issues
                directly. Unauthorized chargebacks may result in account
                suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p>
                Your satisfaction matters to us! If you have any concerns or
                questions, reach out anytime at support@writequeryhook.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
