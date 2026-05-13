import { describe, it, expect } from "vitest";
import {
  teamIdSchema,
  passwordSchema,
  tempPasswordSchema,
  emailSchema,
  phoneSchema,
  githubUrlSchema,
  videoUrlSchema,
  problemStatementSchema,
  notificationSchema,
  flagReasonSchema,
  csvFileSchema,
  generateTempPassword,
} from "./hmsValidation";

describe("teamIdSchema", () => {
  it("accepts valid team IDs", () => {
    expect(teamIdSchema.safeParse("IH-0001").success).toBe(true);
    expect(teamIdSchema.safeParse("IH-9999").success).toBe(true);
  });

  it("rejects invalid team IDs", () => {
    expect(teamIdSchema.safeParse("IH-123").success).toBe(false);
    expect(teamIdSchema.safeParse("IH-12345").success).toBe(false);
    expect(teamIdSchema.safeParse("XX-1234").success).toBe(false);
    expect(teamIdSchema.safeParse("").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts valid passwords", () => {
    expect(passwordSchema.safeParse("Abcdef1!").success).toBe(true);
    expect(passwordSchema.safeParse("StrongP@ss1").success).toBe(true);
  });

  it("rejects passwords missing requirements", () => {
    expect(passwordSchema.safeParse("short1!").success).toBe(false); // too short
    expect(passwordSchema.safeParse("abcdefg1!").success).toBe(false); // no uppercase
    expect(passwordSchema.safeParse("ABCDEFG1!").success).toBe(false); // no lowercase
    expect(passwordSchema.safeParse("Abcdefgh!").success).toBe(false); // no digit
    expect(passwordSchema.safeParse("Abcdefg1").success).toBe(false); // no special
  });
});

describe("tempPasswordSchema", () => {
  it("accepts passwords with 12+ chars meeting all requirements", () => {
    expect(tempPasswordSchema.safeParse("Abcdefghij1!").success).toBe(true);
  });

  it("rejects passwords shorter than 12 chars even if otherwise valid", () => {
    expect(tempPasswordSchema.safeParse("Abcdef1!abc").success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("accepts valid emails", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
    expect(emailSchema.safeParse("a.b+c@domain.co.in").success).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
    expect(emailSchema.safeParse("").success).toBe(false);
    expect(emailSchema.safeParse("a".repeat(250) + "@x.co").success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("accepts valid phone numbers", () => {
    expect(phoneSchema.safeParse("+1234567890").success).toBe(true);
    expect(phoneSchema.safeParse("123-456-7890").success).toBe(true);
    expect(phoneSchema.safeParse("+91 98765 43210").success).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(phoneSchema.safeParse("123").success).toBe(false); // too few digits
    expect(phoneSchema.safeParse("abc1234567").success).toBe(false); // letters
    expect(phoneSchema.safeParse("1234567890123456").success).toBe(false); // too many digits
  });
});

describe("githubUrlSchema", () => {
  it("accepts valid GitHub URLs", () => {
    expect(githubUrlSchema.safeParse("https://github.com/user/repo").success).toBe(true);
    expect(githubUrlSchema.safeParse("https://github.com/user/repo/").success).toBe(true);
    expect(githubUrlSchema.safeParse("https://github.com/my-org/my_repo.js").success).toBe(true);
  });

  it("rejects invalid GitHub URLs", () => {
    expect(githubUrlSchema.safeParse("https://gitlab.com/user/repo").success).toBe(false);
    expect(githubUrlSchema.safeParse("http://github.com/user/repo").success).toBe(false);
    expect(githubUrlSchema.safeParse("https://github.com/user").success).toBe(false);
    expect(githubUrlSchema.safeParse("").success).toBe(false);
  });
});

describe("videoUrlSchema", () => {
  it("accepts valid video URLs", () => {
    expect(videoUrlSchema.safeParse("https://youtube.com/watch?v=abc").success).toBe(true);
    expect(videoUrlSchema.safeParse("https://www.youtube.com/watch?v=abc").success).toBe(true);
    expect(videoUrlSchema.safeParse("https://youtu.be/abc123").success).toBe(true);
    expect(videoUrlSchema.safeParse("https://vimeo.com/123456").success).toBe(true);
    expect(videoUrlSchema.safeParse("https://drive.google.com/file/d/abc").success).toBe(true);
  });

  it("rejects invalid video URLs", () => {
    expect(videoUrlSchema.safeParse("https://example.com/video").success).toBe(false);
    expect(videoUrlSchema.safeParse("not-a-url").success).toBe(false);
  });
});

describe("problemStatementSchema", () => {
  const futureDate = new Date(Date.now() + 86400000).toISOString();

  it("accepts valid problem statements", () => {
    const result = problemStatementSchema.safeParse({
      title: "Build a Chat App",
      description: "Create a real-time chat application",
      domain: "Web Development",
      release_at: futureDate,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(problemStatementSchema.safeParse({}).success).toBe(false);
  });

  it("rejects past release_at", () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const result = problemStatementSchema.safeParse({
      title: "Title",
      description: "Desc",
      domain: "Domain",
      release_at: pastDate,
    });
    expect(result.success).toBe(false);
  });

  it("rejects title exceeding 200 chars", () => {
    const result = problemStatementSchema.safeParse({
      title: "A".repeat(201),
      description: "Desc",
      domain: "Domain",
      release_at: futureDate,
    });
    expect(result.success).toBe(false);
  });
});

describe("notificationSchema", () => {
  it("accepts valid notifications", () => {
    const result = notificationSchema.safeParse({
      title: "Important Update",
      message: "Please check the new deadline.",
      audience_type: "all",
      audience_value: null,
      scheduled_at: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid audience_type", () => {
    const result = notificationSchema.safeParse({
      title: "Title",
      message: "Message",
      audience_type: "invalid",
      audience_value: null,
      scheduled_at: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("flagReasonSchema", () => {
  it("accepts valid flag reasons", () => {
    expect(flagReasonSchema.safeParse("This submission needs further review by the team.").success).toBe(true);
  });

  it("rejects too short reasons", () => {
    expect(flagReasonSchema.safeParse("short").success).toBe(false);
  });

  it("rejects too long reasons", () => {
    expect(flagReasonSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});

describe("csvFileSchema", () => {
  it("accepts valid CSV data", () => {
    const result = csvFileSchema.safeParse({
      headers: ["email", "name"],
      rows: [{ email: "a@b.com", name: "Alice" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects CSV without email header", () => {
    const result = csvFileSchema.safeParse({
      headers: ["name", "phone"],
      rows: [{ name: "Alice", phone: "123" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty rows", () => {
    const result = csvFileSchema.safeParse({
      headers: ["email"],
      rows: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 1000 rows", () => {
    const result = csvFileSchema.safeParse({
      headers: ["email"],
      rows: Array.from({ length: 1001 }, (_, i) => ({ email: `user${i}@test.com` })),
    });
    expect(result.success).toBe(false);
  });
});

describe("generateTempPassword", () => {
  it("generates passwords of at least 12 characters", () => {
    const password = generateTempPassword();
    expect(password.length).toBeGreaterThanOrEqual(12);
  });

  it("generates passwords of specified length", () => {
    const password = generateTempPassword(20);
    expect(password.length).toBe(20);
  });

  it("enforces minimum length of 12 even if lower is requested", () => {
    const password = generateTempPassword(8);
    expect(password.length).toBeGreaterThanOrEqual(12);
  });

  it("generates passwords that pass tempPasswordSchema validation", () => {
    // Run multiple times to account for randomness
    for (let i = 0; i < 50; i++) {
      const password = generateTempPassword();
      const result = tempPasswordSchema.safeParse(password);
      expect(result.success).toBe(true);
    }
  });

  it("contains at least one uppercase, lowercase, digit, and special character", () => {
    for (let i = 0; i < 20; i++) {
      const password = generateTempPassword();
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{};|:,.<>?]/);
    }
  });
});
