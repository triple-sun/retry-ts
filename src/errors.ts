import type { RetryContext } from ".";

export class StopError extends Error {
	readonly original: Error;
	constructor(message: string | Error) {
		super();

		if (message instanceof Error) {
			this.original = message;
			({ message } = message);
		} else {
			this.original = new Error(message);
			this.original.stack = this.stack;
		}

		this.name = StopError.name;
		this.message = message;
	}
}

export class NotAnErrorError extends Error {
	constructor(e: unknown) {
		super();
		this.message = `Expected instanceof Error, got: "${typeof e}"`;
		this.name = NotAnErrorError.name;
	}
}

export class RetryFailedError extends Error {
	ctx: RetryContext;

	constructor(ctx: Readonly<RetryContext>) {
		super();

		this.ctx = ctx;
		this.name = RetryFailedError.name;
		this.message = `Retry failed: ${this.ctx.errors[this.ctx.errors.length - 1]}`;
	}
}
