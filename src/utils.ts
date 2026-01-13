import { deepStrictEqual } from "node:assert";
import type { RetryContext, RetryOptions } from "./types";
import { wait } from "./wait";

export const validateTries = (tries: number): void => {
	if (typeof tries === "number") {
		if (tries < 0)
			throw new TypeError("Expected [tries] to be a non-negative number.");
		if (Number.isNaN(tries))
			throw new TypeError(
				"Expected [tries] to be a valid number or Infinity, got NaN.",
			);
	} else if (tries !== undefined) {
		throw new TypeError("Expected [tries] to be a number or Infinity.");
	}
};

export const validateNumericOption = (
	name: string,
	value: number,
	{ finite = true }: { finite?: boolean } = {},
): void => {
	if (value === undefined) return;

	if (typeof value !== "number" || Number.isNaN(value)) {
		throw new TypeError(`Expected [${name}] to be a number`);
	}

	if (finite && !Number.isFinite(value)) {
		throw new TypeError(`Expected [${name}] to be a finite number.`);
	}

	if (value < 0) throw new TypeError(`Expected [${name}] to be \u22650.`);
};

export const onFail = async (
	error: unknown,
	context: RetryContext,
	options: RetryOptions,
): Promise<void> => {
	const normalizedError =
		error instanceof Error
			? error
			: new TypeError(
					`Non-error was thrown: "${error}". You should only throw errors.`,
				);

	if (options.skipSameErrorCheck) {
		context.errors.push(normalizedError);
	} else {
		try {
			/** check if our last error was the same as this one */
			deepStrictEqual(context.errors[context.errors.length - 1], error);
		} catch (_err) {
			context.errors.push(normalizedError);
		}
	}

	if (options.onCatch) await options.onCatch(context);
	if (options.delay) {
		if (options.exponent) options.delay *= options.exponent;
		await wait(options.grow ? options.delay * options.grow : options.delay);
	}

	context.triesConsumed++;
};
