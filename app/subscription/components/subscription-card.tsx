import Spinner from "@/app/components/spinner";
import { Button } from "@/app/ui-primitives/button";
import DiscountBadge from "./discount-badge";
import { CheckCircle, XCircle } from "lucide-react";

const SubscriptionCard = ({
  message,
  isMonthly,
  priceId,
  handleSubscribe,
  isSubscribing,
}: {
  message: {
    type: "success" | "error";
    text: string;
  } | null;
  isMonthly: boolean;
  priceId: string;
  handleSubscribe: (priceId: string) => void;
  isSubscribing: boolean;
}) => {
  const title = isMonthly ? "Monthly Subscription" : "Yearly Subscription";
  const subtext = isMonthly ? "Flexible. Cancel anytime." : "Save 45%";
  const price = isMonthly ? "$14" : "$90";
  const cta = isMonthly ? "Subscribe Monthly" : "Subscribe Annually";

  return (
    <div className="w-full md:w-[350px]">
      {!isMonthly && (
        <div className="hidden md:block absolute ml-[272px] mt-[-52px]">
          <DiscountBadge />
        </div>
      )}
      <div className="bg-white rounded-lg p-8 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{subtext}</p>

          <div className="mb-8 flex justify-center items-center">
            <span className="text-4xl font-semibold">{price}</span>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-md flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <Button
            onClick={() => handleSubscribe(priceId)}
            disabled={isSubscribing}
            className="w-full text-lg py-6 font-semibold shadow-lg hover:shadow-xl"
          >
            {isSubscribing ? (
              <div className="flex items-center gap-2">
                <Spinner size={20} />
                Processing...
              </div>
            ) : (
              cta
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
