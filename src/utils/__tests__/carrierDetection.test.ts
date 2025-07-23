import {
  detectCarrier,
  isValidTrackingNumber,
  getCarrierInfo,
} from "../carrierDetection";

describe("Carrier Detection", () => {
  describe("detectCarrier", () => {
    it("should detect UPS tracking numbers", () => {
      expect(detectCarrier("1Z999AA1234567890")).toBe("UPS");
      expect(detectCarrier("1Z1234567890123456")).toBe("UPS");
    });

    it("should detect FedEx tracking numbers", () => {
      expect(detectCarrier("123456789012")).toBe("FedEx");
      expect(detectCarrier("1234567890123")).toBe("FedEx");
      expect(detectCarrier("12345678901234")).toBe("FedEx");
    });

    it("should detect USPS tracking numbers", () => {
      expect(detectCarrier("9400100000000000000000")).toBe("USPS");
      expect(detectCarrier("9205500000000000000000")).toBe("USPS");
      expect(detectCarrier("9405508106244021621495")).toBe("USPS");
    });

    it("should return null for invalid tracking numbers", () => {
      expect(detectCarrier("INVALID123")).toBeNull();
      expect(detectCarrier("")).toBeNull();
      expect(detectCarrier("123")).toBeNull();
    });

    it("should handle whitespace and case", () => {
      expect(detectCarrier(" 1Z999AA1234567890 ")).toBe("UPS");
      expect(detectCarrier(" 123456789012 ")).toBe("FedEx");
    });
  });

  describe("isValidTrackingNumber", () => {
    it("should return true for valid tracking numbers", () => {
      expect(isValidTrackingNumber("1Z999AA1234567890")).toBe(true);
      expect(isValidTrackingNumber("123456789012")).toBe(true);
      expect(isValidTrackingNumber("9400100000000000000000")).toBe(true);
    });

    it("should return false for invalid tracking numbers", () => {
      expect(isValidTrackingNumber("INVALID123")).toBe(false);
      expect(isValidTrackingNumber("")).toBe(false);
      expect(isValidTrackingNumber("123")).toBe(false);
    });
  });

  describe("getCarrierInfo", () => {
    it("should return carrier info for valid carriers", () => {
      const upsInfo = getCarrierInfo("UPS");
      expect(upsInfo).toBeDefined();
      expect(upsInfo?.name).toBe("UPS");
      expect(upsInfo?.pattern).toBeInstanceOf(RegExp);
    });

    it("should return null for invalid carriers", () => {
      expect(getCarrierInfo("INVALID" as any)).toBeNull();
    });
  });
});
