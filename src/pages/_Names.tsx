import { actions } from "astro:actions";
import { useState } from "react";
import type { NameEntry } from "@/pocket";

type NamesProps = {
	initialNames: NameEntry[];
};

function getActionMessage(error: { message?: string } | undefined) {
	return error?.message ?? "Unable to update names";
}

const Names: React.FC<NamesProps> = ({ initialNames }) => {
	const [names, setNames] = useState(initialNames);
	const [key, setKey] = useState("");
	const [value, setValue] = useState("");
	const [pendingAction, setPendingAction] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	const enabledCount = names.filter((name) => !name.disabled).length;
	const isAdding = pendingAction === "add";

	async function addName(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPendingAction("add");
		setErrorMessage(null);
		setSuccessMessage(null);

		const result = await actions.addName({
			key,
			value,
		});

		setPendingAction(null);

		if (result.error) {
			setErrorMessage(getActionMessage(result.error));
			return;
		}

		setNames(result.data);
		setKey("");
		setValue("");
		setSuccessMessage("Name added");
	}

	async function deleteName(nameKey: string) {
		setPendingAction(`delete:${nameKey}`);
		setErrorMessage(null);
		setSuccessMessage(null);

		const result = await actions.deleteName({ key: nameKey });

		setPendingAction(null);

		if (result.error) {
			setErrorMessage(getActionMessage(result.error));
			return;
		}

		setNames(result.data);
		setSuccessMessage("Name deleted");
	}

	async function setDisabled(nameKey: string, disabled: boolean) {
		setPendingAction(`toggle:${nameKey}`);
		setErrorMessage(null);
		setSuccessMessage(null);

		const result = await actions.setNameDisabled({ key: nameKey, disabled });

		setPendingAction(null);

		if (result.error) {
			setErrorMessage(getActionMessage(result.error));
			return;
		}

		setNames(result.data);
		setSuccessMessage(disabled ? "Name disabled" : "Name enabled");
	}

	return (
		<main className="min-h-screen bg-gray-100 p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
				<header className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold">Names</h1>
							<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
								Manage the difficult-name glossary used by translation prompts.
								Disabled names stay stored here but are excluded from prompts.
							</p>
						</div>
						<a
							href="/"
							className="rounded-lg bg-gray-200 px-4 py-2 text-center text-sm font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
						>
							Back to translator
						</a>
					</div>
					<div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
						<span>Total: {names.length}</span>
						<span>Enabled: {enabledCount}</span>
						<span>Disabled: {names.length - enabledCount}</span>
					</div>
				</header>

				<section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
					<h2 className="text-lg font-semibold">Add name</h2>
					<form onSubmit={addName} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
						<label className="flex flex-col gap-1 text-sm font-medium">
							Key
							<input
								type="text"
								value={key}
								onChange={(event) => setKey(event.target.value)}
								placeholder="Original name"
								className="rounded-lg border border-gray-300 bg-white p-2 text-base font-normal focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
							/>
						</label>
						<label className="flex flex-col gap-1 text-sm font-medium">
							Value
							<input
								type="text"
								value={value}
								onChange={(event) => setValue(event.target.value)}
								placeholder="Translated name"
								className="rounded-lg border border-gray-300 bg-white p-2 text-base font-normal focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
							/>
						</label>
						<button
							type="submit"
							disabled={isAdding || !key.trim() || !value.trim()}
							className="self-end rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isAdding ? "Adding..." : "Add"}
						</button>
					</form>
					{errorMessage && (
						<p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
							{errorMessage}
						</p>
					)}
					{successMessage && (
						<p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-200">
							{successMessage}
						</p>
					)}
				</section>

				<section className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
					<div className="border-b border-gray-200 p-6 dark:border-gray-700">
						<h2 className="text-lg font-semibold">Stored names</h2>
					</div>
					{names.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-700 dark:text-gray-300">
									<tr>
										<th scope="col" className="px-6 py-3">
											Key
										</th>
										<th scope="col" className="px-6 py-3">
											Value
										</th>
										<th scope="col" className="px-6 py-3">
											Disabled
										</th>
										<th scope="col" className="px-6 py-3 text-right">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 dark:divide-gray-700">
									{names.map((name) => {
										const togglePending = pendingAction === `toggle:${name.key}`;
										const deletePending = pendingAction === `delete:${name.key}`;

										return (
											<tr
												key={name.key}
												className={
													name.disabled
														? "bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400"
														: ""
												}
											>
												<td className="px-6 py-4 font-medium">{name.key}</td>
												<td className="px-6 py-4">{name.value}</td>
												<td className="px-6 py-4">
													<label className="inline-flex items-center gap-2">
														<input
															type="checkbox"
															checked={name.disabled}
															disabled={togglePending || deletePending}
															onChange={(event) =>
																setDisabled(name.key, event.target.checked)
															}
															className="size-4 rounded border-gray-300"
														/>
														<span>{name.disabled ? "Disabled" : "Enabled"}</span>
													</label>
												</td>
												<td className="px-6 py-4 text-right">
													<button
														type="button"
														disabled={togglePending || deletePending}
														onClick={() => deleteName(name.key)}
														className="rounded-lg bg-red-500 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
													>
														{deletePending ? "Deleting..." : "Delete"}
													</button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					) : (
						<p className="p-6 text-sm text-gray-600 dark:text-gray-300">
							No names are stored yet.
						</p>
					)}
				</section>
			</div>
		</main>
	);
};

export default Names;
