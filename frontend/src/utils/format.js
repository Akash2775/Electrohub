const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(n / 100);
const message = (e) => e instanceof Error ? e.message : "Something went wrong. Please try again.";
export {
  message,
  money
};
