import * as ESTree from 'estree';
import { EventEmitter } from 'events';

export const VERSION: string;

export interface IdMap {
	[key: string]: string;
}

export interface RollupError {
	message: string;
	code?: string;
	name?: string;
	url?: string;
	id?: string;
	loc?: {
		file?: string;
		line: number;
		column: number;
	};
	stack?: string;
	frame?: string;
	pos?: number;
	plugin?: string;
	pluginCode?: string;
}

export interface RawSourceMap {
	version: string;
	sources: string[];
	names: string[];
	sourceRoot?: string;
	sourcesContent?: string[];
	mappings: string;
	file: string;
}

export interface SourceMap {
	version: string;
	file: string;
	sources: string[];
	sourcesContent: string[];
	names: string[];
	mappings: string;

	toString(): string;
	toUrl(): string;
}

export interface SourceDescription {
	code: string;
	map?: RawSourceMap;
	ast?: ESTree.Program;
}

export interface ModuleJSON {
	id: string;
	dependencies: string[];
	transformDependencies: string[];
	code: string;
	originalCode: string;
	originalSourcemap: RawSourceMap | void;
	ast: ESTree.Program;
	sourcemapChain: RawSourceMap[];
	resolvedIds: IdMap;
}

export interface PluginContext {
	watcher: Watcher;
	resolveId: ResolveIdHook;
	isExternal: IsExternal;
	parse: (input: string, options: any) => ESTree.Program;
	emitAsset: (name: string, source?: string | Buffer) => string;
	setAssetSource: (assetId: string, source: string | Buffer) => void;
	getAssetFileName: (assetId: string) => string;
	warn(warning: RollupWarning, pos?: { line: number; column: number }): void;
	error(err: RollupError, pos?: { line: number; column: number }): void;
}

export type ResolveIdHook = (
	this: PluginContext,
	id: string,
	parent: string
) => Promise<string | boolean | void> | string | boolean | void;

export type IsExternal = (
	id: string,
	parentId: string,
	isResolved: boolean
) => Promise<boolean | void> | boolean | void;

export type LoadHook = (
	this: PluginContext,
	id: string
) => Promise<SourceDescription | string | void> | SourceDescription | string | void;

export type TransformHook = (
	this: PluginContext,
	code: string,
	id: string
) => Promise<SourceDescription | string | void> | SourceDescription | string | void;

export type TransformChunkHook = (
	code: string,
	options: OutputOptions,
	chunk: OutputChunk
) =>
	| Promise<{ code: string; map: RawSourceMap } | void>
	| { code: string; map: RawSourceMap }
	| void;

export type TransformChunkHookBound = (
	this: PluginContext,
	code: string,
	options: OutputOptions,
	chunk: OutputChunk
) =>
	| Promise<{ code: string; map: RawSourceMap } | void>
	| { code: string; map: RawSourceMap }
	| void;

export type ResolveDynamicImportHook = (
	this: PluginContext,
	specifier: string | ESTree.Node,
	parentId: string
) => Promise<string | void> | string | void;

export type AddonHook = string | ((this: PluginContext) => string | Promise<string>);

export interface OutputBundle {
	[fileName: string]: OutputAsset | OutputChunk;
}

export interface Plugin {
	name: string;
	options?: (options: InputOptions) => InputOptions | void;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;
	/** @deprecated */
	transformBundle?: TransformChunkHook;
	transformChunk?: TransformChunkHook;
	buildStart?: (this: PluginContext, options: InputOptions) => Promise<void> | void;
	buildEnd?: (this: PluginContext, err?: any) => Promise<void> | void;
	/** @deprecated */
	ongenerate?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	/** @deprecated */
	onwrite?: (
		this: PluginContext,
		options: OutputOptions,
		chunk: OutputChunk
	) => void | Promise<void>;
	/** @deprecated */
	generateBundle?: (
		this: PluginContext,
		options: OutputOptions,
		bundle: OutputBundle,
		isWrite: boolean
	) => void | Promise<void>;
	resolveDynamicImport?: ResolveDynamicImportHook;
	banner?: AddonHook;
	footer?: AddonHook;
	intro?: AddonHook;
	outro?: AddonHook;
}

export interface TreeshakingOptions {
	propertyReadSideEffects: boolean;
	pureExternalModules: boolean;
}

export type ExternalOption = string[] | IsExternal;
export type GlobalsOption = { [name: string]: string } | ((name: string) => string);
export type InputOption = string | string[] | { [entryAlias: string]: string };

export interface InputOptions {
	input: InputOption;
	manualChunks?: { [chunkAlias: string]: string[] };
	external?: ExternalOption;
	plugins?: Plugin[];

	onwarn?: WarningHandler;
	cache?: {
		modules: ModuleJSON[];
	};

	acorn?: {};
	acornInjectPlugins?: Function[];
	treeshake?: boolean | TreeshakingOptions;
	context?: string;
	moduleContext?: string | ((id: string) => string) | { [id: string]: string };
	watch?: WatcherOptions;
	inlineDynamicImports?: boolean;
	preserveSymlinks?: boolean;
	preserveModules?: boolean;
	optimizeChunks?: boolean;
	chunkGroupingSize?: number;
	shimMissingExports?: boolean;

