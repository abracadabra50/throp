import { chaosTransform } from './src/utils/chaos-formatter.js';

const testTexts = [
  "Bitcoin is a decentralized digital currency that operates on blockchain technology.",
  "The market is currently experiencing significant volatility according to analysts.",
  "Artificial intelligence will revolutionize software development in the coming years.",
  "Web3 represents the future of the internet with decentralized applications.",
  "I believe memecoins are an interesting phenomenon in the cryptocurrency space."
];

console.log("🧪 TESTING CHAOS FORMATTER\n");
console.log("=" .repeat(60));

testTexts.forEach((text, i) => {
  console.log(`\nTest ${i + 1}:`);
  console.log("ORIGINAL:", text);
  console.log("CHAOS:   ", chaosTransform(text));
  console.log("-".repeat(60));
});

// Test multiple passes to see if it gets more chaotic
console.log("\n🌀 PROGRESSIVE CHAOS TEST (3 passes):");
let progressive = testTexts[0];
for (let i = 0; i < 3; i++) {
  progressive = chaosTransform(progressive);
  console.log(`Pass ${i + 1}: ${progressive}`);
}
