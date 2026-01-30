import { retrySafe } from "./retry-safe";
import { retryUnsafe } from "./retry-unsafe";
import type { RetryOptions, RetryResult } from "./types";

export const retryifySafe = <ARGS extends unknown[], VALUE_TYPE>(
	function_: (...arguments_: ARGS) => Promise<VALUE_TYPE> | VALUE_TYPE,
	options: Readonly<RetryOptions>
): ((...arguments_: ARGS) => Promise<RetryResult<VALUE_TYPE>>) => {
	return function (this: unknown, ...arguments_) {
		return retrySafe(() => function_.apply(this, arguments_), options);
	};
};

export const retryifyUnsafe = <ARGS extends unknown[], VALUE_TYPE>(
	function_: (...arguments_: ARGS) => Promise<VALUE_TYPE> | VALUE_TYPE,
	options: Readonly<RetryOptions>
): ((...arguments_: ARGS) => Promise<VALUE_TYPE>) => {
	return function (this: unknown, ...arguments_) {
		return retryUnsafe(() => function_.apply(this, arguments_), options);
	};
};
