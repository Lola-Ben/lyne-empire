// scripts/test-checkout.js


const NGROK_URL = process.env.NEXT_PUBLIC_APP_URL; // 👈 Paste your active ngrok URL here

async function runMockCheckout() {
    if (!NGROK_URL) {
    console.error("❌ ERROR: process.env.NEXT_PUBLIC_APP_URL is still undefined!");
    console.log("Try running the script with the --env-file flag explicitly.");
    process.exit(1);
  }

  console.log(`📡 Targeting public tunnel endpoint: ${NGROK_URL}/api/checkout`);
  console.log("🚀 Initializing mock Mobile Money checkout request...");
  console.log(`📡 Targeting public tunnel endpoint: ${NGROK_URL}/api/checkout`);

  // Mock payload mimicking a real Cameroonian user buying a wig item
  const mockPayload = {
    phoneNumber: "677123456", // Standard local MTN number format
    paymentProvider: "MTN_MOMO",
    amount: 1000.00, // 120,000 frs wig + 2,000 frs delivery logistics
    cartItems: [
      {
        productId: "00000000-0000-0000-0000-000000000000", // Placeholder UUID layout
        variantId: "00000000-0000-0000-0000-000000000000",
        quantity: 1,
        price: 1000.00
      }
    ]
  };

  try {
    const response = await fetch(`${NGROK_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockPayload)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("\n✅ SUCCESS: The Checkout Route processed the initialization perfectly!");
      console.log(`🆔 Assigned Database Order ID: ${data.orderId}`);
      console.log(`💬 API Response Message: "${data.message}"`);
      console.log("\n💡 Next step: Head over to your ngrok terminal dashboard to view the data stream payload metrics.");
    } else {
      console.error("\n❌ FAILED: The Checkout Route rejected the request properties.");
      console.error(`⚠️ Server Error Details: ${data.error || "Unknown error context"}`);
    }
  } catch (error) {
    console.error("\n❌ CRITICAL: Could not communicate with your live ngrok public link server.");
    console.error("Make sure you ran 'npm run dev' and your ngrok tunnel is actively open.", error.message);
  }
}

runMockCheckout();