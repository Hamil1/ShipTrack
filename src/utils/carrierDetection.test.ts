import { detectCarrier } from "./carrierDetection";

describe("Carrier Detection", () => {
  const testCases = [
    { number: "123456789012", expected: "FedEx" },
    { number: "1Z999AA1234567890", expected: "UPS" },
    { number: "9400100000000000000000", expected: "USPS" },
    { number: "9400100000000000000001", expected: "USPS" },
  ];

  testCases.forEach(({ number, expected }) => {
    it(`should detect ${expected} for tracking number ${number}`, () => {
      const detected = detectCarrier(number);
      expect(detected).toBe(expected);
    });
  });

  it("should return null for invalid tracking numbers", () => {
    const invalidNumbers = ["", "123", "invalid", "123456789"];
    invalidNumbers.forEach((number) => {
      const detected = detectCarrier(number);
      expect(detected).toBeNull();
    });
  });
});
