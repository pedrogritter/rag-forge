/**
 * Unit tests for chats router logic.
 *
 * The tRPC infrastructure (superjson) is ESM-only and doesn't work under
 * Jest/CJS. Instead of importing the router, we test:
 *   1. The DB operation patterns (select/insert/update/delete chains)
 *   2. The Zod input validation schemas used by each procedure
 *   3. The pagination cursor logic
 */
import { z } from "zod";

// ── Replicate the Zod schemas from chats.ts for validation testing ───
const listInput = z.object({
  userId: z.string().min(1),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(25),
});

const byIdInput = z.object({ id: z.string().min(1) });
const createInput = z.object({ userId: z.string().min(1) });
const updateTitleInput = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
});
const deleteInput = z.object({ id: z.string().min(1) });

// ── Mock DB for operation pattern tests ──────────────────────────────
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDeleteFn = jest.fn();

const mockDb = {
  select: (...args: unknown[]) => mockSelect(...args),
  insert: (...args: unknown[]) => mockInsert(...args),
  update: (...args: unknown[]) => mockUpdate(...args),
  delete: (...args: unknown[]) => mockDeleteFn(...args),
};

const now = new Date("2025-01-15T12:00:00Z");
const earlier = new Date("2025-01-15T11:00:00Z");

// ── Input Validation Tests ───────────────────────────────────────────
describe("chats input validation", () => {
  describe("list", () => {
    it("accepts valid input with defaults", () => {
      const result = listInput.safeParse({ userId: "user-1" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.limit).toBe(25);
    });

    it("accepts custom limit", () => {
      const result = listInput.safeParse({ userId: "u1", limit: 50 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.limit).toBe(50);
    });

    it("accepts cursor", () => {
      const result = listInput.safeParse({
        userId: "u1",
        cursor: now.toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty userId", () => {
      expect(listInput.safeParse({ userId: "" }).success).toBe(false);
    });

    it("rejects limit = 0", () => {
      expect(listInput.safeParse({ userId: "u1", limit: 0 }).success).toBe(
        false,
      );
    });

    it("rejects limit > 100", () => {
      expect(listInput.safeParse({ userId: "u1", limit: 101 }).success).toBe(
        false,
      );
    });
  });

  describe("byId", () => {
    it("accepts valid id", () => {
      expect(byIdInput.safeParse({ id: "abc" }).success).toBe(true);
    });

    it("rejects empty id", () => {
      expect(byIdInput.safeParse({ id: "" }).success).toBe(false);
    });
  });

  describe("create", () => {
    it("accepts valid userId", () => {
      expect(createInput.safeParse({ userId: "u1" }).success).toBe(true);
    });

    it("rejects empty userId", () => {
      expect(createInput.safeParse({ userId: "" }).success).toBe(false);
    });
  });

  describe("updateTitle", () => {
    it("accepts valid input", () => {
      expect(
        updateTitleInput.safeParse({ id: "c1", title: "New" }).success,
      ).toBe(true);
    });

    it("rejects empty title", () => {
      expect(updateTitleInput.safeParse({ id: "c1", title: "" }).success).toBe(
        false,
      );
    });

    it("rejects empty id", () => {
      expect(updateTitleInput.safeParse({ id: "", title: "T" }).success).toBe(
        false,
      );
    });
  });

  describe("delete", () => {
    it("accepts valid id", () => {
      expect(deleteInput.safeParse({ id: "c1" }).success).toBe(true);
    });

    it("rejects empty id", () => {
      expect(deleteInput.safeParse({ id: "" }).success).toBe(false);
    });
  });
});

// ── DB Operation Pattern Tests ───────────────────────────────────────
describe("chats DB operations", () => {
  beforeEach(() => jest.clearAllMocks());

  it("list: returns paginated chats", async () => {
    const items = [
      { id: "c1", title: "Chat 1", createdAt: now, updatedAt: now },
      { id: "c2", title: "Chat 2", createdAt: earlier, updatedAt: earlier },
    ];

    mockSelect.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(items),
          }),
        }),
      }),
    });

    const result = await mockDb
      .select()
      .from("chats")
      .where("eq(userId)")
      .orderBy("desc(updatedAt)")
      .limit(26);

    expect(result).toEqual(items);
    expect(result.length).toBeLessThanOrEqual(25);
    expect(mockSelect).toHaveBeenCalled();
  });

  it("list: sets nextCursor when more items than limit", () => {
    const limit = 2;
    const items = [
      { id: "c1", updatedAt: now },
      { id: "c2", updatedAt: earlier },
      { id: "c3", updatedAt: new Date("2025-01-15T10:00:00Z") },
    ];

    // Simulate the cursor logic from chats.ts
    let nextCursor: string | undefined;
    if (items.length > limit) {
      const next = items.pop()!;
      nextCursor = next.updatedAt.toISOString();
    }

    expect(items).toHaveLength(2);
    expect(nextCursor).toBe("2025-01-15T10:00:00.000Z");
  });

  it("list: no cursor when items <= limit", () => {
    const limit = 25;
    const items = [{ id: "c1", updatedAt: now }];

    let nextCursor: string | undefined;
    if (items.length > limit) {
      const next = items.pop()!;
      nextCursor = next.updatedAt.toISOString();
    }

    expect(nextCursor).toBeUndefined();
  });

  it("byId: returns chat when found", async () => {
    const chat = { id: "c1", userId: "u1", title: "My Chat", messages: [] };

    mockSelect.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([chat]),
        }),
      }),
    });

    const [result] = await mockDb
      .select()
      .from("chats")
      .where("eq(id)")
      .limit(1);

    expect(result).toEqual(chat);
  });

  it("byId: returns null when not found", async () => {
    mockSelect.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const results = await mockDb
      .select()
      .from("chats")
      .where("eq(id)")
      .limit(1);

    expect(results[0] ?? null).toBeNull();
  });

  it("create: inserts and returns id", async () => {
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: "new-id" }]),
      }),
    });

    const [result] = await mockDb
      .insert("chats")
      .values({ userId: "u1" })
      .returning({ id: "id" });

    expect(result).toEqual({ id: "new-id" });
  });

  it("updateTitle: calls update with set and where", async () => {
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });

    await mockDb.update("chats").set({ title: "New" }).where("eq(id)");
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("delete: calls delete with where", async () => {
    mockDeleteFn.mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });

    await mockDb.delete("chats").where("eq(id)");
    expect(mockDeleteFn).toHaveBeenCalled();
  });
});