	// undocumented?
	pureExternalModules?: boolean;
	preferConst?: boolean;
	perf?: boolean;

	/** @deprecated */
	entry?: string;
	/** @deprecated */
	transform?: TransformHook;
	/** @deprecated */
	load?: LoadHook;
	/** @deprecated */
	resolveId?: ResolveIdHook;
	/** @deprecated */
	resolveExternal?: any;
}

export type ModuleFormat = 'amd' | 'cjs' | 'system' | 'es' | 'es6' | 'iife' | 'umd';

export type OptionsPaths = Record<string, string> | ((id: string) => string);

export interface OutputOptions {
	// only required for bundle.write
	file?: string;
	// only required for bundles.write
	dir?: string;
	// this is optional at the base-level of RollupWatchOptions,
	// which extends from this interface through config merge
	format?: ModuleFormat;
	name?: string;
	globals?: GlobalsOption;
	chunkFileNames?: string;
	entryFileNames?: string;
	assetFileNames?: string;

	paths?: OptionsPaths;
	banner?: string | (() => string | Promise<string>);
	footer?: string | (() => string | Promise<string>);
	intro?: string | (() => string | Promise<string>);
	outro?: string | (() => string | Promise<string>);
	sourcemap?: boolean | 'inline';
	sourcemapFile?: string;
	interop?: boolean;
	extend?: boolean;

	exports?: 'default' | 'named' | 'none' | 'auto';
	amd?: {
		id?: string;
		define?: string;
	};
	indent?: boolean;
	strict?: boolean;
	freeze?: boolean;
	esModule?: boolean;
	namespaceToStringTag?: boolean;
	compact?: boolean;

	/** @deprecated */
	noConflict?: boolean;
	/** @deprecated */
	dest?: string;
	/** @deprecated */
	moduleId?: string;
}

export interface RollupWarning {
	message?: string;
	code?: string;
	loc?: {
		file: string;
		line: number;
		column: number;
	};
	deprecations?: { old: string; new: string }[];
	modules?: string[];
	names?: string[];
	source?: string;
	importer?: string;
	frame?: any;
	missing?: string;
	exporter?: string;
	exportName?: string;
	name?: string;
	sources?: string[];
	reexporter?: string;
	guess?: string;
	url?: string;
	id?: string;
	plugin?: string;
	pos?: number;
	pluginCode?: string;
}

export type WarningHandler = (warning: string | RollupWarning) => void;

export interface SerializedTimings {
	[label: string]: number;
}

export interface OutputAsset {
	isAsset: true;
	code?: undefined;
	fileName: string;
	source: string | Buffer;
}

export interface RenderedModule {
	renderedExports: string[];
	removedExports: string[];
	renderedLength: number;
	originalLength: number;
}

export interface OutputChunk {
	fileName: string;
	isEntry: boolean;
	imports: string[];
	exports: string[];
	modules: {
		[id: string]: RenderedModule;
	};
	code: string;
	map?: SourceMap;
}

export interface RollupCache {
	modules: ModuleJSON[];
}

export interface RollupOutput {
	// when supported in TypeScript (https://github.com/Microsoft/TypeScript/pull/24897):
	// output: [OutputChunk, ...(OutputChunk | OutputAsset)[]];
	output: (OutputChunk | OutputAsset)[];
}

export interface RollupBuild {
	cache: RollupCache;
	generate: (outputOptions: OutputOptions) => Promise<RollupOutput>;
	write: (options: OutputOptions) => Promise<RollupOutput>;
	getTimings?: () => SerializedTimings;
}

export interface RollupOptions extends InputOptions {
	cache?: RollupCache;
	input: string | string[] | { [entryName: string]: string };
	output?: OutputOptions;
}

export function rollup(options: RollupOptions): Promise<RollupBuild>;

export interface Watcher extends EventEmitter {}

// chokidar watch options
export interface WatchOptions {
	persistent?: boolean;
	ignored?: any;
	ignoreInitial?: boolean;
	followSymlinks?: boolean;
	cwd?: string;
	disableGlobbing?: boolean;
	usePolling?: boolean;
	useFsEvents?: boolean;
	alwaysStat?: boolean;
	depth?: number;
	interval?: number;
	binaryInterval?: number;
	ignorePermissionErrors?: boolean;
	atomic?: boolean | number;
	awaitWriteFinish?:
		| {
				stabilityThreshold?: number;
				pollInterval?: number;
		  }
		| boolean;
}

export interface WatcherOptions {
	chokidar?: boolean | WatchOptions;
	include?: string[];
	exclude?: string[];
	clearScreen?: boolean;
}

export interface RollupWatchOptions extends InputOptions {
	output?: OutputOptions | OutputOptions[];
	watch?: WatcherOptions;
}

export function watch(configs: RollupWatchOptions[]): Watcher;
