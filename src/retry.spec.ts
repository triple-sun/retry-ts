import { retry, retryify } from "./retry";

describe("retry tests", () => {
	it("should call on try and return result ", async () => {
		const onTry = jest.fn((ok: string) => {
			return ok;
		});
		const res = await retry(() => onTry("ok"));

		expect(res.ok).toBe(true);
		expect(onTry).toHaveBeenCalledTimes(1);
		expect(onTry).toHaveBeenCalledWith("ok");
	});

	it("should try tries # of times if throws every time", async () => {
		const TRIES = 10;

		const onTry = jest.fn((att: number) => {
			throw new Error(`error${att}`);
		});

		const res = await retry((att) => onTry(att), { tries: TRIES });

		expect(res.ok).toBe(false);

		if (res.ok === false) {
			expect(res.context.attempt).toBe(TRIES);
		}

		expect(onTry).toHaveBeenCalledTimes(TRIES);

		Array(TRIES)
			.fill(0)
			.forEach((_, i) => {
				expect(onTry).toHaveBeenCalledWith(i + 1);
			});
	});

	it("should not add same errors twice", async () => {
		const TRIES = 10;

		const onTry = jest.fn((_att: number) => {
			throw new Error(`error`);
		});

		const res = await retry((att) => onTry(att), { tries: TRIES });

		if (res.ok === false) expect(res.context.errors.length).toBe(1);
	});

	it("should try tries # of times and call onCatch if throws", async () => {
		const TRIES = 10;
		const ON_TRY_ERROR = new Error("error");

		const onTry = jest.fn(() => {
			throw ON_TRY_ERROR;
		});
		const onCatch = jest.fn();

		const res = await retry(() => onTry(), { tries: TRIES, onCatch });

		expect(res.ok).toBe(false);

		Array(TRIES)
			.fill(0)
			.forEach((_, i) => {
				expect(onCatch).toHaveBeenCalledWith(ON_TRY_ERROR, i + 1);
			});
	});
});

describe("retryify tests", () => {
	const testFn = (i: number) => {
		return `Got ${i}!`;
	};

	const retriableTestFn = retryify(testFn, { tries: 5 });
});
