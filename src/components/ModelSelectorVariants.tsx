import { useState } from "react";

type Option = { id: string; label: string };

const NATIVE_MODELS: Option[] = [
	{ id: "google", label: "Gemini 3.1 Pro" },
	{ id: "google_flash", label: "Gemini 3.5 Flash" },
	{ id: "deepseek", label: "DeepSeek V4 Pro" },
	{ id: "anthropic", label: "Claude" },
];

const NANO_GPT_MODELS: Option[] = [
	{ id: "nanogpt|mimo", label: "Mimo V2.5 Pro" },
	{ id: "nanogpt|glm", label: "GLM 5.2" },
	{ id: "nanogpt|gemini", label: "Nano GPT Gemini 3.5 Flash" },
];

const labelClass = "text-gray-700 dark:text-gray-300";
const rowLabelClass =
	"text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap";

function Radio({
	option,
	selected,
	onChange,
	idPrefix,
	className,
	labelClassName,
}: {
	option: Option;
	selected: string;
	onChange: (id: string) => void;
	idPrefix: string;
	className?: string;
	labelClassName?: string;
}) {
	const inputId = `${idPrefix}-${option.id}`;
	return (
		<div className={`flex items-center gap-2 ${className ?? ""}`}>
			<input
				type="radio"
				id={inputId}
				name={idPrefix}
				value={option.id}
				checked={selected === option.id}
				onChange={(e) => onChange(e.target.value)}
				className="scale-125"
			/>
			<label htmlFor={inputId} className={labelClassName ?? labelClass}>
				{option.label}
			</label>
		</div>
	);
}

function VariantShell({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="mb-8">
			<div className="mb-3">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{title}
				</h2>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					{description}
				</p>
			</div>
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				{children}
			</div>
		</section>
	);
}

/**
 * Variant 1 — Labeled groups separated by a divider.
 * Native models and Nano GPT models live in two clearly labeled clusters
 * split by a vertical divider, so the provider grouping is obvious while the
 * familiar inline radio layout is preserved.
 */
function VariantGroupedDivider() {
	const [model, setModel] = useState("deepseek");
	return (
		<div className="flex flex-col lg:flex-row lg:items-center gap-3">
			<span className={rowLabelClass}>AI Model:</span>
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<div className="flex flex-col gap-1.5">
					<span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
						Direct
					</span>
					<div className="flex flex-wrap items-center gap-4">
						{NATIVE_MODELS.map((option) => (
							<Radio
								key={option.id}
								option={option}
								selected={model}
								onChange={setModel}
								idPrefix="v1"
							/>
						))}
					</div>
				</div>

				<div className="hidden lg:block self-stretch w-px bg-gray-200 dark:bg-gray-700 mx-1" />

				<div className="flex flex-col gap-1.5">
					<span className="text-xs font-semibold uppercase tracking-wide text-indigo-400 dark:text-indigo-300">
						via Nano GPT
					</span>
					<div className="flex flex-wrap items-center gap-4">
						{NANO_GPT_MODELS.map((option) => (
							<Radio
								key={option.id}
								option={option}
								selected={model}
								onChange={setModel}
								idPrefix="v1"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Variant 2 — Accent badge pills.
 * Models keep a single inline row, but every Nano GPT option is wrapped in a
 * tinted pill with a small "Nano GPT" badge, making them pop out without
 * changing the overall layout flow.
 */
function VariantBadgePills() {
	const [model, setModel] = useState("deepseek");
	return (
		<div className="flex flex-col lg:flex-row lg:items-center gap-3">
			<span className={rowLabelClass}>AI Model:</span>
			<div className="flex flex-wrap items-center gap-3">
				{NATIVE_MODELS.map((option) => (
					<Radio
						key={option.id}
						option={option}
						selected={model}
						onChange={setModel}
						idPrefix="v2"
					/>
				))}
				{NANO_GPT_MODELS.map((option) => {
					const inputId = `v2-${option.id}`;
					const active = model === option.id;
					return (
						<label
							key={option.id}
							htmlFor={inputId}
							className={`flex items-center gap-2 rounded-full border pl-2 pr-3 py-1 cursor-pointer transition-colors ${
								active
									? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
									: "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40"
							}`}
						>
							<input
								type="radio"
								id={inputId}
								name="v2"
								value={option.id}
								checked={active}
								onChange={(e) => setModel(e.target.value)}
								className="scale-125"
							/>
							<span className="rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5">
								Nano
							</span>
							<span className={labelClass}>{option.label}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
}

/**
 * Variant 3 — Boxed sub-panel.
 * Native models stay on the main row; Nano GPT models are moved into their own
 * tinted, bordered card with a header chip, presenting them as a distinct
 * provider group beneath the primary models.
 */
function VariantBoxedPanel() {
	const [model, setModel] = useState("deepseek");
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-col lg:flex-row lg:items-center gap-3">
				<span className={rowLabelClass}>AI Model:</span>
				<div className="flex flex-wrap items-center gap-4">
					{NATIVE_MODELS.map((option) => (
						<Radio
							key={option.id}
							option={option}
							selected={model}
							onChange={setModel}
							idPrefix="v3"
						/>
					))}
				</div>
			</div>

			<div className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-3">
				<div className="flex items-center gap-2 mb-2">
					<span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5">
						⚡ Nano GPT
					</span>
					<span className="text-xs text-gray-500 dark:text-gray-400">
						Routed through Nano GPT
					</span>
				</div>
				<div className="flex flex-wrap items-center gap-4">
					{NANO_GPT_MODELS.map((option) => (
						<Radio
							key={option.id}
							option={option}
							selected={model}
							onChange={setModel}
							idPrefix="v3"
						/>
					))}
				</div>
			</div>
		</div>
	);
}

export default function ModelSelectorVariants() {
	return (
		<div className="w-full lg:max-w-4xl mx-auto p-6">
			<header className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Nano GPT model separation — design options
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Three ways to visually separate Nano GPT models from the direct
					provider models.
				</p>
			</header>

			<VariantShell
				title="Design 1 · Labeled groups + divider"
				description="Two clearly labeled clusters split by a vertical divider."
			>
				<VariantGroupedDivider />
			</VariantShell>

			<VariantShell
				title="Design 2 · Accent badge pills"
				description="Inline layout kept; Nano GPT options become tinted pills with a badge."
			>
				<VariantBadgePills />
			</VariantShell>

			<VariantShell
				title="Design 3 · Boxed sub-panel"
				description="Nano GPT models grouped into their own bordered, tinted card."
			>
				<VariantBoxedPanel />
			</VariantShell>
		</div>
	);
}
