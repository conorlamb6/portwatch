import {
  resetPortLabels,
  addCustomLabel,
  removeCustomLabel,
  getLabelForPort,
  isWellKnown,
  getAllLabels,
} from "./portLabel";

beforeEach(() => {
  resetPortLabels();
});

describe("getLabelForPort", () => {
  it("returns the well-known label for port 80", () => {
    expect(getLabelForPort(80)).toBe("HTTP");
  });

  it("returns the well-known label for port 443", () => {
    expect(getLabelForPort(443)).toBe("HTTPS");
  });

  it("returns a generic label for an unknown port", () => {
    expect(getLabelForPort(9999)).toBe("Port 9999");
  });

  it("returns a custom label when one is registered", () => {
    addCustomLabel(9999, "My Service");
    expect(getLabelForPort(9999)).toBe("My Service");
  });

  it("custom label overrides well-known label", () => {
    addCustomLabel(80, "Internal Proxy");
    expect(getLabelForPort(80)).toBe("Internal Proxy");
  });
});

describe("addCustomLabel", () => {
  it("throws RangeError for port 0", () => {
    expect(() => addCustomLabel(0, "Invalid")).toThrow(RangeError);
  });

  it("throws RangeError for port 65536", () => {
    expect(() => addCustomLabel(65536, "Invalid")).toThrow(RangeError);
  });

  it("accepts port 1 as valid", () => {
    expect(() => addCustomLabel(1, "Edge")).not.toThrow();
  });

  it("accepts port 65535 as valid", () => {
    expect(() => addCustomLabel(65535, "Edge")).not.toThrow();
  });
});

describe("removeCustomLabel", () => {
  it("returns true when a custom label is removed", () => {
    addCustomLabel(9999, "My Service");
    expect(removeCustomLabel(9999)).toBe(true);
    expect(getLabelForPort(9999)).toBe("Port 9999");
  });

  it("returns false when no custom label exists for the port", () => {
    expect(removeCustomLabel(9999)).toBe(false);
  });

  it("does not remove well-known labels", () => {
    expect(removeCustomLabel(80)).toBe(false);
    expect(getLabelForPort(80)).toBe("HTTP");
  });
});

describe("isWellKnown", () => {
  it("returns true for a well-known port", () => {
    expect(isWellKnown(22)).toBe(true);
  });

  it("returns false for an unknown port", () => {
    expect(isWellKnown(9999)).toBe(false);
  });
});

describe("getAllLabels", () => {
  it("includes well-known ports", () => {
    const labels = getAllLabels();
    expect(labels[80]).toBe("HTTP");
    expect(labels[443]).toBe("HTTPS");
  });

  it("merges custom labels into the result", () => {
    addCustomLabel(9999, "Custom");
    const labels = getAllLabels();
    expect(labels[9999]).toBe("Custom");
  });

  it("custom labels override well-known in merged result", () => {
    addCustomLabel(80, "Overridden");
    const labels = getAllLabels();
    expect(labels[80]).toBe("Overridden");
  });
});
