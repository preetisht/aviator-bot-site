// Payment integration for Aviator Bot landing page
const API_BASE = "https://aviator-bot-api.YOUR_WORKER.workers.dev"; // Replace after deploy

// Razorpay plan IDs (set these after creating plans in Razorpay Dashboard)
const RAZORPAY_PLANS = {
  basic: "plan_REPLACE_WITH_RAZORPAY_PLAN_ID_BASIC",
  pro: "plan_REPLACE_WITH_RAZORPAY_PLAN_ID_PRO",
};

// Stripe price IDs (set these after creating prices in Stripe Dashboard)
const STRIPE_PRICES = {
  basic: "price_REPLACE_WITH_STRIPE_PRICE_ID_BASIC",
  pro: "price_REPLACE_WITH_STRIPE_PRICE_ID_PRO",
};

const RAZORPAY_KEY = "rzp_live_REPLACE_WITH_YOUR_KEY";

function subscribe(tier, provider) {
  const email = prompt("Enter your email address:");
  if (!email || !email.includes("@")) {
    alert("Valid email required.");
    return;
  }

  if (provider === "razorpay") {
    subscribeRazorpay(tier, email);
  } else if (provider === "stripe") {
    subscribeStripe(tier, email);
  }
}

function subscribeRazorpay(tier, email) {
  const planId = RAZORPAY_PLANS[tier];
  if (!planId || planId.includes("REPLACE")) {
    alert("Payment not configured yet. Contact support.");
    return;
  }

  const options = {
    key: RAZORPAY_KEY,
    subscription_id: "", // Will be created server-side in production
    name: "Aviator Strategy Bot",
    description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan — Monthly`,
    image: "",
    prefill: { email },
    notes: { email, tier },
    theme: { color: "#e94560" },
    handler: function (response) {
      alert(`Payment successful! Subscription ID: ${response.razorpay_subscription_id}\n\nYour license key will be sent to ${email} within 2 minutes.`);
      window.location.href = `dashboard.html?email=${encodeURIComponent(email)}`;
    },
    modal: {
      ondismiss: function () {
        console.log("Payment modal closed");
      },
    },
  };

  if (typeof Razorpay !== "undefined") {
    const rzp = new Razorpay(options);
    rzp.open();
  } else {
    alert("Razorpay SDK not loaded. Please refresh and try again.");
  }
}

async function subscribeStripe(tier, email) {
  const priceId = STRIPE_PRICES[tier];
  if (!priceId || priceId.includes("REPLACE")) {
    alert("Stripe not configured yet. Contact support.");
    return;
  }

  // In production, create a Checkout Session via your backend
  // For now, redirect to a Stripe payment link
  alert(`Stripe checkout for ${tier} plan will redirect you to the payment page.\n\nEmail: ${email}`);
  // window.location.href = `https://checkout.stripe.com/...`;
}

// Dashboard: fetch license key by email
async function fetchLicenseByEmail(email) {
  try {
    const response = await fetch(`${API_BASE}/api/admin?action=list`, {
      headers: { "x-admin-key": "USER_DASHBOARD_KEY" }, // In production, use proper auth
    });
    const data = await response.json();
    const license = data.licenses?.find((l) => l.email === email);
    return license || null;
  } catch (err) {
    console.error("Failed to fetch license:", err);
    return null;
  }
}
